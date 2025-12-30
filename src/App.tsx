import { useEffect, useMemo, useState } from "react";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { FilterBar } from "./components/FilterBar";
import { useTasks } from "./hooks/useTasks";
import type { DayKey, Task } from "./types/task";
import type { Filters } from "./types/filters";
import { loadTheme, saveTheme, type ThemeMode } from "./utils/theme";

const DAY_LABEL: Record<DayKey, string> = {
  mon: "Ponedjeljak",
  tue: "Utorak",
  wed: "Srijeda",
  thu: "Četvrtak",
  fri: "Petak",
  sat: "Subota",
  sun: "Nedjelja",
};

export default function App() {
  const { tasks, addTask, deleteTask, updateTask, stats } = useTasks();

  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  useEffect(() => saveTheme(theme), [theme]);
  const isDark = theme === "dark";

  const [filters, setFilters] = useState<Filters>({
    day: "all",
    priority: "all",
    status: "all",
    query: "",
  });

  const visibleTasks = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    return tasks.filter((t) => {
      const dayOk = filters.day === "all" || t.day === filters.day;
      const prioOk = filters.priority === "all" || t.priority === filters.priority;
      const statusOk = filters.status === "all" || t.status === filters.status;
      const queryOk = !q || t.title.toLowerCase().includes(q);

      return dayOk && prioOk && statusOk && queryOk;
    });
  }, [tasks, filters]);

  const grouped = groupByDay(visibleTasks);

  return (
    <div style={page(isDark)}>
      <header style={header}>
        <div style={headerTopRow}>
          <div>
            <h1 style={{ margin: 0 }}>Raspored+</h1>
            <p style={{ margin: "6px 0 0", color: isDark ? "#9ca3af" : "#6b7280" }}>
              Završeno: {stats.done}/{stats.total} • {stats.percent}%
            </p>
            <p style={{ margin: "6px 0 0", color: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}>
              Prikazano: {visibleTasks.length}/{tasks.length}
            </p>
          </div>

          <button
            style={themeBtn(isDark)}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div style={progressWrap(isDark)}>
          <div style={progressBar(isDark, stats.percent)} />
        </div>
      </header>

      <main style={grid}>
        <section style={{ display: "grid", gap: 12 }}>
          <FilterBar
            value={filters}
            onChange={setFilters}
            onReset={() => setFilters({ day: "all", priority: "all", status: "all", query: "" })}
            dark={isDark}
          />

          <TaskForm onAdd={(t: Task) => addTask(t)} dark={isDark} />
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          {(Object.keys(DAY_LABEL) as DayKey[]).map((day) => (
            <TaskList
              key={day}
              title={DAY_LABEL[day]}
              tasks={grouped[day]}
              onDelete={deleteTask}
              onToggleDone={(id, nextDone) =>
                updateTask(id, { status: nextDone ? "done" : "todo" })
              }
              onUpdate={updateTask}
              dark={isDark}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

function groupByDay(tasks: Task[]) {
  const base: Record<DayKey, Task[]> = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };

  for (const t of tasks) base[t.day].push(t);
  return base;
}

const header: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto 16px",
  display: "grid",
  gap: 10,
};

const headerTopRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const grid: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: 16,
};

const page = (dark: boolean): React.CSSProperties => ({
  minHeight: "100vh",
  background: dark ? "#0b1220" : "#f6f7fb",
  color: dark ? "#e5e7eb" : "#111827",
  padding: 24,
  fontFamily: "system-ui",
});

const themeBtn = (dark: boolean): React.CSSProperties => ({
  padding: "10px 12px",
  borderRadius: 12,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#0f172a" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
  whiteSpace: "nowrap",
});

const progressWrap = (dark: boolean): React.CSSProperties => ({
  height: 10,
  background: dark ? "#111827" : "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
  border: dark ? "1px solid #1f2937" : "none",
});

const progressBar = (dark: boolean, percent: number): React.CSSProperties => ({
  height: "100%",
  width: `${percent}%`,
  background: dark ? "#e5e7eb" : "#111827",
});
