import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import supabase from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check email uniqueness in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // If it's the student account seeded initially, update password and log in
      if (normalizedEmail === "lenguyenanhmai05@gmail.com") {
        const hashedPassword = await hashPassword(password);
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name.trim() || existingUser.name,
            password: hashedPassword,
          },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        });

        // Register in Supabase Auth as well
        try {
          await supabase.auth.signUp({
            email: normalizedEmail,
            password: password,
            options: { data: { name: name.trim() } },
          });
        } catch {}

        const token = await signToken({
          userId: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        });

        const response = NextResponse.json(
          {
            success: true,
            message: "Account claimed and signed in successfully",
            user: updatedUser,
            token,
          },
          { status: 201 }
        );

        response.cookies.set({
          name: "token",
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });

        return response;
      }

      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // Register with Supabase Auth
    try {
      const { error: supabaseError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: { name: name.trim() },
        },
      });
      if (supabaseError) {
        console.warn("Supabase signUp note:", supabaseError.message);
      }
    } catch (sbErr) {
      console.warn("Supabase signUp warning:", sbErr);
    }

    // Hash password & create user in Prisma database
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user,
        token,
      },
      { status: 201 }
    );

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
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
