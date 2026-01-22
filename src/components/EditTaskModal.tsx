import { useEffect, useMemo, useState } from "react";
import type { DayKey, Priority, Status, Task, RecurrenceType } from "../types/task";
import { useTheme } from "../contexts/ThemeContext";
import { DAYS } from "../constants/days";
import { format } from "date-fns";
import { parseISO } from "date-fns";

type Props = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Task>) => void;
  weekStart?: Date;
};

export function EditTaskModal({ open, task, onClose, onSave }: Props) {
  const { isDark } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState<DayKey>("mon");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("todo");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState("");

  const canRender = open && task;

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description || "");
    setDay(task.day);
    setPriority(task.priority);
    setStatus(task.status);
    setRecurrence(task.recurrence || "none");
    setTags((task.tags || []).join(", "));
    if (task.date) {
      const taskDate = typeof task.date === "string" ? parseISO(task.date) : task.date;
      setDate(format(taskDate, "yyyy-MM-dd"));
    } else {
      setDate("");
    }
  }, [task]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  function handleSave() {
    if (!task) return;
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const taskDate = date ? parseISO(date) : undefined;

    onSave(task.id, {
      title: cleanTitle,
      description: description.trim() || undefined,
      day,
      date: taskDate?.toISOString(),
      priority,
      status,
      tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      recurrence: recurrence !== "none" ? recurrence : undefined,
    });

    onClose();
  }

  if (!canRender) return null;

  return (
    <div
      style={backdrop(isDark)}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modal(isDark)} role="dialog" aria-modal="true" aria-label="Edit task">
        <div style={topRow}>
          <h3 style={{ margin: 0 }}>Uredi zadatak</h3>
          <button style={closeBtn(isDark)} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <label style={label(isDark)}>
          Naziv *
          <input
            style={input(isDark)}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Npr. završiti domaću zadaću"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") onClose();
            }}
          />
        </label>

        <label style={label(isDark)}>
          Opis (max 500 karaktera)
          <textarea
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setDescription(e.target.value);
              }
            }}
            placeholder="Dodatne napomene..."
            style={textarea(isDark)}
            rows={3}
          />
          <small style={{ color: isDark ? "#6b7280" : "#9ca3af" }}>
            {description.length}/500
          </small>
        </label>

        <div style={grid}>
          <label style={label(isDark)}>
            Dan
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as DayKey)}
              style={select(isDark)}
            >
              {DAYS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label style={label(isDark)}>
            Datum
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={input(isDark)}
            />
          </label>

          <label style={label(isDark)}>
            Prioritet
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              style={select(isDark)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <div style={grid}>
          <label style={label(isDark)}>
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              style={select(isDark)}
            >
              <option value="todo">To do</option>
              <option value="inprogress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label style={label(isDark)}>
            Ponavljanje
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              style={select(isDark)}
            >
              <option value="none">Ne ponavlja se</option>
              <option value="daily">Dnevno</option>
              <option value="weekly">Nedeljno</option>
              <option value="monthly">Mesečno</option>
            </select>
          </label>

          <label style={label(isDark)}>
            Tagovi (razdvojeno zarezom)
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="npr. posao, hitno"
              style={input(isDark)}
            />
          </label>
        </div>

        <div style={actions}>
          <button style={secondaryBtn(isDark)} onClick={onClose}>
            Odustani
          </button>
          <button
            style={{ ...primaryBtn(isDark), opacity: canSave ? 1 : 0.6 }}
            onClick={handleSave}
            disabled={!canSave}
          >
            Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop = (dark: boolean): React.CSSProperties => ({
  position: "fixed",
  inset: 0,
  background: dark ? "rgba(0,0,0,0.65)" : "rgba(17, 24, 39, 0.45)",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 50,
});

const modal = (dark: boolean): React.CSSProperties => ({
  width: "min(640px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: dark ? "#0f172a" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  borderRadius: 16,
  border: dark ? "1px solid #1f2937" : "1px solid #e5e7eb",
  boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.2)",
  padding: 16,
  display: "grid",
  gap: 12,
});

const topRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const closeBtn = (dark: boolean): React.CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: 12,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
});

const label = (dark: boolean): React.CSSProperties => ({
  display: "grid",
  gap: 6,
  fontSize: 12,
  color: dark ? "#9ca3af" : "#374151",
});

const input = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  outline: "none",
  fontFamily: "inherit",
});

const textarea = (dark: boolean): React.CSSProperties => ({
  ...input(dark),
  resize: "vertical",
  minHeight: 60,
});

const select = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  outline: "none",
  fontFamily: "inherit",
});

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const actions: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 4,
};

const secondaryBtn = (dark: boolean): React.CSSProperties => ({
  padding: "10px 12px",
  borderRadius: 12,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
});

const primaryBtn = (dark: boolean): React.CSSProperties => ({
  padding: "10px 12px",
  borderRadius: 12,
  border: dark ? "1px solid #334155" : "1px solid #111827",
  background: dark ? "#e5e7eb" : "#111827",
  color: dark ? "#111827" : "white",
  cursor: "pointer",
});
