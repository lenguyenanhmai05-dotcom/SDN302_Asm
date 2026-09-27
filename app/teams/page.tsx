import Link from "next/link";

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-jade-border bg-white p-8 sm:p-12 shadow-xl shadow-[#45834D]/5 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#AEDBB8]/30 px-3 py-1 text-xs font-semibold text-[#45834D] mb-6">
          <span className="h-2 w-2 rounded-full bg-[#45834D] animate-ping" />
          <span>SDN302 – Planned for Assignment 2</span>
        </div>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#AEDBB8] via-[#8FCA97] to-[#45834D] text-white shadow-lg shadow-[#45834D]/20 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#142217] sm:text-4xl">
          Team Collaboration & Workspaces
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-neutral-600 sm:text-lg">
          Tính năng quản lý nhóm, phân quyền thành viên và phân công công việc (Task Assignment)
          đang được hoàn thiện và sẽ chính thức ra mắt trong **Assignment 2**!
        </p>

        {/* Feature Preview Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-jade-border bg-[#f2f8f4]/60 p-5 transition-all hover:bg-[#f2f8f4]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#45834D] shadow-xs mb-3">
              🏢
            </div>
            <h3 className="font-bold text-[#142217]">Multi-team Support</h3>
            <p className="mt-1 text-xs text-neutral-600">
              Tạo và quản lý nhiều nhóm làm việc với các dự án riêng biệt.
            </p>
          </div>

          <div className="rounded-2xl border border-jade-border bg-[#f2f8f4]/60 p-5 transition-all hover:bg-[#f2f8f4]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#45834D] shadow-xs mb-3">
              👥
            </div>
            <h3 className="font-bold text-[#142217]">Role & Permissions</h3>
            <p className="mt-1 text-xs text-neutral-600">
              Phân quyền rõ ràng giữa Owner, Admin và Member với bảng TeamMember.
            </p>
          </div>

          <div className="rounded-2xl border border-jade-border bg-[#f2f8f4]/60 p-5 transition-all hover:bg-[#f2f8f4]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#45834D] shadow-xs mb-3">
              🎯
            </div>
            <h3 className="font-bold text-[#142217]">Task Assignment</h3>
            <p className="mt-1 text-xs text-neutral-600">
              Giao việc trực tiếp cho thành viên trong nhóm kèm deadline cụ thể.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#45834D] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#45834D]/20 transition-all hover:bg-[#34673b] hover:shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Quay về trang danh sách Tasks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
