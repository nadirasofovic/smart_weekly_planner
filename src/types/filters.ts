import type { DayKey, Priority, Status } from "./task";

export type Filters = {
  day: "all" | DayKey;
  priority: "all" | Priority;
  status: "all" | Status;
  query: string; 
};
