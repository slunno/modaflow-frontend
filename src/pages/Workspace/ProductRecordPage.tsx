import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, CircleDollarSign, History, Pencil, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';
import { saveWorkspace, workspaceHistory } from '../../services/workspaceService';
import {
  currency,
  displayDate,
  isoDate,
  productCosts,
  today,
} from '../../services/workspaceDomain';
import type { ColecaoItem, PecaItem } from '../../types/plm';
import type {
  OperationalCollection,
  OperationalProduct,
  RegistryData,
  WorkspaceChange,
  WorkspaceDocument,
} from '../../types/workspace';
import { PecaFichaTecnicaView } from '../Home/components/PecaFichaTecnicaView';
import { DataState, Drawer } from './WorkspaceUI';
import { ProductFields } from './ProductFields';
import { getUsuariosApi } from '../../services/authService';
import { mapUsuarioDtoToRecord } from '../../services/contractMappers';
import type { UserRecord } from '../../types/gestao';
import { shareLocalAttachments } from '../../services/fichaAnexosStorage';
import { ProductTimeline } from './ProductTimeline';

export function ProductRecordPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { activeMarca } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  useEffect(() => {
    let current = true;
    setLoadingUsers(true);
    getUsuariosApi()
      .then((rows) => {
        if (current) setUsers(rows.map(mapUsuarioDtoToRecord));
      })
      .catch(() => {
        if (current) setUsers([]);
      })
      .finally(() => {
        if (current) setLoadingUsers(false);
      });
    return () => {
      current = false;
    };
  }, [activeMarca?.id]);
  const source = useWorkspace<OperationalProduct>('products');
  const collections = useWorkspace<OperationalCollection>('collections');
  const tags = useWorkspace<RegistryData>('tags');
  const types = useWorkspace<RegistryData>('piece-types');
  const flows = useWorkspace<RegistryData>('flows');
  const fields = useWorkspace<RegistryData>('custom-fields');
  const fixed = useWorkspace<RegistryData>('fixed-costs');
  const pricing = useWorkspace<RegistryData>('pricing');
  const measurements = useWorkspace<RegistryData>('measurements');
  const [record, setRecord] = useState<WorkspaceDocument<OperationalProduct> | null>(null);
  const latest = useRef(record);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [status, setStatus] = useState('Salvo');
  const [error, setError] = useState('');
  const [form, setForm] = useState<OperationalProduct | null>(null);
  const [panel, setPanel] = useState<'data' | 'financial' | 'history' | null>(null);
  const [history, setHistory] = useState<WorkspaceChange[]>([]);
  const [mountVersion, setMountVersion] = useState(0);
  useEffect(() => {
    const found = source.rows.find((r) => r.id === id);
    if (
      found &&
      (!latest.current || latest.current.id !== id || latest.current.data.marcaId !== source.brand)
    ) {
      latest.current = found;
      setRecord(found);
      setStatus('Salvo');
      setError('');
    }
  }, [source.rows, source.brand, id]);
  useEffect(() => {
    if (record?.data.marcaId !== source.brand) {
      latest.current = null;
      setRecord(null);
    }
  }, [source.brand, record?.data.marcaId]);
  const persist = (data: PecaItem | OperationalProduct, fichaOnly = false): Promise<void> => {
    setStatus('Salvando');
    setError('');
    const run = queue.current.then(async () => {
      const previous = latest.current;
      if (!previous) throw new Error('Registro ainda não carregado.');
      const next = { ...previous.data, ...data } as OperationalProduct;
      // Extended metadata is owned by the shared editor, never erased by a legacy ficha snapshot.
      if (fichaOnly)
        Object.assign(next, {
          tagIds: previous.data.tagIds,
          customFields: previous.data.customFields,
          typeId: previous.data.typeId,
          flowId: previous.data.flowId,
          team: previous.data.team,
          teamId: previous.data.teamId,
          estilistaId: previous.data.estilistaId,
          modelistaId: previous.data.modelistaId,
        });
      const flow = flows.rows.find((f) => f.id === next.flowId);
      if (flow && next.etapaAtual !== previous.data.etapaAtual) {
        next.status =
          next.etapaAtual === flow.data.final
            ? 'Completa'
            : previous.data.status === 'Completa'
              ? 'Em andamento'
              : next.status;
        next.completedAt = next.status === 'Completa' ? new Date().toISOString() : undefined;
      }
      const saved = await saveWorkspace('products', next, source.brand, previous);
      latest.current = saved;
      setRecord(saved);
      setStatus('Salvo');
    });
    queue.current = run.catch((e) => {
      setStatus('Erro ao salvar');
      setError(e instanceof Error ? e.message : 'Falha ao salvar.');
    });
    return run;
  };
  const saveMetadata = async () => {
    if (!form) return;
    try {
      await persist(form);
      setPanel(null);
      setForm(null);
      setMountVersion((v) => v + 1);
    } catch {
      /* error remains visible and form retained */
    }
  };
  const openHistory = async () => {
    setPanel('history');
    setHistory([]);
    try {
      setHistory((await workspaceHistory(source.brand)).filter((e) => e.documentId === id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao consultar histórico.');
    }
  };
  if (!record || record.id !== id || !activeMarca)
    return (
      <div className="akr-page">
        <DataState {...source} noBrand={!source.brand} retry={source.reload} />
        {!source.loading && !source.error && (
          <div className="akr-panel akr-empty">
            <h2>Modelo não encontrado nesta marca</h2>
            <Link className="akr-button" to={'/pecas?' + params.toString()}>
              Voltar à lista
            </Link>
          </div>
        )}
      </div>
    );
  const p = record.data;
  const collection =
    collections.rows.find((c) => c.data.id === p.colecaoId)?.data ??
    ({
      id: p.colecaoId ?? '',
      nome: p.colecaoNome,
      marcaId: source.brand,
      marcaNome: activeMarca.nome,
      status: 'Em andamento',
      dataEntrega: '',
      diasAtraso: 0,
      regraFicha: p.linxOrigem ? 'legado' : 'integracao-colecao-v1',
    } as ColecaoItem);
  const costs = productCosts(p);
  const flow = flows.rows.find((f) => f.id === p.flowId);
  const applicable = (row: WorkspaceDocument<RegistryData>) =>
    !row.data.archived &&
    (!row.data.inicio || String(row.data.inicio) <= today()) &&
    (!row.data.fim || String(row.data.fim) >= today());
  const rules = pricing.rows
    .filter(applicable)
    .filter(
      (r) =>
        r.data.escopo === 'Marca' ||
        (r.data.escopo === 'Coleção' && r.data.alvo === p.colecaoId) ||
        (r.data.escopo === 'Tipo de peça' && (r.data.alvo === p.typeId || r.data.alvo === p.tipo))
    )
    .sort(
      (a, b) =>
        Number(b.data.prioridade ?? 0) - Number(a.data.prioridade ?? 0) || a.id.localeCompare(b.id)
    );
  const applyFinancial = async () => {
    const current = latest.current?.data;
    if (!current) return;
    const rule = rules[0];
    const rateios = fixed.rows.filter(applicable).map((r) => ({
      id: r.id,
      nome: r.data.nome,
      valor: Number(r.data.valor),
      unidades: Number(r.data.unidadesBase),
      periodicidade: String(r.data.periodicidade),
      revisao: r.revision,
    }));
    const next = {
      ...current,
      fichaTecnica: {
        ...current.fichaTecnica,
        variantes: (current.fichaTecnica?.variantes ?? []).map((v) => ({
          ...v,
          custos: { ...v.custos, rateios },
          precificacao: rule
            ? {
                ...v.precificacao,
                modo: rule.data.modo as 'markup' | 'margem',
                baseCusto: 'producao' as const,
                markup:
                  rule.data.modo === 'markup'
                    ? String(rule.data.fator)
                    : (v.precificacao?.markup ?? ''),
                margemLucro: rule.data.modo === 'margem' ? String(rule.data.fator) : '',
                precoAprovado: v.precificacao?.precoAprovado ?? '',
                regraId: rule.id,
                regraRevisao: rule.revision,
              }
            : v.precificacao,
        })),
      },
    };
    try {
      await persist(next);
      setMountVersion((v) => v + 1);
      setPanel(null);
    } catch {
      /* form stays available */
    }
  };
  const applyMeasurements = async (registry: WorkspaceDocument<RegistryData>) => {
    const current = latest.current?.data;
    if (!current) return;
    const sizes = String(registry.data.grade ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const names = String(registry.data.medidas ?? '')
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean);
    const existing = current.fichaTecnica?.tabelasMedidas ?? [];
    const tableId = 'template:' + registry.id;
    const table = existing.find((t) => t.id === tableId);
    const next = {
      ...current,
      fichaTecnica: {
        ...current.fichaTecnica,
        tamanhos: [...new Set([...(current.fichaTecnica?.tamanhos ?? []), ...sizes])],
        tabelasMedidas: [
          ...existing.filter((t) => t.id !== tableId),
          {
            id: tableId,
            nome: registry.data.nome,
            medidasSelecionadas: [...new Set([...(table?.medidasSelecionadas ?? []), ...names])],
            valoresMedidas: table?.valoresMedidas ?? {},
          },
        ],
      },
    };
    try {
      await persist(next);
      setMountVersion((v) => v + 1);
      setPanel(null);
    } catch {
      /* error visible */
    }
  };
  const remote = source.rows.find((r) => r.id === record.id);
  const newer = remote && remote.revision > record.revision;
  return (
    <div className="akr-page" style={{ gap: 16 }}>
      <div className="akr-save-state">
        <span role="status" aria-live="polite" className="flex items-center gap-2">
          {status === 'Salvo' ? (
            <Check size={15} />
          ) : (
            <RefreshCw size={15} className={status === 'Salvando' ? 'animate-spin' : ''} />
          )}
          <strong>{status}</strong>
          <span className="akr-muted">· servidor · revisão {record.revision}</span>
        </span>
        <div className="akr-actions">
          <button
            className="akr-button"
            disabled={status === 'Salvando'}
            onClick={() => {
              setForm({
                ...latest.current!.data,
                previsaoEntrega: isoDate(latest.current!.data.previsaoEntrega) ?? '',
              });
              setPanel('data');
            }}
          >
            <Pencil size={14} />
            Dados e vínculos
          </button>
          <button
            className="akr-button"
            disabled={status === 'Salvando'}
            onClick={() => setPanel('financial')}
          >
            <CircleDollarSign size={14} />
            Regras e estruturas
          </button>
          <button className="akr-button" onClick={() => void openHistory()}>
            <History size={14} />
            Histórico compartilhado
          </button>
        </div>
      </div>
      {error && (
        <div role="alert" className="akr-alert">
          <strong>Erro ao salvar.</strong>
          {error}
          <button
            className="akr-button"
            onClick={() => {
              source.reload();
            }}
          >
            Consultar versão atual
          </button>
        </div>
      )}
      {newer && status !== 'Salvando' && (
        <div className="akr-notice">
          Há uma revisão mais recente no servidor. Reabra a ficha para revisar antes de substituir
          alterações.
          <button
            className="akr-button"
            onClick={() => {
              latest.current = remote;
              setRecord(remote);
              setMountVersion((v) => v + 1);
              setError('');
              setStatus('Salvo');
            }}
          >
            Carregar revisão {remote.revision}
          </button>
        </div>
      )}
      <PecaFichaTecnicaView
        key={record.id + ':' + mountVersion}
        shared
        sharedDocumentId={record.id}
        usuarios={users}
        usuariosCarregando={loadingUsers}
        peca={p}
        colecao={collection}
        marca={activeMarca}
        flowStages={flow ? String(flow.data.etapas).split('\n') : undefined}
        flowFinal={flow ? String(flow.data.final) : undefined}
        sharedTimeline={
          <ProductTimeline
            id={record.id}
            brand={source.brand}
            product={p}
            revision={record.revision}
          />
        }
        onBack={() =>
          navigate(
            (['bi', 'dashboard', 'notifications', 'kanban'].includes(params.get('origem') ?? '')
              ? '/workspace/' + params.get('origem')
              : '/pecas') +
              '?' +
              params.toString()
          )
        }
        onUpdatePeca={(data) => persist(data, true)}
      />
      <details className="akr-panel p-4 text-xs">
        <summary>Anexos de versões anteriores neste navegador</summary>
        <p className="akr-muted my-3">
          A importação copia os arquivos antigos deste modelo para o servidor e mantém os originais
          no navegador. Arquivos já copiados não são duplicados.
        </p>
        <button
          className="akr-button"
          disabled={status === 'Salvando'}
          onClick={async () => {
            setStatus('Salvando');
            setError('');
            try {
              const count = await shareLocalAttachments(
                `${source.brand}:${p.id}`,
                `shared:${source.brand}:${record.id}`
              );
              setStatus(count ? 'Salvo' : 'Nenhum anexo local encontrado');
              setMountVersion((v) => v + 1);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Falha ao compartilhar anexos.');
              setStatus('Erro ao salvar');
            }
          }}
        >
          Compartilhar anexos locais
        </button>
      </details>
      {panel === 'data' && form && (
        <Drawer
          title="Dados e vínculos do modelo"
          onClose={() => {
            if (status !== 'Salvando') setPanel(null);
          }}
          footer={
            <button
              className="akr-button primary"
              type="submit"
              form="metadata-form"
              disabled={status === 'Salvando'}
            >
              {status === 'Salvando' ? 'Salvando…' : 'Salvar dados'}
            </button>
          }
        >
          <form
            id="metadata-form"
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void saveMetadata();
            }}
          >
            <ProductFields
              value={form}
              onChange={setForm}
              tags={tags.rows}
              types={types.rows}
              flows={flows.rows}
              fields={fields.rows}
            />
          </form>
          {error && (
            <p role="alert" className="akr-alert">
              {error}
            </p>
          )}
        </Drawer>
      )}
      {panel === 'financial' && (
        <Drawer title="Regras e estruturas da ficha" onClose={() => setPanel(null)}>
          <h3>Custos e precificação</h3>
          <p className="akr-muted text-sm">
            Aplicar registra uma cópia dos rateios e da regra vigente nas variantes. Edições futuras
            nos cadastros não alteram esse valor histórico.
          </p>
          <div className="akr-notice">
            {fixed.rows.filter(applicable).length} rateios vigentes · Regra:{' '}
            {rules[0]?.data.nome ?? 'Nenhuma regra aplicável'}
          </div>
          {rules.length > 1 &&
            Number(rules[0]?.data.prioridade) === Number(rules[1]?.data.prioridade) && (
              <div className="akr-alert">
                Duas regras têm a mesma prioridade. Ajuste as prioridades antes de aplicar.
              </div>
            )}
          <div className="akr-table-scroll">
            <table className="akr-table">
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Unidades</th>
                  <th>Custo unitário</th>
                  <th>Lote</th>
                </tr>
              </thead>
              <tbody>
                {costs.variants.map((v) => (
                  <tr key={v.variant.id}>
                    <td>{v.variant.nome}</td>
                    <td>{v.cost.quantidade ?? '—'}</td>
                    <td>{currency(v.cost.total)}</td>
                    <td>{currency(v.cost.totalProducao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="akr-button primary"
            disabled={
              status === 'Salvando' ||
              fixed.loading ||
              pricing.loading ||
              !!fixed.error ||
              !!pricing.error ||
              (rules.length > 1 &&
                Number(rules[0]?.data.prioridade) === Number(rules[1]?.data.prioridade))
            }
            onClick={() => void applyFinancial()}
          >
            Aplicar rateios e regra às variantes
          </button>
          <h3 className="mt-4">Estruturas de modelagem</h3>
          <p className="akr-muted text-xs">
            Aplicar acrescenta medidas e tamanhos. Os valores já preenchidos são preservados.
          </p>
          {[...measurements.rows, ...types.rows.filter((t) => t.id === p.typeId)]
            .filter((t) => !t.data.archived)
            .map((t) => (
              <button
                className="akr-button justify-between"
                key={t.id}
                disabled={status === 'Salvando'}
                onClick={() => void applyMeasurements(t)}
              >
                {t.data.nome}
                <span>Aplicar estrutura</span>
              </button>
            ))}
          {error && <div className="akr-alert">{error}</div>}
        </Drawer>
      )}
      {panel === 'history' && (
        <Drawer title="Histórico e cronograma" onClose={() => setPanel(null)}>
          <div className="akr-notice">
            <span>
              Prazo planejado: <strong>{displayDate(p.previsaoEntrega)}</strong>
            </span>
            <span>
              Conclusão registrada:{' '}
              <strong>
                {p.completedAt ? new Date(p.completedAt).toLocaleString('pt-BR') : 'Não registrada'}
              </strong>
            </span>
          </div>
          <p className="akr-muted text-xs">
            Datas abaixo são eventos reais do servidor. Dados anteriores ao compartilhamento não são
            reconstruídos.
          </p>
          <ol className="akr-timeline">
            {history
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <strong>
                    {e.toStage
                      ? 'Etapa: ' + e.fromStage + ' → ' + e.toStage
                      : e.data.operation === 'CRIAR'
                        ? 'Registro compartilhado'
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
          {!history.length && <p className="akr-muted text-sm">Nenhum evento carregado.</p>}
        </Drawer>
      )}
    </div>
  );
}
