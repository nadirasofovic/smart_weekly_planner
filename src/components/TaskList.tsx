import type { Task } from "../types/task";

type Props = {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggleDone: (id: string, nextDone: boolean) => void;
};

export function TaskList({ title, tasks, onDelete, onToggleDone }: Props) {
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{tasks.length} zadataka</span>
      </div>

      {tasks.length === 0 ? (
        <p style={{ color: "#6b7280" }}>Nema zadataka 🎉</p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {tasks.map((t) => {
            const isDone = t.status === "done";
            return (
              <div key={t.id} style={item}>
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={(e) => onToggleDone(t.id, e.target.checked)}
                    />
                    <strong style={{ textDecoration: isDone ? "line-through" : "none" }}>
                      {t.title}
                    </strong>
                  </div>
                  <small style={{ color: "#6b7280" }}>
                    Prioritet: {t.priority} • Status: {t.status}
                  </small>
                </div>

                <button onClick={() => onDelete(t.id)} style={dangerBtn}>
                  Obriši
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
  background: "white",
};

const item: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #f3f4f6",
  background: "#fafafa",
};

const dangerBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ef4444",
  background: "white",
  color: "#ef4444",
  cursor: "pointer",
};
