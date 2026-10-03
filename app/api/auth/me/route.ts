import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized", user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", user: null }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ error: "Failed to get user profile" }, { status: 500 });
  }
}
