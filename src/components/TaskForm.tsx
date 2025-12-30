import { useState } from "react";
import type { DayKey, Priority, Status, Task } from "../types/task";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Pon" },
  { key: "tue", label: "Uto" },
  { key: "wed", label: "Sri" },
  { key: "thu", label: "Čet" },
  { key: "fri", label: "Pet" },
  { key: "sat", label: "Sub" },
  { key: "sun", label: "Ned" },
];

type Props = {
  onAdd: (task: Task) => void;
  dark: boolean;
};

export function TaskForm({ onAdd, dark }: Props) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState<DayKey>("mon");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("todo");

  function submit() {
    const clean = title.trim();
    if (!clean) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: clean,
      day,
      priority,
      status,
      createdAt: new Date().toISOString(),
    };

    onAdd(task);
    setTitle("");
    setDay("mon");
    setPriority("medium");
    setStatus("todo");
  }

  return (
    <div style={card(dark)}>
      <h2 style={{ marginTop: 0 }}>Dodaj zadatak</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Npr. završiti vježbe iz TS-a"
        style={input(dark)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />

      <div style={row}>
        <label style={label(dark)}>
          Dan
          <select value={day} onChange={(e) => setDay(e.target.value as DayKey)} style={select(dark)}>
            {DAYS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label style={label(dark)}>
          Prioritet
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            style={select(dark)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label style={label(dark)}>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            style={select(dark)}
          >
            <option value="todo">To do</option>
            <option value="inprogress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <button onClick={submit} style={btn(dark)}>
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
});

const select = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  outline: "none",
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
});
