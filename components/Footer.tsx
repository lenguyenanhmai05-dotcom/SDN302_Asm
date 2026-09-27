export default function Footer() {
  return (
    <footer className="mt-auto border-t border-jade-border bg-white/70 py-8 backdrop-blur-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8FCA97] to-[#45834D] text-white font-bold text-xs">
              TT
            </div>
            <div>
              <p className="text-sm font-semibold text-[#142217]">
                Task & Team Management Application
              </p>
              <p className="text-xs text-[#68A877]">
                SDN302 – Assignment 1: Project Setup, Prisma & Deployment
              </p>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-md bg-[#f2f8f4] px-2.5 py-1 font-medium text-[#45834D] border border-jade-border">
              Next.js 16 (App Router)
            </span>
            <span className="rounded-md bg-[#f2f8f4] px-2.5 py-1 font-medium text-[#45834D] border border-jade-border">
              Prisma ORM
            </span>
            <span className="rounded-md bg-[#f2f8f4] px-2.5 py-1 font-medium text-[#45834D] border border-jade-border">
              Supabase PostgreSQL
            </span>
            <span className="rounded-md bg-[#f2f8f4] px-2.5 py-1 font-medium text-[#45834D] border border-jade-border">
              Tailwind CSS
            </span>
            <span className="rounded-md bg-[#f2f8f4] px-2.5 py-1 font-medium text-[#45834D] border border-jade-border">
              Vercel
            </span>
          </div>

          <div className="text-xs text-neutral-500">
            <span>© 2026 TaskTeam. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
