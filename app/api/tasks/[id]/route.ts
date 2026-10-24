import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createNotification, logActivity } from "@/lib/notifications";

// PUT /api/tasks/[id] - Update a task (status, priority, details, assignee)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to update tasks" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: { select: { userId: true, role: true } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Role check:
    // If task belongs to a team, user must be a member of that team
    if (task.team) {
      const isMember =
        task.team.ownerId === authUser.userId ||
        task.team.members.some((m) => m.userId === authUser.userId);

      if (!isMember) {
        return NextResponse.json(
          { error: "Forbidden: You are not a member of this team" },
          { status: 403 }
        );
      }
    } else if (task.creatorId && task.creatorId !== authUser.userId && task.assigneeId !== authUser.userId) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to update this task" },
        { status: 403 }
      );
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

    // If a new assignee was assigned, notify them!
    if (
      assigneeId &&
      assigneeId !== task.assigneeId &&
      assigneeId !== authUser.userId
    ) {
      await createNotification({
        userId: assigneeId,
        title: "Task Assigned to You",
        message: `You were assigned the task "${updatedTask.title}".`,
        type: "TASK_ASSIGNED",
        link: task.teamId ? `/teams/${task.teamId}` : "/",
      });
    }

    // Log activity if belongs to a team
    if (task.teamId) {
      await logActivity({
        teamId: task.teamId,
        userId: authUser.userId,
        action: "TASK_UPDATED",
        details: `Updated task "${updatedTask.title}" (${updatedTask.status})`,
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a task
// "Owner, Admin, Task Creator, or Assignee can delete a task."
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to delete tasks" },
        { status: 401 }
      );
    }

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

    // Check Admin status in team
    let isAdmin = false;
    if (task.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: task.teamId, userId: authUser.userId } },
      });
      isAdmin = membership?.role === "ADMIN";
    }

    // Role-based authorization:
    // "Owner, Admin, Creator, or Assignee can delete a task."
    const isCreator = Boolean(task.creatorId && task.creatorId === authUser.userId);
    const isAssignee = Boolean(task.assigneeId && task.assigneeId === authUser.userId);
    const isOwner = Boolean(task.team && task.team.ownerId === authUser.userId);

    if (!isCreator && !isAssignee && !isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Only the task creator, assignee, team owner, or admin can delete this task",
        },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    // Log activity if belongs to a team
    if (task.teamId) {
      await logActivity({
        teamId: task.teamId,
        userId: authUser.userId,
        action: "TASK_DELETED",
        details: `Deleted task "${task.title}"`,
      });
    }

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
