import { prisma } from "../../prisma/client";
import { hashPassword } from "../../utils/password";
import { generateAccessToken } from "../../utils/jwt";

export async function createTestUser(email: string = "test@example.com", password: string = "password123") {
  const passwordHash = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Test User",
    },
  });

  return user;
}

export async function createTestTask(userId: string, taskData: any = {}) {
  const task = await prisma.task.create({
    data: {
      title: taskData.title || "Test Task",
      description: taskData.description || null,
      day: taskData.day || "mon",
      date: taskData.date || null,
      priority: taskData.priority || "medium",
      status: taskData.status || "todo",
      position: taskData.position || 0,
      userId,
    },
  });

  return task;
}

export function getAuthToken(userId: string, email: string = "test@example.com"): string {
  return generateAccessToken({ userId, email });
}

export async function cleanupDatabase() {
  // Delete in correct order to respect foreign keys
  await prisma.notification.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
}

