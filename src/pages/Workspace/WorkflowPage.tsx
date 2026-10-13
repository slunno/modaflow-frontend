import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock3, RefreshCw, UserRound } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { saveWorkspace, workspaceHistory } from '../../services/workspaceService';
import {
  attention,
  displayDate,
  filterProducts,
  stageHistory,
} from '../../services/workspaceDomain';
import { ETAPAS_FLUXO } from '../../services/fichaFluxos';
import type {
  OperationalProduct,
  RegistryData,
  WorkspaceChange,
  WorkspaceDocument,
  WorkspaceFilter,
} from '../../types/workspace';
import { DataState, DeadlineBadge, Empty, PageHeader } from './WorkspaceUI';

export function WorkflowPage() {
  const source = useWorkspace<OperationalProduct>('products');
  const flows = useWorkspace<RegistryData>('flows');
  const [params, setParams] = useSearchParams();
  const flowId = params.get('fluxo') ?? '';
  const flow = flows.rows.find((f) => f.id === flowId);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<WorkspaceChange[]>([]);
  const [historyError, setHistoryError] = useState('');
  useEffect(() => {
    let live = true;
    setHistoryError('');
    setHistory([]);
    if (source.brand)
      workspaceHistory(source.brand)
        .then((rows) => {
          if (live) setHistory(rows);
        })
        .catch((e) => {
          if (live) {
            setHistory([]);
            setHistoryError(e instanceof Error ? e.message : 'Falha ao consultar histórico.');
          }
        });
    return () => {
      live = false;
    };
  }, [source.brand, source.rows]);
  const rows = filterProducts(source.rows, Object.fromEntries(params) as WorkspaceFilter).filter(
    (r) => !flowId || r.data.flowId === flowId
  );
  const stages = flow
    ? String(flow.data.etapas).split('\n').filter(Boolean)
    : [...new Set([...ETAPAS_FLUXO, ...rows.map((r) => r.data.etapaAtual).filter(Boolean)])];
  const times = stageHistory(history, new Set(rows.map((r) => r.id))).entered;
  const move = async (record: WorkspaceDocument<OperationalProduct>, stage: string) => {
    if (busy || stage === record.data.etapaAtual) return;
    setBusy(record.id);
    setError('');
    const configuration = flows.rows.find((f) => f.id === record.data.flowId);
    const final = configuration?.data.final === stage;
    const next = {
      ...record.data,
      etapaAtual: stage,
      status: final
        ? 'Completa'
        : record.data.status === 'Completa'
          ? 'Em andamento'
          : record.data.status,
      completedAt: final ? new Date().toISOString() : undefined,
    };
    try {
      await saveWorkspace('products', next, source.brand, record);
      source.reload();
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : 'Erro ao salvar a etapa.') +
          ' O cartão permanece na etapa confirmada pelo servidor.'
      );
    } finally {
      setBusy('');
    }
  };
  return (
    <div className="akr-page">
      <PageHeader
        eyebrow="Operação / Fluxo de desenvolvimento"
        title="Kanban de produção"
        description="Movimente modelos e acompanhe as etapas com a mesma configuração da ficha técnica."
      >
        <Link className="akr-button" to="/gestao/fluxos">
          Configurar fluxos
        </Link>
        <button className="akr-button" onClick={source.reload} disabled={source.loading}>
          <RefreshCw size={15} />
          Atualizar
        </button>
      </PageHeader>
      {historyError && (
        <div role="alert" className="akr-alert">
          Tempo nas etapas indisponível. {historyError}
        </div>
      )}
      {flows.error && (
        <div role="alert" className="akr-alert">
          Configuração dos fluxos indisponível. {flows.error}
        </div>
      )}
      <div className="akr-filterbar">
        <label className="akr-field">
          Fluxo
          <select
            value={flowId}
            onChange={(e) =>
              setParams((prev) => {
                const next = new URLSearchParams(prev);
                if (e.target.value) next.set('fluxo', e.target.value);
                else next.delete('fluxo');
                return next;
              })
            }
          >
            <option value="">Etapas existentes / todos os modelos</option>
            {flows.rows.map((f) => (
              <option key={f.id} value={f.id}>
                {f.data.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="akr-field">
          Buscar modelo
          <input
            value={params.get('q') ?? ''}
            onChange={(e) =>
              setParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('q', e.target.value);
                return next;
              })
            }
            placeholder="Nome ou código"
          />
        </label>
        <span className="akr-filter-scope">
          {rows.length} modelos · arraste ou use o seletor de etapa
        </span>
      </div>
      <DataState {...source} noBrand={!source.brand} retry={source.reload} />
      {error && (
        <div role="alert" className="akr-alert">
          {error}
        </div>
      )}
      {!source.loading &&
        !source.error &&
        source.brand &&
        (rows.length ? (
          <div className="akr-kanban">
            {stages.map((stage) => (
              <section
                key={stage}
                className="akr-column"
                aria-label={'Etapa ' + stage}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const row = rows.find((r) => r.id === e.dataTransfer.getData('text/plain'));
                  if (row) void move(row, stage);
                }}
              >
                <header>
                  <span>{stage}</span>
                  <span className="akr-badge">
                    {rows.filter((r) => r.data.etapaAtual === stage).length}
                  </span>
                </header>
                {rows
                  .filter((r) => r.data.etapaAtual === stage)
                  .map((row) => {
                    const entered = times.get(row.id);
                    const pending = attention(row.data);
                    const configured = flows.rows.find((f) => f.id === row.data.flowId);
                    const options = configured
                      ? String(configured.data.etapas).split('\n')
                      : stages;
                    return (
                      <article
                        key={row.id}
                        className="akr-kanban-card"
                        draggable={!busy}
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', row.id)}
                        aria-busy={busy === row.id}
                      >
                        <Link
                          className="akr-product-cell"
                          to={'/pecas/' + row.id + '?' + params.toString() + '&origem=kanban'}
                        >
                          {row.data.imagemCroquiUrl && (
                            <img alt="" src={row.data.imagemCroquiUrl} />
                          )}
                          <span>
                            <strong>{row.data.nome}</strong>
                            <small>
                              {row.data.codigo || 'Código pendente'} · {row.data.colecaoNome}
                            </small>
                          </span>
                        </Link>
                        <DeadlineBadge product={row.data} />
                        <p className="text-xs akr-muted flex gap-2 items-center">
                          <UserRound size={13} />
                          {row.data.responsavel || 'Responsável não informado'}
                        </p>
                        <p className="text-xs akr-muted flex gap-2 items-center">
                          <CalendarDays size={13} />
                          Entrega: {displayDate(row.data.previsaoEntrega)}
                        </p>
                        {row.data.stageDeadline && (
                          <p className="text-xs akr-muted">
                            Prazo da etapa: {displayDate(row.data.stageDeadline)}
                          </p>
                        )}
                        <p className="text-xs akr-muted flex gap-2 items-center">
                          <Clock3 size={13} />
                          {entered
                            ? Math.max(0, Math.floor((Date.now() - entered.at) / 86400000)) +
                              ' dias na etapa'
                            : 'Entrada na etapa sem histórico'}
                        </p>
                        {pending.length > 0 && (
                          <p className="text-xs" style={{ color: 'var(--color-status-late)' }}>
                            {pending.join(' · ')}
                          </p>
                        )}
                        <label className="text-xs akr-muted">
                          {busy === row.id ? 'Salvando etapa…' : 'Mover para'}
                          <select
                            aria-label={'Mover etapa de ' + row.data.nome}
                            value={row.data.etapaAtual}
                            disabled={Boolean(busy)}
                            onChange={(e) => void move(row, e.target.value)}
                          >
                            {options.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                      </article>
                    );
                  })}
                {!rows.some((r) => r.data.etapaAtual === stage) && (
                  <p className="text-xs akr-muted text-center py-5">Nenhum modelo nesta etapa</p>
                )}
              </section>
            ))}
          </div>
        ) : (
          <Empty
            title={
              source.rows.length ? 'Nenhum modelo neste recorte' : 'Nenhum modelo compartilhado'
            }
            description="Escolha outro fluxo ou crie os modelos da coleção para acompanhar o desenvolvimento."
          >
            <Link className="akr-button" to="/pecas">
              Abrir modelos
            </Link>
          </Empty>
        ))}
    </div>
  );
}
