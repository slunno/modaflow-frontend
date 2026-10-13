import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCheck,
  Clock3,
  Columns3,
  RefreshCw,
  SlidersHorizontal,
  TriangleAlert,
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { workspaceHistory } from '../../services/workspaceService';
import {
  attention,
  currency,
  deadline,
  exportCsv,
  filterProducts,
  groupProducts,
  groupStageEvents,
  isHistoricalMetric,
  eventDay,
  isCancelled,
  isComplete,
  numeric,
  productCosts,
  stageHistory,
  type Dimension,
  type Metric,
} from '../../services/workspaceDomain';
import type {
  OperationalProduct,
  RegistryData,
  WorkspaceChange,
  WorkspaceFilter,
} from '../../types/workspace';
import { DataState, Empty, PageHeader, ProductTable } from './WorkspaceUI';
import { LegacyImportNotice } from './LegacyImportNotice';

const dimensionLabels: Record<Dimension, string> = {
  marca: 'Marca',
  colecao: 'Coleção',
  etapa: 'Etapa',
  status: 'Status PLM',
  responsavel: 'Responsável',
  estilista: 'Estilista',
  modelista: 'Modelista',
  time: 'Time',
  tipo: 'Tipo de peça',
  tag: 'Tag',
  custom: 'Campo customizado',
};
const metricLabels: Record<Metric, string> = {
  modelos: 'Modelos distintos',
  variantes: 'Variantes / SKUs',
  unidades: 'Unidades planejadas',
  custo: 'Custo previsto do lote (R$)',
  atrasos: 'Modelos atrasados',
  pendencias: 'Modelos com pendências',
  preco: 'Preço sugerido médio por variante (R$)',
  entradas: 'Entradas registradas na etapa',
  saidas: 'Saídas registradas da etapa',
  permanencia: 'Permanência média encerrada (dias)',
};

