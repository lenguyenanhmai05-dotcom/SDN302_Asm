"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[rgba(173,48,41,0.08)] bg-[#FAF7F2]/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Brand: OrPit */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#AD3029] via-[#CD5252] to-[#CC8780] shadow-md shadow-[#AD3029]/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#AD3029]/30">
              {/* OrPit Orbital Planetary Icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3.5" fill="#FEEFCD" stroke="none" />
                <ellipse cx="12" cy="12" rx="8" ry="4" transform="rotate(-30 12 12)" stroke="#FFFFFF" strokeWidth="1.8" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#221514]">
                OrPit
              </span>
            </div>
          </Link>

          {/* Clean Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                pathname === "/"
                  ? "bg-[#AD3029] text-white shadow-xs"
                  : "text-[#55403E] hover:bg-[rgba(173,48,41,0.06)] hover:text-[#AD3029]"
              }`}
            >
              Tasks
            </Link>

            <Link
              href="/teams"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                pathname === "/teams"
                  ? "bg-[#AD3029] text-white shadow-xs"
                  : "text-[#55403E] hover:bg-[rgba(173,48,41,0.06)] hover:text-[#AD3029]"
              }`}
            >
              <span>Teams</span>
              <span className="rounded-full bg-[#FEEFCD] px-1.5 py-0.2 text-[10px] font-semibold text-[#8F2520]">
                v2
              </span>
            </Link>

            <div className="mx-1 h-4 w-px bg-[rgba(173,48,41,0.15)]" />

            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-1.5 text-sm font-medium text-[#AD3029] shadow-2xs transition-all hover:bg-[#FEEFCD]/40 hover:border-[#AD3029] cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Login Placeholder Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[rgba(173,48,41,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEEFCD] text-[#AD3029]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#221514]">Sign In</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-2">
              <p className="text-xs text-[#55403E] leading-relaxed">
                Authentication and multi-user team spaces will be available in the upcoming version.
              </p>
              <div className="rounded-xl bg-[#FAF7F2] p-3 text-xs text-[#8F2520] border border-[#FEEFCD]">
                <p className="font-semibold mb-1">Public Workspace</p>
                <p className="text-[#55403E]">
                  You can freely create, view, edit, and manage all tasks right now on the homepage.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowLoginModal(false)}
                className="rounded-xl bg-[#AD3029] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8F2520] transition-all cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
