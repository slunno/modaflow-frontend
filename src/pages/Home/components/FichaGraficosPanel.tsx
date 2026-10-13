import type { PecaItem } from '../../../types/plm';
import { useEffect, useState } from 'react';
import { Card, SectionHeader, Tooltip } from '../../../components/ui/FichaPrimitives';

const legend = [
  ['Concluído', 'bg-status-complete'],
  ['Em andamento', 'bg-accent-camel'],
  ['Atrasado', 'bg-status-late'],
  ['Previsto', 'bg-status-neutral'],
] as const;
const formatDate = (value: number) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(
    value
  );
function parseDate(value: string) {
  const display = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = display
    ? `${display[3]}-${display[2]}-${display[1]}`
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : '';
  const date = iso ? Date.parse(`${iso}T12:00:00-03:00`) : NaN;
  return Number.isFinite(date) ? date : undefined;
}

export function FichaGraficosPanel({ peca, concluida }: { peca: PecaItem; concluida?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const transitions = (peca.historicoAlteracoes ?? [])
    .flatMap((event) => {
      const stage = event.campos.find((field) => field.campo === 'Etapa');
      const start = Date.parse(event.registradoEm);
      if (!stage || !Number.isFinite(start)) return [];
      return [
        {
          id: event.id,
          name: stage.depois,
          before: stage.antes,
          start,
          author: event.responsavel.nome,
          responsible: event.campos.find((field) => field.campo === 'Responsável da etapa')?.depois,
        },
      ];
    })
    .sort((a, b) => a.start - b.start);
  const deadline = parseDate(peca.previsaoEntrega);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const todayDate = parseDate(today) ?? now;
  const concluded =
    concluida ??
    (!!peca.fichaTecnica?.processo?.concluida &&
      peca.fichaTecnica.processo.concluida.revisao === peca.fichaTecnica.processo.revisao);
  const late = !concluded && deadline !== undefined && deadline < todayDate;
  const rows = transitions.map((item, index) => {
    const next = transitions[index + 1];
    const current = index === transitions.length - 1 && item.name === peca.etapaAtual;
    const end = next?.before === item.name ? next.start : current && !concluded ? now : undefined;
    return {
      ...item,
      responsible: current ? (item.responsible ?? peca.responsavel) : item.responsible,
      end,
      state: current ? (concluded ? 0 : late ? 2 : 1) : next?.before === item.name ? 0 : 3,
    };
  });
  if (
    !rows.some((item) => item.name === peca.etapaAtual) &&
    peca.etapaAtual &&
    peca.etapaAtual !== '—'
  )
    rows.push({
      id: 'current',
      name: peca.etapaAtual,
      before: '',
      start: NaN,
      author: null,
      responsible: peca.responsavel,
      end: undefined,
      state: concluded ? 0 : late ? 2 : 1,
    });
  if (deadline !== undefined)
    rows.push({
      id: 'deadline',
      name: 'Previsão de entrega da peça',
      before: '',
      start: deadline,
      author: null,
      responsible: peca.responsavel,
      end: undefined,
      state: late ? 2 : 3,
    });
  const dates = [
    now,
    ...rows.flatMap((row) => [row.start, row.end ?? row.start]).filter(Number.isFinite),
  ];
  const min = Math.min(...dates) - 86400000,
    max = Math.max(...dates) + 86400000;
  const position = (value: number) => ((value - min) / (max - min)) * 100;
  return (
    <Card>
      <SectionHeader
        title="Cronograma da peça"
        description="Etapas e datas registradas no histórico local da ficha."
      />
      <div aria-label="Legenda do cronograma" className="mb-4 flex flex-wrap gap-2">
        {legend.map(([name, color]) => (
          <span
            key={name}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2 py-1 text-xs font-medium"
          >
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {name}
          </span>
        ))}
      </div>
      <p className="mb-5 text-xs text-muted">
        As barras conectam somente mudanças consecutivas registradas. Sem registro, a data fica a
        definir; datas planejadas por etapa não estão disponíveis.
      </p>
      {rows.length ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[minmax(200px,1fr)_2fr] gap-5 border-b border-border pb-3 text-xs text-muted">
                <span>Etapa / responsável</span>
                <div className="relative flex justify-between pt-6">
                  <span>{formatDate(min)}</span>
                  <span>{formatDate(max)}</span>
                  <span
                    className="absolute top-0 rounded-control bg-accent-camel/10 px-2 py-1 font-semibold text-accent-camel"
                    style={{ left: `${position(now)}%`, transform: 'translateX(-50%)' }}
                  >
                    Hoje
                  </span>
                </div>
              </div>
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[minmax(200px,1fr)_2fr] gap-5 border-b border-border-muted py-4"
                >
                  <div>
                    <p className="break-words text-sm font-semibold">
                      {row.name || 'Etapa sem nome'}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {legend[row.state]?.[0]}
                      {row.responsible ? ` · ${row.responsible}` : ''}
                    </p>
                  </div>
                  <div className="relative flex min-h-10 items-center">
                    <div
                      aria-hidden="true"
                      className="absolute inset-y-0 z-10 border-l-2 border-accent-camel"
                      style={{ left: `${position(now)}%` }}
                    />
                    {Number.isFinite(row.start) ? (
                      <div
                        className="absolute"
                        style={{
                          left: `${position(row.start)}%`,
                          width: row.end
                            ? `${Math.max(position(row.end) - position(row.start), 0.5)}%`
                            : '4px',
                        }}
                      >
                        <Tooltip
                          className="w-full"
                          text={`${row.name}: ${formatDate(row.start)}${row.end ? ' até ' + formatDate(row.end) : ' · registro pontual'}. ${row.responsible ? 'Responsável: ' + row.responsible + '. ' : ''}${row.author ? 'Registrado por ' + row.author : ''}`}
                        >
                          <span
                            className={`block h-6 min-w-1 rounded ${legend[row.state]?.[1]}`}
                            style={{ width: row.end ? '100%' : '4px' }}
                          />
                          <span className="sr-only">
                            {row.name} · {formatDate(row.start)} · {legend[row.state]?.[0]}
                          </span>
                        </Tooltip>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Datas a definir</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ol className="space-y-3 md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="border-l-2 border-border pl-4">
                <p className="text-sm font-semibold">{row.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {legend[row.state]?.[0]} ·{' '}
                  {Number.isFinite(row.start)
                    ? formatDate(row.start) + (row.end ? ' até ' + formatDate(row.end) : '')
                    : 'Datas a definir'}
                </p>
                {row.responsible && (
                  <p className="text-xs text-muted">Responsável: {row.responsible}</p>
                )}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="text-sm text-muted">
          Nenhuma movimentação ou previsão registrada. Defina a etapa em Opções → Entregar / alterar
          etapa.
        </p>
      )}
    </Card>
  );
}
