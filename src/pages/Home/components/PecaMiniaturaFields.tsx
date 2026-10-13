import { Pencil } from 'lucide-react';
import type { PecaItem } from '../../../types/plm';
import { getPecaFichaValues } from '../../../services/pecaFichaSelectors';

interface Props {
  peca: PecaItem;
  fields: string[];
  onEdit?: (field: string) => void;
}

export function PecaMiniaturaFields({ peca, fields, onEdit }: Props) {
  return (
    <div className="space-y-1.5 text-xs text-primary pt-1">
      {fields.map((field) => {
        const values = getPecaFichaValues(peca, field);
        const multiline =
          values.length > 1 || ['Tecidos', 'Aviamentos', 'Descrição'].includes(field);
        return (
          <div
            key={field}
            className={
              multiline
                ? 'pt-1 border-t border-border-muted'
                : 'flex items-start justify-between gap-2'
            }
          >
            <span className="flex items-center gap-1 text-muted-foreground font-medium">
              {field}
              {onEdit && (
                <button
                  type="button"
                  aria-label={
                    field === 'Etapas'
                      ? 'Mover etapa'
                      : `Editar ${field.toLocaleLowerCase('pt-BR')} na ficha técnica`
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(field);
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:text-accent-camel"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </span>
            <span
              className={`font-medium break-words ${multiline ? 'text-[11px] block leading-tight mt-0.5' : 'text-right'}`}
            >
              {values.join(', ') || '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
