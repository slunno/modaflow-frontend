import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { listWorkspace, WORKSPACE_CHANGED } from '../services/workspaceService';
import type { WorkspaceDocument, WorkspaceKind } from '../types/workspace';
const EMPTY_ROWS: WorkspaceDocument<never>[] = [];

export function useWorkspace<T>(kind: WorkspaceKind) {
  const { activeMarca } = useAuth();
  const brand = activeMarca?.id ?? '';
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{
    brand: string;
    loading: boolean;
    error: string;
    rows: WorkspaceDocument<T>[];
  }>({ brand: '', loading: true, error: '', rows: [] });
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let current = true;
    if (!brand) {
      setState({ brand, loading: false, error: '', rows: [] });
      return;
    }
    setState((s) => ({
      ...s,
      brand,
      loading: true,
      error: '',
      rows: s.brand === brand ? s.rows : [],
    }));
    listWorkspace<T>(kind, brand)
      .then((rows) => {
        if (current) setState({ brand, rows, loading: false, error: '' });
      })
      .catch((e) => {
        if (current)
          setState({
            brand,
            rows: [],
            loading: false,
            error: e instanceof Error ? e.message : 'Falha ao consultar.',
          });
      });
    return () => {
      current = false;
    };
  }, [brand, kind, version]);
  useEffect(() => {
    const changed = (event: Event) => {
      const detail = (event as CustomEvent<{ brand: string; kind: string }>).detail;
      if (!detail || (detail.brand === brand && detail.kind === kind)) reload();
    };
    window.addEventListener(WORKSPACE_CHANGED, changed);
    window.addEventListener('focus', reload);
    return () => {
      window.removeEventListener(WORKSPACE_CHANGED, changed);
      window.removeEventListener('focus', reload);
    };
  }, [brand, kind, reload]);
  return {
    ...state,
    brand,
    rows: state.brand === brand ? state.rows : EMPTY_ROWS,
    loading: state.brand !== brand || state.loading,
    reload,
  };
}
