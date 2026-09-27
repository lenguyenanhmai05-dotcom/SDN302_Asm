"use client";

import { useEffect, useState, useMemo } from "react";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TO_DO");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");

  // Filters State (Bonus Feature)
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("TO_DO");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editDueDate, setEditDueDate] = useState("");
  const [editError, setEditError] = useState("");

  // Delete Confirm Modal State
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      showToast("Không thể tải danh sách task từ Supabase", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side Validation (Bonus Feature)
    if (!title.trim()) {
      setFormError("Vui lòng nhập tiêu đề task (bắt buộc)!");
      return;
    }
    setFormError("");

    try {
      setSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          dueDate: dueDate || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Tạo task thất bại");
      }

      const newTask = await res.json();
      setTasks((prev) => [newTask, ...prev]);

      // Reset form
      setTitle("");
      setDescription("");
      setStatus("TO_DO");
      setPriority("MEDIUM");
      setDueDate("");
      showToast("Đã tạo task mới thành công vào Supabase!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi khi tạo task";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setEditError("");
  };

  // Update Task Handler
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    if (!editTitle.trim()) {
      setEditError("Tiêu đề không được để trống!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          status: editStatus,
          priority: editPriority,
          dueDate: editDueDate || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Cập nhật thất bại");
      }

      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTask(null);
      showToast("Đã cập nhật task thành công!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi khi cập nhật";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Xóa task thất bại");
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      showToast("Đã xóa task thành công khỏi database!");
      setTaskToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi khi xóa task";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick toggle task status
  const handleQuickToggleDone = async (task: TaskItem) => {
    const nextStatus = task.status === "DONE" ? "TO_DO" : "DONE";
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        showToast(
          nextStatus === "DONE" ? "Đã đánh dấu hoàn thành!" : "Đã chuyển về To Do!"
        );
      }
    } catch {
      showToast("Lỗi khi đổi trạng thái", "error");
    }
  };

  // Filtered Tasks Memo
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      // Priority filter
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = t.title.toLowerCase().includes(query);
        const inDesc = t.description?.toLowerCase().includes(query);
        if (!inTitle && !inDesc) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TO_DO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return { total, todo, inProgress, done };
  }, [tasks]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-xl transition-all border animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-[#142217] text-white border-[#45834D]"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          <span>{toastMessage.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-jade-border bg-gradient-to-br from-white via-[#f2f8f4] to-[#AEDBB8]/20 p-6 sm:p-10 shadow-sm mb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#AEDBB8]/40 px-3 py-1 text-xs font-semibold text-[#45834D]">
              <span className="h-2 w-2 rounded-full bg-[#45834D]" />
              <span>Assignment 1: Technical Foundation & Task CRUD</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#142217] sm:text-4xl">
              Task & Team Management
            </h1>
            <p className="text-sm text-neutral-600 sm:text-base leading-relaxed">
              Chào mừng bạn đến với ứng dụng quản lý công việc và nhóm dự án. Nền tảng được xây
              dựng với Next.js App Router, Prisma ORM và Cloud PostgreSQL (Supabase). Mọi tác vụ
              CRUD đều hoạt động công khai trực tiếp ngay trên trang chủ.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:w-auto">
            <div className="rounded-2xl border border-jade-border bg-white/90 p-3.5 text-center shadow-xs">
              <span className="text-xs font-medium text-neutral-500">Tất cả</span>
              <p className="text-2xl font-bold text-[#142217]">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white/90 p-3.5 text-center shadow-xs">
              <span className="text-xs font-medium text-blue-600">To Do</span>
              <p className="text-2xl font-bold text-blue-700">{stats.todo}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white/90 p-3.5 text-center shadow-xs">
              <span className="text-xs font-medium text-amber-600">In Progress</span>
              <p className="text-2xl font-bold text-amber-700">{stats.inProgress}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-3.5 text-center shadow-xs">
              <span className="text-xs font-medium text-emerald-600">Done</span>
              <p className="text-2xl font-bold text-[#45834D]">{stats.done}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Create Task Form & Task List */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Create Task Form (4 cols on lg) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-jade-border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AEDBB8]/40 text-[#45834D]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#142217]">Thêm Task Mới</h2>
                <p className="text-xs text-neutral-500">Tạo công việc lưu trực tiếp vào Supabase</p>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Tiêu đề Task <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thiết kế giao diện Dashboard..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                    formError
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      : "border-gray-200 focus:border-[#45834D] focus:ring-[#AEDBB8]/40"
                  }`}
                />
                {formError && <p className="mt-1 text-xs text-rose-500">{formError}</p>}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Mô tả chi tiết (tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú chi tiết về mục tiêu hoặc yêu cầu công việc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                />
              </div>

              {/* Status & Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-neutral-800 transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                  >
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Độ ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-neutral-800 transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                  >
                    <option value="LOW">Thấp (Low)</option>
                    <option value="MEDIUM">Vừa (Medium)</option>
                    <option value="HIGH">Cao (High)</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Hạn hoàn thành (Due Date)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-neutral-800 transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#45834D] py-3 text-sm font-bold text-white shadow-md shadow-[#45834D]/20 transition-all hover:bg-[#34673b] hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    <span>Đang lưu vào Database...</span>
                  </>
                ) : (
                  <>
                    <span>+ Thêm Task Mới</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Task List & Controls (7 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Controls: Search & Filters (Bonus Features) */}
          <div className="rounded-3xl border border-jade-border bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm task theo tiêu đề hoặc mô tả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-3.5 py-2 text-sm transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-neutral-400 hover:text-neutral-600"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">
                  Ưu tiên:
                </span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:border-[#45834D] focus:outline-none"
                >
                  <option value="ALL">Tất cả ưu tiên</option>
                  <option value="HIGH">Cao (High)</option>
                  <option value="MEDIUM">Vừa (Medium)</option>
                  <option value="LOW">Thấp (Low)</option>
                </select>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-xs font-semibold text-neutral-500 mr-1">Trạng thái:</span>
              {[
                { label: "Tất cả", value: "ALL" },
                { label: "To Do", value: "TO_DO" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Done", value: "DONE" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === tab.value
                      ? "bg-[#45834D] text-white shadow-xs"
                      : "bg-[#f2f8f4] text-neutral-600 hover:bg-[#AEDBB8]/40 hover:text-[#45834D]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <span className="ml-auto text-xs text-neutral-400">
                Hiển thị {filteredTasks.length} / {tasks.length} tasks
              </span>
            </div>
          </div>

          {/* Task List Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/50 py-16 text-center">
              <svg
                className="h-8 w-8 animate-spin text-[#45834D]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <p className="mt-3 text-sm text-neutral-500">Đang đồng bộ dữ liệu từ Supabase...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-jade-border bg-white/60 p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#AEDBB8]/30 text-2xl text-[#45834D] mb-3">
                📋
              </div>
              <h3 className="text-base font-bold text-[#142217]">Không tìm thấy task nào</h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-sm">
                {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
                  ? "Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc."
                  : "Chưa có công việc nào trong database. Hãy dùng form bên trái để tạo task đầu tiên!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const isDone = task.status === "DONE";
                return (
                  <div
                    key={task.id}
                    className={`group relative rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
                      isDone
                        ? "border-emerald-100 bg-[#fbfdfb]"
                        : "border-gray-200 hover:border-[#8FCA97]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Checkbox & Content */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleDone(task)}
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                            isDone
                              ? "border-[#45834D] bg-[#45834D] text-white"
                              : "border-gray-300 hover:border-[#45834D]"
                          }`}
                          title={isDone ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
                        >
                          {isDone && <span className="text-xs font-bold">✓</span>}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {/* Title */}
                            <h3
                              className={`text-base font-bold text-[#142217] truncate ${
                                isDone ? "line-through text-neutral-400" : ""
                              }`}
                            >
                              {task.title}
                            </h3>

                            {/* Status Badge */}
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                task.status === "DONE"
                                  ? "bg-[#AEDBB8]/40 text-[#45834D]"
                                  : task.status === "IN_PROGRESS"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {task.status.replace("_", " ")}
                            </span>

                            {/* Priority Badge */}
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                task.priority === "HIGH"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : task.priority === "MEDIUM"
                                  ? "bg-[#f2f8f4] text-[#45834D] border border-jade-border"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {task.priority === "HIGH"
                                ? "Ưu tiên Cao"
                                : task.priority === "MEDIUM"
                                ? "Ưu tiên Vừa"
                                : "Ưu tiên Thấp"}
                            </span>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p
                              className={`text-xs leading-relaxed line-clamp-2 ${
                                isDone ? "text-neutral-400" : "text-neutral-600"
                              }`}
                            >
                              {task.description}
                            </p>
                          )}

                          {/* Metadata row */}
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-neutral-400">
                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-neutral-500">
                                <span>📅 Hạn:</span>
                                <span className="font-medium text-neutral-700">
                                  {new Date(task.dueDate).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span>Tạo:</span>
                              <span>
                                {new Date(task.createdAt).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Edit & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(task)}
                          className="rounded-lg p-2 text-neutral-400 hover:bg-[#f2f8f4] hover:text-[#45834D] transition-colors"
                          title="Chỉnh sửa task"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="rounded-lg p-2 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Xóa task"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-jade-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#AEDBB8]/40 p-2 text-[#45834D]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#142217]">Chỉnh Sửa Task</h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                    editError
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      : "border-gray-200 focus:border-[#45834D] focus:ring-[#AEDBB8]/40"
                  }`}
                />
                {editError && <p className="mt-1 text-xs text-rose-500">{editError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-neutral-800 transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                  >
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Độ ưu tiên
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-neutral-800 transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                  >
                    <option value="LOW">Thấp (Low)</option>
                    <option value="MEDIUM">Vừa (Medium)</option>
                    <option value="HIGH">Cao (High)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Hạn hoàn thành
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-neutral-800 transition-all focus:border-[#45834D] focus:outline-none focus:ring-2 focus:ring-[#AEDBB8]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#45834D] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#45834D]/20 hover:bg-[#34673b] transition-all disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#142217]">Xác nhận xóa Task?</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Bạn có chắc chắn muốn xóa task &quot;
              <span className="font-semibold text-neutral-900">{taskToDelete.title}</span>&quot; khỏi
              database Supabase? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteTask}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all disabled:opacity-50"
              >
                {submitting ? "Đang xóa..." : "Xác nhận Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
