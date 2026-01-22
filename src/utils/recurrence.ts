import { addDays, addWeeks, addMonths, format, parseISO } from "date-fns";
import type { Task } from "../types/task";

export function generateRecurringInstances(
  task: Task,
  startDate: Date,
  endDate: Date
): Task[] {
  if (!task.recurrence || task.recurrence === "none" || !task.date) {
    return [];
  }

  const instances: Task[] = [];
  const baseDate = typeof task.date === "string" ? parseISO(task.date) : task.date;
  let currentDate = new Date(baseDate);

  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      instances.push({
        ...task,
        id: `${task.id}-${format(currentDate, "yyyy-MM-dd")}`,
        date: currentDate.toISOString(),
      });
    }

    switch (task.recurrence) {
      case "daily":
        currentDate = addDays(currentDate, 1);
        break;
      case "weekly":
        currentDate = addWeeks(currentDate, 1);
        break;
      case "monthly":
        currentDate = addMonths(currentDate, 1);
        break;
    }
  }

  return instances;
}