export function AnalyticsPage({
  dashboard = false,
  notifications = false,
}: {
  dashboard?: boolean;
  notifications?: boolean;
}) {
  const source = useWorkspace<OperationalProduct>('products');
  const tags = useWorkspace<RegistryData>('tags');
  const fields = useWorkspace<RegistryData>('custom-fields');
  const [params, setParams] = useSearchParams();
  const pendingParams = useRef(params);
  useEffect(() => {
    pendingParams.current = params;
  }, [params]);
  const navigate = useNavigate();
  const filters = useMemo(() => Object.fromEntries(params) as WorkspaceFilter, [params]);
  const dimension = (params.get('dimensao') ?? (dashboard ? 'etapa' : 'colecao')) as Dimension;
  const metric = (params.get('metrica') ?? 'modelos') as Metric;
  const safeMetric = metric in metricLabels ? metric : 'modelos';
  const historical = isHistoricalMetric(safeMetric);
  const safeDimension = historical ? 'etapa' : dimension in dimensionLabels ? dimension : 'etapa';
  const [history, setHistory] = useState<WorkspaceChange[]>([]);
  const [historyError, setHistoryError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [expanded, setExpanded] = useState(!dashboard);
  const selectedGroup = params.get('grupo');
  const setSelectedGroup = (group: string | null) =>
    setParams(() => {
      const next = new URLSearchParams(pendingParams.current);
      if (group === null) next.delete('grupo');
      else next.set('grupo', group);
      pendingParams.current = next;
      return next;
    });
  const [historyVersion, setHistoryVersion] = useState(0);
  useEffect(() => {
    let current = true;
    if (!source.brand) return;
    setHistory([]);
    setHistoryError('');
    setHistoryLoading(true);
    workspaceHistory(source.brand)
      .then((data) => {
        if (current) setHistory(data);
      })
      .catch((e) => {
        if (current)
          setHistoryError(e instanceof Error ? e.message : 'Falha ao consultar histórico.');
      })
      .finally(() => {
        if (current) setHistoryLoading(false);
      });
    return () => {
      current = false;
    };
  }, [source.brand, source.rows, historyVersion]);
  const filtered = useMemo(() => filterProducts(source.rows, filters), [source.rows, filters]);
  const groups = useMemo(
    () =>
      historical
        ? groupStageEvents(
            history,
            new Set(filtered.map((r) => r.id)),
            safeMetric,
            params.get('eventFrom') ?? '',
            params.get('eventTo') ?? ''
          )
        : safeDimension === 'custom' && !params.get('campo')
          ? []
          : groupProducts(
              filtered,
              safeDimension,
              safeMetric,
              tags.rows,
              params.get('campo') ?? ''
            ),
    [filtered, safeDimension, safeMetric, tags.rows, params, history, historical]
  );
  const change = (key: string, value: string) => {
    setParams(() => {
      const next = new URLSearchParams(pendingParams.current);
      next.delete('grupo');
      if (key === 'custom') next.delete('value');
      if (value) next.set(key, value);
      else next.delete(key);
      pendingParams.current = next;
      return next;
    });
  };
  const open = (patch: Record<string, string> = {}) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch))
      if (value) next.set(key, value);
      else next.delete(key);
    navigate('/pecas?' + next.toString());
  };
  const details =
    selectedGroup === null
      ? filtered
      : filtered.filter((r) => groups.find((g) => g.key === selectedGroup)?.ids.includes(r.id));
  const development = filtered.filter((r) => !isComplete(r.data) && !isCancelled(r.data)).length;
  const complete = filtered.filter((r) => isComplete(r.data)).length;
  const late = filtered.filter((r) => deadline(r.data) === 'Atrasado').length;
  const due = filtered.filter((r) => deadline(r.data) === 'Vence hoje').length;
  const unscheduled = filtered.filter((r) => deadline(r.data) === 'Sem prazo').length;
  const attentionRows = filtered.filter((r) => attention(r.data).length);
  const validLots = filtered.map((r) => productCosts(r.data)).filter((c) => c.batch !== null);
  const totalCost = validLots.reduce((sum, c) => sum + c.batch!, 0);
  const events = stageHistory(history, new Set(filtered.map((p) => p.id)));
  const average = events.durations.length
    ? events.durations.reduce((sum, e) => sum + e.days, 0) / events.durations.length
    : null;
  const timeline = Object.entries(
    events.movements.reduce<Record<string, number>>((result, event) => {
      const day = eventDay(event.at);
      result[day] = (result[day] ?? 0) + 1;
      return result;
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b));
  const optionValues = (field: keyof OperationalProduct) =>
    [...new Set(source.rows.map((r) => String(r.data[field] ?? '')).filter(Boolean))].sort();
  const max = Math.max(1, ...groups.map((g) => g.value));
  const updated = source.rows.reduce(
    (latest, r) => (r.updatedAt > latest ? r.updatedAt : latest),
    ''
  );
  const exportData = () =>
    exportCsv(
      'akr-' + safeDimension + '-' + safeMetric,
      [
        dimensionLabels[safeDimension],
        metricLabels[safeMetric],
        'Modelos distintos no grupo',
        'Registros sem base válida',
      ],
      groups.map((g) => [
        g.label,
        g.missing === g.ids.length ? null : g.value,
        g.ids.length,
        g.missing,
      ])
    );
  return (
    <div className="akr-page">
      <PageHeader
        eyebrow={
          notifications
            ? 'Operação / Prioridades'
            : dashboard
              ? 'Visão geral / Produção'
              : 'Análise / Desenvolvimento'
        }
        title={
          notifications
            ? 'Precisam de atenção'
            : dashboard
              ? 'Dashboard de produção'
              : 'Relatórios e BI'
        }
        description={
          notifications
            ? 'Pendências reais dos modelos da marca e da coleção selecionadas.'
            : dashboard
              ? 'Da primeira ideia à coleção pronta. Acompanhe o que precisa avançar.'
              : 'Explore os dados da coleção e abra os modelos que compõem cada indicador.'
        }
      >
        <button
          className="akr-button"
          onClick={() => {
            source.reload();
            setHistoryVersion((v) => v + 1);
          }}
          disabled={source.loading}
        >
          <RefreshCw size={15} className={source.loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
        <button
          className="akr-button"
          onClick={exportData}
          disabled={source.loading || !!source.error || !filtered.length}
        >
          <ArrowDownToLine size={15} />
          Exportar recorte
        </button>
      </PageHeader>
      <LegacyImportNotice onImported={source.reload} />
      <div className="akr-filterbar">
        <label className="akr-field">
          Etapa
          <select value={filters.etapa ?? ''} onChange={(e) => change('etapa', e.target.value)}>
            <option value="">Todas as etapas</option>
            {optionValues('etapaAtual').map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="akr-field">
          Prazo a partir de
          <input
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => change('from', e.target.value)}
          />
        </label>
        <label className="akr-field">
          Prazo até
          <input
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => change('to', e.target.value)}
          />
        </label>
        <button
          className="akr-button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={14} />
          Mais filtros
        </button>
        <span className="akr-filter-scope">
          Marca e coleção: área de trabalho
          <br />
          Demais filtros: esta análise
        </span>
        {(filters.from ||
          filters.to ||
          filters.etapa ||
          filters.tag ||
          filters.tipo ||
          filters.responsavel ||
          filters.custom) && (
          <button
            className="akr-button"
            onClick={() =>
              setParams(
                new URLSearchParams(
                  [...params].filter(([key]) => ['marca', 'colecao'].includes(key))
                )
              )
            }
          >
            Limpar análise
          </button>
        )}
      </div>
      {expanded && (
        <div className="akr-filterbar">
          <label className="akr-field">
            Tipo de peça
            <select value={filters.tipo ?? ''} onChange={(e) => change('tipo', e.target.value)}>
              <option value="">Todos</option>
              {optionValues('tipo').map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="akr-field">
            Responsável
            <select
              value={filters.responsavel ?? ''}
              onChange={(e) => change('responsavel', e.target.value)}
            >
              <option value="">Todos</option>
              {optionValues('responsavel').map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="akr-field">
            Tag
            <select value={filters.tag ?? ''} onChange={(e) => change('tag', e.target.value)}>
              <option value="">Todas</option>
              {tags.rows.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.data.grupo} · {t.data.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="akr-field">
            Campo customizado
            <select value={filters.custom ?? ''} onChange={(e) => change('custom', e.target.value)}>
              <option value="">Nenhum</option>
              {fields.rows
                .filter((f) => f.data.contexto === 'produto')
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.data.nome}
                  </option>
                ))}
            </select>
          </label>
          {filters.custom && (
            <label className="akr-field">
              Valor
              <select value={filters.value ?? ''} onChange={(e) => change('value', e.target.value)}>
                <option value="">Selecione</option>
                {[
                  ...new Set(
                    source.rows.map((r) =>
                      String(r.data.customFields?.[filters.custom!] ?? 'Não informado')
                    )
                  ),
                ].map((v) => (
                  <option key={v} value={v}>
                    {fields.rows.find((f) => f.id === filters.custom)?.data.tipo === 'booleano'
                      ? v === 'true'
                        ? 'Sim'
                        : v === 'false'
                          ? 'Não'
                          : v
                      : v}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 text-xs akr-muted">
        <span>
          {filters.from || filters.to
            ? 'Período: ' +
              (filters.from ?? 'início') +
              ' a ' +
              (filters.to ?? 'fim') +
              ' · Data usada: prazo planejado do modelo.'
            : 'Todos os prazos · Modelos sem prazo são identificados separadamente.'}
        </span>
        <span>
          {updated
            ? 'Último registro atualizado: ' + new Date(updated).toLocaleString('pt-BR')
            : 'Sem atualização registrada'}
        </span>
      </div>
      <DataState {...source} noBrand={!source.brand} retry={source.reload} />
      {(tags.error || fields.error) && (
        <div role="alert" className="akr-alert">
          Não foi possível carregar todos os cadastros dos filtros. {tags.error || fields.error}
        </div>
      )}
      {!source.loading &&
        !source.error &&
        source.brand &&
        (source.rows.length === 0 ? (
          <Empty
            title="Seu painel começa com os modelos compartilhados"
            description="Crie uma coleção e seus modelos, ou compartilhe os rascunhos existentes deste navegador. O catálogo Linx continua disponível para consulta."
          >
            <Link className="akr-button primary" to="/colecoes">
              Abrir coleções
              <ArrowRight size={15} />
            </Link>
          </Empty>
        ) : filtered.length === 0 ? (
          <Empty
            title="Nenhum resultado para os filtros"
            description="A consulta foi concluída. Ajuste marca, coleção, prazo ou os filtros da análise."
          />
        ) : (
          <>
            {!notifications && (
              <div className="akr-metrics">
                <button
                  className="akr-metric"
                  title="Modelos distintos que não estão concluídos nem cancelados."
                  onClick={() => open({ attention: 'Em desenvolvimento' })}
                >
                  <span>
                    Em desenvolvimento
                    <Columns3 size={15} />
                  </span>
                  <strong>{development}</strong>
                  <small>Modelos distintos em trabalho</small>
                </button>
                <button
                  className="akr-metric"
                  title="Modelos com status PLM Completa."
                  onClick={() => open({ attention: 'Concluído' })}
                >
                  <span>
                    Concluídos
                    <CheckCheck size={15} />
                  </span>
                  <strong>{complete}</strong>
                  <small>Desenvolvimento finalizado</small>
                </button>
                <button
                  className="akr-metric warning"
                  title="Modelos ativos com prazo planejado anterior a hoje. Não inclui concluídos."
                  onClick={() => open({ attention: 'Atrasado' })}
                >
                  <span>
                    Atrasados
                    <TriangleAlert size={15} />
                  </span>
                  <strong>{late}</strong>
                  <small>Prazo planejado vencido</small>
                </button>
                <button
                  className="akr-metric"
                  title="Modelos ativos com prazo planejado para hoje, no horário de São Paulo."
                  onClick={() => open({ attention: 'Vence hoje' })}
                >
                  <span>
                    Vencem hoje
                    <Clock3 size={15} />
                  </span>
                  <strong>{due}</strong>
                  <small>{unscheduled} modelos ativos sem prazo</small>
                </button>
              </div>
            )}
            {!notifications && (
              <div className="akr-grid-two">
                <section className="akr-panel">
                  <div className="akr-panel-heading">
                    <div>
                      <h2>
                        {dashboard
                          ? 'Distribuição do desenvolvimento'
                          : 'Análise por ' + dimensionLabels[safeDimension].toLowerCase()}
                      </h2>
                      <p>
                        {metricLabels[safeMetric]} · {filtered.length} modelos distintos no recorte
                      </p>
                    </div>
                    <button className="akr-button" onClick={() => setShowTable(!showTable)}>
                      {showTable ? 'Gráfico' : 'Ver tabela'}
                    </button>
                  </div>
                  {!dashboard && (
                    <div className="akr-filterbar" style={{ border: 0, borderRadius: 0 }}>
                      <label className="akr-field">
                        Agrupar por
                        <select
                          value={safeDimension}
                          disabled={historical}
                          onChange={(e) => change('dimensao', e.target.value)}
                        >
                          {Object.entries(dimensionLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="akr-field">
                        Métrica
                        <select
                          value={safeMetric}
                          onChange={(e) => change('metrica', e.target.value)}
                        >
                          {Object.entries(metricLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {safeDimension === 'custom' && (
                        <label className="akr-field">
                          Campo da dimensão
                          <select
                            value={params.get('campo') ?? ''}
                            onChange={(e) => change('campo', e.target.value)}
                          >
                            <option value="">Selecione</option>
                            {fields.rows
                              .filter((f) => f.data.contexto === 'produto')
                              .map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.data.nome}
                                </option>
                              ))}
                          </select>
                        </label>
                      )}
                      {historical && (
                        <>
                          <label className="akr-field">
                            Evento a partir de
                            <input
                              type="date"
                              value={params.get('eventFrom') ?? ''}
                              onChange={(e) => change('eventFrom', e.target.value)}
                            />
                          </label>
                          <label className="akr-field">
                            Evento até
                            <input
                              type="date"
                              value={params.get('eventTo') ?? ''}
                              onChange={(e) => change('eventTo', e.target.value)}
                            />
                          </label>
                          <span className="akr-filter-scope">
                            Data da movimentação · São Paulo
                            <br />
                            Permanência: data da saída da etapa
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {historical && historyLoading ? (
                    <p className="akr-empty" role="status">
                      Consultando movimentos registrados…
                    </p>
                  ) : historical && historyError ? (
                    <p className="akr-alert" role="alert">
                      {historyError}
                    </p>
                  ) : showTable ? (
                    <div className="akr-table-scroll">
                      <table className="akr-table">
                        <thead>
                          <tr>
                            <th>{dimensionLabels[safeDimension]}</th>
                            <th className="num">{metricLabels[safeMetric]}</th>
                            <th>Sem base válida</th>
                            <th>Origem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groups.map((g) => (
                            <tr key={g.key}>
                              <td>{g.label}</td>
                              <td className="num">
                                {g.missing === g.ids.length
                                  ? '—'
                                  : ['custo', 'preco'].includes(safeMetric)
                                    ? currency(g.value)
                                    : numeric(g.value)}
                              </td>
                              <td>{g.missing}</td>
                              <td>
                                <button
                                  className="akr-source-link"
                                  onClick={() => setSelectedGroup(g.key)}
                                >
                                  Abrir {g.ids.length} modelos
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="akr-chart">
                      {!groups.length && (
                        <p className="akr-muted">
                          {safeDimension === 'custom'
                            ? 'Selecione um campo para agrupar os modelos.'
                            : 'Não há eventos suficientes para esta métrica e período.'}
                        </p>
                      )}
                      {groups.map((g) => (
                        <button
                          key={g.key}
                          className="akr-bar-row"
                          title={
                            g.label +
                            ': ' +
                            numeric(g.value) +
                            ' ' +
                            (['custo', 'preco'].includes(safeMetric)
                              ? 'reais'
                              : metricLabels[safeMetric].toLowerCase()) +
                            '. ' +
                            g.missing +
                            ' registros sem base válida.'
                          }
                          onClick={() => setSelectedGroup(g.key)}
                        >
                          <span>{g.label}</span>
                          <span className="akr-bar-track">
                            <i style={{ width: (100 * g.value) / max + '%' }} />
                          </span>
                          <strong>
                            {g.missing === g.ids.length
                              ? '—'
                              : ['custo', 'preco'].includes(safeMetric)
                                ? currency(g.value)
                                : numeric(g.value)}
                          </strong>
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="akr-chart-caption">
                    {historical &&
                      'Etapas efetivamente registradas. O tempo considera somente permanências com entrada e saída observadas. '}
                    {safeMetric === 'preco' &&
                      'Média aritmética dos preços sugeridos válidos das variantes, sem estimativa de faturamento. '}
                    {safeDimension === 'tag'
                      ? 'Um modelo pode estar em várias tags. A soma dos grupos não é o total de modelos únicos.'
                      : 'Cada modelo é contado uma vez por grupo; variantes e materiais não duplicam a contagem.'}{' '}
                    {(['custo', 'preco'].includes(safeMetric) || safeMetric === 'unidades') &&
                      'Registros incompletos aparecem como sem base válida. Custos são totais de lotes, não faturamento.'}{' '}
                    Clique em uma barra para ver os registros de origem abaixo.
                  </p>
                </section>
                <section className="akr-panel">
                  <div className="akr-panel-heading">
                    <div>
                      <h2>{dashboard ? 'Ritmo da operação' : 'Histórico observado'}</h2>
                      <p>Movimentações efetivamente gravadas no servidor</p>
                    </div>
                  </div>
                  <div className="akr-panel-body">
                    <div
                      className="akr-financial-summary"
                      style={{ gridTemplateColumns: '1fr 1fr' }}
                    >
                      <div>
                        <small>Custo previsto dos lotes válidos</small>
                        <strong>{validLots.length ? currency(totalCost) : '—'}</strong>
                        <small>
                          {validLots.length} de {filtered.length} modelos com base completa
                        </small>
                      </div>
                      <div>
                        <small>Tempo médio em etapas encerradas</small>
                        <strong>
                          {historyLoading
                            ? 'Consultando…'
                            : average === null
                              ? '—'
                              : average > 0 && average < 0.01
                                ? '< 0,01 dia'
                                : numeric(average) + ' dias'}
                        </strong>
                        {!historyLoading && (
                          <small>{events.durations.length} permanências observadas</small>
                        )}
                      </div>
                    </div>
                    {historyLoading ? (
                      <p className="akr-empty" role="status">
                        Consultando histórico…
                      </p>
                    ) : historyError ? (
                      <div className="akr-alert mt-4" role="alert">
                        {historyError}
                      </div>
                    ) : timeline.length === 0 ? (
                      <div className="akr-empty" style={{ padding: '32px 10px' }}>
                        <Clock3 size={23} />
                        <p>
                          Ainda não há série histórica suficiente. Novas movimentações alimentarão
                          esta visão, sem reconstruir o passado a partir do estado atual.
                        </p>
                      </div>
                    ) : (
                      <>
                        <svg
                          viewBox="0 0 440 150"
                          role="img"
                          aria-label="Movimentações de etapa por dia registrado"
                          className="w-full mt-6"
                        >
                          <line x1="15" y1="125" x2="425" y2="125" stroke="var(--color-border)" />
                          <polyline
                            fill="none"
                            stroke="#a66b45"
                            strokeWidth="2.5"
                            points={timeline
                              .map(([, v], i) =>
                                [
                                  15 + (i * 410) / Math.max(1, timeline.length - 1),
                                  120 - (v * 95) / Math.max(...timeline.map(([, n]) => n)),
                                ].join(',')
                              )
                              .join(' ')}
                          />
                          {timeline.map(([d, v], i) => (
                            <circle
                              key={d}
                              cx={15 + (i * 410) / Math.max(1, timeline.length - 1)}
                              cy={120 - (v * 95) / Math.max(...timeline.map(([, n]) => n))}
                              r="4"
                              fill="#a66b45"
                            >
                              <title>
                                {d}: {v} movimentações
                              </title>
                            </circle>
                          ))}
                        </svg>
                        <div className="akr-legend">
                          <span>
                            <i />
                            Movimentações por data do evento
                          </span>
                        </div>
                        <details className="mt-3 text-xs">
                          <summary>Ver dados da evolução</summary>
                          <table className="akr-table">
                            <thead>
                              <tr>
                                <th>Data do evento</th>
                                <th>Movimentações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {timeline.map(([d, n]) => (
                                <tr key={d}>
                                  <td>{d}</td>
                                  <td>{n}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </details>
                      </>
                    )}
                  </div>
                </section>
              </div>
            )}
            <section className="akr-panel">
              <div className="akr-panel-heading">
                <div>
                  <h2>
                    {selectedGroup !== null
                      ? 'Registros de origem · ' +
                        groups.find((g) => g.key === selectedGroup)?.label
                      : notifications
                        ? 'Pendências operacionais'
                        : dashboard
                          ? 'Precisam de atenção'
                          : 'Modelos do recorte'}
                  </h2>
                  <p>
                    {selectedGroup !== null
                      ? details.length
                      : dashboard || notifications
                        ? attentionRows.length
                        : filtered.length}{' '}
                    modelos · filtros preservados ao abrir a ficha
                  </p>
                </div>
                {selectedGroup !== null ? (
                  <button className="akr-button" onClick={() => setSelectedGroup(null)}>
                    Voltar ao recorte
                  </button>
                ) : (
                  <button className="akr-button" onClick={() => open()}>
                    Ver todos
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
              {(selectedGroup !== null
                ? details
                : dashboard || notifications
                  ? attentionRows
                  : filtered
              ).length ? (
                <ProductTable
                  origin={dashboard ? 'dashboard' : notifications ? 'notifications' : 'bi'}
                  rows={
                    selectedGroup !== null
                      ? details
                      : dashboard || notifications
                        ? attentionRows
                        : filtered
                  }
                  finance={!dashboard && !notifications}
                />
              ) : (
                <div className="akr-empty">
                  <CheckCheck size={24} />
                  <p>Nenhuma pendência identificada neste recorte.</p>
                </div>
              )}
            </section>
          </>
        ))}
    </div>
  );
}
