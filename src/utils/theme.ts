export type ThemeMode = "light" | "dark";

const KEY = "raspored_plus_theme";

export function loadTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === "dark" || raw === "light") return raw;
    return "light";
  } catch {
    return "light";
  }
}

export function saveTheme(mode: ThemeMode) {
  localStorage.setItem(KEY, mode);
}
