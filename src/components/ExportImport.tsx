import { useRef, useState } from "react";
import type { Task } from "../types/task";
import { useTheme } from "../contexts/ThemeContext";
import { exportTasksToJSON, exportTasksToCSV, downloadFile, importTasksFromJSON } from "../utils/export";

type Props = {
  tasks: Task[];
  onImport: (tasks: Task[]) => void;
};

export function ExportImport({ tasks, onImport }: Props) {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExportJSON = () => {
    const json = exportTasksToJSON(tasks);
    downloadFile(json, `raspored-tasks-${new Date().toISOString().split("T")[0]}.json`, "application/json");
  };

  const handleExportCSV = () => {
    const csv = exportTasksToCSV(tasks);
    downloadFile(csv, `raspored-tasks-${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedTasks = importTasksFromJSON(content);
        onImport(importedTasks);
        setImportError(null);
        alert(`Uspješno uvezeno ${importedTasks.length} zadataka!`);
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "Greška pri uvozu");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={container(isDark)}>
      <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Izvoz / Uvoz</h3>
      
      <div style={buttonGroup}>
        <button style={btn(isDark)} onClick={handleExportJSON}>
          📥 Izvezi JSON
        </button>
        <button style={btn(isDark)} onClick={handleExportCSV}>
          📥 Izvezi CSV
        </button>
        <button style={btn(isDark)} onClick={handleImport}>
          📤 Uvezi JSON
        </button>
      </div>

      {importError && (
        <div style={errorBox(isDark)}>
          ⚠️ {importError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

const container = (dark: boolean): React.CSSProperties => ({
  background: dark ? "#0f172a" : "white",
  border: dark ? "1px solid #1f2937" : "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 16,
  marginTop: 16,
});

const buttonGroup: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const btn = (dark: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 8,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
  fontSize: 13,
  flex: 1,
  minWidth: 100,
});

const errorBox = (dark: boolean): React.CSSProperties => ({
  marginTop: 12,
  padding: 12,
  background: dark ? "#7f1d1d" : "#fee2e2",
  color: dark ? "#fca5a5" : "#991b1b",
  borderRadius: 8,
  fontSize: 13,
});

