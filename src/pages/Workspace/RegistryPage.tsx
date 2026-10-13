import { useState } from 'react';
import { Archive, Pencil, Plus, RotateCcw } from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { saveWorkspace } from '../../services/workspaceService';
import type {
  RegistryKind,
  RegistryData,
  WorkspaceDocument,
  OperationalCollection,
} from '../../types/workspace';
import { currency, today } from '../../services/workspaceDomain';
import { DataState, Drawer, Empty, PageHeader } from './WorkspaceUI';
import { registryDefinitions } from './registryDefinitions';
import { calcularPrecificacao } from '../../services/fichaPrecificacao';
import { decimalManual } from '../../services/fichaProcesso';
import { useWorkspacePeople } from '../../hooks/useWorkspacePeople';
import { LegacyTeamsNotice } from './LegacyTeamsNotice';

export function RegistryPage({ kind }: { kind: RegistryKind }) {
  const source = useWorkspace<RegistryData>(kind);
  const collections = useWorkspace<OperationalCollection>('collections');
  const types = useWorkspace<RegistryData>('piece-types');
  const teams = useWorkspace<RegistryData>('teams');
  const { people } = useWorkspacePeople();
  const definition = registryDefinitions[kind];
  const [editing, setEditing] = useState<WorkspaceDocument<RegistryData> | null | undefined>(
    undefined
  );
  const [form, setForm] = useState<RegistryData>(definition.defaults);
  const [search, setSearch] = useState('');
  const [archived, setArchived] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [simulation, setSimulation] = useState('80');
  const open = (record?: WorkspaceDocument<RegistryData>) => {
    setEditing(record ?? null);
    setForm({ ...definition.defaults, ...record?.data });
    setError('');
    setSaved('');
  };
  const persist = async (data: RegistryData, previous?: WorkspaceDocument<RegistryData>) => {
    if (busy || !source.brand) return;
    setBusy(true);
    setError('');
    setSaved('');
    try {
      await saveWorkspace(kind, data, source.brand, previous);
      setEditing(undefined);
      setSaved('Salvo no servidor. Disponível para a equipe desta marca.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setBusy(false);
    }
  };
  const rows = source.rows
    .filter(
      (r) =>
        Boolean(r.data.archived) === archived &&
        Object.values(r.data)
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR'))
    )
    .sort((a, b) => a.data.nome.localeCompare(b.data.nome, 'pt-BR'));
  const preview =
    kind === 'fixed-costs' && Number(form.unidadesBase) > 0
      ? Number(form.valor) / Number(form.unidadesBase)
      : null;
  const price =
    kind === 'pricing'
      ? calcularPrecificacao(decimalManual(simulation), {
          modo: form.modo === 'margem' ? 'margem' : 'markup',
          markup: String(form.fator ?? ''),
          margemLucro: String(form.fator ?? ''),
          precoAprovado: '',
        }).precoFinal
      : null;
  return (
    <div className="akr-page">
      <PageHeader
        eyebrow="Cadastros compartilhados"
        title={definition.title}
        description={definition.description}
      >
        <button
          className="akr-button primary"
          disabled={!source.brand || source.loading || !!source.error}
          onClick={() => open()}
        >
          <Plus size={16} />
          Novo registro
        </button>
      </PageHeader>
      <div className="akr-filterbar">
        <label className="akr-field">
          <span className="sr-only">Buscar registros</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código…"
          />
        </label>
        <div className="akr-toggle">
          <button aria-pressed={!archived} onClick={() => setArchived(false)}>
            Ativos
          </button>
          <button aria-pressed={archived} onClick={() => setArchived(true)}>
            Arquivados
          </button>
        </div>
        <span className="akr-filter-scope">Marca selecionada · {rows.length} registros</span>
      </div>
      {kind === 'teams' && <LegacyTeamsNotice />}
      <DataState {...source} noBrand={!source.brand} retry={source.reload} />
      {error && editing === undefined && (
        <div className="akr-alert" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <div className="akr-notice" role="status">
          {saved}
        </div>
      )}
      {!source.loading &&
        !source.error &&
        source.brand &&
        (rows.length ? (
          <div className="akr-panel akr-table-scroll">
            <table className="akr-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Configuração</th>
                  <th>Atualização</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.data.nome}</strong>
                      {row.data.identificador && (
                        <small className="block akr-muted">{row.data.identificador}</small>
                      )}
                    </td>
                    <td>
                      {kind === 'fixed-costs'
                        ? currency(Number(row.data.valor)) +
                          ' / ' +
                          row.data.periodicidade +
                          ' · ' +
                          currency(Number(row.data.valor) / Number(row.data.unidadesBase)) +
                          '/un.'
                        : kind === 'pricing'
                          ? (row.data.modo === 'markup'
                              ? 'Markup ×' + row.data.fator
                              : 'Margem ' + row.data.fator + '%') +
                            ' · ' +
                            row.data.escopo +
                            ' · prioridade ' +
                            row.data.prioridade
                          : kind === 'flows'
                            ? String(row.data.etapas).split('\n').filter(Boolean).length + ' etapas'
                            : kind === 'custom-fields'
                              ? row.data.tipo + ' · ' + row.data.contexto
                              : String(
                                  row.data.grupo ?? row.data.categoria ?? row.data.grade ?? '—'
                                )}
                    </td>
                    <td>
                      {new Date(row.updatedAt).toLocaleString('pt-BR')}
                      <small className="block akr-muted">Revisão {row.revision}</small>
                    </td>
                    <td>
                      <span className="akr-badge">
                        {row.data.archived
                          ? 'Arquivado'
                          : row.data.fim && String(row.data.fim) < today()
                            ? 'Vigência encerrada'
                            : 'Ativo'}
                      </span>
                    </td>
                    <td>
                      <div className="akr-actions">
                        <button
                          className="akr-icon-button"
                          onClick={() => open(row)}
                          aria-label={'Editar ' + row.data.nome}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="akr-icon-button"
                          disabled={busy}
                          onClick={() =>
                            void persist({ ...row.data, archived: !row.data.archived }, row)
                          }
                          aria-label={
                            (row.data.archived ? 'Restaurar ' : 'Arquivar ') + row.data.nome
                          }
                        >
                          {row.data.archived ? <RotateCcw size={15} /> : <Archive size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={
              source.rows.length ? 'Nenhum resultado para os filtros' : 'Nenhum registro cadastrado'
            }
            description={
              source.rows.length
                ? 'Ajuste a busca ou consulte os registros arquivados.'
                : 'Crie o primeiro registro para disponibilizá-lo à equipe.'
            }
          >
            <button
              className="akr-button"
              onClick={() => (source.rows.length ? setSearch('') : open())}
            >
              {source.rows.length ? 'Limpar busca' : 'Criar registro'}
            </button>
          </Empty>
        ))}
      {editing !== undefined && (
        <Drawer
          title={(editing ? 'Editar ' : 'Novo registro · ') + definition.singular}
          onClose={() => {
            if (!busy) setEditing(undefined);
          }}
          footer={
            <>
              <button className="akr-button" disabled={busy} onClick={() => setEditing(undefined)}>
                Cancelar
              </button>
              <button
                className="akr-button primary"
                disabled={busy}
                type="submit"
                form="registry-form"
              >
                {busy ? 'Salvando…' : 'Salvar registro'}
              </button>
            </>
          }
        >
          <form
            id="registry-form"
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void persist(form, editing ?? undefined);
            }}
          >
            <label className="akr-field">
              Nome
              <input
                required
                maxLength={200}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </label>
            {definition.fields.map((field) =>
              field.type === 'boolean' ? (
                <label key={field.key} className="akr-check">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })}
                  />
                  {field.label}
                </label>
              ) : (
                <label key={field.key} className="akr-field">
                  {field.label}
                  {kind === 'flows' && (field.key === 'time' || field.key === 'responsavel') ? (
                    <select
                      value={String(form[field.key === 'time' ? 'teamId' : 'responsavelId'] ?? '')}
                      onChange={(e) => {
                        const name =
                          field.key === 'time'
                            ? teams.rows.find((t) => t.id === e.target.value)?.data.nome
                            : people.find((p) => p.id === e.target.value)?.nome;
                        setForm({
                          ...form,
                          [field.key]: name ?? '',
                          [field.key === 'time' ? 'teamId' : 'responsavelId']: e.target.value,
                        });
                      }}
                    >
                      <option value="">{String(form[field.key] || 'Não atribuído')}</option>
                      {field.key === 'time'
                        ? teams.rows
                            .filter((t) => !t.data.archived || t.id === form.teamId)
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.data.nome}
                              </option>
                            ))
                        : people.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome}
                            </option>
                          ))}
                    </select>
                  ) : kind === 'pricing' && field.key === 'alvo' ? (
                    <select
                      required={form.escopo !== 'Marca'}
                      disabled={form.escopo === 'Marca'}
                      value={String(form.alvo ?? '')}
                      onChange={(e) => setForm({ ...form, alvo: e.target.value })}
                    >
                      <option value="">
                        {form.escopo === 'Marca' ? 'Marca selecionada' : 'Selecione'}
                      </option>
                      {form.escopo === 'Coleção'
                        ? collections.rows.map((c) => (
                            <option key={c.id} value={c.data.id}>
                              {c.data.nome}
                            </option>
                          ))
                        : types.rows.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.data.nome}
                            </option>
                          ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      rows={field.key === 'etapas' ? 12 : 4}
                      value={String(form[field.key] ?? '')}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={String(form[field.key] ?? '')}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.key]: e.target.value,
                          ...(field.key === 'escopo' ? { alvo: '' } : {}),
                        })
                      }
                    >
                      <option value="">Selecione</option>
                      {field.options?.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={field.required}
                      type={field.type ?? 'text'}
                      step={field.type === 'number' ? 'any' : undefined}
                      min={field.type === 'number' ? 0 : undefined}
                      value={String(form[field.key] ?? '')}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.key]:
                            field.type === 'number' && e.target.value !== ''
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  )}{' '}
                  {field.help && <small>{field.help}</small>}
                </label>
              )
            )}
          </form>
          {kind === 'fixed-costs' && (
            <div className="akr-notice">
              Prévia por unidade: <strong>{currency(preview)}</strong>
              <span>
                {form.valor ?? 'Valor'} ÷ {form.unidadesBase ?? 'unidades'} da mesma periodicidade.
              </span>
            </div>
          )}
          {kind === 'pricing' && (
            <div className="akr-panel akr-panel-body">
              <label className="akr-field">
                Custo para simulação (R$)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={simulation}
                  onChange={(e) => setSimulation(e.target.value)}
                />
              </label>
              <p className="mt-3">
                Preço sugerido: <strong>{currency(price)}</strong>
              </p>
              <p className="akr-muted text-xs mt-2">
                {form.modo === 'markup' ? 'Custo × multiplicador' : 'Custo ÷ (1 − margem / 100)'}.
                Sem impostos ou despesas de venda adicionais.
              </p>
            </div>
          )}
          {error && (
            <div className="akr-alert" role="alert">
              {error}
            </div>
          )}
          <p className="akr-muted text-xs">
            Arquivar preserva os vínculos e os valores já utilizados nas fichas. Alterar uma regra
            não reescreve custos históricos.
          </p>
        </Drawer>
      )}
    </div>
  );
}
