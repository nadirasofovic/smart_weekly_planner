import { addWeeks } from "date-fns";
import { useTheme } from "../contexts/ThemeContext";
import { getWeekLabel } from "../utils/dates";

type Props = {
  weekStart: Date;
  onWeekChange: (weekStart: Date) => void;
};

export function WeekNavigation({ weekStart, onWeekChange }: Props) {
  const { isDark } = useTheme();

  const goToPreviousWeek = () => {
    onWeekChange(addWeeks(weekStart, -1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(weekStart, 1));
  };

  const goToCurrentWeek = () => {
    onWeekChange(new Date());
  };

  return (
    <div style={container(isDark)}>
      <button style={btn(isDark)} onClick={goToPreviousWeek}>
        ← Prethodna
      </button>
      <div style={weekLabel(isDark)}>
        <span>{getWeekLabel(weekStart)}</span>
        <button style={todayBtn(isDark)} onClick={goToCurrentWeek}>
          Danas
        </button>
      </div>
      <button style={btn(isDark)} onClick={goToNextWeek}>
        Sledeća →
      </button>
    </div>
  );
}

const container = (dark: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "12px 16px",
  background: dark ? "#0f172a" : "white",
  border: dark ? "1px solid #1f2937" : "1px solid #e5e7eb",
  borderRadius: 12,
  marginBottom: 16,
});

const btn = (dark: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  borderRadius: 8,
  border: dark ? "1px solid #334155" : "1px solid #e5e7eb",
  background: dark ? "#020617" : "white",
  color: dark ? "#e5e7eb" : "#111827",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
});

const todayBtn = (dark: boolean): React.CSSProperties => ({
  ...btn(dark),
  background: dark ? "#1e40af" : "#3b82f6",
  color: "white",
  border: "none",
  padding: "6px 12px",
  fontSize: 12,
  marginLeft: 12,
});

const weekLabel = (dark: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  color: dark ? "#e5e7eb" : "#111827",
  fontWeight: 500,
  fontSize: 14,
});

