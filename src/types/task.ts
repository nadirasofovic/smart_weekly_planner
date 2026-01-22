export type DayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "inprogress" | "done";

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export type Task = {
  id: string;
  title: string;
  description?: string; // Challenge 3: Task notes/descriptions
  day: DayKey;
  date?: string; // Challenge 1: Real date (ISO string)
  priority: Priority;
  status: Status;
  tags?: string[]; // Challenge 9: Task tags
  recurrence?: RecurrenceType; // Challenge 5: Recurring tasks
  order?: number; // Challenge 6: For drag-and-drop ordering
  createdAt: string; // ISO
};
