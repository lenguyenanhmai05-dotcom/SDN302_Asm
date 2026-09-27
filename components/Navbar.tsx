"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-jade-border bg-white/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8FCA97] to-[#45834D] text-white shadow-md shadow-[#45834D]/20 transition-transform group-hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#142217]">TaskTeam</span>
                <span className="rounded-md bg-[#AEDBB8]/40 px-1.5 py-0.5 text-xs font-semibold text-[#45834D]">
                  SDN302
                </span>
              </div>
              <p className="text-[11px] text-[#68A877]">Workspace Management</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 sm:flex md:gap-2">
            <Link
              href="/"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                pathname === "/"
                  ? "bg-[#AEDBB8]/30 font-semibold text-[#45834D]"
                  : "text-neutral-600 hover:bg-[#f2f8f4] hover:text-[#45834D]"
              }`}
            >
              Home
            </Link>

            <Link
              href="/teams"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                pathname === "/teams"
                  ? "bg-[#AEDBB8]/30 font-semibold text-[#45834D]"
                  : "text-neutral-600 hover:bg-[#f2f8f4] hover:text-[#45834D]"
              }`}
            >
              <span>Teams</span>
              <span className="rounded-full bg-[#68A877]/15 px-2 py-0.5 text-[10px] font-semibold text-[#45834D]">
                Soon
              </span>
            </Link>

            <button
              onClick={() => setShowLoginModal(true)}
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-jade-border bg-white px-3.5 py-2 text-sm font-medium text-[#45834D] shadow-xs transition-all hover:bg-[#f2f8f4] hover:border-[#68A877]"
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Login</span>
            </button>

            {/* Supabase status badge */}
            <div className="ml-2 flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Live</span>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-neutral-600 hover:bg-[#f2f8f4] hover:text-[#45834D]"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-jade-border bg-white px-4 py-4 sm:hidden space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-2 text-base font-medium ${
                pathname === "/"
                  ? "bg-[#AEDBB8]/30 font-semibold text-[#45834D]"
                  : "text-neutral-700 hover:bg-[#f2f8f4]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/teams"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-base font-medium ${
                pathname === "/teams"
                  ? "bg-[#AEDBB8]/30 font-semibold text-[#45834D]"
                  : "text-neutral-700 hover:bg-[#f2f8f4]"
              }`}
            >
              <span>Teams</span>
              <span className="rounded-full bg-[#68A877]/15 px-2 py-0.5 text-xs font-semibold text-[#45834D]">
                Assignment 2
              </span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLoginModal(true);
              }}
              className="w-full text-left rounded-lg px-3 py-2 text-base font-medium text-[#45834D] hover:bg-[#f2f8f4]"
            >
              Login (Assignment 2)
            </button>
            <div className="pt-2">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-xs font-medium text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Supabase PostgreSQL Connected</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Login Placeholder Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-jade-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-[#AEDBB8]/30 p-2 text-[#45834D]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-800">Authentication</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-3">
              <p className="text-sm text-neutral-600">
                Chào mừng bạn! Tính năng Đăng nhập & Xác thực người dùng (Authentication) sẽ được
                xây dựng trong **Assignment 2**.
              </p>
              <div className="rounded-xl bg-[#f2f8f4] p-3 text-xs text-[#34673b] border border-[#AEDBB8]/60 space-y-1">
                <p className="font-semibold">Theo yêu cầu Assignment 1:</p>
                <p>
                  Trang CRUD Task hiện tại hoạt động công khai hoàn toàn (public) — bất kỳ ai cũng có
                  thể thêm, xem, sửa, xóa công việc trực tiếp mà không cần đăng nhập.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLoginModal(false)}
                className="rounded-xl bg-[#45834D] px-4 py-2 text-sm font-medium text-white hover:bg-[#34673b] transition-all"
              >
                Đã hiểu, quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
