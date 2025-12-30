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
  dark: boolean;
};

export function FilterBar({ value, onChange, onReset, dark }: Props) {
  return (
    <div style={card(dark)}>
      <h2 style={{ marginTop: 0 }}>Filteri</h2>

      <input
        style={input(dark)}
        placeholder="Pretraži zadatke…"
        value={value.query}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
      />

      <div style={grid}>
        <label style={label(dark)}>
          Dan
          <select
            style={select(dark)}
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

        <label style={label(dark)}>
          Prioritet
          <select
            style={select(dark)}
            value={value.priority}
            onChange={(e) =>
              onChange({ ...value, priority: e.target.value as "all" | Priority })
            }
          >
            <option value="all">Svi</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label style={label(dark)}>
          Status
          <select
            style={select(dark)}
            value={value.status}
            onChange={(e) =>
              onChange({ ...value, status: e.target.value as "all" | Status })
            }
          >
            <option value="all">Svi</option>
            <option value="todo">To do</option>
            <option value="inprogress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <button style={btn(dark)} onClick={onReset}>
        Reset filtera
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

const input = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
});

const select = (dark: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
});

const label = (dark: boolean): React.CSSProperties => ({
  display: "grid",
  gap: 6,
  fontSize: 12,
  color: dark ? "#9ca3af" : "#374151",
});

const btn = (dark: boolean): React.CSSProperties => ({
  marginTop: 12,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: dark ? "1px solid #334155" : "1px solid #111827",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
});

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
  marginTop: 12,
};
