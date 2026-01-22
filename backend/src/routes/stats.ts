import { Router, Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { prisma } from "../prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate);

// Get overall statistics
router.get(
  "/",
  [
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
      const { date_from, date_to } = req.query;

      const where: any = { userId };
      if (date_from || date_to) {
        where.date = {};
        if (date_from) where.date.gte = date_from;
        if (date_to) where.date.lte = date_to;
      }

      // Get all tasks
      const tasks = await prisma.task.findMany({
        where,
      });

      const total = tasks.length;
      const completed = tasks.filter((t: any) => t.status === "done").length;
      const inProgress = tasks.filter((t: any) => t.status === "inprogress").length;
      const todo = tasks.filter((t: any) => t.status === "todo").length;

      // By priority
      const byPriority = {
        high: {
          total: tasks.filter((t: any) => t.priority === "high").length,
          completed: tasks.filter((t: any) => t.priority === "high" && t.status === "done").length,
        },
        medium: {
          total: tasks.filter((t: any) => t.priority === "medium").length,
          completed: tasks.filter((t: any) => t.priority === "medium" && t.status === "done").length,
        },
        low: {
          total: tasks.filter((t: any) => t.priority === "low").length,
          completed: tasks.filter((t: any) => t.priority === "low" && t.status === "done").length,
        },
      };

      // By day
      const byDay: Record<string, { total: number; completed: number }> = {};
      ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].forEach((day) => {
        const dayTasks = tasks.filter((t: any) => t.day === day);
        byDay[day] = {
          total: dayTasks.length,
          completed: dayTasks.filter((t: any) => t.status === "done").length,
        };
      });

      // Most productive day
      const mostProductiveDay = Object.entries(byDay).reduce((max, [day, stats]) => {
        return stats.completed > max.completed ? { day, ...stats } : max;
      }, { day: "mon", completed: 0, total: 0 });

      // Average tasks per day
      const dateRange = date_from && date_to
        ? Math.ceil((new Date(date_to as string).getTime() - new Date(date_from as string).getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      const averagePerDay = total / dateRange;

      res.json({
        total_tasks: total,
        completed_tasks: completed,
        completion_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        in_progress: inProgress,
        todo,
        by_priority: byPriority,
        by_day: byDay,
        most_productive_day: mostProductiveDay.day,
        average_per_day: Math.round(averagePerDay * 10) / 10,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
);

export default router;

