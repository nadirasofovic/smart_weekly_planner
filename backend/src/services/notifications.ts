import { prisma } from "../prisma/client";
import cron from "node-cron";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  taskId?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      taskId: taskId || null,
      type,
      title,
      message,
    },
  });
}

export function setupNotificationCron() {
  // Check for due tasks every hour
  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const tasks = await prisma.task.findMany({
      where: {
        status: { not: "done" },
        dueDate: {
          gte: now.toISOString(),
          lte: oneHourLater.toISOString(),
        },
      },
      include: {
        user: true,
      },
    });

    for (const task of tasks) {
      await createNotification(
        task.userId,
        "reminder",
        "Task due soon",
        `Task "${task.title}" is due in less than an hour`,
        task.id
      );
    }
  });

  // Check for overdue tasks daily at 9 AM
  cron.schedule("0 9 * * *", async () => {
    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: {
        status: { not: "done" },
        dueDate: {
          lt: now.toISOString(),
        },
      },
      include: {
        user: true,
      },
    });

    for (const task of tasks) {
      await createNotification(
        task.userId,
        "overdue",
        "Task overdue",
        `Task "${task.title}" is overdue`,
        task.id
      );
    }
  });
}

