"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[rgba(173,48,41,0.08)] bg-[#FAF7F2]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-6 sm:px-10 lg:px-12">
          {/* Logo & Brand: OrPit */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#AD3029] via-[#CD5252] to-[#CC8780] shadow-md shadow-[#AD3029]/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#AD3029]/30">
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
                <ellipse
                  cx="12"
                  cy="12"
                  rx="8"
                  ry="4"
                  transform="rotate(-30 12 12)"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-[#221514]">
                OrPit
              </span>
              <span className="rounded-full bg-[#FEEFCD] px-2 py-0.5 text-[10px] font-bold text-[#8F2520]">
                v2
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                pathname === "/"
                  ? "bg-[#AD3029] text-white shadow-xs"
                  : "text-[#55403E] hover:bg-[rgba(173,48,41,0.06)] hover:text-[#AD3029]"
              }`}
            >
              Public Tasks
            </Link>

            <Link
              href="/teams"
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                pathname.startsWith("/teams")
                  ? "bg-[#AD3029] text-white shadow-xs"
                  : "text-[#55403E] hover:bg-[rgba(173,48,41,0.06)] hover:text-[#AD3029]"
              }`}
            >
              <span>Teams & Workspace</span>
            </Link>

            <div className="mx-1 h-5 w-px bg-[rgba(173,48,41,0.15)]" />

            {/* Auth Actions */}
            {!loading && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-xl bg-white border border-[rgba(173,48,41,0.12)] shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEEFCD] text-xs font-bold text-[#8F2520]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#221514] leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-[#7A6664] leading-tight truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Logout"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2 text-xs font-semibold text-[#AD3029] shadow-2xs transition-all hover:bg-[#FEEFCD]/40 hover:border-[#AD3029] cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : !loading ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#AD3029] hover:bg-[rgba(173,48,41,0.06)] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-[#AD3029] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-[#8F2520] transition-all"
                >
                  Register
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[rgba(173,48,41,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#221514]">Confirm Logout</h3>
            <p className="mt-2 text-xs text-[#7A6664] leading-relaxed">
              Are you sure you want to log out of your OrPit workspace account?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                }}
                className="rounded-xl bg-[#AD3029] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8F2520] cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
