import type {
  OperationalProduct,
  RegistryData,
  WorkspaceChange,
  WorkspaceDocument,
  WorkspaceFilter,
} from '../types/workspace';
import { calcularCustosFicha } from './fichaCustos';
import { decimalManual } from './fichaProcesso';
import { precificacaoVariante } from './fichaPrecificacao';

export const currency = (value: number | null | undefined) =>
  value == null
    ? '—'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
export const numeric = (value: number | null | undefined) =>
  value == null ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value);
export function isoDate(value?: string): string | null {
  if (!value) return null;
  const formatted = /^\d{4}-\d{2}-\d{2}/.test(value)
    ? value.slice(0, 10)
    : value.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$2-$1');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formatted)) return null;
  const parsed = new Date(formatted + 'T12:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === formatted
    ? formatted
    : null;
}
export function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
export const displayDate = (value?: string) =>
  isoDate(value)?.split('-').reverse().join('/') ?? 'Sem prazo';
export const isComplete = (p: OperationalProduct) =>
  ['completa', 'concluída', 'concluida'].includes(p.status?.toLowerCase());
export const isCancelled = (p: OperationalProduct) =>
  ['cancelada', 'cancelado'].includes(p.status?.toLowerCase());
export function deadline(p: OperationalProduct, date = today()) {
  if (isComplete(p)) return 'Concluído';
  if (isCancelled(p)) return 'Cancelado';
  const due = isoDate(p.previsaoEntrega);
  return !due ? 'Sem prazo' : due < date ? 'Atrasado' : due === date ? 'Vence hoje' : 'Em dia';
}
export function productCosts(p: OperationalProduct) {
  const variants = (p.fichaTecnica?.variantes ?? []).map((v) => {
    const cost = calcularCustosFicha(v, undefined, p.fichaTecnica?.terceiros);
    const calculated = precificacaoVariante(v, undefined, p.fichaTecnica?.terceiros);
    const settings = calculated.value;
    const price = calculated.resultado;
    return { variant: v, cost, price, approved: decimalManual(settings.precoAprovado) };
  });
  const quantitiesValid = variants.length > 0 && variants.every((v) => v.cost.quantidade !== null);
  const costsValid = variants.length > 0 && variants.every((v) => v.cost.total !== null);
  const units = quantitiesValid ? variants.reduce((sum, v) => sum + v.cost.quantidade!, 0) : null;
  const batch =
    quantitiesValid && costsValid
      ? variants.reduce((sum, v) => sum + v.cost.totalProducao!, 0)
      : null;
  const weighted = batch !== null && units !== null && units > 0 ? batch / units : null;
  const known = variants.map((v) => v.cost.total).filter((v): v is number => v !== null);
  return {
    variants,
    units,
    batch,
    weighted,
    range: costsValid ? [Math.min(...known), Math.max(...known)] : null,
    pending: !costsValid,
  };
}
export function attention(p: OperationalProduct) {
  const result: string[] = [];
  if (isCancelled(p) || isComplete(p)) return result;
  if (deadline(p) === 'Atrasado') result.push('Prazo vencido');
  if (!p.responsavel?.trim() || p.responsavel === '—') result.push('Responsável ausente');
  for (const v of productCosts(p).variants) {
    if (v.cost.linhas.some((l) => l.preco === null)) result.push('Material sem preço');
    if (v.cost.linhas.some((l) => l.consumo === null)) result.push('Consumo pendente');
  }
  if (p.fichaTecnica?.provaRoupa?.resultado === 'aguardando')
    result.push('Prova aguardando aprovação');
  return [...new Set(result)];
}
export function filterProducts(rows: WorkspaceDocument<OperationalProduct>[], f: WorkspaceFilter) {
  return rows.filter(({ data: p }) => {
    const q = f.q?.trim().toLocaleLowerCase('pt-BR');
    if (p.archived) return false;
    if (
      q &&
      ![p.nome, p.codigo, p.tipo, p.estilista, p.modelista, p.responsavel, p.tema].some((v) =>
        v?.toLocaleLowerCase('pt-BR').includes(q)
      )
    )
      return false;
    if (f.colecao && p.colecaoId !== f.colecao) return false;
    if (f.etapa && p.etapaAtual !== f.etapa) return false;
    if (f.tipo && p.tipo !== f.tipo) return false;
    if (f.tag && !p.tagIds?.includes(f.tag)) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.responsavel && (p.responsavel || 'Não informado') !== f.responsavel) return false;
    if (f.estilista && (p.estilista || 'Não informado') !== f.estilista) return false;
    if (f.modelista && (p.modelista || 'Não informado') !== f.modelista) return false;
    if (f.time && (p.team || 'Não informado') !== f.time) return false;
    if (
      f.custom &&
      f.value !== undefined &&
      f.value !== '' &&
      String(p.customFields?.[f.custom] ?? 'Não informado') !== f.value
    )
      return false;
    if (f.attention === 'Em desenvolvimento' && (isComplete(p) || isCancelled(p))) return false;
    if (
      f.attention &&
      f.attention !== 'Em desenvolvimento' &&
      !attention(p).includes(f.attention) &&
      deadline(p) !== f.attention
    )
      return false;
    const date = isoDate(p.previsaoEntrega);
    if ((f.from || f.to) && (!date || (f.from && date < f.from) || (f.to && date > f.to)))
      return false;
    return true;
  });
}
export type Dimension =
  | 'marca'
  | 'colecao'
  | 'etapa'
  | 'status'
  | 'responsavel'
  | 'estilista'
  | 'modelista'
  | 'time'
  | 'tipo'
  | 'tag'
  | 'custom';
