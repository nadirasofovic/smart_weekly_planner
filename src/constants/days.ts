import type { DayKey } from "../types/task";

export const DAY_LABEL: Record<DayKey, string> = {
  mon: "Ponedjeljak",
  tue: "Utorak",
  wed: "Srijeda",
  thu: "Četvrtak",
  fri: "Petak",
  sat: "Subota",
  sun: "Nedjelja",
};

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Pon" },
  { key: "tue", label: "Uto" },
  { key: "wed", label: "Sri" },
  { key: "thu", label: "Čet" },
  { key: "fri", label: "Pet" },
  { key: "sat", label: "Sub" },
  { key: "sun", label: "Ned" },
];

export const DAYS_WITH_ALL: { key: "all" | DayKey; label: string }[] = [
  { key: "all", label: "Svi dani" },
  ...DAYS,
];

