import prisma from "@/lib/prisma";

export async function createNotification({
  userId,
  title,
  message,
  type = "INFO",
  link = null,
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string | null;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function logActivity({
  teamId,
  userId,
  action,
  details = null,
}: {
  teamId: string;
  userId: string;
  action: string;
  details?: string | null;
}) {
  try {
    return await prisma.activityLog.create({
      data: {
        teamId,
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}
