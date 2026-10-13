import { useWorkspace } from '../../hooks/useWorkspace';
import { useWorkspacePeople } from '../../hooks/useWorkspacePeople';
import type {
  FieldValue,
  OperationalProduct,
  RegistryData,
  WorkspaceDocument,
} from '../../types/workspace';

export function CustomFields({
  fields,
  value,
  onChange,
  context = 'produto',
}: {
  fields: WorkspaceDocument<RegistryData>[];
  value: Record<string, FieldValue>;
  onChange: (value: Record<string, FieldValue>) => void;
  context?: string;
}) {
  return (
    <>
      {fields
        .filter((f) => !f.data.archived && f.data.contexto === context)
        .sort((a, b) => Number(a.data.ordem ?? 0) - Number(b.data.ordem ?? 0))
        .map((f) => {
          const id = f.id,
            type = String(f.data.tipo),
            current = value[id];
          return (
            <label className="akr-field" key={id}>
              {f.data.nome}
              {f.data.obrigatorio ? ' *' : ''}
              {type === 'booleano' ? (
                <select
                  required={Boolean(f.data.obrigatorio)}
                  value={current === undefined ? '' : String(current)}
                  onChange={(e) => {
                    const next = { ...value };
                    if (!e.target.value) delete next[id];
                    else next[id] = e.target.value === 'true';
                    onChange(next);
                  }}
                >
                  <option value="">Não informado</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              ) : type === 'selecao' ? (
                <select
                  required={Boolean(f.data.obrigatorio)}
                  value={String(current ?? '')}
                  onChange={(e) => onChange({ ...value, [id]: e.target.value })}
                >
                  <option value="">Selecione</option>
                  {String(f.data.opcoes ?? '')
                    .split('\n')
                    .filter(Boolean)
                    .map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                </select>
              ) : (
                <input
                  required={Boolean(f.data.obrigatorio)}
                  type={
                    type === 'numero' || type === 'moeda'
                      ? 'number'
                      : type === 'data'
                        ? 'date'
                        : 'text'
                  }
                  step="any"
                  value={String(current ?? '')}
                  onChange={(e) => {
                    const next = { ...value };
                    if (e.target.value === '') delete next[id];
                    else
                      next[id] =
                        type === 'numero' || type === 'moeda'
                          ? Number(e.target.value)
                          : e.target.value;
                    onChange(next);
                  }}
                />
              )}
            </label>
          );
        })}
    </>
  );
}
export function ProductFields({
  value,
  onChange,
  tags,
  types,
  flows,
  fields,
}: {
  value: OperationalProduct;
  onChange: (value: OperationalProduct) => void;
  tags: WorkspaceDocument<RegistryData>[];
  types: WorkspaceDocument<RegistryData>[];
  flows: WorkspaceDocument<RegistryData>[];
  fields: WorkspaceDocument<RegistryData>[];
}) {
  const set = (patch: Partial<OperationalProduct>) => onChange({ ...value, ...patch });
  const teams = useWorkspace<RegistryData>('teams');
  const { people, error: peopleError } = useWorkspacePeople();
  const personSelect = (role: 'responsavel' | 'estilista' | 'modelista') => {
    const key = `${role}Id` as const;
    return (
      <select
        value={value[key] ?? ''}
        onChange={(e) =>
          set({
            [key]: e.target.value,
            [role]: people.find((p) => p.id === e.target.value)?.nome ?? '',
          })
        }
      >
        <option value="">
          {value[role] && !value[key] ? value[role] + ' (registro anterior)' : 'Não atribuído'}
        </option>
        {value[key] && !people.some((p) => p.id === value[key]) && (
          <option value={value[key]}>{value[role]} (vínculo preservado)</option>
        )}
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
    );
  };
  return (
    <>
      <label className="akr-field">
        Nome do modelo
        <input required value={value.nome} onChange={(e) => set({ nome: e.target.value })} />
      </label>
      <div className="akr-form-grid">
        <label className="akr-field">
          Código
          <input value={value.codigo} onChange={(e) => set({ codigo: e.target.value })} />
        </label>
        <label className="akr-field">
          Tipo de peça
          <select
            value={value.typeId ?? ''}
            onChange={(e) => {
              const t = types.find((t) => t.id === e.target.value);
              set({ typeId: e.target.value, tipo: t?.data.nome ?? value.tipo });
            }}
          >
            <option value="">{value.tipo || 'Selecione'}</option>
            {types
              .filter((t) => !t.data.archived || t.id === value.typeId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.data.nome}
                </option>
              ))}
          </select>
        </label>
        <label className="akr-field">
          Responsável
          {personSelect('responsavel')}
        </label>
        <label className="akr-field">
          Time
          <select
            value={value.teamId ?? ''}
            onChange={(e) =>
              set({
                teamId: e.target.value,
                team: teams.rows.find((t) => t.id === e.target.value)?.data.nome ?? '',
              })
            }
          >
            <option value="">
              {value.team && !value.teamId ? value.team + ' (registro anterior)' : 'Não atribuído'}
            </option>
            {teams.rows
              .filter((t) => !t.data.archived || t.id === value.teamId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.data.nome}
                </option>
              ))}
          </select>
        </label>
        <label className="akr-field">
          Estilista
          {personSelect('estilista')}
        </label>
        <label className="akr-field">
          Modelista
          {personSelect('modelista')}
        </label>
        <label className="akr-field">
          Prazo planejado
          <input
            type="date"
            value={/^\d{4}-\d{2}-\d{2}$/.test(value.previsaoEntrega) ? value.previsaoEntrega : ''}
            onChange={(e) => set({ previsaoEntrega: e.target.value })}
          />
        </label>
        <label className="akr-field">
          Status PLM
          <select
            value={value.status}
            onChange={(e) =>
              set({
                status: e.target.value,
                completedAt:
                  e.target.value === 'Completa'
                    ? (value.completedAt ?? new Date().toISOString())
                    : undefined,
              })
            }
          >
            {!['Em andamento', 'A desenhar', 'Completa', 'Cancelada'].includes(value.status) && (
              <option>{value.status}</option>
            )}
            {['Em andamento', 'A desenhar', 'Completa', 'Cancelada'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="akr-field">
        Fluxo de desenvolvimento
        <select
          value={value.flowId ?? ''}
          onChange={(e) => {
            const flow = flows.find((f) => f.id === e.target.value);
            const stages = String(flow?.data.etapas ?? '').split('\n');
            set({
              flowId: e.target.value,
              fluxo: flow?.data.nome ?? value.fluxo,
              etapaAtual: stages.includes(value.etapaAtual)
                ? value.etapaAtual
                : String(flow?.data.inicial ?? value.etapaAtual),
              responsavel: value.responsavel || String(flow?.data.responsavel ?? ''),
              team: value.team || String(flow?.data.time ?? ''),
              teamId: value.teamId || String(flow?.data.teamId ?? ''),
              responsavelId: value.responsavelId || String(flow?.data.responsavelId ?? ''),
            });
          }}
        >
          <option value="">Fluxo existente / sem configuração</option>
          {flows
            .filter((f) => !f.data.archived || f.id === value.flowId)
            .map((f) => (
              <option key={f.id} value={f.id}>
                {f.data.nome}
              </option>
            ))}
        </select>
        <small>Alterar o fluxo preserva a etapa se ela existir na nova configuração.</small>
      </label>
      {(peopleError || teams.error) && (
        <p role="alert" className="akr-alert">
          {peopleError || teams.error}
        </p>
      )}
      <fieldset className="grid gap-2">
        <legend className="text-xs font-semibold mb-2">Tags</legend>
        {tags
          .filter((t) => !t.data.archived || value.tagIds?.includes(t.id))
          .map((tag) => (
            <label key={tag.id} className="akr-check">
              <input
                type="checkbox"
                checked={value.tagIds?.includes(tag.id) ?? false}
                onChange={(e) =>
                  set({
                    tagIds: e.target.checked
                      ? [...new Set([...(value.tagIds ?? []), tag.id])]
                      : (value.tagIds ?? []).filter((id) => id !== tag.id),
                  })
                }
              />
              {tag.data.grupo} · {tag.data.nome}
              {tag.data.archived ? ' (arquivada)' : ''}
            </label>
          ))}
        {!tags.length && (
          <p className="akr-muted text-xs">
            Cadastre tags para classificar e filtrar este modelo no BI.
          </p>
        )}
      </fieldset>
      <CustomFields
        fields={fields}
        value={value.customFields ?? {}}
        onChange={(customFields) => set({ customFields })}
      />
    </>
  );
}
