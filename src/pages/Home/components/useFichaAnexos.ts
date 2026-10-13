import { useEffect, useState } from 'react';
import {
  addFichaAnexos,
  listFichaAnexos,
  removeFichaAnexo,
  type FichaAnexo,
  type FichaAnexoCategoria,
} from '../../../services/fichaAnexosStorage';
export interface FichaAnexosOptions {
  pieceKey: string;
  onItemsChange?: (items: FichaAnexo[]) => void;
  onMutation?: (antes: FichaAnexo[], depois: FichaAnexo[]) => void | Promise<void>;
  disabled?: boolean;
  revision?: number;
}
export interface FichaAnexosController {
  shared?: boolean;
  items: FichaAnexo[];
  loading: boolean;
  busy: FichaAnexoCategoria | null;
  dragging: FichaAnexoCategoria | null;
  error: string;
  status: string;
  disabled: boolean;
  setDragging: (categoria: FichaAnexoCategoria | null) => void;
  upload: (categoria: FichaAnexoCategoria, files: File[]) => Promise<void>;
  remove: (item: FichaAnexo) => Promise<void>;
}

export function useFichaAnexos({
  pieceKey,
  onItemsChange,
  onMutation,
  disabled = false,
  revision = 0,
}: FichaAnexosOptions): FichaAnexosController {
  const [items, setItems] = useState<FichaAnexo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<FichaAnexoCategoria | null>(null);
  const [dragging, setDragging] = useState<FichaAnexoCategoria | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setItems([]);
    listFichaAnexos(pieceKey)
      .then((records) => {
        if (active) {
          setItems(records);
          onItemsChange?.(records);
        }
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os anexos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [pieceKey, onItemsChange, revision]);

  const upload = async (categoria: FichaAnexoCategoria, files: File[]) => {
    if (disabled || loading || busy || !files.length) return;
    setBusy(categoria);
    setError('');
    setStatus('');
    try {
      const records = await addFichaAnexos(pieceKey, categoria, files);
      const next = [...items, ...records];
      setItems(next);
      onItemsChange?.(next);
      setStatus(
        pieceKey.startsWith('shared:')
          ? 'Anexos salvos no servidor.'
          : 'Anexos salvos neste navegador.'
      );
      try {
        await onMutation?.(items, next);
      } catch {
        setError(
          'Os anexos foram salvos, mas não foi possível atualizar a ficha. Recarregue para conferir.'
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error && !(cause instanceof DOMException)
          ? cause.message
          : 'Não foi possível salvar os anexos. Verifique o espaço disponível no navegador.'
      );
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: FichaAnexo) => {
    if (disabled) return;
    setBusy(item.categoria);
    setError('');
    setStatus('');
    try {
      await removeFichaAnexo(item.id, pieceKey);
      const next = items.filter((entry) => entry.id !== item.id);
      setItems(next);
      onItemsChange?.(next);
      setStatus('Anexo removido do portal. O arquivo original no computador não foi alterado.');
      try {
        await onMutation?.(items, next);
      } catch {
        setError('O anexo foi removido, mas não foi possível registrar o histórico no navegador.');
      }
    } catch {
      setError('Não foi possível remover o anexo.');
    } finally {
      setBusy(null);
    }
  };

  return {
    shared: pieceKey.startsWith('shared:'),
    items,
    loading,
    busy,
    dragging,
    error,
    status,
    disabled,
    setDragging,
    upload,
    remove,
  };
}
