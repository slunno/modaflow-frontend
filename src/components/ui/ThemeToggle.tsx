import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, setPreference } = useTheme();
  const dark = theme === 'dark';
  const label = dark ? 'Ativar modo claro' : 'Ativar modo escuro';

  return (
    <button
      type="button"
      onClick={() => setPreference(dark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className="inline-flex min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-2.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-accent-camel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-camel focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {dark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">{dark ? 'Modo claro' : 'Modo escuro'}</span>
      )}
    </button>
  );
}
