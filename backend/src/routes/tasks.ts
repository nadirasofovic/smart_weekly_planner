import { Router, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import { prisma } from "../prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all tasks with filters
router.get(
  "/",
  [
    query("day").optional().isIn(["mon", "tue", "wed", "thu", "fri", "sat", "sun", "all"]),
    query("priority").optional().isIn(["low", "medium", "high", "all"]),
    query("status").optional().isIn(["todo", "inprogress", "done", "all"]),
    query("tags").optional().isString(),
    query("date_from").optional().isISO8601(),
    query("date_to").optional().isISO8601(),
    query("week").optional().isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { day, priority, status, tags, date_from, date_to, week } = req.query;
      const userId = req.userId!;

      // Build where clause
      const where: any = {
        userId,
      };

      if (day && day !== "all") {
        where.day = day;
      }

      if (priority && priority !== "all") {
        where.priority = priority;
      }

      if (status && status !== "all") {
        where.status = status;
      }

      // Date filtering
      if (date_from || date_to) {
        where.date = {};
        if (date_from) where.date.gte = date_from;
        if (date_to) where.date.lte = date_to;
      }

      // Week filtering (ISO week format: 2024-W03)
      if (week) {
        // Parse ISO week and get date range
        const weekStr = Array.isArray(week) ? week[0] : String(week);
        const [year, weekNum] = weekStr.split("-W").map(Number);
        const weekStart = getWeekStartDate(year, weekNum);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        where.date = {
          gte: weekStart.toISOString().split("T")[0],
          lte: weekEnd.toISOString().split("T")[0],
        };
      }

      // Tag filtering
      if (tags) {
        const tagNames = (tags as string).split(",").map((t) => t.trim());
        where.taskTags = {
          some: {
            tag: {
              name: { in: tagNames },
            },
          },
        };
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          dependencies: {
            include: {
              dependsOnTask: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: [
          { status: "asc" }, // Done tasks at bottom
          { position: "asc" },
          { createdAt: "desc" },
        ],
      });

      res.json({ tasks });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

// Get single task
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
        subtasks: true,
        dependencies: {
          include: {
            dependsOnTask: true,
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    res.json({ task });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

// Create task
router.post(
  "/",
  [
    body("title").trim().notEmpty(),
    body("description").optional().trim(),
    body("day").isIn(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
    body("date").optional().isISO8601(),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("status").optional().isIn(["todo", "inprogress", "done"]),
    body("tags").optional().isArray(),
    body("recurrencePattern").optional().isObject(),
    body("parentTaskId").optional().isUUID(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        description,
        day,
        date,
        priority = "medium",
        status = "todo",
        tags = [],
        recurrencePattern,
        parentTaskId,
      } = req.body;
      const userId = req.userId!;

      // Get max position for ordering
      const maxPosition = await prisma.task.findFirst({
        where: { userId, day },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      // Create task
      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          day,
          date: date || null,
          priority,
          status,
          position: (maxPosition?.position ?? -1) + 1,
          userId,
          recurrencePattern: recurrencePattern ? JSON.stringify(recurrencePattern) : null,
          parentTaskId: parentTaskId || null,
        },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Handle tags
      if (tags.length > 0) {
        await handleTaskTags(userId, task.id, tags);
      }

      // Reload task with tags
      const taskWithTags = await prisma.task.findUnique({
        where: { id: task.id },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      res.status(201).json({ task: taskWithTags });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

// Update task (full)
router.put(
  "/:id",
  [
    body("title").optional().trim().notEmpty(),
    body("description").optional().trim(),
    body("day").optional().isIn(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
    body("date").optional().isISO8601(),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("status").optional().isIn(["todo", "inprogress", "done"]),
    body("tags").optional().isArray(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const userId = req.userId!;
      const updateData = req.body;

      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existingTask) {
        throw new AppError("Task not found", 404);
      }

      // Handle tags separately
      const { tags, ...taskData } = updateData as any;

      // Update task
      const task = await prisma.task.update({
        where: { id },
        data: {
          ...taskData,
          ...(taskData.description === "" && { description: null }),
          ...(taskData.date === "" && { date: null }),
        },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Update tags if provided
      if (tags !== undefined) {
        await handleTaskTags(userId, id, tags);
      }

      // Reload task with updated tags
      const updatedTask = await prisma.task.findUnique({
        where: { id },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      res.json({ task: updatedTask });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

// Update task status
router.patch("/:id/status", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId!;

    if (!["todo", "inprogress", "done"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check dependencies if completing task
    if (status === "done") {
      const dependencies = await prisma.taskDependency.findMany({
        where: { taskId: id },
        include: {
          dependsOnTask: true,
        },
      });

      const incompleteDeps = dependencies.filter(
        (dep: any) => dep.dependsOnTask.status !== "done"
      );

      if (incompleteDeps.length > 0) {
        return res.status(400).json({
          error: "Cannot complete task with incomplete dependencies",
          incompleteDependencies: incompleteDeps.map((d: any) => ({
            id: d.dependsOnTask.id,
            title: d.dependsOnTask.title,
          })),
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        ...(status === "done" && { completedAt: new Date().toISOString() }),
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    res.json({ task: updatedTask });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

// Update task position (drag-and-drop)
router.patch("/:id/position", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { position } = req.body;
    const userId = req.userId!;

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { position },
    });

    res.json({ task: updatedTask });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

// Delete task
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

// Helper function to handle task tags
async function handleTaskTags(userId: string, taskId: string, tagNames: string[]) {
  // Remove existing tags
  await prisma.taskTag.deleteMany({
    where: { taskId },
  });

  if (tagNames.length === 0) return;

  // Find or create tags
  const tagIds: string[] = [];

  for (const tagName of tagNames) {
    let tag = await prisma.tag.findFirst({
      where: {
        name: tagName,
        OR: [{ userId }, { userId: null }], // User tags or shared tags
      },
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          name: tagName,
          userId,
        },
      });
    }

    tagIds.push(tag.id);
  }

  // Create task-tag relationships
  await prisma.taskTag.createMany({
    data: tagIds.map((tagId) => ({
      taskId,
      tagId,
    })),
    skipDuplicates: true,
  });
}

// Helper function to get week start date from ISO week
function getWeekStartDate(year: number, week: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

export default router;

