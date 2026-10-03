"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await login(email, password);
      if (result.success) {
        router.push("/teams");
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillGraderAccount = () => {
    setEmail("grader@sdn302.edu.vn");
    setPassword("Password123!");
    setError("");
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[rgba(173,48,41,0.14)] bg-white p-8 sm:p-10 shadow-lg shadow-[#AD3029]/5">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#AD3029] via-[#CD5252] to-[#CC8780] shadow-md shadow-[#AD3029]/20">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#221514] sm:text-3xl">
            Welcome to OrPit
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#7A6664]">
            Sign in to access your teams, workspaces, and assignments.
          </p>
        </div>

        {/* Quick Demo Grader Account Box */}
        <div className="rounded-2xl border border-[#FEEFCD] bg-[#FAF7F2] p-4 text-xs text-[#55403E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[#8F2520]">⚡ Grader Test Account</p>
              <p className="text-[11px] text-[#7A6664] mt-0.5">grader@sdn302.edu.vn / Password123!</p>
            </div>
            <button
              type="button"
              onClick={handleFillGraderAccount}
              className="rounded-lg bg-[#FEEFCD] px-2.5 py-1 text-xs font-semibold text-[#8F2520] hover:bg-[#AD3029] hover:text-white transition-all cursor-pointer"
            >
              Quick Fill
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2">
            <svg className="h-4 w-4 shrink-0 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#55403E]">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2.5 text-sm text-[#221514] placeholder-[#7A6664]/50 focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#AD3029]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#55403E]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-xl border border-[rgba(173,48,41,0.2)] bg-white px-3.5 py-2.5 text-sm text-[#221514] placeholder-[#7A6664]/50 focus:border-[#AD3029] focus:outline-none focus:ring-2 focus:ring-[#AD3029]/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#AD3029] py-3 text-sm font-semibold text-white shadow-md shadow-[#AD3029]/20 transition-all hover:bg-[#8F2520] hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Sign In to Workspace"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#7A6664]">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-bold text-[#AD3029] hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
