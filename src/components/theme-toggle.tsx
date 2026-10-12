import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  // Inisialisasi state awal langsung dari DOM saat pertama kali dipasang
  useEffect(() => {
    const hasDarkClass = document.documentElement.classList.contains('dark');
    const storedTheme = localStorage.getItem('balasin_theme');
    setIsDark(hasDarkClass || storedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;

    // 1. Ubah state ikon LANGSUNG secara serentak
    setIsDark(nextDark);

    // 2. Terapkan ke DOM & localStorage seketika
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
      type="button"
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-200"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
