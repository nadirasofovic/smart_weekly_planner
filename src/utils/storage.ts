import type { Task } from "../types/task";

const KEY = "raspored_plus_tasks";

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}
