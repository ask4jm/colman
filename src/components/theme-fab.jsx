"use client";

import { useTheme } from "./theme-provider";

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }

  return (
    <div className={`rounded-[22px] border border-white/10 bg-white/6 p-1.5 ${compact ? "" : "w-full"}`}>
      <div className={`flex items-center gap-1 ${compact ? "justify-center" : "justify-between"}`}>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`rounded-full px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition ${
            theme === "light"
              ? "bg-[color:var(--brand)] text-white"
              : "text-white/55"
          }`}
          aria-pressed={theme === "light"}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`rounded-full px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition ${
            theme === "dark"
              ? "bg-[color:var(--brand)] text-white"
              : "text-white/55"
          }`}
          aria-pressed={theme === "dark"}
        >
          Dark
        </button>
      </div>
    </div>
  );
}
