import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/teams/[id]/messages - Get team chat history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;

    // Check membership
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { select: { userId: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isMember =
      team.ownerId === authUser.userId ||
      team.members.some((m) => m.userId === authUser.userId);

    if (!isMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this team" },
        { status: 403 }
      );
    }

    // Fetch messages (latest 100)
    const messages = await prisma.chatMessage.findMany({
      where: { teamId },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/teams/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}

// POST /api/teams/[id]/messages - Send a chat message
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
      include: {
        members: { select: { userId: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isMember =
      team.ownerId === authUser.userId ||
      team.members.some((m) => m.userId === authUser.userId);

    if (!isMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this team" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, fileUrl, fileName, fileType, fileSize } = body;

    const trimmedContent = typeof content === "string" ? content.trim() : "";

    if (!trimmedContent && !fileUrl) {
      return NextResponse.json(
        { error: "Message must contain text content or an attachment" },
        { status: 400 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        teamId,
        senderId: authUser.userId,
        content: trimmedContent || (fileName ? `[Tệp đính kèm: ${fileName}]` : "[Tệp đính kèm]"),
        fileUrl: typeof fileUrl === "string" ? fileUrl : null,
        fileName: typeof fileName === "string" ? fileName : null,
        fileType: typeof fileType === "string" ? fileType : null,
        fileSize: typeof fileSize === "number" ? fileSize : null,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
