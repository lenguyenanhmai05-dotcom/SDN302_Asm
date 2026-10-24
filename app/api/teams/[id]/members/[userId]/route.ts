import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createNotification, logActivity } from "@/lib/notifications";

// PATCH /api/teams/[id]/members/[userId] - Change a member's role (Owner or Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, userId: targetUserId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Requester role check
    const isOwner = team.ownerId === authUser.userId;
    const requesterMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: authUser.userId } },
    });
    const isAdmin = requesterMembership?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only team owners and admins can manage roles" },
        { status: 403 }
      );
    }

    // Cannot change the role of the team owner
    if (targetUserId === team.ownerId) {
      return NextResponse.json(
        { error: "Cannot change the role of the team owner" },
        { status: 400 }
      );
    }

    const targetMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUserId } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found in this team" }, { status: 404 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Role must be 'ADMIN' or 'MEMBER'" },
        { status: 400 }
      );
    }

    // Admins cannot demote other Admins, only Owner can demote an Admin
    if (!isOwner && targetMembership.role === "ADMIN" && role === "MEMBER") {
      return NextResponse.json(
        { error: "Forbidden: Only the team owner can demote an admin" },
        { status: 403 }
      );
    }

    const updated = await prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId: targetUserId } },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Send in-app notification to the affected member
    await createNotification({
      userId: targetUserId,
      title: "Team Role Updated",
      message: `Your role in "${team.name}" has been changed to ${role}.`,
      type: "ROLE_CHANGED",
      link: `/teams/${teamId}`,
    });

    // Log activity
    await logActivity({
      teamId,
      userId: authUser.userId,
      action: "ROLE_UPDATED",
      details: `Updated ${targetMembership.user.name}'s role to ${role}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/teams/[id]/members/[userId] error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

// DELETE /api/teams/[id]/members/[userId] - Remove a member from a team
// "Owner and Admin can remove members, or a member can leave themselves"
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, userId: memberUserId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isOwner = team.ownerId === authUser.userId;
    const isSelf = memberUserId === authUser.userId;

    const requesterMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: authUser.userId } },
    });
    const isAdmin = requesterMembership?.role === "ADMIN";

    // Only Owner, Admin, or member themselves can remove
    if (!isOwner && !isAdmin && !isSelf) {
      return NextResponse.json(
        { error: "Forbidden: Only team owners and admins can remove members" },
        { status: 403 }
      );
    }

    // Cannot remove the owner of the team
    if (memberUserId === team.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove the team owner from the team" },
        { status: 400 }
      );
    }

    // Check target membership
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Member not found in this team" },
        { status: 404 }
      );
    }

    // Admins cannot remove other Admins (only Owner can)
    if (!isOwner && !isSelf && membership.role === "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only the team owner can remove an admin" },
        { status: 403 }
      );
    }

    // Unassign tasks assigned to this member in this team
    await prisma.task.updateMany({
      where: {
        teamId,
        assigneeId: memberUserId,
      },
      data: {
        assigneeId: null,
      },
    });

    // Delete membership
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    });

    // Log activity
    await logActivity({
      teamId,
      userId: authUser.userId,
      action: "MEMBER_REMOVED",
      details: isSelf
        ? `${membership.user.name} left the team`
        : `Removed ${membership.user.name} from the team`,
    });

    return NextResponse.json({
      success: true,
      message: "Member removed from team successfully",
    });
  } catch (error) {
    console.error("DELETE /api/teams/[id]/members/[userId] error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
