import type { Priority } from "../types/task";

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; border: string }> = {
  high: {
    bg: "#fee2e2",
    text: "#991b1b",
    border: "#ef4444",
  },
  medium: {
    bg: "#fef3c7",
    text: "#92400e",
    border: "#f59e0b",
  },
  low: {
    bg: "#d1fae5",
    text: "#065f46",
    border: "#10b981",
  },
};

export const PRIORITY_COLORS_DARK: Record<Priority, { bg: string; text: string; border: string }> = {
  high: {
    bg: "#7f1d1d",
    text: "#fca5a5",
    border: "#ef4444",
  },
  medium: {
    bg: "#78350f",
    text: "#fcd34d",
    border: "#f59e0b",
  },
  low: {
    bg: "#064e3b",
    text: "#6ee7b7",
    border: "#10b981",
  },
};

export const PRIORITY_ICONS: Record<Priority, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

export function getPriorityColor(priority: Priority, isDark: boolean) {
  return isDark ? PRIORITY_COLORS_DARK[priority] : PRIORITY_COLORS[priority];
}

