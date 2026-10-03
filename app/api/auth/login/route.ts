import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, verifyPassword } from "@/lib/auth";
import supabase from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find user in Prisma database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let isAuthenticated = false;

    // 1. Try Supabase Auth
    try {
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: String(password),
      });

      if (sbData?.user && !sbError) {
        isAuthenticated = true;
        // If user exists in Supabase but not yet in Prisma, sync into Prisma
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: sbData.user.user_metadata?.name || normalizedEmail.split("@")[0],
              email: normalizedEmail,
              password: "",
            },
          });
        }
      }
    } catch (sbErr) {
      console.warn("Supabase signIn attempt:", sbErr);
    }

    // 2. Fallback to local Prisma password verification (e.g., seeded accounts)
    if (!isAuthenticated && user && user.password) {
      const isPasswordValid = await verifyPassword(String(password), user.password);
      if (isPasswordValid) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: userPayload,
      token,
    });

    // Set HTTP-only session cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
