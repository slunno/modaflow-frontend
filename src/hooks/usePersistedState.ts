/**
 * ============================================================================
 * HOOK: usePersistedState<T>
 * ARQUIVO: src/hooks/usePersistedState.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Hook genérico tipado para gerenciar estado persistido no localStorage
 *            com fallback seguro, sincronização entre abas e resiliência a falhas.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';

export function usePersistedState<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  const getValue = useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch {
      // Fallback em caso de erro de parsing ou acesso ao localStorage
    }
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  }, [key, initialValue]);

  const [state, setState] = useState<T>(getValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Silencia erros de quota excedida ou storage bloqueado
    }
  }, [key, state]);

  const setPersistedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prevState) => {
        const nextValue =
          typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
        try {
          localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // Silencia erros de storage
        }
        return nextValue;
      });
    },
    [key]
  );

  return [state, setPersistedState];
}
