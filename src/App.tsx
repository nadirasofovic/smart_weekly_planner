import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { useTasks } from "./hooks/useTasks";
import type { DayKey, Task } from "./types/task";

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

  const grouped = groupByDay(tasks);

  return (
    <div style={page}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0 }}>Raspored+</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
            Završeno: {stats.done}/{stats.total} • {stats.percent}%
          </p>
        </div>

        <div style={progressWrap}>
          <div style={{ ...progressBar, width: `${stats.percent}%` }} />
        </div>
      </header>

      <main style={grid}>
        <section style={{ display: "grid", gap: 12 }}>
          <TaskForm onAdd={(t: Task) => addTask(t)} />
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          {(
            Object.keys(DAY_LABEL) as DayKey[]
          ).map((day) => (
            <TaskList
              key={day}
              title={DAY_LABEL[day]}
              tasks={grouped[day]}
              onDelete={deleteTask}
              onToggleDone={(id, nextDone) =>
                updateTask(id, { status: nextDone ? "done" : "todo" })
              }
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

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f6f7fb",
  padding: 24,
  fontFamily: "system-ui",
};

const header: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto 16px",
  display: "grid",
  gap: 10,
};

const progressWrap: React.CSSProperties = {
  height: 10,
  background: "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
};

const progressBar: React.CSSProperties = {
  height: "100%",
  background: "#111827",
};

const grid: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: 16,
};
