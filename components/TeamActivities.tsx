"use client";

import { useState, useEffect } from "react";

interface ActivityItem {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function TeamActivities({
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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      if (!isOpen) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/teams/${teamId}/activities`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (err) {
        console.error("Failed to load activities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, [teamId, isOpen]);

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case "TASK_CREATED":
        return <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">Created Task</span>;
      case "TASK_UPDATED":
        return <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">Updated Task</span>;
      case "TASK_DELETED":
        return <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">Deleted Task</span>;
      case "MEMBER_ADDED":
        return <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">Added Member</span>;
      case "MEMBER_REMOVED":
        return <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">Removed Member</span>;
      case "ROLE_UPDATED":
        return <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">Role Changed</span>;
      default:
        return <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700 border border-gray-200">{action}</span>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-[rgba(173,48,41,0.15)] animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(173,48,41,0.1)] px-5 py-4 bg-[#FAF7F2]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#AD3029] to-[#CD5252] text-white shadow-xs">
            📜
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#221514]">Activity Log</h3>
            <p className="text-[10px] text-[#7A6664]">{teamName} audit trail</p>
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

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#AD3029]/20 border-t-[#AD3029]" />
              <p className="text-xs text-[#7A6664]">Loading audit trail...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7A6664]">
            No recent activity logged for this team.
          </div>
        ) : (
          activities.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-[rgba(173,48,41,0.1)] bg-[#FAF7F2]/50 p-3 text-xs shadow-2xs hover:bg-[#FAF7F2] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#221514]">{a.user.name}</span>
                {getActionBadge(a.action)}
              </div>
              {a.details && (
                <p className="mt-1.5 text-[11px] text-[#55403E] leading-relaxed">
                  {a.details}
                </p>
              )}
              <p className="mt-2 text-[10px] text-[#7A6664]">
                {new Date(a.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
