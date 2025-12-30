import { useEffect, useMemo, useState } from "react";
import type { DayKey, Priority, Status, Task } from "../types/task";

type Props = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Task>) => void;
  dark?: boolean; 
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

export function EditTaskModal({ open, task, onClose, onSave, dark = false }: Props) {
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
      style={backdrop(dark)}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modal(dark)} role="dialog" aria-modal="true" aria-label="Edit task">
        <div style={topRow}>
          <h3 style={{ margin: 0 }}>Uredi zadatak</h3>
          <button style={closeBtn(dark)} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <label style={label(dark)}>
          Naziv
          <input
            style={input(dark)}
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
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} style={select(dark)}>
              <option value="todo">To do</option>
              <option value="inprogress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>

        <div style={actions}>
          <button style={secondaryBtn(dark)} onClick={onClose}>
            Odustani
          </button>
          <button
            style={{ ...primaryBtn(dark), opacity: canSave ? 1 : 0.6 }}
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
