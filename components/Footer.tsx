export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[rgba(173,48,41,0.08)] bg-[#FAF7F2] py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-[#AD3029] to-[#CD5252] text-white text-xs font-bold shadow-xs">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" fill="#FEEFCD" stroke="none" />
                <ellipse cx="12" cy="12" rx="7" ry="3.5" transform="rotate(-30 12 12)" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#221514]">OrPit</span>
            <span className="text-xs text-[#7A6664]">· Minimalist Workspace</span>
          </div>

          <div className="text-xs text-[#7A6664]">
            © {new Date().getFullYear()} OrPit. Built with Next.js, Prisma & Supabase.
          </div>
        </div>
      </div>
    </footer>
  );
}
