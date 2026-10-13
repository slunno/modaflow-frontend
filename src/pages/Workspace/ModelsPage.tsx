import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';
import { saveWorkspace } from '../../services/workspaceService';
import { exportCsv, filterProducts, productCosts } from '../../services/workspaceDomain';
import { ETAPA_INICIAL_FICHA } from '../../services/fichaFluxos';
import type {
  OperationalCollection,
  OperationalProduct,
  RegistryData,
  WorkspaceFilter,
} from '../../types/workspace';
import { DataState, Drawer, Empty, PageHeader, ProductTable } from './WorkspaceUI';
import { ProductFields } from './ProductFields';
import { LegacyImportNotice } from './LegacyImportNotice';

export function ModelsPage() {
  const source = useWorkspace<OperationalProduct>('products');
  const collections = useWorkspace<OperationalCollection>('collections');
  const tags = useWorkspace<RegistryData>('tags');
  const types = useWorkspace<RegistryData>('piece-types');
  const flows = useWorkspace<RegistryData>('flows');
  const fields = useWorkspace<RegistryData>('custom-fields');
  const { activeMarca } = useAuth();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<OperationalProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState('prazo');
  const [page, setPage] = useState(0);
  const change = (key: string, value: string) => {
    setPage(0);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };
  const rows = filterProducts(source.rows, Object.fromEntries(params) as WorkspaceFilter).sort(
    (a, b) =>
      order === 'nome'
        ? a.data.nome.localeCompare(b.data.nome, 'pt-BR')
        : (a.data.previsaoEntrega || '9999').localeCompare(b.data.previsaoEntrega || '9999')
  );
  const currentPage = Math.min(page, Math.max(0, Math.ceil(rows.length / 30) - 1));
  const create = () => {
    const c =
      collections.rows.find((c) => c.data.id === params.get('colecao')) ?? collections.rows[0];
    const id = crypto.randomUUID();
    setError('');
    setForm({
      id,
      sourceKey: 'product:' + (c?.data.id ?? '') + ':' + id,
      marcaId: source.brand,
      marcaNome: activeMarca?.nome ?? '',
      colecaoId: c?.data.id ?? '',
      colecaoNome: c?.data.nome ?? '',
      nome: '',
      codigo: '',
      tipo: '',
      tema: '',
      status: 'Em andamento',
      etapaAtual: ETAPA_INICIAL_FICHA,
      estilista: '',
      tecidos: [],
      previsaoEntrega: '',
      fichaTecnica: {
        variantes: [
          {
            id: crypto.randomUUID(),
            nome: 'Principal',
            tecidos: [],
            aviamentos: [],
            precificacao: {
              modo: 'markup',
              markup: '',
              margemLucro: '',
              precoAprovado: '',
              baseCusto: 'producao',
            },
          },
        ],
      },
    });
  };
  const save = async () => {
    if (!form || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await saveWorkspace(
        'products',
        { ...form, sourceKey: 'product:' + form.colecaoId + ':' + form.id },
        source.brand
      );
      setForm(null);
      navigate('/pecas/' + result.id + '?' + params.toString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="akr-page">
      <PageHeader
        eyebrow="Desenvolvimento / Fichas técnicas"
        title="Modelos da coleção"
        description="Uma linha por modelo. Variantes e unidades planejadas permanecem identificadas na ficha."
      >
        <button className="akr-button" disabled={source.loading} onClick={source.reload}>
          <RefreshCw size={15} />
          Atualizar
        </button>
        <button
          className="akr-button"
          disabled={!rows.length}
          onClick={() =>
            exportCsv(
              'akr-modelos',
              [
                'Modelo',
                'Código',
                'Coleção',
                'Etapa',
                'Responsável',
                'Prazo',
                'Variantes',
                'Unidades planejadas',
                'Custo do lote',
              ],
              rows.map((r) => {
                const c = productCosts(r.data);
                return [
                  r.data.nome,
                  r.data.codigo,
                  r.data.colecaoNome,
                  r.data.etapaAtual,
                  r.data.responsavel,
                  r.data.previsaoEntrega,
                  c.variants.length,
                  c.units,
                  c.batch,
                ];
              })
            )
          }
        >
          <ArrowDownToLine size={15} />
          Exportar
        </button>
        <button
          className="akr-button primary"
          disabled={!source.brand || !collections.rows.length || !!source.error || source.loading}
          onClick={create}
        >
          <Plus size={15} />
          Novo modelo
        </button>
      </PageHeader>
      <LegacyImportNotice onImported={source.reload} />
      <div className="akr-filterbar">
        <label className="akr-field" style={{ minWidth: 220 }}>
          Buscar modelo
          <input
            placeholder="Nome, código, tipo ou responsável"
            value={params.get('q') ?? ''}
            onChange={(e) => change('q', e.target.value)}
          />
        </label>
        <label className="akr-field">
          Tag
          <select value={params.get('tag') ?? ''} onChange={(e) => change('tag', e.target.value)}>
            <option value="">Todas</option>
            {tags.rows.map((t) => (
              <option value={t.id} key={t.id}>
                {t.data.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="akr-field">
          Status
          <select
            value={params.get('status') ?? ''}
            onChange={(e) => change('status', e.target.value)}
          >
            <option value="">Todos</option>
            {['Em andamento', 'A desenhar', 'Completa', 'Cancelada'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="akr-field">
          Ordenar
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="prazo">Prazo planejado</option>
            <option value="nome">Nome do modelo</option>
          </select>
        </label>
        <span className="akr-filter-scope">{rows.length} modelos distintos</span>
        <button
          className="akr-button"
          onClick={() =>
            setParams(
              new URLSearchParams([...params].filter(([key]) => ['marca', 'colecao'].includes(key)))
            )
          }
        >
          Limpar filtros da lista
        </button>
      </div>
      {[...params].some(([key]) =>
        ['etapa', 'attention', 'from', 'to', 'tipo', 'responsavel', 'custom', 'value'].includes(key)
      ) && (
        <div className="akr-notice">
          Recorte do BI preservado:{' '}
          {[...params]
            .filter(([key]) =>
              ['etapa', 'attention', 'from', 'to', 'tipo', 'responsavel', 'value'].includes(key)
            )
            .map(([, value]) => value)
            .join(' · ')}
        </div>
      )}
      <DataState {...source} noBrand={!source.brand} retry={source.reload} />
      {!source.loading &&
        !source.error &&
        source.brand &&
        (rows.length ? (
          <div className="akr-panel">
            <ProductTable rows={rows.slice(currentPage * 30, currentPage * 30 + 30)} finance />
            <div className="akr-pagination">
              <span>
                {currentPage * 30 + 1}–{Math.min(currentPage * 30 + 30, rows.length)} de{' '}
                {rows.length} modelos
              </span>
              <div className="akr-actions">
                <button
                  className="akr-button"
                  disabled={currentPage === 0}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Anterior
                </button>
                <button
                  className="akr-button"
                  disabled={(currentPage + 1) * 30 >= rows.length}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Empty
            title={
              source.rows.length
                ? 'Nenhum resultado para os filtros'
                : 'Nenhum modelo compartilhado'
            }
            description={
              source.rows.length
                ? 'Os dados existem, mas não correspondem ao recorte atual.'
                : 'Crie uma coleção ou compartilhe os rascunhos existentes para iniciar o desenvolvimento.'
            }
          >
            <Link className="akr-button" to="/colecoes">
              Abrir coleções
            </Link>
          </Empty>
        ))}
      {form && (
        <Drawer
          title="Novo modelo"
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
                type="submit"
                form="product-form"
                disabled={busy}
              >
                {busy ? 'Salvando…' : 'Criar modelo'}
              </button>
            </>
          }
        >
          <form
            id="product-form"
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <label className="akr-field">
              Coleção
              <select
                required
                value={form.colecaoId}
                onChange={(e) => {
                  const c = collections.rows.find((c) => c.data.id === e.target.value);
                  setForm({
                    ...form,
                    colecaoId: c?.data.id ?? '',
                    colecaoNome: c?.data.nome ?? '',
                  });
                }}
              >
                <option value="">Selecione</option>
                {collections.rows.map((c) => (
                  <option key={c.id} value={c.data.id}>
                    {c.data.nome}
                  </option>
                ))}
              </select>
            </label>
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
            <div role="alert" className="akr-alert">
              {error}
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
}
