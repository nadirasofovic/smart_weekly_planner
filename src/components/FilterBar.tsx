import type { DayKey, Priority, Status } from "../types/task";
import type { Filters } from "../types/filters";

const DAYS: { key: "all" | DayKey; label: string }[] = [
  { key: "all", label: "Svi dani" },
  { key: "mon", label: "Pon" },
  { key: "tue", label: "Uto" },
  { key: "wed", label: "Sri" },
  { key: "thu", label: "Čet" },
  { key: "fri", label: "Pet" },
  { key: "sat", label: "Sub" },
  { key: "sun", label: "Ned" },
];

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
};

export function FilterBar({ value, onChange, onReset }: Props) {
  return (
    <div style={card}>
      <h2 style={{ marginTop: 0 }}>Filteri</h2>

      <input
        style={input}
        placeholder="Pretraži zadatke…"
        value={value.query}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
      />

      <div style={grid}>
        <label style={label}>
          Dan
          <select
            style={select}
            value={value.day}
            onChange={(e) =>
              onChange({ ...value, day: e.target.value as Filters["day"] })
            }
          >
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
            style={select}
            value={value.priority}
            onChange={(e) =>
              onChange({
                ...value,
                priority: e.target.value as "all" | Priority,
              })
            }
          >
            <option value="all">Svi</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label style={label}>
          Status
          <select
            style={select}
            value={value.status}
            onChange={(e) =>
              onChange({
                ...value,
                status: e.target.value as "all" | Status,
              })
            }
          >
            <option value="all">Svi</option>
            <option value="todo">To do</option>
            <option value="inprogress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <button style={btn} onClick={onReset}>
        Reset filtera
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

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginTop: 12,
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

const btn: React.CSSProperties = {
  marginTop: 12,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "white",
  color: "#111827",
  cursor: "pointer",
};
