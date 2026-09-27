import Link from "next/link";

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-[rgba(173,48,41,0.12)] bg-white p-8 sm:p-12 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEEFCD] text-[#AD3029] shadow-inner mb-6">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>

        <span className="rounded-full bg-[#FEEFCD] px-3 py-1 text-xs font-semibold text-[#8F2520]">
          Coming in Version 2
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#221514] sm:text-3xl">
          Team Workspaces & Roles
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#7A6664] leading-relaxed">
          Collaborative team spaces, role-based access control, and direct task assignments are
          being prepared for the next release.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#AD3029] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#8F2520]"
          >
            <span>Back to Tasks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
