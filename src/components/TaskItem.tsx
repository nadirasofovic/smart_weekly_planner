import { useState } from "react";
import type { Task } from "../types/task";
import { useTheme } from "../contexts/ThemeContext";
import { getPriorityColor, PRIORITY_ICONS } from "../utils/priority";
import { formatDateShort, isDateToday } from "../utils/dates";

type Props = {
  task: Task;
  onDelete: (id: string) => void;
  onToggleDone: (id: string, nextDone: boolean) => void;
  onEdit: (task: Task) => void;
};

export function TaskItem({ task, onDelete, onToggleDone, onEdit }: Props) {
  const { isDark } = useTheme();
  const [showDescription, setShowDescription] = useState(false);
  const priorityColors = getPriorityColor(task.priority, isDark);

  return (
    <div style={item(isDark, task.priority, isDark)}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={task.status === "done"}
            onChange={(e) => onToggleDone(task.id, e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <strong
                style={{
                  textDecoration: task.status === "done" ? "line-through" : "none",
                  color: task.status === "done" ? (isDark ? "#6b7280" : "#9ca3af") : undefined,
                }}
              >
                {task.title}
              </strong>
              <span style={{ fontSize: 14 }}>{PRIORITY_ICONS[task.priority]}</span>
              {task.recurrence && (
                <span style={recurrenceBadge(isDark)}>🔄 {task.recurrence}</span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
              {task.date && (
                <small style={{ color: isDateToday(task.date) ? "#ef4444" : (isDark ? "#9ca3af" : "#6b7280") }}>
                  📅 {formatDateShort(task.date)}
                  {isDateToday(task.date) && " (Danas)"}
                </small>
              )}
              <small
                style={{
                  ...priorityBadge(priorityColors),
                  fontSize: 11,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {task.priority}
              </small>
              <small style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
                {task.status}
              </small>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                {task.tags.map((tag) => (
                  <span key={tag} style={tagBadge(isDark)}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {task.description && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  style={descriptionToggle(isDark)}
                >
                  {showDescription ? "▼" : "▶"} Opis
                </button>
                {showDescription && (
                  <div style={descriptionBox(isDark)}>{task.description}</div>
                )}
              </div>
            )}
          </div>
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button style={ghost(isDark)} onClick={() => onEdit(task)}>
          Uredi
        </button>
        <button style={danger} onClick={() => onDelete(task.id)}>
          Obriši
        </button>
      </div>
    </div>
  );
}

const item = (dark: boolean, priority: string, isDark: boolean): React.CSSProperties => {
  const colors = getPriorityColor(priority as any, isDark);
  return {
    background: dark ? "#020617" : "#fafafa",
    border: `1px solid ${colors.border}40`,
    borderLeft: `3px solid ${colors.border}`,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  };
};

const priorityBadge = (colors: { bg: string; text: string; border: string }): React.CSSProperties => ({
  background: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
});

const tagBadge = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#1f2937" : "#e5e7eb",
  color: dark ? "#d1d5db" : "#374151",
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 11,
});

const recurrenceBadge = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#1e3a8a" : "#dbeafe",
  color: dark ? "#93c5fd" : "#1e40af",
  padding: "2px 6px",
  borderRadius: 4,
  fontSize: 11,
});

const descriptionToggle = (dark: boolean): React.CSSProperties => ({
  background: "transparent",
  border: "none",
  color: dark ? "#9ca3af" : "#6b7280",
  cursor: "pointer",
  padding: "4px 0",
  fontSize: 12,
  textAlign: "left",
});

const descriptionBox = (dark: boolean): React.CSSProperties => ({
  marginTop: 8,
  padding: 12,
  background: dark ? "#111827" : "#f3f4f6",
  borderRadius: 8,
  fontSize: 13,
  lineHeight: 1.6,
  color: dark ? "#d1d5db" : "#374151",
  whiteSpace: "pre-wrap",
});

const ghost = (dark: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 10,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: "transparent",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
  fontSize: 12,
});

const danger: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid #ef4444",
  background: "transparent",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: 12,
};

