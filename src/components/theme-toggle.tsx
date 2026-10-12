import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('balasin_theme') === 'dark';
    }
    return false;
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('balasin_theme', 'dark');
      } catch {
        // ignore
      }
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('balasin_theme', 'light');
      } catch {
        // ignore
      }
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-200"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
