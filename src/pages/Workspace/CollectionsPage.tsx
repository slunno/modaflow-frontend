import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, LayoutGrid, List, Pencil, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';
import {
  getLinxColecoesValidas,
  getLinxProdutosDaColecao,
  resolveLinxGriffe,
} from '../../services/linxService';
import { mapLinxColecaoToItem, mapLinxProdutoToPeca } from '../../services/contractMappers';
import { listWorkspace, saveWorkspace } from '../../services/workspaceService';
import {
  attention,
  currency,
  displayDate,
  groupProducts,
  isComplete,
  productCosts,
} from '../../services/workspaceDomain';
import type {
  OperationalCollection,
  OperationalProduct,
  RegistryData,
  WorkspaceDocument,
} from '../../types/workspace';
import { DataState, Drawer, Empty, PageHeader } from './WorkspaceUI';
import { LegacyImportNotice } from './LegacyImportNotice';
import { CustomFields } from './ProductFields';

export function CollectionsPage() {
  const source = useWorkspace<OperationalCollection>('collections');
  const products = useWorkspace<OperationalProduct>('products');
  const fields = useWorkspace<RegistryData>('custom-fields');
  const { activeMarca } = useAuth();
  const [params] = useSearchParams();
  const [mode, setMode] = useState('cards');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<OperationalCollection | null>(null);
  const [editing, setEditing] = useState<WorkspaceDocument<OperationalCollection>>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [catalog, setCatalog] = useState<OperationalCollection[] | null>(null);
  const [importMessage, setImportMessage] = useState('');
  const rows = source.rows.filter(
    (c) =>
      (!q || c.data.nome.toLowerCase().includes(q.toLowerCase())) &&
      (!status || c.data.status === status)
  );
  const url = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('colecao', id);
    return '/pecas?' + next.toString();
  };
  const create = () => {
    const id = crypto.randomUUID();
    setEditing(undefined);
    setError('');
    setForm({
      id,
      sourceKey: 'collection:' + id,
      nome: '',
      marcaId: source.brand,
      marcaNome: activeMarca?.nome ?? '',
      status: 'Em andamento',
      dataEntrega: '',
      diasAtraso: 0,
      regraFicha: 'integracao-colecao-v1',
      criadaEm: new Date().toISOString(),
    });
  };
  const save = async () => {
    if (!form) return;
    setBusy(true);
    setError('');
    try {
      await saveWorkspace('collections', form, source.brand, editing);
      setForm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setBusy(false);
    }
  };
  const openCatalog = async () => {
    setCatalog([]);
    setBusy(true);
    setError('');
    try {
      if (!activeMarca) throw new Error('Selecione uma marca.');
      const griffe = resolveLinxGriffe(activeMarca);
      if (!griffe) throw new Error('Marca sem grife Linx configurada.');
      const items = await getLinxColecoesValidas({ griffe: [griffe] });
      setCatalog(
        items.map((c) => {
          const mapped = mapLinxColecaoToItem(c, activeMarca, griffe);
          return { ...mapped, sourceKey: 'collection:' + mapped.id };
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao consultar Linx.');
    } finally {
      setBusy(false);
    }
  };
  const importCollection = async (collection: OperationalCollection) => {
    if (!activeMarca || !collection.codigoPill) return;
    setBusy(true);
    setError('');
    let count = 0;
    try {
      const griffe = resolveLinxGriffe(activeMarca);
      if (!griffe) throw new Error('Grife indisponível.');
      const records = await getLinxProdutosDaColecao(collection.codigoPill, griffe);
      const existing = await listWorkspace<OperationalProduct>('products', source.brand);
      if (!source.rows.some((c) => c.data.sourceKey === collection.sourceKey))
        await saveWorkspace('collections', collection, source.brand);
      for (const [index, record] of records.entries()) {
        const p = mapLinxProdutoToPeca(
          record,
          collection.id,
          collection.nome,
          source.brand,
          activeMarca.nome,
          index
        );
        const sourceKey = 'product:' + collection.id + ':' + p.id;
        if (existing.some((r) => r.data.sourceKey === sourceKey)) continue;
        await saveWorkspace('products', { ...p, sourceKey }, source.brand);
        count++;
      }
      setImportMessage(
        count + ' modelos vinculados ao PLM. O catálogo Linx foi apenas consultado.'
      );
      setCatalog(null);
      source.reload();
      products.reload();
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : 'Erro ao vincular coleção.') +
          ' ' +
          count +
          ' modelos confirmados; a próxima tentativa preservará esses registros.'
      );
    } finally {
      setBusy(false);
    }
  };
  const stats = (id: string) => {
    const pieces = products.rows.filter((p) => p.data.colecaoId === id);
    const complete = pieces.filter((p) => isComplete(p.data)).length;
    const costs = pieces.map((p) => productCosts(p.data));
    return {
      total: pieces.length,
      complete,
      stages: groupProducts(pieces, 'etapa', 'modelos'),
      pending: pieces.filter((p) => attention(p.data).length > 0).length,
      progress: pieces.length ? Math.round((complete / pieces.length) * 100) : 0,
      units:
        costs.length && costs.every((c) => c.units !== null)
          ? costs.reduce((s, c) => s + c.units!, 0)
          : null,
      batch:
        costs.length && costs.every((c) => c.batch !== null)
          ? costs.reduce((s, c) => s + c.batch!, 0)
          : null,
    };
  };
  return (
    <div className="akr-page">
      <PageHeader
        eyebrow="Coleções / Portfólio"
        title="Suas próximas coleções"
        description="Planejamento, modelos e desenvolvimento em um único contexto."
      >
        <button
          className="akr-button"
          disabled={busy || !source.brand}
          onClick={() => void openCatalog()}
        >
          <RefreshCw size={15} />
          Vincular coleção Linx
        </button>
        <button
          className="akr-button primary"
          disabled={!source.brand || source.loading || !!source.error}
          onClick={create}
        >
          <Plus size={16} />
          Nova coleção
        </button>
      </PageHeader>
      <LegacyImportNotice onImported={source.reload} />
      {importMessage && (
        <div className="akr-notice" role="status">
          {importMessage}
        </div>
      )}
      <div className="akr-filterbar">
        <label className="akr-field">
          Buscar coleção
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou temporada" />
        </label>
        <label className="akr-field">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todas as coleções</option>
            {['Em andamento', 'Completas', 'Arquivadas'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span className="akr-filter-scope">{rows.length} coleções · marca selecionada</span>
        <div className="akr-toggle">
          <button
            aria-label="Visualização em cards"
            aria-pressed={mode === 'cards'}
            onClick={() => setMode('cards')}
          >
            <LayoutGrid size={17} />
          </button>
          <button
            aria-label="Visualização em tabela"
            aria-pressed={mode === 'table'}
            onClick={() => setMode('table')}
          >
            <List size={17} />
          </button>
        </div>
      </div>
      <DataState {...source} noBrand={!source.brand} retry={source.reload} />
      <DataState {...products} noBrand={false} retry={products.reload} />
      {!source.loading &&
        !source.error &&
        !products.loading &&
        !products.error &&
        source.brand &&
        (rows.length ? (
          mode === 'cards' ? (
            <div className="akr-collection-grid">
              {rows.map((row) => {
                const c = row.data,
                  s = stats(c.id);
                return (
                  <article className="akr-panel akr-collection-card" key={row.id}>
                    <div>
                      <div className="akr-collection-meta">
                        <span>{c.marcaNome}</span>
                        <span className={'akr-badge ' + (c.status === 'Completas' ? 'done' : '')}>
                          {c.status}
                        </span>
                      </div>
                      <Link to={url(c.id)}>
                        <h2>{c.nome}</h2>
                        <p className="akr-muted text-xs">
                          {c.temporada || 'Temporada não informada'}
                          {c.ano ? ' / ' + c.ano : ''}
                        </p>
                      </Link>
                    </div>
                    <div>
                      <div className="akr-collection-meta">
                        <span>
                          {s.complete} de {s.total} modelos concluídos
                        </span>
                        <strong>{s.progress}%</strong>
                      </div>
                      <div
                        className="akr-progress mt-2"
                        title="Progresso = modelos com status Completa ÷ modelos da coleção"
                      >
                        <span style={{ width: s.progress + '%' }} />
                      </div>
                    </div>
                    <div className="akr-collection-meta">
                      <span>
                        <CalendarDays size={13} className="inline mr-1" />
                        {displayDate(c.dataEntrega)}
                      </span>
                      <span>
                        {s.units === null ? 'Unidades pendentes' : s.units + ' unidades planejadas'}
                      </span>
                    </div>
                    <div className="akr-collection-meta">
                      <span>{c.responsavel || 'Responsável não definido'}</span>
                      <span>{currency(s.batch)}</span>
                    </div>
                    <div className="akr-actions justify-between">
                      <details className="text-xs">
                        <summary>
                          {s.pending} modelos com pendências · distribuição por etapa
                        </summary>
                        <ul className="mt-2">
                          {s.stages.map((stage) => (
                            <li key={stage.key}>
                              {stage.label}: {stage.value}
                            </li>
                          ))}
                        </ul>
                      </details>
                      <button
                        className="akr-button"
                        aria-label={'Editar ' + c.nome}
                        onClick={() => {
                          setEditing(row);
                          setForm({ ...c });
                          setError('');
                        }}
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <Link className="akr-button" to={url(c.id)}>
                        Abrir modelos
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="akr-panel akr-table-scroll">
              <table className="akr-table">
                <thead>
                  <tr>
                    <th>Coleção</th>
                    <th>Temporada / Ano</th>
                    <th>Prazo</th>
                    <th>Responsável</th>
                    <th className="num">Modelos</th>
                    <th className="num">Unidades</th>
                    <th className="num">Progresso</th>
                    <th className="num">Custo previsto</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const c = row.data,
                      s = stats(c.id);
                    return (
                      <tr key={row.id}>
                        <td>
                          <Link to={url(c.id)}>
                            <strong>{c.nome}</strong>
                          </Link>
                        </td>
                        <td>
                          {c.temporada} {c.ano}
                        </td>
                        <td>{displayDate(c.dataEntrega)}</td>
                        <td>{c.responsavel || 'Não informado'}</td>
                        <td className="num">{s.total}</td>
                        <td className="num">{s.units ?? '—'}</td>
                        <td className="num">{s.progress}%</td>
                        <td className="num">{currency(s.batch)}</td>
                        <td>
                          <button
                            className="akr-icon-button"
                            aria-label={'Editar ' + c.nome}
                            onClick={() => {
                              setEditing(row);
                              setForm({ ...c });
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <Empty
            title={
              source.rows.length
                ? 'Nenhuma coleção corresponde aos filtros'
                : 'Comece pela próxima coleção'
            }
            description="Crie uma coleção, vincule uma coleção existente do Linx ou compartilhe os rascunhos deste navegador."
          />
        ))}
      {form && (
        <Drawer
          title={editing ? 'Editar coleção' : 'Nova coleção'}
          onClose={() => {
            if (!busy) setForm(null);
          }}
          footer={
            <>
              <button className="akr-button" disabled={busy} onClick={() => setForm(null)}>
                Cancelar
              </button>
              <button
                className="akr-button primary"
                form="collection-form"
                type="submit"
                disabled={busy}
              >
                {busy ? 'Salvando…' : 'Salvar coleção'}
              </button>
            </>
          }
        >
          <form
            id="collection-form"
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <label className="akr-field">
              Nome
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </label>
            <label className="akr-field">
              Temporada
              <input
                value={form.temporada ?? ''}
                onChange={(e) => setForm({ ...form, temporada: e.target.value })}
              />
            </label>
            <label className="akr-field">
              Ano
              <input
                type="number"
                min="2000"
                max="2200"
                value={form.ano ?? ''}
                onChange={(e) => setForm({ ...form, ano: e.target.value })}
              />
            </label>
            <label className="akr-field">
              Prazo planejado
              <input
                type="date"
                value={form.dataEntrega?.match(/^\d{4}-\d{2}-\d{2}$/) ? form.dataEntrega : ''}
                onChange={(e) => setForm({ ...form, dataEntrega: e.target.value })}
              />
            </label>
            <label className="akr-field">
              Responsável
              <input
                value={form.responsavel ?? ''}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              />
            </label>
            <label className="akr-field">
              Status
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {['Em andamento', 'Completas', 'Arquivadas'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="akr-field">
              Descrição
              <textarea
                value={form.descricao ?? ''}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </label>
            <CustomFields
              context="colecao"
              fields={fields.rows}
              value={form.customFields ?? {}}
              onChange={(customFields) => setForm({ ...form, customFields })}
            />
          </form>
          {error && (
            <div role="alert" className="akr-alert">
              {error}
            </div>
          )}
        </Drawer>
      )}
      {catalog && (
        <Drawer
          title="Coleções do catálogo Linx"
          onClose={() => {
            if (!busy) setCatalog(null);
          }}
        >
          <p className="akr-muted text-sm">
            A vinculação cria o contexto de desenvolvimento no PLM e preserva os códigos do ERP.
            Nenhuma informação é enviada ao Linx.
          </p>
          {busy && <p role="status">Consultando e vinculando registros…</p>}
          {error && (
            <div role="alert" className="akr-alert">
              {error}
            </div>
          )}
          {catalog.map((c) => (
            <button
              key={c.id}
              className="akr-button justify-between"
              disabled={busy}
              onClick={() => void importCollection(c)}
            >
              <span>
                {c.nome}
                <small className="block akr-muted">
                  {c.codigoPill} · {c.pecasTotal ?? '—'} modelos no catálogo
                </small>
              </span>
              <ArrowRight size={16} />
            </button>
          ))}
          {!busy && !error && !catalog.length && (
            <p>Nenhuma coleção encontrada para a grife configurada.</p>
          )}
        </Drawer>
      )}
    </div>
  );
}
