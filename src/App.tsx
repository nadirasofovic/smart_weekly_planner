import { useMemo, useState, useEffect, useCallback } from "react";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { FilterBar } from "./components/FilterBar";
import { WeekNavigation } from "./components/WeekNavigation";
import { ExportImport } from "./components/ExportImport";
import { useTasks } from "./hooks/useTasks";
import { useUndoRedo } from "./hooks/useUndoRedo";
import type { DayKey, Task } from "./types/task";
import type { Filters } from "./types/filters";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { DAY_LABEL } from "./constants/days";
import { getWeekDates } from "./utils/dates";
import { generateRecurringInstances } from "./utils/recurrence";

function AppContent() {
  const { tasks: initialTasks, addTask: baseAddTask, deleteTask: baseDeleteTask, updateTask: baseUpdateTask, stats, setTasks } = useTasks();
  const { isDark, toggleTheme } = useTheme();
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const { weekStart: start } = getWeekDates(today);
    return start;
  });

  const { currentTasks, addToHistory, undo, redo, canUndo, canRedo } = useUndoRedo(initialTasks);

  // Sync currentTasks with useTasks
  useEffect(() => {
    if (currentTasks !== initialTasks) {
      setTasks(currentTasks);
    }
  }, [currentTasks, initialTasks, setTasks]);

  const addTask = useCallback((task: Task) => {
    baseAddTask(task);
    // Generate recurring instances if needed
    if (task.recurrence && task.recurrence !== "none" && task.date) {
      const startDate = new Date(weekStart);
      const endDate = new Date(weekStart);
      endDate.setDate(endDate.getDate() + 90); // Next 90 days
      
      const instances = generateRecurringInstances(task, startDate, endDate);
      instances.forEach((instance) => baseAddTask(instance));
    }
    addToHistory([...initialTasks, task]);
  }, [baseAddTask, initialTasks, addToHistory, weekStart]);

  const deleteTask = useCallback((id: string) => {
    baseDeleteTask(id);
    addToHistory(initialTasks.filter((t) => t.id !== id));
  }, [baseDeleteTask, initialTasks, addToHistory]);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    baseUpdateTask(id, patch);
    addToHistory(initialTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, [baseUpdateTask, initialTasks, addToHistory]);

  const handleImport = useCallback((importedTasks: Task[]) => {
    setTasks(importedTasks);
    addToHistory(importedTasks);
  }, [setTasks, addToHistory]);

  const handleReorder = useCallback((day: DayKey, taskIds: string[]) => {
    const dayTasks = initialTasks.filter((t) => t.day === day);
    const otherTasks = initialTasks.filter((t) => t.day !== day);
    
    const reordered = taskIds.map((id, idx) => {
      const task = dayTasks.find((t) => t.id === id);
      return task ? { ...task, order: idx } : null;
    }).filter(Boolean) as Task[];
    
    const newTasks = [...otherTasks, ...reordered];
    setTasks(newTasks);
    addToHistory(newTasks);
  }, [initialTasks, setTasks, addToHistory]);

  const [filters, setFilters] = useState<Filters>({
    day: "all",
    priority: "all",
    status: "all",
    query: "",
    tags: [],
  });

  const { dayMap } = getWeekDates(weekStart);

  const visibleTasks = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    return initialTasks.filter((t) => {
      const dayOk = filters.day === "all" || t.day === filters.day;
      const prioOk = filters.priority === "all" || t.priority === filters.priority;
      const statusOk = filters.status === "all" || t.status === filters.status;
      const queryOk = !q || t.title.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q) ?? false);
      
      // Filter by date if we're in week view
      const dateOk = !t.date || (() => {
        const taskDate = new Date(t.date!);
        const weekStartDate = new Date(weekStart);
        const weekEndDate = new Date(weekStart);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        return taskDate >= weekStartDate && taskDate <= weekEndDate;
      })();

      // Filter by tags
      const tagsOk = filters.tags?.length === 0 || (t.tags && filters.tags?.some((tag) => t.tags?.includes(tag)));

      return dayOk && prioOk && statusOk && queryOk && dateOk && tagsOk;
    });
  }, [initialTasks, filters, weekStart]);

  const grouped = groupByDay(visibleTasks);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return (
    <div style={page(isDark)}>
      <header style={header(isDark)} className="header-content">
        <div style={headerInner}>
          <div>
            <h1 style={{ margin: 0 }}>Raspored+</h1>
            <p style={muted(isDark)}>
              Završeno: {stats.done}/{stats.total} • {stats.percent}%
            </p>
            <p style={{ ...muted(isDark), fontSize: 12 }}>
              Prikazano: {visibleTasks.length}/{initialTasks.length}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={undoRedoGroup}>
              <button
                style={undoRedoBtn(isDark, !canUndo)}
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                style={undoRedoBtn(isDark, !canRedo)}
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
            </div>
            <button style={themeBtn(isDark)} onClick={toggleTheme}>
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        <div style={progressWrap(isDark)}>
          <div style={progressBar(isDark, stats.percent)} />
        </div>
      </header>

      <main style={main} className="main-content">
        <WeekNavigation weekStart={weekStart} onWeekChange={setWeekStart} />

        <div style={contentGrid} className="content-grid">
          <section style={sidebar} className="sidebar">
            <FilterBar
              value={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({ day: "all", priority: "all", status: "all", query: "", tags: [] })
              }
              allTags={Array.from(new Set(initialTasks.flatMap((t) => t.tags || [])))}
            />

            <TaskForm onAdd={addTask} weekStart={weekStart} />

            <ExportImport tasks={initialTasks} onImport={handleImport} />
          </section>

          <section style={taskSection} className="task-section">
            {(Object.keys(DAY_LABEL) as DayKey[]).map((day) => {
              const dayDate = dayMap[day];
              const isToday = dayDate && new Date().toDateString() === dayDate.toDateString();
              
              return (
                <TaskList
                  key={day}
                  title={`${DAY_LABEL[day]}${dayDate ? ` (${dayDate.toLocaleDateString("sr-RS", { day: "numeric", month: "numeric" })})` : ""}${isToday ? " ⭐" : ""}`}
                  tasks={grouped[day]}
                  onDelete={deleteTask}
                  onToggleDone={(id, nextDone) =>
                    updateTask(id, { status: nextDone ? "done" : "todo" })
                  }
                  onUpdate={updateTask}
                  onReorder={(taskIds) => handleReorder(day, taskIds)}
                />
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
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
  flexWrap: "wrap",
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

const sidebar: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const taskSection: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const undoRedoGroup: React.CSSProperties = {
  display: "flex",
  gap: 4,
};

const undoRedoBtn = (dark: boolean, disabled: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 8,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: disabled ? (dark ? "#1f2937" : "#f3f4f6") : (dark ? "#0f172a" : "white"),
  color: disabled ? (dark ? "#4b5563" : "#9ca3af") : (dark ? "#e5e7eb" : "#111827"),
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 12,
  opacity: disabled ? 0.5 : 1,
});

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
