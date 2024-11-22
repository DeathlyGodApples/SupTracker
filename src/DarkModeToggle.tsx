import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 
        dark:hover:text-gray-200"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}