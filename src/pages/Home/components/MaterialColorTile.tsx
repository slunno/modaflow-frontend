import { X } from 'lucide-react';
import type { TecidoCorItem } from '../../../types/gestao';
import { getMaterialColorAppearance } from './materialColorAppearance';

export function MaterialColorTile({
  color,
  onRemove,
  onSelect,
  selected,
}: {
  color: TecidoCorItem;
  onRemove?: () => void;
  onSelect?: () => void;
  selected?: boolean;
}) {
  const appearance = getMaterialColorAppearance(color);
  const description = `${color.nome}${color.codigo ? ` (${color.codigo})` : ''}${appearance.exact ? '' : ' — tonalidade ilustrativa'}`;
  return (
    <div
      className="material-color-chip group"
      data-selected={selected}
      title={description}
      aria-label={description}
    >
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Editar cor ${color.nome}${color.codigo ? ` (${color.codigo})` : ''}`}
          aria-pressed={selected}
          className="min-h-control-compact text-left text-xs font-medium"
        >
          <span
            aria-hidden="true"
            className="material-color-swatch"
            style={{ backgroundColor: appearance.background }}
          />
          <span className="break-words">
            {color.nome}
            {color.codigo && <span className="ml-1 text-muted">{color.codigo}</span>}
          </span>
        </button>
      ) : (
        <span className="text-xs font-medium">
          <span
            aria-hidden="true"
            className="material-color-swatch"
            style={{ backgroundColor: appearance.background }}
          />
          {color.nome}
          {color.codigo && <span className="text-muted">{color.codigo}</span>}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover cor ${color.nome}`}
          className="material-color-remove rounded-control hover:bg-surface-muted"
        >
          <X aria-hidden="true" strokeWidth={1.5} className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
