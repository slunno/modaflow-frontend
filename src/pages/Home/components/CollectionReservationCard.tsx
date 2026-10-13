import { ChevronDown, ImagePlus } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/FichaPrimitives';
import type { TecidoInsumoItem } from '../../../types/gestao';
import type { Reservation } from './CollectionManagementTabs';
import { collectionDate } from './collectionFormatting';

function quantity(value: string) {
  const trimmed = value.trim().replace(',', '.');
  return trimmed && /^\d+(?:\.\d+)?$/.test(trimmed) ? Number(trimmed) : null;
}
export function CollectionReservationCard({
  reservation: item,
  material,
  expanded,
  onToggle,
}: {
  reservation: Reservation;
  material?: TecidoInsumoItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const reserved = quantity(item.reserved),
    used = quantity(item.used);
  const percent =
    reserved !== null && reserved > 0 && used !== null ? Math.round((100 * used) / reserved) : null;
  const unit = material?.unidade || 'unidade a definir';
  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="flex flex-wrap items-start gap-4 p-4 sm:p-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surface-muted">
          {material?.imagemUrl ? (
            <img
              src={material.imagemUrl}
              alt={item.materialName}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus aria-hidden="true" className="h-6 w-6 text-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1 basis-48">
          <h4 className="break-words font-editorial text-lg font-semibold">{item.materialName}</h4>
          <p className="mt-1 text-xs text-muted">
            Código: {material?.codigo || 'A definir'} · Cor: {item.color || 'A definir'}
          </p>
          <p className="mt-3 text-xs text-muted">
            Cadastro:{' '}
            {collectionDate(item.createdAt)?.toLocaleDateString('pt-BR') ?? item.createdAt}
          </p>
        </div>
        <StatusBadge status="neutral" label="Registro local" />
      </div>
      <dl className="grid grid-cols-3 gap-3 border-y border-border bg-surface-muted/40 p-4 sm:px-5">
        {[
          ['Reservado', item.reserved, unit],
          ['Utilizado', item.used, unit],
          ['Completos', item.completed, 'unidade não definida'],
        ].map(([label, value, suffix]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-lg font-semibold">{value || '—'}</dd>
            <dd className="mt-1 break-words text-xs text-muted">{suffix}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex justify-between gap-3 text-xs">
          <span>{percent === null ? 'Consumo não informado' : `${percent}% utilizado`}</span>
          {percent !== null && percent > 100 && (
            <StatusBadge status="late" label="Acima da reserva" />
          )}
        </div>
        {percent !== null && (
          <div
            role="progressbar"
            aria-label={`Consumo de ${item.materialName}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(percent, 100)}
            aria-valuetext={`${percent}% utilizado`}
            className="h-2 overflow-hidden rounded-full bg-border"
          >
            <div
              className="h-full rounded-full bg-accent-camel"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        )}
        <dl className="grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted">Estilista</dt>
            <dd className="mt-1 font-medium">{item.stylist || 'A definir'}</dd>
          </div>
          <div>
            <dt className="text-muted">Responsável pela reserva</dt>
            <dd className="mt-1 font-medium">{item.responsible || 'A definir'}</dd>
          </div>
        </dl>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={onToggle}
          className="flex min-h-10 w-full items-center justify-between border-t border-border pt-3 text-sm font-medium"
        >
          Detalhes de {item.materialName}
          <ChevronDown aria-hidden="true" className={`h-4 w-4 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className="rounded-control bg-surface-muted p-3 text-sm">
            <p className="mb-1 text-xs text-muted">Observações</p>
            <p className="whitespace-pre-wrap break-words">
              {item.notes || 'Nenhuma observação cadastrada.'}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
