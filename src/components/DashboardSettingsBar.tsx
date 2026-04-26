'use client';

import { Sun, Moon, Languages } from 'lucide-react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { clsx } from 'clsx';

/**
 * Compact settings bar — dark mode toggle + language switcher.
 * Used in admin and branch dashboards.
 */
export default function DashboardSettingsBar() {
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useSimbaStore();

  return (
    <div className="flex items-center gap-1">
      {/* Dark mode */}
      <button
        onClick={toggleDarkMode}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode
          ? <Sun className="w-4 h-4 text-brand" />
          : <Moon className="w-4 h-4 text-white/80" />}
      </button>

      {/* Language */}
      <div className="relative group">
        <button className="flex items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors">
          <Languages className="w-4 h-4 text-white/80" />
          <span className="text-[10px] font-black text-white uppercase">{language}</span>
        </button>
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[200] overflow-hidden py-1">
          {(['en', 'fr', 'rw'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={clsx(
                'w-full text-left px-4 py-2.5 text-sm font-bold transition-colors',
                language === lang
                  ? 'text-brand bg-brand-muted dark:bg-brand/10'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              {lang === 'en' ? '🇬🇧 English' : lang === 'fr' ? '🇫🇷 Français' : '🇷🇼 Kinyarwanda'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
