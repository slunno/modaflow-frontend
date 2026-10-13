import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePersistedState } from '../hooks/usePersistedState';
import { saveLocalState } from '../services/localStateStorage';

function Counter({
  name,
  storageKey = 'teste-compartilhado',
}: {
  name: string;
  storageKey?: string;
}) {
  const [value, setValue] = usePersistedState(storageKey, 0);
  return (
    <button onClick={() => setValue((previous) => previous + 1)}>
      {name}: {value}
    </button>
  );
}

describe('Armazenamento local compartilhado', () => {
  beforeEach(() => localStorage.clear());

  it('notifica consumidores da mesma página e usa o último valor nas atualizações consecutivas em StrictMode', () => {
    render(
      <StrictMode>
        <Counter name="Primeiro" />
        <Counter name="Segundo" />
        <Counter name="Outra chave" storageKey="outra" />
      </StrictMode>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Primeiro: 0' }));
    expect(screen.getByRole('button', { name: 'Segundo: 1' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Segundo: 1' }));
    expect(screen.getByRole('button', { name: 'Primeiro: 2' })).toBeDefined();
    expect(localStorage.getItem('teste-compartilhado')).toBe('2');
    expect(screen.getByRole('button', { name: 'Outra chave: 0' })).toBeDefined();
    act(() => saveLocalState('teste-compartilhado', 8));
    expect(screen.getByRole('button', { name: 'Primeiro: 8' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Segundo: 8' })).toBeDefined();
  });

  it('acompanha mudanças e limpeza vindas de outra aba do navegador', () => {
    render(<Counter name="Seleção" />);
    act(() => {
      localStorage.setItem('teste-compartilhado', '4');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'teste-compartilhado',
          newValue: '4',
          storageArea: localStorage,
        })
      );
    });
    expect(screen.getByRole('button', { name: 'Seleção: 4' })).toBeDefined();
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }));
    });
    expect(screen.getByRole('button', { name: 'Seleção: 0' })).toBeDefined();
  });

  it('recupera dados locais, tolera JSON inválido e mantém o valor salvo quando falta espaço', () => {
    localStorage.setItem('teste-compartilhado', 'inválido');
    render(<Counter name="Seleção" />);
    expect(screen.getByRole('button', { name: 'Seleção: 0' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Seleção: 0' }));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Sem espaço', 'QuotaExceededError');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Seleção: 1' }));
    expect(screen.getByRole('button', { name: 'Seleção: 1' })).toBeDefined();
    expect(localStorage.getItem('teste-compartilhado')).toBe('1');
    expect(log).toHaveBeenCalled();
    write.mockRestore();
    log.mockRestore();
  });
});
