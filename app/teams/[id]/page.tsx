"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface UserSummary {
  id: string;
  name: string;
  email: string;
}

interface TeamMember {
  id: string;
  role: string;
  joinedAt: string;
  user: UserSummary;
}

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  assignee: UserSummary | null;
  creator: UserSummary | null;
}

interface TeamDetails {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  owner: UserSummary;
  members: TeamMember[];
  tasks: TaskItem[];
}

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.id;

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // View state: 'kanban' or 'list'
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  // Add Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("MEMBER");
  const [addMemberSubmitting, setAddMemberSubmitting] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");

  // Edit Team Modal
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamDesc, setEditTeamDesc] = useState("");
  const [editTeamSubmitting, setEditTeamSubmitting] = useState(false);
  const [editTeamError, setEditTeamError] = useState("");

  // Delete Team Modal
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);

  // Create Task Modal
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStatus, setTaskStatus] = useState("TO_DO");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskError, setTaskError] = useState("");

  // Edit Task Modal
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState("TO_DO");
  const [editTaskPriority, setEditTaskPriority] = useState("MEDIUM");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskAssigneeId, setEditTaskAssigneeId] = useState("");
  const [editTaskSubmitting, setEditTaskSubmitting] = useState(false);
  const [editTaskError, setEditTaskError] = useState("");

  // Delete Task Confirm Modal
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [deleteTaskSubmitting, setDeleteTaskSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/teams/${teamId}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        throw new Error(data.error || "Failed to load team workspace");
      }
      const data: TeamDetails = await res.json();
      setTeam(data);
      setEditTeamName(data.name);
      setEditTeamDesc(data.description || "");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error loading team workspace");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchTeamDetails();
    } else if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, teamId]);

  const isOwner = Boolean(user && team && team.ownerId === user.id);

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) {
      setAddMemberError("Email is required");
      return;
    }

    try {
      setAddMemberSubmitting(true);
      setAddMemberError("");
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail.trim(),
          role: newMemberRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddMemberError(data.error || "Failed to add member");
        return;
      }

      setNewMemberEmail("");
      setShowAddMemberModal(false);
      showToast("Member added to team successfully!");
      fetchTeamDetails();
    } catch {
      setAddMemberError("Network error. Please try again.");
    } finally {
      setAddMemberSubmitting(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberUserId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this team?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/teams/${teamId}/members/${memberUserId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to remove member", "error");
        return;
      }

      showToast("Member removed successfully");
      fetchTeamDetails();
    } catch {
      showToast("Network error removing member", "error");
    }
  };

  // Edit Team
  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeamName.trim()) {
      setEditTeamError("Team name cannot be empty");
      return;
    }

    try {
      setEditTeamSubmitting(true);
      setEditTeamError("");
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editTeamName.trim(),
          description: editTeamDesc.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditTeamError(data.error || "Failed to update team");
        return;
      }

      setShowEditTeamModal(false);
      showToast("Team information updated successfully!");
      fetchTeamDetails();
    } catch {
      setEditTeamError("Network error. Please try again.");
    } finally {
      setEditTeamSubmitting(false);
    }
  };

  // Delete Team
  const handleDeleteTeam = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to delete team", "error");
        return;
      }

      showToast("Team deleted successfully");
      router.push("/teams");
    } catch {
      showToast("Network error deleting team", "error");
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setTaskError("Task title is required");
      return;
    }

    try {
      setTaskSubmitting(true);
      setTaskError("");
      const res = await fetch(`/api/teams/${teamId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim() || null,
          status: taskStatus,
          priority: taskPriority,
          dueDate: taskDueDate || null,
          assigneeId: taskAssigneeId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTaskError(data.error || "Failed to create task");
        return;
      }

      setTaskTitle("");
      setTaskDesc("");
      setTaskStatus("TO_DO");
      setTaskPriority("MEDIUM");
      setTaskDueDate("");
      setTaskAssigneeId("");
      setShowCreateTaskModal(false);
      showToast("Task created successfully!");
      fetchTeamDetails();
    } catch {
      setTaskError("Network error. Please try again.");
    } finally {
      setTaskSubmitting(false);
    }
  };

  // Open Edit Task Modal
  const openEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description || "");
    setEditTaskStatus(task.status);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
    );
    setEditTaskAssigneeId(task.assignee?.id || "");
    setEditTaskError("");
  };

  // Update Task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    if (!editTaskTitle.trim()) {
      setEditTaskError("Task title cannot be empty");
      return;
    }

    try {
      setEditTaskSubmitting(true);
      setEditTaskError("");
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTaskTitle.trim(),
          description: editTaskDesc.trim() || null,
          status: editTaskStatus,
          priority: editTaskPriority,
          dueDate: editTaskDueDate || null,
          assigneeId: editTaskAssigneeId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditTaskError(data.error || "Failed to update task");
        return;
      }

      setEditingTask(null);
      showToast("Task updated successfully!");
      fetchTeamDetails();
    } catch {
      setEditTaskError("Network error. Please try again.");
    } finally {
      setEditTaskSubmitting(false);
    }
  };

  // Quick Change Status (for Kanban move buttons)
  const handleQuickStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Failed to update task status", "error");
        return;
      }

      showToast("Status updated");
      fetchTeamDetails();
    } catch {
      showToast("Network error updating status", "error");
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setDeleteTaskSubmitting(true);
      const res = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to delete task", "error");
        return;
      }

      setTaskToDelete(null);
      showToast("Task deleted successfully");
      fetchTeamDetails();
    } catch {
      showToast("Network error deleting task", "error");
    } finally {
      setDeleteTaskSubmitting(false);
    }
  };

  // Check if current user can delete task:
  // "Only the task creator, the assignee, or the team Owner can delete a task."
  const canDeleteTask = (task: TaskItem) => {
    if (!user) return false;
    if (isOwner) return true;
    if (task.creator && task.creator.id === user.id) return true;
    if (task.assignee && task.assignee.id === user.id) return true;
    return false;
  };

  // Filter and sort tasks (Completed tasks moved to the bottom)
  const filteredTasks = useMemo(() => {
    if (!team) return [];
    const list = team.tasks.filter((t) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query) ?? false;
        if (!matchesTitle && !matchesDesc) return false;
      }
      // Status
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      // Priority
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      // Assignee
      if (assigneeFilter !== "ALL") {
        if (assigneeFilter === "UNASSIGNED" && t.assignee !== null) return false;
        if (assigneeFilter !== "UNASSIGNED" && t.assignee?.id !== assigneeFilter) return false;
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
  }, [team, search, statusFilter, priorityFilter, assigneeFilter]);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#AD3029]/20 border-t-[#AD3029]" />
          <p className="text-xs font-semibold text-[#7A6664]">Loading team workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-red-600">Access Error</h2>
          <p className="mt-2 text-xs text-[#7A6664]">{error || "Team not found"}</p>
          <div className="mt-6">
            <Link
              href="/teams"
              className="rounded-xl bg-[#AD3029] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8F2520]"
            >
              Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Kanban grouped columns
  const todoTasks = filteredTasks.filter((t) => t.status === "TO_DO");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = filteredTasks.filter((t) => t.status === "DONE");

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-8 sm:px-10 lg:px-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-5 ${
            toastMessage.type === "error" ? "bg-red-600" : "bg-[#AD3029]"
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A6664] mb-4">
        <Link href="/teams" className="hover:text-[#AD3029] font-medium transition-colors">
          ← All Teams
        </Link>
        <span>/</span>
        <span className="font-semibold text-[#221514]">{team.name}</span>
      </div>

      {/* Team Header Card */}
      <div className="rounded-3xl border border-[rgba(173,48,41,0.12)] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#221514]">
                {team.name}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isOwner
                    ? "bg-[#AD3029] text-white"
                    : "bg-[#FEEFCD] text-[#8F2520]"
                }`}
              >
                {isOwner ? "👑 Team Owner" : "👤 Team Member"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#7A6664] leading-relaxed">
              {team.description || "No description for this team workspace."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#55403E] pt-2">
              <div>
                Owner: <strong className="text-[#221514]">{team.owner.name}</strong> ({team.owner.email})
              </div>
              <div className="h-3 w-px bg-gray-200" />
              <div>
                Created: <strong className="text-[#221514]">{new Date(team.createdAt).toLocaleDateString()}</strong>
              </div>
            </div>
          </div>

          {/* Team Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isOwner && (
              <>
                <button
                  onClick={() => setShowEditTeamModal(true)}
                  className="rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2 text-xs font-semibold text-[#AD3029] hover:bg-[#FEEFCD]/40 cursor-pointer"
                >
                  Edit Team
                </button>
                <button
                  onClick={() => setShowDeleteTeamModal(true)}
                  className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Delete Team
                </button>
              </>
            )}

            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#AD3029] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#AD3029]/20 hover:bg-[#8F2520] cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Member Management Section */}
        <div className="mt-8 border-t border-[rgba(173,48,41,0.08)] pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#221514]">
                Team Members ({team.members.length})
              </h2>
              <span className="text-[11px] text-[#7A6664]">
                Collaborators with workspace access
              </span>
            </div>

            {isOwner && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-[#FEEFCD] px-3 py-1.5 text-xs font-bold text-[#8F2520] hover:bg-[#AD3029] hover:text-white transition-all cursor-pointer"
              >
                <span>+ Add Member by Email</span>
              </button>
            )}
          </div>

          {/* Members List Chips */}
          <div className="flex flex-wrap gap-2.5">
            {team.members.map((m) => {
              const isMemberOwner = m.role === "OWNER" || m.user.id === team.ownerId;
              const isCurrentUser = user && user.id === m.user.id;

              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-2xl border border-[rgba(173,48,41,0.12)] bg-[#FAF7F2] py-1.5 pl-2 pr-3 text-xs"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FEEFCD] text-[10px] font-bold text-[#8F2520]">
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <span className="font-semibold text-[#221514]">
                      {m.user.name} {isCurrentUser && "(You)"}
                    </span>
                    <span className="ml-1 text-[10px] text-[#7A6664]">
                      {m.user.email}
                    </span>
                  </div>

                  <span
                    className={`ml-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      isMemberOwner
                        ? "bg-[#AD3029] text-white"
                        : "bg-white text-[#7A6664] border border-gray-200"
                    }`}
                  >
                    {isMemberOwner ? "Owner" : "Member"}
                  </span>

                  {/* Remove Member button (Owner only, cannot remove owner) */}
                  {isOwner && !isMemberOwner && (
                    <button
                      onClick={() => handleRemoveMember(m.user.id, m.user.name)}
                      title="Remove member from team"
                      className="ml-1 text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tasks Controls & Filters */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[rgba(173,48,41,0.15)] bg-white px-3.5 py-2 text-xs text-[#221514] placeholder-[#7A6664]/50 focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#AD3029]/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2 text-xs text-[#7A6664] hover:text-[#221514]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[rgba(173,48,41,0.15)] bg-white px-3 py-2 text-xs text-[#55403E] focus:border-[#AD3029] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="TO_DO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-[rgba(173,48,41,0.15)] bg-white px-3 py-2 text-xs text-[#55403E] focus:border-[#AD3029] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-xl border border-[rgba(173,48,41,0.15)] bg-white px-3 py-2 text-xs text-[#55403E] focus:border-[#AD3029] focus:outline-none"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {team.members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher: Board vs Table */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-white p-1 border border-[rgba(173,48,41,0.12)]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-[#AD3029] text-white shadow-xs"
                  : "text-[#55403E] hover:text-[#AD3029]"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#AD3029] text-white shadow-xs"
                  : "text-[#55403E] hover:text-[#AD3029]"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Views */}
      {viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW (Bonus Feature) */
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column: TO DO */}
          <div className="rounded-3xl border border-[rgba(173,48,41,0.1)] bg-[#FAF7F2]/60 p-4">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-[rgba(173,48,41,0.1)]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#221514]">
                  To Do
                </h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#7A6664] border border-gray-200">
                {todoTasks.length}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {todoTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                  No tasks to do
                </div>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => setTaskToDelete(task)}
                    canDelete={canDeleteTask(task)}
                    onMoveStatus={(newStatus) => handleQuickStatusChange(task.id, newStatus)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column: IN PROGRESS */}
          <div className="rounded-3xl border border-[rgba(173,48,41,0.1)] bg-[#FAF7F2]/60 p-4">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-[rgba(173,48,41,0.1)]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#221514]">
                  In Progress
                </h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#7A6664] border border-gray-200">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {inProgressTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                  No tasks in progress
                </div>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => setTaskToDelete(task)}
                    canDelete={canDeleteTask(task)}
                    onMoveStatus={(newStatus) => handleQuickStatusChange(task.id, newStatus)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column: DONE */}
          <div className="rounded-3xl border border-[rgba(173,48,41,0.1)] bg-[#FAF7F2]/60 p-4">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-[rgba(173,48,41,0.1)]">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#221514]">
                  Done
                </h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#7A6664] border border-gray-200">
                {doneTasks.length}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {doneTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                  No completed tasks yet
                </div>
              ) : (
                doneTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => setTaskToDelete(task)}
                    canDelete={canDeleteTask(task)}
                    onMoveStatus={(newStatus) => handleQuickStatusChange(task.id, newStatus)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="mt-6 overflow-hidden rounded-3xl border border-[rgba(173,48,41,0.12)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-[#FAF7F2] text-[11px] font-bold text-[#7A6664] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Task Title</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Assignee</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#221514]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No tasks found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const userCanDelete = canDeleteTask(task);
                    return (
                      <tr key={task.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#221514]">{task.title}</p>
                          {task.description && (
                            <p className="mt-0.5 text-[11px] text-[#7A6664] line-clamp-1 max-w-sm">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-6 py-4">
                          {task.assignee ? (
                            <div className="flex items-center gap-1.5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FEEFCD] text-[9px] font-bold text-[#8F2520]">
                                {task.assignee.name.charAt(0)}
                              </div>
                              <span className="font-medium">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#7A6664]">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditTask(task)}
                              className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-[#55403E] hover:bg-gray-100 hover:text-[#AD3029] cursor-pointer"
                            >
                              Edit
                            </button>
                            {userCanDelete ? (
                              <button
                                onClick={() => setTaskToDelete(task)}
                                className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 cursor-pointer"
                              >
                                Delete
                              </button>
                            ) : (
                              <span
                                title="Only creator, assignee, or team owner can delete"
                                className="text-[11px] text-gray-300 cursor-not-allowed px-1"
                              >
                                Locked
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[rgba(173,48,41,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#221514]">Create Task in {team.name}</h3>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {taskError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {taskError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#55403E]">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement authentication middleware"
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#AD3029]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55403E]">Description</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Task details and acceptance criteria..."
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#AD3029]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#55403E]">Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#55403E]">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#55403E]">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#55403E]">Assignee</label>
                  <select
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {team.members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name} ({m.user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskSubmitting}
                  className="rounded-xl bg-[#AD3029] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8F2520] disabled:opacity-60 cursor-pointer"
                >
                  {taskSubmitting ? "Saving..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[rgba(173,48,41,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#221514]">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editTaskError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {editTaskError}
              </div>
            )}

            <form onSubmit={handleUpdateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#55403E]">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55403E]">Description</label>
                <textarea
                  rows={3}
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#55403E]">Status</label>
                  <select
                    value={editTaskStatus}
                    onChange={(e) => setEditTaskStatus(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#55403E]">Priority</label>
                  <select
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#55403E]">Due Date</label>
                  <input
                    type="date"
                    value={editTaskDueDate}
                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#55403E]">Assignee</label>
                  <select
                    value={editTaskAssigneeId}
                    onChange={(e) => setEditTaskAssigneeId(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {team.members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name} ({m.user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editTaskSubmitting}
                  className="rounded-xl bg-[#AD3029] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8F2520] disabled:opacity-60 cursor-pointer"
                >
                  {editTaskSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TASK CONFIRM MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#221514]">Delete Task</h3>
            <p className="mt-2 text-xs text-[#7A6664]">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[#221514]">&ldquo;{taskToDelete.title}&rdquo;</strong>?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteTaskSubmitting}
                onClick={handleDeleteTask}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              >
                {deleteTaskSubmitting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL (Owner only) */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[rgba(173,48,41,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#221514]">Add Member to Team</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addMemberError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {addMemberError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#55403E]">
                  Member Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="colleague@domain.com"
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2.5 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#7A6664]">
                  Enter the email address of a registered OrPit user.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55403E]">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                >
                  <option value="MEMBER">Member (Can create & update tasks)</option>
                  <option value="OWNER">Co-Owner (Full team management)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMemberSubmitting}
                  className="rounded-xl bg-[#AD3029] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8F2520] disabled:opacity-60 cursor-pointer"
                >
                  {addMemberSubmitting ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEAM MODAL */}
      {showEditTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[rgba(173,48,41,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#221514]">Edit Team Info</h3>
              <button
                onClick={() => setShowEditTeamModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editTeamError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {editTeamError}
              </div>
            )}

            <form onSubmit={handleUpdateTeam} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#55403E]">Team Name</label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55403E]">Description</label>
                <textarea
                  rows={3}
                  value={editTeamDesc}
                  onChange={(e) => setEditTeamDesc(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2 text-xs text-[#221514] focus:border-[#AD3029] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditTeamModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editTeamSubmitting}
                  className="rounded-xl bg-[#AD3029] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8F2520] disabled:opacity-60 cursor-pointer"
                >
                  {editTeamSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TEAM CONFIRM MODAL */}
      {showDeleteTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-red-600">Delete Entire Team?</h3>
            <p className="mt-2 text-xs text-[#7A6664] leading-relaxed">
              This will permanently delete the team <strong className="text-[#221514]">&ldquo;{team.name}&rdquo;</strong> and all associated tasks and member records. This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteTeamModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Kanban Task Card Component
function TaskCard({
  task,
  onEdit,
  onDelete,
  canDelete,
  onMoveStatus,
}: {
  task: TaskItem;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onMoveStatus: (status: string) => void;
}) {
  return (
    <div className="group rounded-2xl border border-[rgba(173,48,41,0.12)] bg-white p-4 shadow-2xs transition-all hover:border-[#AD3029]/30 hover:shadow-sm">
      {/* Header: Priority & Quick Move Buttons */}
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />

        {/* Quick move dropdown or cycle */}
        <div className="flex items-center gap-1">
          {task.status !== "TO_DO" && (
            <button
              onClick={() => onMoveStatus("TO_DO")}
              title="Move back to To Do"
              className="rounded p-1 text-[10px] text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
            >
              ← To Do
            </button>
          )}
          {task.status !== "IN_PROGRESS" && (
            <button
              onClick={() => onMoveStatus("IN_PROGRESS")}
              title="Move to In Progress"
              className="rounded p-1 text-[10px] text-amber-600 hover:bg-amber-50 cursor-pointer"
            >
              Progress
            </button>
          )}
          {task.status !== "DONE" && (
            <button
              onClick={() => onMoveStatus("DONE")}
              title="Mark as Done"
              className="rounded p-1 text-[10px] text-emerald-600 hover:bg-emerald-50 cursor-pointer"
            >
              Done →
            </button>
          )}
        </div>
      </div>

      {/* Task Content */}
      <h4 className="mt-2.5 text-xs font-bold text-[#221514] leading-snug">
        {task.title}
      </h4>
      {task.description && (
        <p className="mt-1 text-[11px] text-[#7A6664] line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer Info: Assignee & Due Date */}
      <div className="mt-3.5 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px]">
        {task.assignee ? (
          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.name}`}>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FEEFCD] text-[9px] font-bold text-[#8F2520]">
              {task.assignee.name.charAt(0)}
            </div>
            <span className="font-medium text-[#55403E] truncate max-w-[80px]">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 italic">Unassigned</span>
        )}

        {task.dueDate && (
          <span className="text-[10px] text-[#7A6664] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-gray-200">
            📅 {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="mt-2.5 flex items-center justify-end gap-1.5 pt-1">
        <button
          onClick={onEdit}
          className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-semibold text-[#55403E] hover:bg-gray-100 hover:text-[#AD3029] cursor-pointer"
        >
          Edit
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-100 cursor-pointer"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "DONE":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Done
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          In Progress
        </span>
      );
    case "TO_DO":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          To Do
        </span>
      );
  }
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "HIGH":
      return (
        <span className="inline-flex items-center rounded-md bg-[#AD3029]/10 px-2 py-0.5 text-[10px] font-bold text-[#AD3029] border border-[#AD3029]/20">
          High
        </span>
      );
    case "LOW":
      return (
        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border border-gray-200">
          Low
        </span>
      );
    case "MEDIUM":
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-[#CC8780]/20 px-2 py-0.5 text-[10px] font-bold text-[#8F2520] border border-[#CC8780]/30">
          Medium
        </span>
      );
  }
}
