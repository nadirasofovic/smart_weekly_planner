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
      <header style={header(isDark)}>
        <div style={headerInner}>
          <div>
            <h1 style={{ margin: 0 }}>Raspored+</h1>
            <p style={muted(isDark)}>
              Završeno: {stats.done}/{stats.total} • {stats.percent}%
            </p>
            <p style={{ ...muted(isDark), fontSize: 12 }}>
              Prikazano: {visibleTasks.length}/{tasks.length}
            </p>
          </div>

          <button
            style={themeBtn(isDark)}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div style={progressWrap(isDark)}>
          <div style={progressBar(isDark, stats.percent)} />
        </div>
      </header>

      <main style={main}>
        <div style={contentGrid}>
          <section style={{ display: "grid", gap: 12 }}>
            <FilterBar
              value={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({ day: "all", priority: "all", status: "all", query: "" })
              }
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
        </div>
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

const page = (dark: boolean): React.CSSProperties => ({
  minHeight: "100vh",
  background: dark ? "#0b1220" : "#f6f7fb",
  color: dark ? "#e5e7eb" : "#111827",
});

const header = (dark: boolean): React.CSSProperties => ({
  padding: "24px 32px",
  borderBottom: dark ? "1px solid #1f2937" : "1px solid #e5e7eb",
});

const headerInner: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
};

const muted = (dark: boolean): React.CSSProperties => ({
  margin: "6px 0 0",
  color: dark ? "#9ca3af" : "#6b7280",
});

const main: React.CSSProperties = {
  padding: "24px 32px",
};

const contentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: 24,
};

const themeBtn = (dark: boolean): React.CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 12,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#0f172a" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
});

const progressWrap = (dark: boolean): React.CSSProperties => ({
  marginTop: 16,
  height: 10,
  background: dark ? "#111827" : "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
});

const progressBar = (dark: boolean, percent: number): React.CSSProperties => ({
  height: "100%",
  width: `${percent}%`,
  background: dark ? "#e5e7eb" : "#111827",
});
