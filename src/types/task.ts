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

export type Task = {
  id: string;
  title: string;
  day: DayKey;
  priority: Priority;
  status: Status;
  createdAt: string; // ISO
};
