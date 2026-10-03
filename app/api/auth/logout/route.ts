import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function POST() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase signOut error:", err);
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear session cookie
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
