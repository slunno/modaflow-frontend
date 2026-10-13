import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { listWorkspace, saveWorkspace } from '../../services/workspaceService';
import type { RegistryData } from '../../types/workspace';
import type { TeamItem } from '../../types/gestao';

export function LegacyTeamsNotice() {
  const { activeMarca } = useAuth();
  const [legacy] = useState<TeamItem[]>(() => {
    try {
      const value = JSON.parse(localStorage.getItem('modaflow_teams_data') ?? '[]');
      return Array.isArray(value) ? value.filter((t) => t.id && t.nome) : [];
    } catch {
      return [];
    }
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <div className="akr-notice">
      <Link to="/gestao/times-legado">Consultar times anteriores deste navegador</Link>
      {legacy.length > 0 && (
        <>
          <span>
            {legacy.length} times locais. Copiar vincula esses times à marca {activeMarca?.nome} e
            preserva os originais.
          </span>
          <button
            className="akr-button"
            disabled={busy || !activeMarca}
            onClick={async () => {
              if (!activeMarca) return;
              setBusy(true);
              setMessage('');
              try {
                const saved = await listWorkspace<RegistryData>('teams', activeMarca.id);
                let count = 0;
                for (const item of legacy) {
                  const sourceKey = 'legacy-team:' + item.id;
                  if (saved.some((t) => t.data.sourceKey === sourceKey)) continue;
                  await saveWorkspace(
                    'teams',
                    {
                      nome: item.nome,
                      descricao: item.descricao ?? '',
                      designadoProduto: item.designadoProduto,
                      sourceKey,
                    },
                    activeMarca.id
                  );
                  count++;
                }
                setMessage(
                  `${count} times copiados para a marca. Vínculos existentes preservados.`
                );
              } catch (e) {
                setMessage(e instanceof Error ? e.message : 'Falha ao copiar times.');
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Copiando…' : 'Copiar times locais para esta marca'}
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