export type Metric =
  | 'modelos'
  | 'variantes'
  | 'unidades'
  | 'custo'
  | 'atrasos'
  | 'pendencias'
  | 'preco'
  | 'entradas'
  | 'saidas'
  | 'permanencia';
export const isHistoricalMetric = (metric: Metric) =>
  ['entradas', 'saidas', 'permanencia'].includes(metric);
export function groupProducts(
  rows: WorkspaceDocument<OperationalProduct>[],
  dimension: Dimension,
  metric: Metric,
  tags: WorkspaceDocument<RegistryData>[] = [],
  custom = ''
) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      value: number;
      missing: number;
      samples: number;
      ids: Set<string>;
    }
  >();
  for (const row of rows) {
    const p = row.data;
    const labels: [string, string][] =
      dimension === 'tag'
        ? p.tagIds?.length
          ? [...new Set(p.tagIds)].map(
              (id) =>
                [id, tags.find((t) => t.id === id)?.data.nome ?? 'Tag arquivada'] as [
                  string,
                  string,
                ]
            )
          : [['', 'Sem tag']]
        : dimension === 'custom'
          ? [
              [
                String(p.customFields?.[custom] ?? 'Não informado'),
                String(p.customFields?.[custom] ?? 'Não informado'),
              ],
            ]
          : dimension === 'colecao'
            ? [[p.colecaoId ?? '', p.colecaoNome || 'Sem coleção']]
            : dimension === 'marca'
              ? [[p.marcaId ?? '', p.marcaNome || 'Marca selecionada']]
              : [
                  [
                    String(
                      (
                        {
                          etapa: p.etapaAtual,
                          status: p.status,
                          responsavel: p.responsavel,
                          estilista: p.estilista,
                          modelista: p.modelista,
                          time: p.team,
                          tipo: p.tipo,
                        } as Record<string, string | undefined>
                      )[dimension] || 'Não informado'
                    ),
                    String(
                      (
                        {
                          etapa: p.etapaAtual,
                          status: p.status,
                          responsavel: p.responsavel,
                          estilista: p.estilista,
                          modelista: p.modelista,
                          time: p.team,
                          tipo: p.tipo,
                        } as Record<string, string | undefined>
                      )[dimension] || 'Não informado'
                    ),
                  ],
                ];
    const cost = productCosts(p);
    const prices = cost.variants
      .map((v) => v.price.precoFinal)
      .filter((v): v is number => v !== null);
    const value =
      metric === 'modelos'
        ? 1
        : metric === 'variantes'
          ? cost.variants.length
          : metric === 'unidades'
            ? cost.units
            : metric === 'custo'
              ? cost.batch
              : metric === 'preco'
                ? prices.length
                  ? prices.reduce((a, b) => a + b, 0)
                  : null
                : metric === 'atrasos'
                  ? Number(deadline(p) === 'Atrasado')
                  : Number(attention(p).length > 0);
    if ((metric === 'atrasos' || metric === 'pendencias') && value === 0) continue;
    for (const [key, label] of labels) {
      const group = groups.get(key) ?? {
        key,
        label,
        value: 0,
        missing: 0,
        samples: 0,
        ids: new Set<string>(),
      };
      if (group.ids.has(row.id)) continue;
      group.ids.add(row.id);
      if (value === null) group.missing++;
      else group.value += value;
      group.samples += prices.length;
      groups.set(key, group);
    }
  }
  return [...groups.values()]
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'))
    .map((g) => ({
      ...g,
      value: metric === 'preco' && g.samples ? g.value / g.samples : g.value,
      ids: [...g.ids],
    }));
}
export function stageHistory(changes: WorkspaceChange[], ids: Set<string>) {
  const selected = changes
    .filter((e) => e.kind === 'products' && ids.has(e.documentId))
    .sort((a, b) => a.at.localeCompare(b.at));
  const movements = selected.filter((e) => e.toStage !== null);
  const durations: { etapa: string; days: number; documentId: string; at: string }[] = [];
  const entered = new Map<string, { etapa: string; at: number }>();
  for (const event of movements) {
    const previous = entered.get(event.documentId);
    if (previous && previous.etapa === event.fromStage)
      durations.push({
        etapa: previous.etapa,
        days: (Date.parse(event.at) - previous.at) / 86400000,
        documentId: event.documentId,
        at: event.at,
      });
    entered.set(event.documentId, { etapa: event.toStage!, at: Date.parse(event.at) });
  }
  return { movements, durations, entered };
}
export function eventDay(at: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(at));
}
export function groupStageEvents(
  changes: WorkspaceChange[],
  ids: Set<string>,
  metric: Metric,
  from = '',
  to = ''
) {
  const events = stageHistory(changes, ids);
  const inPeriod = (at: string) => (!from || eventDay(at) >= from) && (!to || eventDay(at) <= to);
  const samples =
    metric === 'permanencia'
      ? events.durations
          .filter((e) => inPeriod(e.at))
          .map((e) => ({ key: e.etapa, value: e.days, id: e.documentId }))
      : events.movements
          .filter((e) => inPeriod(e.at))
          .map((e) => ({
            key: (metric === 'saidas' ? e.fromStage : e.toStage) ?? 'Sem etapa',
            value: 1,
            id: e.documentId,
          }));
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      value: number;
      missing: number;
      ids: Set<string>;
      samples: number;
    }
  >();
  for (const sample of samples) {
    const g = groups.get(sample.key) ?? {
      key: sample.key,
      label: sample.key,
      value: 0,
      missing: 0,
      ids: new Set<string>(),
      samples: 0,
    };
    g.value += sample.value;
    g.samples++;
    g.ids.add(sample.id);
    groups.set(sample.key, g);
  }
  return [...groups.values()]
    .map((g) => ({
      ...g,
      value: metric === 'permanencia' ? g.value / g.samples : g.value,
      ids: [...g.ids],
    }))
    .sort((a, b) => b.value - a.value);
}
export function exportCsv(
  name: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const escape = (value: string | number | null | undefined) => {
    const s = String(value ?? '');
    return '"' + (/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replace(/"/g, '""') + '"';
  };
  const url = URL.createObjectURL(
    new Blob(['\uFEFF' + [headers, ...rows].map((r) => r.map(escape).join(';')).join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name + '.csv';
  link.click();
  URL.revokeObjectURL(url);
}
