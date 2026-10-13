import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { listWorkspace, saveWorkspace } from '../../services/workspaceService';
import type { PecaItem, ColecaoItem } from '../../types/plm';
import type { OperationalProduct, OperationalCollection } from '../../types/workspace';

function localRows<T>(key: string): T[] {
  try {
    const result = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}
export function LegacyImportNotice({ onImported }: { onImported: () => void }) {
  const { activeMarca } = useAuth();
  const brand = activeMarca?.id ?? '';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const pieces = localRows<PecaItem>('modaflow_collection_pecas').filter(
    (p) => p.marcaId === brand
  );
  const collections = localRows<ColecaoItem>('modaflow_user_colecoes').filter(
    (c) => c.marcaId === brand
  );
  if (!brand || (!pieces.length && !collections.length)) return null;
  const migrate = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    let created = 0;
    try {
      const existingCollections = await listWorkspace<OperationalCollection>('collections', brand);
      const existingPieces = await listWorkspace<OperationalProduct>('products', brand);
      for (const item of collections) {
        const sourceKey = 'collection:' + item.id;
        if (existingCollections.some((c) => c.data.sourceKey === sourceKey)) continue;
        await saveWorkspace('collections', { ...item, marcaId: brand, sourceKey }, brand);
        created++;
      }
      for (const item of pieces) {
        if (!item.colecaoId) continue;
        if (
          !existingCollections.some((c) => c.data.id === item.colecaoId) &&
          !collections.some((c) => c.id === item.colecaoId)
        ) {
          const saved = await saveWorkspace<OperationalCollection>(
            'collections',
            {
              id: item.colecaoId,
              nome: item.colecaoNome,
              marcaId: brand,
              marcaNome: activeMarca?.nome ?? item.marcaNome,
              sourceKey: 'collection:' + item.colecaoId,
              status: item.statusColecao ?? 'Status não identificado',
              dataEntrega: '',
              diasAtraso: 0,
              codigoPill: item.linxOrigem?.colecaoCodigo,
              griffe: item.linxOrigem?.griffe,
              regraFicha: 'legado',
            },
            brand
          );
          existingCollections.push(saved);
          created++;
        }
        const sourceKey = 'product:' + item.colecaoId + ':' + item.id;
        if (existingPieces.some((p) => p.data.sourceKey === sourceKey)) continue;
        await saveWorkspace('products', { ...item, marcaId: brand, sourceKey }, brand);
        created++;
      }
      setMessage(
        created +
          ' registros compartilhados. Registros já existentes no servidor foram preservados.'
      );
      onImported();
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : 'Erro ao compartilhar.') +
          ' ' +
          created +
          ' registros foram confirmados. Os originais locais continuam preservados.'
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={error ? 'akr-alert' : 'akr-notice'} role={error ? 'alert' : 'status'}>
      <span>
        {error ||
          message ||
          'Há ' +
            pieces.length +
            ' fichas e ' +
            collections.length +
            ' coleções neste navegador. Compartilhe-as para alimentar o BI e o Kanban da equipe.'}
      </span>
      <button className="akr-button" disabled={busy} onClick={() => void migrate()}>
        <UploadCloud size={15} />
        {busy ? 'Compartilhando…' : 'Compartilhar rascunhos'}
      </button>
    </div>
  );
}
