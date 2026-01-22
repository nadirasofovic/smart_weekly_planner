import type { Priority, Status } from "../types/task";
import type { Filters } from "../types/filters";
import { useTheme } from "../contexts/ThemeContext";
import { DAYS_WITH_ALL } from "../constants/days";

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  allTags?: string[];
};

export function FilterBar({ value, onChange, onReset, allTags = [] }: Props) {
  const { isDark } = useTheme();
  
  const selectedTags = value.tags || [];

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onChange({ ...value, tags: newTags });
  };

  return (
    <div style={card(isDark)}>
      <h2 style={{ marginTop: 0 }}>Filteri</h2>

      <input
        style={input(isDark)}
        placeholder="Pretraži zadatke…"
        value={value.query}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
      />

      <div style={grid}>
        <label style={label(isDark)}>
          Dan
          <select
            style={select(isDark)}
            value={value.day}
            onChange={(e) =>
              onChange({ ...value, day: e.target.value as Filters["day"] })
            }
          >
            {DAYS_WITH_ALL.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label style={label(isDark)}>
          Prioritet
          <select
            style={select(isDark)}
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

        <label style={label(isDark)}>
          Status
          <select
            style={select(isDark)}
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

      {allTags.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <label style={label(isDark)}>Tagovi</label>
          <div style={tagsContainer}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={tagButton(isDark, selectedTags.includes(tag))}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <button style={btn(isDark)} onClick={onReset}>
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
  marginBottom: 12,
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

const tagsContainer: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 6,
};

const tagButton = (dark: boolean, selected: boolean): React.CSSProperties => ({
  padding: "4px 8px",
  borderRadius: 6,
  border: selected
    ? (dark ? "1px solid #3b82f6" : "1px solid #2563eb")
    : (dark ? "1px solid #334155" : "1px solid #e5e7eb"),
  background: selected
    ? (dark ? "#1e3a8a" : "#dbeafe")
    : (dark ? "#020617" : "white"),
  color: selected
    ? (dark ? "#93c5fd" : "#1e40af")
    : (dark ? "#e5e7eb" : "#111827"),
  cursor: "pointer",
  fontSize: 11,
});
