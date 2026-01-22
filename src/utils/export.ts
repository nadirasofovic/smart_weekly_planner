import type { Task } from "../types/task";

export function exportTasksToJSON(tasks: Task[]): string {
  return JSON.stringify(tasks, null, 2);
}

export function exportTasksToCSV(tasks: Task[]): string {
  if (tasks.length === 0) return "";
  
  const headers = ["ID", "Title", "Description", "Day", "Date", "Priority", "Status", "Tags", "Recurrence", "Created At"];
  const rows = tasks.map((task) => [
    task.id,
    task.title,
    task.description || "",
    task.day,
    task.date || "",
    task.priority,
    task.status,
    (task.tags || []).join(";"),
    task.recurrence || "none",
    task.createdAt,
  ]);
  
  const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
  return csv;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importTasksFromJSON(json: string): Task[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid format: expected array");
    }
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

