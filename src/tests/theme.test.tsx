import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { THEME_STORAGE_KEY } from '../lib/theme';

let media: MediaQueryList;

function changeSystemTheme(dark: boolean) {
  const event = new Event('change');
  Object.defineProperty(event, 'matches', { value: dark });
  Object.defineProperty(media, 'matches', { value: dark, configurable: true });
  act(() => media.dispatchEvent(event));
}

function renderTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle showLabel />
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  media = Object.assign(new EventTarget(), { matches: false }) as MediaQueryList;
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media)
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('Tema da aplicação', () => {
  it('usa o tema do sistema sem gravar uma preferência manual', () => {
    Object.defineProperty(media, 'matches', { value: true, configurable: true });
    renderTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeDefined();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('prioriza a preferência salva sobre o sistema', () => {
    Object.defineProperty(media, 'matches', { value: true, configurable: true });
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    renderTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Ativar modo escuro' })).toBeDefined();
  });

  it('alterna nos dois sentidos e restaura a escolha ao remontar a aplicação', () => {
    const first = renderTheme();
    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    first.unmount();
    renderTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo claro' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('acompanha alterações do sistema até o usuário fazer uma escolha', () => {
    renderTheme();
    changeSystemTheme(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo claro' }));
    changeSystemTheme(false);
    changeSystemTheme(true);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('sincroniza a preferência entre abas e volta ao sistema quando ela é removida', () => {
    renderTheme();
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY })));
    expect(document.documentElement.dataset.theme).toBe('dark');
    localStorage.removeItem(THEME_STORAGE_KEY);
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY })));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('continua alternando o tema se o navegador bloquear o armazenamento', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Armazenamento bloqueado', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Armazenamento bloqueado', 'SecurityError');
    });
    renderTheme();
    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeDefined();
  });
});
