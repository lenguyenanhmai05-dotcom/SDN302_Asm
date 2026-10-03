"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

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
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TO_DO");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");

  // Filters State
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

  // Toast State
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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
      showToast("Could not load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError("Task title is required");
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
        throw new Error(errData.error || "Failed to create task");
      }

      const newTask = await res.json();
      setTasks((prev) => [newTask, ...prev]);

      setTitle("");
      setDescription("");
      setStatus("TO_DO");
      setPriority("MEDIUM");
      setDueDate("");
      showToast("Task created successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating task";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Task
  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setEditError("");
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    if (!editTitle.trim()) {
      setEditError("Title cannot be empty");
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
        throw new Error(errData.error || "Update failed");
      }

      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTask(null);
      showToast("Task updated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating task";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      showToast("Task deleted");
      setTaskToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error deleting task";
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
        showToast(nextStatus === "DONE" ? "Completed" : "Moved to To Do");
      }
    } catch {
      showToast("Error updating status", "error");
    }
  };

  // Filtered & Sorted Tasks (Completed tasks at the bottom)
  const filteredTasks = useMemo(() => {
    const list = tasks.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = t.title.toLowerCase().includes(query);
        const inDesc = t.description?.toLowerCase().includes(query);
        if (!inTitle && !inDesc) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const aDone = a.status === "DONE" ? 1 : 0;
      const bDone = b.status === "DONE" ? 1 : 0;
      if (aDone !== bDone) {
        return aDone - bDone; // Active tasks first, DONE tasks at the end
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
    <div className="mx-auto w-full max-w-[1600px] px-6 pt-4 pb-10 sm:px-10 lg:px-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-2xl transition-all border animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-[#221514] text-[#FEEFCD] border-[#AD3029]"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          <span className="text-base">{toastMessage.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Clean Unframed Header with Minimal Vertical Spacing */}
      <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#221514] sm:text-3xl">
            Workspace Tasks
          </h1>
          <p className="mt-0.5 text-xs text-[#7A6664]">
            Organize, prioritize, and track your team work effortlessly in real time.
          </p>
        </div>

        {/* Minimal Stat Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(173,48,41,0.12)] bg-white px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-semibold text-[#7A6664]">All</span>
            <span className="rounded-md bg-[#FAF7F2] px-1.5 py-0.5 text-xs font-bold text-[#221514]">
              {stats.total}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(173,48,41,0.12)] bg-white px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-semibold text-[#7A6664]">To Do</span>
            <span className="rounded-md bg-[#FEEFCD] px-1.5 py-0.5 text-xs font-bold text-[#8F2520]">
              {stats.todo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(173,48,41,0.12)] bg-white px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-semibold text-[#CD5252]">In Progress</span>
            <span className="rounded-md bg-[#FEEFCD] px-1.5 py-0.5 text-xs font-bold text-[#CD5252]">
              {stats.inProgress}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(173,48,41,0.12)] bg-white px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-semibold text-[#AD3029]">Done</span>
            <span className="rounded-md bg-[#AD3029] px-1.5 py-0.5 text-xs font-bold text-[#FEEFCD]">
              {stats.done}
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Form (With Red Border on Left) & Tasks List (Right) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Enlarged "New Task" Form with Prominent Red Border */}
        <div className="lg:col-span-5 xl:col-span-5">
          <div className="sticky top-20 rounded-3xl border-2 border-[#AD3029] bg-white p-6 sm:p-7 shadow-xl shadow-[#AD3029]/8 transition-all">
            {/* Form Header with Red Accent */}
            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#AD3029] text-white shadow-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#221514]">Create New Task</h2>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#AD3029] bg-[#FEEFCD] px-2.5 py-0.5 rounded-full border border-[rgba(173,48,41,0.15)]">
                Quick Add
              </span>
            </div>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                  Task Title <span className="text-[#AD3029]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Dashboard Components..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                    formError
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-gray-200 focus:border-[#AD3029] focus:ring-[#FEEFCD]"
                  }`}
                />
                {formError && <p className="mt-1 text-xs text-rose-500">{formError}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Add details, notes, or requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm transition-all focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#FEEFCD]"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-[#221514] focus:border-[#AD3029] focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#AD3029] py-3 text-sm font-bold text-white shadow-md shadow-[#AD3029]/20 transition-all hover:bg-[#8F2520] hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>Saving Task...</span>
                ) : (
                  <span>+ Create Task</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Controls & Task List (7 cols out of 12) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          {/* Controls Bar */}
          <div className="rounded-2xl border border-[rgba(173,48,41,0.12)] bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
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
                  placeholder="Search tasks by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm transition-all focus:border-[#AD3029] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#7A6664] whitespace-nowrap">
                  Priority:
                </span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#221514] focus:border-[#AD3029] focus:outline-none"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 border-t border-gray-100 pt-2.5">
              {[
                { label: "All", value: "ALL" },
                { label: "To Do", value: "TO_DO" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Done", value: "DONE" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === tab.value
                      ? "bg-[#AD3029] text-white shadow-xs"
                      : "bg-[#FAF7F2] text-[#55403E] hover:bg-[#FEEFCD] hover:text-[#8F2520]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <span className="ml-auto text-xs text-[#7A6664]">
                Showing {filteredTasks.length} / {tasks.length} tasks
              </span>
            </div>
          </div>

          {/* Task List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50 py-12 text-center">
              <svg className="h-6 w-6 animate-spin text-[#AD3029]" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="mt-2 text-xs text-[#7A6664]">Loading workspace tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(173,48,41,0.15)] bg-white/60 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEEFCD] text-[#AD3029] mb-2 font-bold">
                ✓
              </div>
              <h3 className="text-sm font-bold text-[#221514]">No tasks found</h3>
              <p className="mt-0.5 text-xs text-[#7A6664]">
                {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
                  ? "Try adjusting your search query or filters."
                  : "All clear! Create your first task using the form on the left."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isDone = task.status === "DONE";
                return (
                  <div
                    key={task.id}
                    className={`group relative rounded-xl border bg-white p-4 sm:p-5 transition-all hover:shadow-xs ${
                      isDone
                        ? "border-gray-200/80 bg-[#FCFBF9]"
                        : "border-[rgba(173,48,41,0.12)] hover:border-[#CD5252]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3.5">
                      {/* Checkbox & Text */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleDone(task)}
                          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                            isDone
                              ? "border-[#AD3029] bg-[#AD3029] text-[#FEEFCD]"
                              : "border-gray-300 hover:border-[#AD3029]"
                          }`}
                          title={isDone ? "Mark incomplete" : "Mark done"}
                        >
                          {isDone && <span className="text-[10px] font-bold">✓</span>}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3
                              className={`text-sm sm:text-base font-bold text-[#221514] truncate ${
                                isDone ? "line-through text-gray-400" : ""
                              }`}
                            >
                              {task.title}
                            </h3>

                            {/* Status Badge */}
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                task.status === "DONE"
                                  ? "bg-[#AD3029] text-[#FEEFCD]"
                                  : task.status === "IN_PROGRESS"
                                  ? "bg-[#FEEFCD] text-[#8F2520]"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {task.status.replace("_", " ")}
                            </span>

                            {/* Priority Badge */}
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                task.priority === "HIGH"
                                  ? "bg-[#CD5252] text-white"
                                  : task.priority === "MEDIUM"
                                  ? "bg-[#CC8780] text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {task.description && (
                            <p
                              className={`text-xs leading-relaxed ${
                                isDone ? "text-gray-400" : "text-[#55403E]"
                              }`}
                            >
                              {task.description}
                            </p>
                          )}

                          {/* Date details */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-[#7A6664]">
                            {task.dueDate && (
                              <span className="flex items-center gap-1 font-semibold text-[#8F2520]">
                                📅 Due {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(task)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-[#FAF7F2] hover:text-[#AD3029] transition-colors cursor-pointer"
                          title="Edit task"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[rgba(173,48,41,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#221514]">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                  Title <span className="text-[#AD3029]">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                    editError
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-gray-200 focus:border-[#AD3029] focus:ring-[#FEEFCD]"
                  }`}
                />
                {editError && <p className="mt-1 text-xs text-rose-500">{editError}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm transition-all focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#FEEFCD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#55403E] uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-[#221514] focus:border-[#AD3029] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#AD3029] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#8F2520] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#221514]">Delete Task?</h3>
            <p className="mt-1.5 text-xs text-[#7A6664]">
              Are you sure you want to permanently delete &quot;
              <span className="font-semibold text-[#221514]">{taskToDelete.title}</span>&quot;?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteTask}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
