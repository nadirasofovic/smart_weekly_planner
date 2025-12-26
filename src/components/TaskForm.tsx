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
};

export function TaskForm({ onAdd }: Props) {
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
    <div style={card}>
      <h2 style={{ marginTop: 0 }}>Dodaj zadatak</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Npr. završiti vježbe iz TS-a"
        style={input}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />

      <div style={row}>
        <label style={label}>
          Dan
          <select value={day} onChange={(e) => setDay(e.target.value as DayKey)} style={select}>
            {DAYS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label style={label}>
          Prioritet
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            style={select}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label style={label}>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            style={select}
          >
            <option value="todo">To do</option>
            <option value="inprogress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <button onClick={submit} style={btn}>
        + Dodaj
      </button>
    </div>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
  background: "white",
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginTop: 12,
};

const label: React.CSSProperties = { display: "grid", gap: 6, fontSize: 12, color: "#374151" };

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
};

const select: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
  background: "white",
};

const btn: React.CSSProperties = {
  marginTop: 12,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer",
};
