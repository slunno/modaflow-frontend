import { useEffect, useState, type ReactNode } from 'react';
import type { PecaItem } from '../../../types/plm';
import { getFichaImagem } from '../../../services/fichaAnexosStorage';

/** A capa da coleção acompanha a primeira variante, inclusive uma remoção explícita. */
export function PecaImagem({
  peca,
  marcaId,
  className,
  fallback,
}: {
  peca: PecaItem;
  marcaId?: string;
  className?: string;
  fallback: ReactNode;
}) {
  const principal = peca.fichaTecnica?.variantes?.[0];
  const removed = !!principal?.imagemRemovida;
  const id = principal?.imagemAnexoId;
  const direct = removed
    ? undefined
    : (principal?.imagemUrl ?? (!id ? peca.imagemCroquiUrl : undefined));
  const pieceKey = `${marcaId ?? peca.marcaId}:${peca.id}`;
  const excluded = JSON.stringify(
    peca.fichaTecnica?.variantes
      ?.slice(1)
      .flatMap((item) => (item.imagemAnexoId ? [item.imagemAnexoId] : [])) ?? []
  );
  const key = JSON.stringify([pieceKey, id, direct, removed, excluded]);
  const [loaded, setLoaded] = useState<{ key: string; url: string }>();
  useEffect(() => {
    if (removed || direct) return;
    let active = true;
    let url: string | undefined;
    void getFichaImagem(pieceKey, id, JSON.parse(excluded) as string[])
      .then((blob) => {
        if (!active || !blob) return;
        url = URL.createObjectURL(blob);
        setLoaded({ key, url });
      })
      .catch(() => {
        /* Mantém a miniatura vazia se o arquivo não estiver disponível. */
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [pieceKey, id, direct, removed, excluded, key]);
  const url = direct ?? (!removed && loaded?.key === key ? loaded.url : undefined);
  return url ? <img src={url} alt={peca.nome} className={className} /> : fallback;
}
