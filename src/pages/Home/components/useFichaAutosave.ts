import { useCallback, useEffect, useRef } from 'react';

interface AutosaveInput {
  conteudo: string;
  salvo: string;
  bloqueado: boolean;
  onSave: () => boolean | Promise<boolean>;
}

/** Agrupa a digitação; sair do campo ou da ficha guarda o último conteúdo imediatamente. */
export function useFichaAutosave({ conteudo, salvo, bloqueado, onSave }: AutosaveInput) {
  const pending = useRef({ alterado: false, bloqueado, onSave, conteudo });
  const inFlight = useRef<Promise<boolean> | null>(null);
  const alterado = conteudo !== salvo;

  useEffect(() => {
    pending.current = { alterado, bloqueado, onSave, conteudo };
  });

  const flush = useCallback(function flushPending(): boolean | Promise<boolean> {
    if (inFlight.current)
      return inFlight.current.then((success) => (success ? flushPending() : false));
    const atual = pending.current;
    if (!atual.alterado) return true;
    if (atual.bloqueado) return false;
    const result = atual.onSave();
    const confirmed = (success: boolean) => {
      if (success && pending.current.conteudo === atual.conteudo) pending.current.alterado = false;
      inFlight.current = null;
      return success;
    };
    if (result instanceof Promise) {
      inFlight.current = result.then(confirmed, () => confirmed(false));
      return inFlight.current;
    }
    return confirmed(result);
  }, []);

  useEffect(() => {
    if (!alterado || bloqueado) return;
    const timer = window.setTimeout(flush, 500);
    return () => window.clearTimeout(timer);
  }, [conteudo, alterado, bloqueado, flush]);

  useEffect(() => {
    const guardar = () => {
      flush();
    };
    const protect = (event: BeforeUnloadEvent) => {
      if (pending.current.alterado || inFlight.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', protect);
    window.addEventListener('pagehide', guardar);
    return () => {
      window.removeEventListener('pagehide', guardar);
      window.removeEventListener('beforeunload', protect);
      flush();
    };
  }, [flush]);

  return { flush, alterado };
}
