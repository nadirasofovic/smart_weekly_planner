import { startOfWeek, endOfWeek, format, parseISO, eachDayOfInterval, isToday } from "date-fns";
import { hr } from "date-fns/locale";
import type { DayKey } from "../types/task";

export function getWeekDates(date: Date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const dayMap: Record<DayKey, Date> = {
    mon: days[0],
    tue: days[1],
    wed: days[2],
    thu: days[3],
    fri: days[4],
    sat: days[5],
    sun: days[6],
  };
  
  return { weekStart, weekEnd, days, dayMap };
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd.MM.yyyy", { locale: hr });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd.MM", { locale: hr });
}

export function getWeekLabel(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

export function isDateToday(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isToday(d);
}

export function getDateForDay(day: DayKey, weekStart: Date): Date {
  const { dayMap } = getWeekDates(weekStart);
  return dayMap[day];
}

