import { useEffect, useMemo, useState } from "react";
import type { Task } from "../types/task";
import { loadTasks, saveTasks } from "../utils/storage";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function addTask(task: Task) {
    setTasks((prev) => [task, ...prev]);
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, percent };
  }, [tasks]);

  return { tasks, addTask, updateTask, deleteTask, stats };
}
