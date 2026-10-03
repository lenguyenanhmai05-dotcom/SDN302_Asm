"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TeamItem {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: TeamMember[];
  _count: {
    tasks: number;
    members: number;
  };
}

export default function TeamsDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Team Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teams", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      } else if (res.status === 401) {
        // Not authenticated
      }
    } catch (err) {
      console.error("Failed to load teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchTeams();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setCreateError("Team name is required");
      return;
    }

    try {
      setCreateSubmitting(true);
      setCreateError("");
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamName.trim(),
          description: newTeamDescription.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create team");
        return;
      }

      setNewTeamName("");
      setNewTeamDescription("");
      setShowCreateModal(false);
      // Refresh teams list
      await fetchTeams();
      // Optional: navigate directly to new team
      router.push(`/teams/${data.id}`);
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // If auth is loading, show loading placeholder
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#AD3029]/20 border-t-[#AD3029]" />
          <p className="text-xs font-semibold text-[#7A6664]">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  // If not logged in, prompt to log in
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 sm:px-6 text-center">
        <div className="rounded-3xl border border-[rgba(173,48,41,0.14)] bg-white p-8 sm:p-12 shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEEFCD] text-[#AD3029] shadow-inner mb-5">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#221514]">Sign in required</h1>
          <p className="mt-2 text-sm text-[#7A6664]">
            You need to be logged in to view your teams, invite members, and collaborate on shared tasks.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[#AD3029] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#8F2520] transition-all"
            >
              Sign In Now
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-5 py-2.5 text-xs font-semibold text-[#AD3029] hover:bg-[#FEEFCD]/40 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter teams by search query
  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-10 lg:px-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(173,48,41,0.08)] pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#FEEFCD] px-2 py-0.5 text-[11px] font-bold text-[#8F2520]">
              Workspace
            </span>
            <span className="text-xs text-[#7A6664]">
              Logged in as <strong className="text-[#221514]">{user.name}</strong>
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#221514]">
            My Team Workspaces
          </h1>
          <p className="mt-1 text-sm text-[#7A6664]">
            Collaborate, organize role-based access, and manage tasks across your teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#AD3029] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#AD3029]/20 transition-all hover:bg-[#8F2520] hover:shadow-lg cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Team</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search teams by name..."
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

        <div className="text-xs text-[#7A6664]">
          Showing <strong className="text-[#221514]">{filteredTeams.length}</strong> of{" "}
          {teams.length} teams
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-3xl border border-gray-100 bg-white/60 p-6"
            />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-[rgba(173,48,41,0.2)] bg-white/40 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEEFCD] text-[#AD3029] mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#221514]">No teams found</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#7A6664]">
            {search
              ? "No teams matched your search. Try another query."
              : "You do not belong to any team yet. Create your first team now to get started!"}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 rounded-xl bg-[#AD3029] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#8F2520] transition-all cursor-pointer"
            >
              + Create First Team
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => {
            const isOwner = team.ownerId === user.id;
            return (
              <div
                key={team.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-[rgba(173,48,41,0.12)] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#AD3029]/30 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isOwner
                          ? "bg-[#AD3029] text-white"
                          : "bg-[#FEEFCD] text-[#8F2520]"
                      }`}
                    >
                      {isOwner ? "👑 Owner" : "👤 Member"}
                    </span>
                    <span className="text-[11px] text-[#7A6664]">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-[#221514] group-hover:text-[#AD3029] transition-colors">
                    {team.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#7A6664] line-clamp-2 min-h-[32px]">
                    {team.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  {/* Meta counts */}
                  <div className="flex items-center justify-between text-xs text-[#55403E] mb-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-[#CD5252]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{team._count.members} Members</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-[#AD3029]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>{team._count.tasks} Tasks</span>
                    </div>
                  </div>

                  {/* Open Link */}
                  <Link
                    href={`/teams/${team.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FAF7F2] py-2.5 text-xs font-semibold text-[#AD3029] border border-[rgba(173,48,41,0.15)] transition-all hover:bg-[#AD3029] hover:text-white"
                  >
                    <span>Open Team Workspace</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[rgba(173,48,41,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#221514]">Create New Team</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#55403E]">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Design System & Frontend"
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2.5 text-sm text-[#221514] placeholder-[#7A6664]/50 focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#AD3029]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55403E]">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="What is this team working on?"
                  className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2.5 text-sm text-[#221514] placeholder-[#7A6664]/50 focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#AD3029]/20"
                />
              </div>

              <div className="rounded-xl bg-[#FAF7F2] p-3 text-xs text-[#7A6664] border border-[#FEEFCD]">
                <p>
                  As creator, you will automatically be designated as the{" "}
                  <strong className="text-[#AD3029]">Owner</strong> with full permissions to manage members and tasks.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="rounded-xl bg-[#AD3029] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#8F2520] disabled:opacity-60 cursor-pointer"
                >
                  {createSubmitting ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
