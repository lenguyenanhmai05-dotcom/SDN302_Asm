"use client";

import { useState, useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "./AuthProvider";

interface ChatSender {
  id: string;
  name: string;
  email: string;
}

export interface ChatMessageItem {
  id: string;
  teamId: string;
  senderId: string;
  content: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  createdAt: string;
  sender: ChatSender;
}

export default function TeamChat({
  teamId,
  teamName,
  isOpen,
  onClose,
}: {
  teamId: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string }[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<{
    dataUrl: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch initial message history
  useEffect(() => {
    let isMounted = true;
    async function loadMessages() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teams/${teamId}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setTimeout(scrollToBottom, 150);
        }
      }
    }

    if (isOpen) {
      loadMessages();
    }

    return () => {
      isMounted = false;
    };
  }, [teamId, isOpen]);

  // 2. Setup Supabase Realtime channel for chat & presence
  useEffect(() => {
    if (!user || !isOpen) return;

    const supabase = getSupabaseBrowserClient();
    const channelName = `team-chat:${teamId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: user.id },
      },
    });

    // Listen for incoming broadcast messages
    channel
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        if (payload && payload.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.id)) return prev;
            return [...prev, payload];
          });
          setTimeout(scrollToBottom, 80);

          // Trigger native browser notification if user is in another tab or drawer is not active, and push is enabled
          const isPushEnabled = typeof window !== "undefined" && localStorage.getItem("browser_push_enabled") !== "false";
          if (
            payload.senderId !== user.id &&
            isPushEnabled &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`Tin nhắn từ ${payload.sender?.name || "thành viên"} (${teamName})`, {
                body: payload.fileName ? `[Tệp đính kèm: ${payload.fileName}] ${payload.content || ""}` : (payload.content || "Tin nhắn mới"),
                icon: "/favicon.ico",
              });
            } catch {}
          }
        }
      })
      // Listen for typing indicator
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userName && payload.userId !== user.id) {
          setTypingUsers((prev) => {
            if (!prev.includes(payload.userName)) return [...prev, payload.userName];
            return prev;
          });
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((name) => name !== payload.userName));
          }, 3000);
        }
      })
      // Track Presence (Online members)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const usersOnline: { id: string; name: string }[] = [];
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((p) => {
            if (p.name && !usersOnline.some((u) => u.id === key)) {
              usersOnline.push({ id: key, name: p.name });
            }
          });
        });
        setOnlineUsers(usersOnline);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            name: user.name,
            email: user.email,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [teamId, user, isOpen, teamName]);

  // Handle typing broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!user) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      try {
        const supabase = getSupabaseBrowserClient();
        const channel = supabase.channel(`team-chat:${teamId}`);
        channel.send({
          type: "broadcast",
          event: "typing",
          payload: { userId: user.id, userName: user.name },
        });
      } catch {}
    }, 300);
  };

  // Handle file / image selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert("Kích thước tệp vượt quá 3MB. Vui lòng chọn tệp nhỏ hơn.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        dataUrl: reader.result as string,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);

    // Reset input value so the same file can be picked again if desired
    e.target.value = "";
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || sending || !user) return;

    const messageText = inputText.trim();
    const currentAttachment = attachment;
    setInputText("");
    setAttachment(null);

    try {
      setSending(true);
      const res = await fetch(`/api/teams/${teamId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageText,
          fileUrl: currentAttachment?.dataUrl || null,
          fileName: currentAttachment?.name || null,
          fileType: currentAttachment?.type || null,
          fileSize: currentAttachment?.size || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const createdMsg: ChatMessageItem = await res.json();

      // Add to local state immediately
      setMessages((prev) => {
        if (prev.some((m) => m.id === createdMsg.id)) return prev;
        return [...prev, createdMsg];
      });
      setTimeout(scrollToBottom, 50);

      // Broadcast to other members in the team room
      const supabase = getSupabaseBrowserClient();
      const channel = supabase.channel(`team-chat:${teamId}`);
      await channel.send({
        type: "broadcast",
        event: "new_message",
        payload: createdMsg,
      });
    } catch (err) {
      console.error(err);
      setInputText(messageText); // restore on failure
      setAttachment(currentAttachment);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-[rgba(173,48,41,0.15)] animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(173,48,41,0.1)] px-5 py-4 bg-[#FAF7F2]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#AD3029] to-[#CD5252] text-white shadow-xs">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#221514]">{teamName} Chat</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-[#7A6664]">
                {onlineUsers.length} online now
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-white to-[#FAF7F2]/30">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#AD3029]/20 border-t-[#AD3029]" />
              <p className="text-xs text-[#7A6664]">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEEFCD]/50 text-xl mb-2 text-[#8F2520]">
              💬
            </div>
            <p className="text-xs font-semibold text-[#55403E]">Welcome to Team Chat!</p>
            <p className="text-[11px] text-[#7A6664] mt-1">
              Send the first message to start collaborating in real time with your team.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = user?.id === m.senderId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1 animate-in fade-in duration-150`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-[#7A6664] px-1">
                    {m.sender.name}
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? "bg-[#AD3029] text-white rounded-tr-xs"
                      : "bg-[#FAF7F2] text-[#221514] border border-[rgba(173,48,41,0.1)] rounded-tl-xs"
                  }`}
                >
                  {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}

                  {/* Attachment Preview in Bubble */}
                  {m.fileUrl && (
                    <div className="mt-2">
                      {m.fileType?.startsWith("image/") ? (
                        <div
                          onClick={() => setPreviewImage({ url: m.fileUrl!, name: m.fileName || "Ảnh đính kèm" })}
                          title="Click để phóng to ảnh"
                          className="group/img relative block cursor-zoom-in overflow-hidden rounded-xl border border-black/10 hover:opacity-95 transition-opacity"
                        >
                          <img
                            src={m.fileUrl}
                            alt={m.fileName || "Ảnh đính kèm"}
                            className="max-h-52 max-w-full rounded-xl object-contain bg-black/5"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-xs">
                              🔍 Bấm để phóng to
                            </span>
                          </div>
                        </div>
                      ) : (
                        <a
                          href={m.fileUrl}
                          download={m.fileName || "attachment"}
                          className={`flex items-center gap-2 rounded-xl p-2 transition-colors ${
                            isMe
                              ? "bg-white/15 hover:bg-white/25 text-white"
                              : "bg-white hover:bg-gray-100 text-[#221514] border border-gray-200"
                          }`}
                        >
                          <span className="text-base">📎</span>
                          <div className="overflow-hidden text-left">
                            <p className="font-semibold truncate text-[11px] underline">
                              {m.fileName || "Tệp đính kèm"}
                            </p>
                            {m.fileSize && (
                              <p className={`text-[9px] ${isMe ? "text-white/70" : "text-[#7A6664]"}`}>
                                {(m.fileSize / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[#7A6664] px-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-[10px] italic text-[#AD3029] bg-[#FAF7F2]/50 animate-pulse">
          ✍️ {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Input Form with Attachment Support */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-[rgba(173,48,41,0.1)] bg-white">
        {/* Attachment preview chip */}
        {attachment && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-[rgba(173,48,41,0.2)] bg-[#FAF7F2] p-2 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 overflow-hidden">
              {attachment.type.startsWith("image/") ? (
                <img
                  src={attachment.dataUrl}
                  alt="preview"
                  className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEEFCD] text-lg">
                  📎
                </span>
              )}
              <div className="truncate text-left">
                <p className="font-semibold text-[#221514] truncate text-[11px]">{attachment.name}</p>
                <p className="text-[9px] text-[#7A6664]">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />

          {/* Attachment trigger button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Đính kèm tệp hoặc hình ảnh"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(173,48,41,0.2)] bg-white text-[#8F2520] hover:bg-[#FEEFCD]/50 transition-colors cursor-pointer"
          >
            📎
          </button>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={attachment ? "Thêm ghi chú cho tệp..." : "Nhập tin nhắn..."}
            disabled={sending}
            className="flex-1 rounded-xl border border-[rgba(173,48,41,0.2)] bg-[#FAF7F2]/40 px-3.5 py-2.5 text-xs text-[#221514] placeholder-gray-400 focus:border-[#AD3029] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#AD3029]/20"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !attachment) || sending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#AD3029] text-white shadow-xs hover:bg-[#8F2520] transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {/* Fullscreen Image Preview Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-4xl items-center justify-between pb-3 text-white"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-base">🖼️</span>
              <span className="text-xs sm:text-sm font-semibold truncate">{previewImage.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={previewImage.url}
                download={previewImage.name}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
              >
                <span>⬇️</span>
                <span>Tải ảnh về</span>
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[85vh] max-w-4xl items-center justify-center overflow-hidden rounded-2xl bg-black/40 p-2 shadow-2xl"
          >
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
