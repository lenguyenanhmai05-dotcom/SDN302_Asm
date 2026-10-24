import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createNotification, logActivity } from "@/lib/notifications";

// POST /api/teams/[id]/members - Add a member to a team by email (Owner or Admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Role check: Owner or Admin
    const isOwner = team.ownerId === authUser.userId;
    const requesterMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: authUser.userId } },
    });
    const isAdmin = requesterMembership?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only team owners and admins can add members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find the user by email
    const targetUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User with this email not found. Please ask them to register first." },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 409 }
      );
    }

    // Target role (Admin can add MEMBER or ADMIN, cannot create another OWNER)
    const targetRole = role === "ADMIN" ? "ADMIN" : "MEMBER";

    // Add member
    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: targetUser.id,
        role: targetRole,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // In-app notification for the newly added member
    await createNotification({
      userId: targetUser.id,
      title: "Added to Team",
      message: `You have been added to team "${team.name}" as ${targetRole}.`,
      type: "TEAM_INVITE",
      link: `/teams/${teamId}`,
    });

    // Log activity
    await logActivity({
      teamId,
      userId: authUser.userId,
      action: "MEMBER_ADDED",
      details: `Added ${targetUser.name} to team as ${targetRole}`,
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams/[id]/members error:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
