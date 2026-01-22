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
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("Storage quota exceeded. Cannot save tasks.");
      // Could show a user-friendly error message here
    } else {
      console.error("Failed to save tasks:", error);
    }
  }
}
