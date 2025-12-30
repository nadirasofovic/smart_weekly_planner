import { useEffect, useMemo, useState } from "react";
import type { DayKey, Priority, Status, Task } from "../types/task";

type Props = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Task>) => void;
};

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Pon" },
  { key: "tue", label: "Uto" },
  { key: "wed", label: "Sri" },
  { key: "thu", label: "Čet" },
  { key: "fri", label: "Pet" },
  { key: "sat", label: "Sub" },
  { key: "sun", label: "Ned" },
];

export function EditTaskModal({ open, task, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState<DayKey>("mon");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("todo");

  const canRender = open && task;

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDay(task.day);
    setPriority(task.priority);
    setStatus(task.status);
  }, [task]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  function handleSave() {
    if (!task) return;
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onSave(task.id, {
      title: cleanTitle,
      day,
      priority,
      status,
    });

    onClose();
  }

  if (!canRender) return null;

  return (
    <div
      style={backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modal} role="dialog" aria-modal="true" aria-label="Edit task">
        <div style={topRow}>
          <h3 style={{ margin: 0 }}>Uredi zadatak</h3>
          <button style={closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <label style={label}>
          Naziv
          <input
            style={input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Npr. završiti domaću zadaću"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") onClose();
            }}
          />
        </label>

        <div style={grid}>
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

        <div style={actions}>
          <button style={secondaryBtn} onClick={onClose}>
            Odustani
          </button>
          <button style={{ ...primaryBtn, opacity: canSave ? 1 : 0.6 }} onClick={handleSave} disabled={!canSave}>
            Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(17, 24, 39, 0.45)",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 50,
};

const modal: React.CSSProperties = {
  width: "min(640px, 100%)",
  background: "white",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  padding: 16,
  display: "grid",
  gap: 12,
};

const topRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const closeBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
};

const label: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  color: "#374151",
};

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

const secondaryBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer",
};
