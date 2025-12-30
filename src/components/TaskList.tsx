import { useMemo, useState } from "react";
import type { Task } from "../types/task";
import { EditTaskModal } from "./EditTaskModal";

type Props = {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggleDone: (id: string, nextDone: boolean) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  dark: boolean;
};

export function TaskList({
  title,
  tasks,
  onDelete,
  onToggleDone,
  onUpdate,
  dark,
}: Props) {
  const [editing, setEditing] = useState<Task | null>(null);

  const sorted = useMemo(
    () =>
      [...tasks].sort(
        (a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0)
      ),
    [tasks]
  );

  return (
    <div style={card(dark)}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>{title}</h2>
        <span style={{ color: dark ? "#9ca3af" : "#6b7280" }}>
          {tasks.length} zadataka
        </span>
      </div>

      {tasks.length === 0 ? (
        <p style={{ color: dark ? "#9ca3af" : "#6b7280" }}>Nema zadataka 🎉</p>
      ) : (
        sorted.map((t) => (
          <div key={t.id} style={item(dark)}>
            <div>
              <label style={{ display: "flex", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={t.status === "done"}
                  onChange={(e) => onToggleDone(t.id, e.target.checked)}
                />
                <strong
                  style={{
                    textDecoration: t.status === "done" ? "line-through" : "none",
                  }}
                >
                  {t.title}
                </strong>
              </label>

              <small style={{ color: dark ? "#9ca3af" : "#6b7280" }}>
                Prioritet: {t.priority} • Status: {t.status}
              </small>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={ghost(dark)} onClick={() => setEditing(t)}>
                Uredi
              </button>
              <button style={danger} onClick={() => onDelete(t.id)}>
                Obriši
              </button>
            </div>
          </div>
        ))
      )}

      <EditTaskModal
        open={!!editing}
        task={editing}
        onClose={() => setEditing(null)}
        onSave={(id, patch) => onUpdate(id, patch)}
        dark={dark}
      />
    </div>
  );
}

const card = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#0f172a" : "white",
  border: dark ? "1px solid #1f2937" : "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
});

const item = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#020617" : "#fafafa",
  border: dark ? "1px solid #1f2937" : "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const ghost = (dark: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 10,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: "transparent",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
});

const danger: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid #ef4444",
  background: "transparent",
  color: "#ef4444",
  cursor: "pointer",
};
