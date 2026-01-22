import { useState } from "react";
import type { DayKey, Priority, Status, Task, RecurrenceType } from "../types/task";
import { useTheme } from "../contexts/ThemeContext";
import { DAYS } from "../constants/days";
import { getDateForDay } from "../utils/dates";
import { format } from "date-fns";

type Props = {
  onAdd: (task: Task) => void;
  weekStart?: Date;
};

export function TaskForm({ onAdd, weekStart = new Date() }: Props) {
  const { isDark } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState<DayKey>("mon");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("todo");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(() => {
    const taskDate = getDateForDay("mon", weekStart);
    return format(taskDate, "yyyy-MM-dd");
  });

  function submit() {
    const clean = title.trim();
    if (!clean) return;

    const taskDate = getDateForDay(day, weekStart);

    const task: Task = {
      id: crypto.randomUUID(),
      title: clean,
      description: description.trim() || undefined,
      day,
      date: taskDate.toISOString(),
      priority,
      status,
      tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      recurrence: recurrence !== "none" ? recurrence : undefined,
      createdAt: new Date().toISOString(),
    };

    onAdd(task);
    setTitle("");
    setDescription("");
    setDay("mon");
    setPriority("medium");
    setStatus("todo");
    setRecurrence("none");
    setTags("");
    const newDate = getDateForDay("mon", weekStart);
    setDate(format(newDate, "yyyy-MM-dd"));
  }

  const handleDayChange = (newDay: DayKey) => {
    setDay(newDay);
    const taskDate = getDateForDay(newDay, weekStart);
    setDate(format(taskDate, "yyyy-MM-dd"));
  };

  return (
    <div style={card(isDark)}>
      <h2 style={{ marginTop: 0 }}>Dodaj zadatak</h2>

      <label style={label(isDark)}>
        Naziv *
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Npr. završiti vježbe iz TS-a"
          style={input(isDark)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
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

      <div style={row}>
        <label style={label(isDark)}>
          Dan
          <select
            value={day}
            onChange={(e) => handleDayChange(e.target.value as DayKey)}
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

      <div style={row}>
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

      <button onClick={submit} style={btn(isDark)}>
        + Dodaj
      </button>
    </div>
  );
}

/* ===== styles ===== */

const card = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#0f172a" : "white",
  border: dark ? "1px solid #1f2937" : "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
});

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginTop: 12,
};

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

const btn = (dark: boolean): React.CSSProperties => ({
  marginTop: 12,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: dark ? "1px solid #334155" : "1px solid #111827",
  background: dark ? "#020617" : "#111827",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 500,
});
