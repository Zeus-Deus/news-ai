import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-secondary-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="relative w-10 h-6">
        <div className="absolute inset-0 rounded-full bg-secondary-200 dark:bg-slate-800 transition-colors duration-300" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow transform transition-all duration-300 ${
            theme === "light" ? "left-1" : "left-[calc(100%-1.25rem)]"
          }`}
        />
      </div>
      <span className="text-xs font-medium text-secondary-700 dark:text-slate-300 uppercase tracking-wide">
        {theme === "light" ? "Dark" : "Light"}
      </span>
    </button>
  );
};

export default ThemeToggle;
