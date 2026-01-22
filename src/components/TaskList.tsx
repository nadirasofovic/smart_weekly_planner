import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types/task";
import { EditTaskModal } from "./EditTaskModal";
import { useTheme } from "../contexts/ThemeContext";
import { TaskItem } from "./TaskItem";

type Props = {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggleDone: (id: string, nextDone: boolean) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onReorder?: (taskIds: string[]) => void;
};

function SortableTaskItem({
  task,
  onDelete,
  onToggleDone,
  onEdit,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onToggleDone: (id: string, nextDone: boolean) => void;
  onEdit: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem
        task={task}
        onDelete={onDelete}
        onToggleDone={onToggleDone}
        onEdit={onEdit}
      />
    </div>
  );
}

export function TaskList({
  title,
  tasks,
  onDelete,
  onToggleDone,
  onUpdate,
  onReorder,
}: Props) {
  const { isDark } = useTheme();
  const [editing, setEditing] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sorted = useMemo(() => {
    const withOrder = [...tasks].map((t, idx) => ({
      ...t,
      order: t.order ?? idx,
    }));
    
    return withOrder.sort((a, b) => {
      // Done tasks at bottom
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      // Then by order
      return (a.order ?? 0) - (b.order ?? 0);
    });
  }, [tasks]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = sorted.findIndex((t) => t.id === active.id);
      const newIndex = sorted.findIndex((t) => t.id === over.id);

      const newOrder = arrayMove(sorted, oldIndex, newIndex);
      onReorder(newOrder.map((t) => t.id));
    }
  }

  return (
    <div style={card(isDark)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <span style={{ color: isDark ? "#9ca3af" : "#6b7280", fontSize: 14 }}>
          {tasks.length} zadataka
        </span>
      </div>

      {tasks.length === 0 ? (
        <p style={{ color: isDark ? "#9ca3af" : "#6b7280", marginTop: 16 }}>
          Nema zadataka 🎉
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sorted.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div style={{ marginTop: 12 }}>
              {sorted.map((t) => (
                <SortableTaskItem
                  key={t.id}
                  task={t}
                  onDelete={onDelete}
                  onToggleDone={onToggleDone}
                  onEdit={setEditing}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <EditTaskModal
        open={!!editing}
        task={editing}
        onClose={() => setEditing(null)}
        onSave={(id, patch) => onUpdate(id, patch)}
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
