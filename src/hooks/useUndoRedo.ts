import { useState, useCallback } from "react";
import type { Task } from "../types/task";

type HistoryState = {
  tasks: Task[];
  timestamp: number;
};

const MAX_HISTORY = 50;

export function useUndoRedo(initialTasks: Task[]) {
  const [history, setHistory] = useState<HistoryState[]>([{ tasks: initialTasks, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentTasks = history[historyIndex]?.tasks || initialTasks;

  const addToHistory = useCallback((tasks: Task[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ tasks, timestamp: Date.now() });
      
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      return newHistory;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    currentTasks,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

