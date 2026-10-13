/**
 * ============================================================================
 * HOOK: usePersistedState<T>
 * ARQUIVO: src/hooks/usePersistedState.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Hook genérico tipado para gerenciar estado persistido no localStorage
 *            com fallback seguro, sincronização entre abas e resiliência a falhas.
 * ============================================================================
 */

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import {
  getLocalStateSnapshot,
  parseLocalState,
  saveLocalState,
  subscribeLocalState,
} from '../services/localStateStorage';

const getServerSnapshot = () => null;

export function usePersistedState<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const [fallback] = useState<T>(() =>
    typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue
  );
  const subscribe = useCallback(
    (onChange: () => void) => subscribeLocalState(key, onChange),
    [key]
  );
  const getSnapshot = useCallback(() => getLocalStateSnapshot(key), [key]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const state = useMemo(() => parseLocalState(snapshot, fallback), [snapshot, fallback]);

  const setPersistedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      const previous = parseLocalState(getLocalStateSnapshot(key), fallback);
      const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(previous) : value;
      try {
        saveLocalState(key, nextValue);
      } catch (error) {
        if (
          error instanceof DOMException &&
          (error.name === 'QuotaExceededError' || error.code === 22)
        )
          console.error(`[usePersistedState] Quota de armazenamento excedida para chave: ${key}`);
        else console.error(`[usePersistedState] Falha ao persistir chave ${key}:`, error);
      }
    },
    [key, fallback]
  );

  return [state, setPersistedState];
}
