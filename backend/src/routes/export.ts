import { Router, Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { prisma } from "../prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate);

// Export tasks
router.get(
  "/tasks",
  [
    query("format").optional().isIn(["json", "csv", "ical"]),
    query("date_from").optional().isISO8601(),
    query("date_to").optional().isISO8601(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.userId!;
      const format = (req.query.format as string) || "json";
      const { date_from, date_to } = req.query;

      const where: any = { userId };
      if (date_from || date_to) {
        where.date = {};
        if (date_from) where.date.gte = date_from;
        if (date_to) where.date.lte = date_to;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="tasks-${new Date().toISOString().split("T")[0]}.json"`
        );
        res.json(tasks);
      } else if (format === "csv") {
        const csv = convertToCSV(tasks);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="tasks-${new Date().toISOString().split("T")[0]}.csv"`
        );
        res.send(csv);
      } else if (format === "ical") {
        const ical = convertToICal(tasks);
        res.setHeader("Content-Type", "text/calendar");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="tasks-${new Date().toISOString().split("T")[0]}.ics"`
        );
        res.send(ical);
      }
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

// Import tasks
router.post(
  "/tasks",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { tasks, merge = false } = req.body;

      if (!Array.isArray(tasks)) {
        throw new AppError("Invalid tasks format", 400);
      }

      const importedTasks = [];

      for (const taskData of tasks) {
        const {
          title,
          description,
          day,
          date,
          priority = "medium",
          status = "todo",
          tags = [],
        } = taskData;

        if (!title || !day) {
          continue; // Skip invalid tasks
        }

        // Check if task exists (if merge mode)
        let task;
        if (merge && taskData.id) {
          const existing = await prisma.task.findFirst({
            where: { id: taskData.id, userId },
          });
          if (existing) {
            task = await prisma.task.update({
              where: { id: taskData.id },
              data: {
                title,
                description: description || null,
                day,
                date: date || null,
                priority,
                status,
              },
            });
          }
        }

        if (!task) {
          task = await prisma.task.create({
            data: {
              title,
              description: description || null,
              day,
              date: date || null,
              priority,
              status,
              userId,
            },
          });
        }

        // Handle tags
        if (tags.length > 0) {
          // Import tag logic here (similar to tasks route)
        }

        importedTasks.push(task);
      }

      res.status(201).json({
        imported: importedTasks.length,
        tasks: importedTasks,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

function convertToCSV(tasks: any[]): string {
  if (tasks.length === 0) return "";

  const headers = [
    "ID",
    "Title",
    "Description",
    "Day",
    "Date",
    "Priority",
    "Status",
    "Tags",
    "Created At",
  ];

  const rows = tasks.map((task) => [
    task.id,
    task.title,
    task.description || "",
    task.day,
    task.date || "",
    task.priority,
    task.status,
    task.taskTags?.map((tt: any) => tt.tag.name).join(";") || "",
    task.createdAt,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csv;
}

function convertToICal(tasks: any[]): string {
  let ical = "BEGIN:VCALENDAR\n";
  ical += "VERSION:2.0\n";
  ical += "PRODID:-//Raspored Plus//EN\n";
  ical += "CALSCALE:GREGORIAN\n";

  tasks.forEach((task) => {
    if (!task.date) return;

    ical += "BEGIN:VEVENT\n";
    ical += `UID:${task.id}@raspored-plus\n`;
    ical += `DTSTART:${task.date.replace(/-/g, "")}\n`;
    ical += `SUMMARY:${task.title}\n`;
    if (task.description) {
      ical += `DESCRIPTION:${task.description.replace(/\n/g, "\\n")}\n`;
    }
    ical += `PRIORITY:${task.priority === "high" ? "1" : task.priority === "medium" ? "5" : "9"}\n`;
    ical += `STATUS:${task.status === "done" ? "COMPLETED" : "CONFIRMED"}\n`;
    ical += "END:VEVENT\n";
  });

  ical += "END:VCALENDAR\n";
  return ical;
}

export default router;

