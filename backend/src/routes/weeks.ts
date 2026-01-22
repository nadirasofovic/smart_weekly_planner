import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// Get current week
router.get("/current", async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const weekInfo = getWeekInfo(now);

    res.json(weekInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to get current week" });
  }
});

// Get specific week
router.get("/:year/:week", async (req: AuthRequest, res: Response) => {
  try {
    const year = parseInt(Array.isArray(req.params.year) ? req.params.year[0] : req.params.year);
    const week = parseInt(Array.isArray(req.params.week) ? req.params.week[0] : req.params.week);

    if (isNaN(year) || isNaN(week) || week < 1 || week > 53) {
      return res.status(400).json({ error: "Invalid year or week" });
    }

    const weekStart = getWeekStartDate(year, week);
    const weekInfo = getWeekInfo(weekStart);

    res.json(weekInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to get week info" });
  }
});

// Get tasks for week
router.get("/:year/:week/tasks", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const year = parseInt(Array.isArray(req.params.year) ? req.params.year[0] : req.params.year);
    const week = parseInt(Array.isArray(req.params.week) ? req.params.week[0] : req.params.week);

    if (isNaN(year) || isNaN(week)) {
      return res.status(400).json({ error: "Invalid year or week" });
    }

    const weekStart = getWeekStartDate(year, week);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        date: {
          gte: weekStart.toISOString().split("T")[0],
          lte: weekEnd.toISOString().split("T")[0],
        },
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { day: "asc" },
        { position: "asc" },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: "Failed to get week tasks" });
  }
});

function getWeekInfo(date: Date) {
  const weekStart = getWeekStartDateFromDate(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const year = weekStart.getFullYear();
  const week = getISOWeek(weekStart);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    days.push({
      date: dayDate.toISOString().split("T")[0],
      day: dayNames[dayDate.getDay()],
    });
  }

  return {
    year,
    week,
    start_date: weekStart.toISOString().split("T")[0],
    end_date: weekEnd.toISOString().split("T")[0],
    days,
  };
}

function getWeekStartDateFromDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

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

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default router;

