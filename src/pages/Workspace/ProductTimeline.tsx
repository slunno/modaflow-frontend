import { useEffect, useState } from 'react';
import { workspaceHistory, WORKSPACE_CHANGED } from '../../services/workspaceService';
import { displayDate, stageHistory } from '../../services/workspaceDomain';
import type { OperationalProduct, WorkspaceChange } from '../../types/workspace';

export function ProductTimeline({
  id,
  brand,
  product,
  revision,
}: {
  id: string;
  brand: string;
  product: OperationalProduct;
  revision: number;
}) {
  const [events, setEvents] = useState<WorkspaceChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let current = true;
    const load = () => {
      setLoading(true);
      workspaceHistory(brand)
        .then((rows) => {
          if (current) {
            setEvents(rows.filter((e) => e.documentId === id));
            setError('');
          }
        })
        .catch((e) => {
          if (current) setError(e instanceof Error ? e.message : 'Falha ao consultar o histórico.');
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    };
    load();
    window.addEventListener(WORKSPACE_CHANGED, load);
    return () => {
      current = false;
      window.removeEventListener(WORKSPACE_CHANGED, load);
    };
  }, [id, brand, revision, retry]);
  const stages = stageHistory(events, new Set([id]));
  return (
    <section className="akr-panel akr-panel-body" aria-label="Cronograma compartilhado">
      <h3>Planejado e realizado</h3>
      <div className="akr-notice">
        <span>
          Entrega planejada: <strong>{displayDate(product.previsaoEntrega)}</strong>
        </span>
        <span>
          Prazo da etapa: <strong>{displayDate(product.stageDeadline)}</strong>
        </span>
        <span>
          Conclusão registrada:{' '}
          <strong>
            {product.completedAt
              ? new Date(product.completedAt).toLocaleString('pt-BR')
              : 'Não registrada'}
          </strong>
        </span>
      </div>
      <p className="akr-muted text-xs">
        Eventos confirmados pelo servidor. A permanência considera apenas intervalos entre entradas
        e saídas registradas.
      </p>
      {loading && <p role="status">Consultando histórico…</p>}
      {error && (
        <div role="alert" className="akr-alert">
          {error}
          <button className="akr-button" onClick={() => setRetry((v) => v + 1)}>
            Tentar novamente
          </button>
        </div>
      )}
      {!loading && !error && (
        <>
          {stages.durations.length > 0 ? (
            <div className="akr-table-scroll">
              <table className="akr-table">
                <thead>
                  <tr>
                    <th>Etapa percorrida</th>
                    <th>Permanência observada (dias)</th>
                    <th>Saída registrada</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.durations.map((d, i) => (
                    <tr key={d.at + ':' + i}>
                      <td>{d.etapa}</td>
                      <td>
                        {d.days > 0 && d.days < 0.01
                          ? '< 0,01'
                          : d.days.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </td>
                      <td>{new Date(d.at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="akr-muted text-sm">
              Ainda não há entrada e saída suficientes para calcular uma permanência completa.
            </p>
          )}
          <ol className="akr-timeline">
            {events
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <strong>
                    {e.toStage
                      ? `${e.fromStage ?? 'Sem etapa'} → ${e.toStage}`
                      : e.data.operation === 'CRIAR'
                        ? 'Registro compartilhado'
                        : e.data.operation === 'ANEXO_ADICIONADO'
                          ? 'Anexo adicionado'
                          : e.data.operation === 'ANEXO_REMOVIDO'
                            ? 'Anexo removido'
                            : 'Ficha atualizada'}
                  </strong>
                  <small>
                    {new Date(e.at).toLocaleString('pt-BR')} · {e.author} · revisão{' '}
                    {e.data.revision}
                  </small>
                  {!e.toStage && (
                    <small>
                      Campos: {e.data.fields.filter((k) => k !== 'sharedAt').join(', ')}
                    </small>
                  )}
                </li>
              ))}
          </ol>
          {!events.length && <p>Nenhum evento registrado.</p>}
        </>
      )}
    </section>
  );
}
