import { useState } from 'react';
import {
  Button,
  Card,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from '../../../components/ui/FichaPrimitives';
import type { FichaStatus } from '../../../components/ui/FichaPrimitives';
import type { PecaItem } from '../../../types/plm';
import { collectionDate, completedPiece } from './collectionFormatting';

const day = 86_400_000;
export function CollectionSchedule({
  pieces,
  collectionName,
  collectionDelivery,
  onOpenPiece,
  onAddPiece,
}: {
  pieces: PecaItem[];
  collectionName: string;
  collectionDelivery: string;
  onOpenPiece: (piece: PecaItem) => void;
  onAddPiece: () => void;
}) {
  const [view, setView] = useState<'timeline' | 'table'>('timeline');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dated = pieces
    .flatMap((piece) => {
      const date = collectionDate(piece.previsaoEntrega);
      return date ? [{ piece, date }] : [];
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const undated = pieces.filter((piece) => !collectionDate(piece.previsaoEntrega));
  const start = Math.min(today.getTime(), ...dated.map((item) => item.date.getTime())) - 7 * day;
  const end = Math.max(today.getTime(), ...dated.map((item) => item.date.getTime())) + 7 * day;
  const position = (date: Date) => (100 * (date.getTime() - start)) / (end - start);
  const state = (
    piece: PecaItem,
    date: Date | null
  ): { status: FichaStatus; label: string; color: string } => {
    if (completedPiece(piece))
      return { status: 'complete', label: 'Concluído', color: 'bg-status-complete' };
    if (piece.status.toLocaleLowerCase() === 'cancelada')
      return { status: 'neutral', label: 'Cancelada', color: 'bg-status-neutral' };
    if (date && date < today) return { status: 'late', label: 'Atrasado', color: 'bg-status-late' };
    if (piece.status.toLocaleLowerCase() === 'em andamento')
      return { status: 'pending', label: 'Em andamento', color: 'bg-status-pending' };
    return { status: 'draft', label: 'Previsto', color: 'bg-accent-camel' };
  };
  return (
    <Card>
      <SectionHeader
        title="Cronograma de Entrega das Peças"
        description={`Prazos e datas previstas de entrega para a coleção ${collectionName}.`}
        action={
          <div className="flex gap-2">
            <Button aria-pressed={view === 'timeline'} onClick={() => setView('timeline')}>
              Linha do tempo
            </Button>
            <Button aria-pressed={view === 'table'} onClick={() => setView('table')}>
              Tabela
            </Button>
          </div>
        }
      />
      {!pieces.length ? (
        <EmptyState
          title="O cronograma começa com suas peças"
          description="Adicione peças e defina os prazos de entrega na ficha técnica."
          action={<Button onClick={onAddPiece}>Adicionar peça</Button>}
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2" aria-label="Legenda do cronograma">
            {(['draft', 'pending', 'complete', 'late'] as const).map((status, index) => (
              <StatusBadge
                key={status}
                status={status}
                label={['Previsto', 'Em andamento', 'Concluído', 'Atrasado'][index]}
              />
            ))}
          </div>
          {view === 'timeline' ? (
            <>
              {dated.length > 0 && (
                <div
                  className="overflow-x-auto rounded-card border border-border"
                  aria-label="Linha do tempo das entregas"
                >
                  <div className="min-w-[640px] p-4">
                    <div className="grid grid-cols-[180px_1fr] gap-4 border-b border-border pb-6">
                      <strong className="text-xs text-muted">Peça / previsão</strong>
                      <div className="relative h-4">
                        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
                          <span
                            key={fraction}
                            className="absolute whitespace-nowrap text-[10px] text-muted"
                            style={{
                              left: `${fraction * 100}%`,
                              transform:
                                fraction === 0
                                  ? undefined
                                  : fraction === 1
                                    ? 'translateX(-100%)'
                                    : 'translateX(-50%)',
                            }}
                          >
                            {new Date(start + fraction * (end - start)).toLocaleDateString(
                              'pt-BR',
                              { day: '2-digit', month: 'short' }
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    {dated.map(({ piece, date }, index) => {
                      const itemState = state(piece, date);
                      return (
                        <div
                          key={piece.id}
                          className="grid grid-cols-[180px_1fr] gap-4 border-b border-border-muted py-4 last:border-0"
                        >
                          <button
                            type="button"
                            onClick={() => onOpenPiece(piece)}
                            className="text-left"
                          >
                            <span
                              className="block truncate text-sm font-semibold"
                              title={piece.nome}
                            >
                              {piece.nome}
                            </span>
                            <span className="text-xs text-muted">
                              {piece.codigo} · {date.toLocaleDateString('pt-BR')}
                            </span>
                          </button>
                          <div className="relative flex min-h-12 items-center rounded-control bg-surface-muted">
                            <div
                              aria-hidden="true"
                              className="absolute -top-4 -bottom-4 border-l-2 border-accent-camel"
                              style={{ left: `${position(today)}%` }}
                            >
                              {index === 0 && (
                                <span className="absolute -top-1 left-1 rounded-control bg-surface px-1 text-xs font-semibold text-accent-camel">
                                  Hoje
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              aria-label={`Abrir ${piece.nome}, entrega em ${date.toLocaleDateString('pt-BR')}, ${itemState.label}`}
                              onClick={() => onOpenPiece(piece)}
                              className="absolute flex min-h-10 -translate-x-1/2 items-center gap-1 rounded-control border border-border bg-surface px-2 shadow-card"
                              style={{ left: `${position(date)}%` }}
                            >
                              <span
                                aria-hidden="true"
                                className={`h-2.5 w-2.5 rounded-full ${itemState.color}`}
                              />
                              <span className="text-[10px] font-medium">{itemState.label}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {undated.length > 0 && (
                <section className="mt-5 rounded-card border border-dashed border-border p-4">
                  <h4 className="mb-3 text-sm font-semibold">
                    Sem data definida ({undated.length})
                  </h4>
                  <p className="mb-3 text-xs text-muted">
                    Abra a ficha técnica para informar a previsão de entrega da peça.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {undated.map((piece) => (
                      <Button key={piece.id} onClick={() => onOpenPiece(piece)}>
                        Definir data · {piece.nome}
                      </Button>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="p-3">Peça</th>
                    <th className="p-3">Previsão de Entrega</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pieces.map((piece) => {
                    const date = collectionDate(piece.previsaoEntrega),
                      itemState = state(piece, date);
                    return (
                      <tr key={piece.id} className="border-b border-border-muted">
                        <td className="p-3 font-medium">
                          {piece.nome}
                          <span className="mt-1 block text-xs text-muted">{piece.codigo}</span>
                        </td>
                        <td className="p-3">
                          {date
                            ? date.toLocaleDateString('pt-BR')
                            : piece.previsaoEntrega && piece.previsaoEntrega !== '—'
                              ? piece.previsaoEntrega
                              : collectionDelivery && collectionDelivery !== '—'
                                ? `${collectionDate(collectionDelivery)?.toLocaleDateString('pt-BR') ?? collectionDelivery} (coleção)`
                                : 'A definir'}
                        </td>
                        <td className="p-3">
                          <StatusBadge
                            status={date ? itemState.status : 'neutral'}
                            label={date ? itemState.label : 'Sem data da peça'}
                          />
                        </td>
                        <td className="p-3">
                          <Button onClick={() => onOpenPiece(piece)}>Abrir ficha</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
