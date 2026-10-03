import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// PUT /api/tasks/[id] - Update a task (status, priority, details, assignee)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: { select: { userId: true } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // If task belongs to a team, user must be authenticated and a team member
    if (task.team) {
      if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const isMember =
        task.team.ownerId === authUser.userId ||
        task.team.members.some((m) => m.userId === authUser.userId);

      if (!isMember) {
        return NextResponse.json(
          { error: "Forbidden: You are not a member of this team" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, assigneeId } = body;

    if (title !== undefined && (!title || typeof title !== "string" || title.trim() === "")) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    // If assigneeId is provided and task is in a team, check that assignee is in team
    if (assigneeId !== undefined && assigneeId !== null && task.team) {
      const isAssigneeInTeam =
        task.team.ownerId === assigneeId ||
        task.team.members.some((m) => m.userId === assigneeId);

      if (!isAssigneeInTeam) {
        return NextResponse.json(
          { error: "Assignee must be a member of this team" },
          { status: 400 }
        );
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a task
// "Only the task creator, the assignee, or the team Owner can delete a task."
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        team: {
          select: { ownerId: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // If task belongs to a team or has creator/assignee, enforce role-based authorization
    if (task.team || task.creatorId || task.assigneeId) {
      if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const isCreator = task.creatorId === authUser.userId;
      const isAssignee = task.assigneeId === authUser.userId;
      const isOwner = task.team?.ownerId === authUser.userId;

      if (!isCreator && !isAssignee && !isOwner) {
        return NextResponse.json(
          {
            error:
              "Forbidden: Only the task creator, assignee, or team owner can delete this task",
          },
          { status: 403 }
        );
      }
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
