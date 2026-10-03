import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// DELETE /api/teams/[id]/members/[userId] - Remove a member from a team
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

    // Role check: Only Owner can remove members, or a member can leave themselves
    const isOwner = team.ownerId === authUser.userId;
    const isSelf = memberUserId === authUser.userId;

    if (!isOwner && !isSelf) {
      return NextResponse.json(
        { error: "Forbidden: Only the team owner can remove members" },
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

    // Check if membership exists
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Member not found in this team" },
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      message: "Member removed from team successfully",
    });
  } catch (error) {
    console.error("DELETE /api/teams/[id]/members/[userId] error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
