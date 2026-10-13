import { collectionDate, completedPiece } from './collectionFormatting';
import type { ReactNode } from 'react';
import { CalendarDays, Layers, Plus } from 'lucide-react';
import { Button, Card } from '../../../components/ui/FichaPrimitives';
import { usePersistedState } from '../../../hooks/usePersistedState';
import type { CollectionPrintItem, PecaItem } from '../../../types/plm';

export type CollectionTab =
  | 'pecas'
  | 'temas'
  | 'cores'
  | 'paineis'
  | 'estampas'
  | 'reserva_tecidos'
  | 'reserva_aviamentos'
  | 'mix'
  | 'metas'
  | 'cronograma';
const groups: { name: string; tabs: { id: CollectionTab; label: string }[] }[] = [
  {
    name: 'Planejamento',
    tabs: [
      { id: 'pecas', label: 'Peças' },
      { id: 'temas', label: 'Temas' },
      { id: 'mix', label: 'Mix' },
      { id: 'metas', label: 'Metas' },
      { id: 'cronograma', label: 'Cronograma' },
    ],
  },
  {
    name: 'Identidade',
    tabs: [
      { id: 'cores', label: 'Cores' },
      { id: 'paineis', label: 'Painéis' },
      { id: 'estampas', label: 'Estampas' },
    ],
  },
  {
    name: 'Materiais',
    tabs: [
      { id: 'reserva_tecidos', label: 'Reserva de Tecidos' },
      { id: 'reserva_aviamentos', label: 'Reserva de Aviamentos' },
    ],
  },
];

export function CollectionOverview({
  collectionId,
  name,
  brand,
  season,
  year,
  delivery,
  pieces,
  themeCount,
  activeTab,
  onTabChange,
  onAddPiece,
  options,
}: {
  collectionId: string;
  name: string;
  brand: string;
  season: string;
  year: string;
  delivery: string;
  pieces: PecaItem[];
  themeCount: number;
  activeTab: CollectionTab;
  onTabChange: (tab: CollectionTab) => void;
  onAddPiece: () => void;
  options: ReactNode;
}) {
  const [colors] = usePersistedState<{ collectionId: string }[]>('modaflow_collection_colors', []);
  const [prints] = usePersistedState<CollectionPrintItem[]>('modaflow_collection_prints', []);
  const [reservations] = usePersistedState<{ collectionId: string; type: string }[]>(
    'modaflow_collection_reservations',
    []
  );
  const currentReservations = reservations.filter((item) => item.collectionId === collectionId);
  const complete = pieces.filter(completedPiece).length;
  const undated = pieces.filter((item) => !collectionDate(item.previsaoEntrega)).length;
  const progress = pieces.length ? Math.round((100 * complete) / pieces.length) : 0;
  const counts: Record<CollectionTab, number | null> = {
    pecas: pieces.length,
    temas: themeCount,
    cores: colors.filter((item) => item.collectionId === collectionId).length,
    estampas: prints.filter((item) => item.collectionId === collectionId).length,
    reserva_tecidos: currentReservations.filter((item) => item.type === 'TECIDO').length,
    reserva_aviamentos: currentReservations.filter((item) => item.type === 'AVIAMENTO').length,
    mix: new Set(pieces.map((item) => item.tipo)).size,
    metas: null,
    paineis: null,
    cronograma: pieces.length - undated,
  };
  return (
    <>
      <Card className="overflow-visible !p-0">
        <div className="flex flex-wrap items-start justify-between gap-5 p-6 sm:p-7">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-accent-camel">
              Planejamento da coleção
            </p>
            <h1 className="break-words font-editorial text-3xl font-semibold sm:text-4xl">
              Coleção {name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {[brand, season, year].map((label, index) => (
                <span
                  key={index}
                  className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={onAddPiece}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Nova peça
            </Button>
            {options}
          </div>
        </div>
        <div className="grid gap-6 border-t border-border bg-surface-muted/40 p-6 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr] sm:px-7">
          <div>
            <p className="flex items-center gap-2 text-xs text-muted">
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
              Data de entrega
            </p>
            <strong className="mt-2 block text-xl">
              {collectionDate(delivery)?.toLocaleDateString('pt-BR') ??
                (delivery === '—' || !delivery ? 'A definir' : delivery)}
            </strong>
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs text-muted">
              <Layers aria-hidden="true" className="h-4 w-4" />
              Total de peças
            </p>
            <p className="mt-1">
              <strong className="font-editorial text-3xl">{pieces.length}</strong>
              <span className="ml-2 text-sm text-muted">Peças</span>
            </p>
          </div>
          <div>
            <div className="flex justify-between gap-3 text-sm">
              <span>
                Peças concluídas{' '}
                <strong>
                  {complete}/{pieces.length}
                </strong>
              </span>
              <strong>{progress}%</strong>
            </div>
            <div
              role="progressbar"
              aria-label="Progresso da coleção"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="my-3 h-2 rounded-full bg-border"
            >
              <div
                className="h-full rounded-full bg-accent-camel"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted">
              {undated} {undated === 1 ? 'peça sem data' : 'peças sem data'} ·{' '}
              {currentReservations.length}{' '}
              {currentReservations.length === 1 ? 'reserva cadastrada' : 'reservas cadastradas'}
            </p>
            <p className="mt-1 text-xs text-muted">
              Status das reservas: sem avaliação disponível.
            </p>
          </div>
        </div>
      </Card>
      <Card className="!p-3 sm:!p-4">
        <nav aria-label="Áreas da coleção" className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {groups.map((group) => (
            <div key={group.name} className="min-w-0">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[.16em] text-muted">
                {group.name}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    aria-label={tab.label}
                    aria-pressed={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                    onKeyDown={(event) => {
                      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
                      event.preventDefault();
                      const buttons = Array.from(
                        event.currentTarget
                          .closest('nav')
                          ?.querySelectorAll<HTMLButtonElement>('button') ?? []
                      );
                      const index = buttons.indexOf(event.currentTarget);
                      const target =
                        event.key === 'Home'
                          ? buttons[0]
                          : event.key === 'End'
                            ? buttons.at(-1)
                            : buttons[
                                (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) %
                                  buttons.length
                              ];
                      target?.focus();
                      target?.click();
                    }}
                    className={`flex min-h-10 items-center gap-2 rounded-control border px-3 py-2 text-xs font-medium ${activeTab === tab.id ? 'border-accent-camel/40 bg-accent-camel/10 text-accent-camel' : 'border-transparent text-muted hover:bg-surface-muted hover:text-primary'}`}
                  >
                    {tab.label}
                    <span
                      aria-hidden="true"
                      title={
                        counts[tab.id] === null
                          ? 'Sem contagem disponível'
                          : tab.id === 'cronograma'
                            ? `${counts[tab.id]} peças com data; ${undated} sem data`
                            : undefined
                      }
                      className="min-w-4 rounded-full bg-surface-muted px-1.5 text-center text-[10px]"
                    >
                      {counts[tab.id] ?? '—'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </Card>
    </>
  );
}
