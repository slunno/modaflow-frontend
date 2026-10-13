import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LinxGriffe } from '../../../types/linx';

const GRUPOS = [
  {
    titulo: 'Grade Adulta',
    griffes: ['K&J BLACK', 'KING&JOE'],
    opcoes: [
      'PP',
      'P',
      'M',
      'G',
      'GG',
      'XG',
      'XXG',
      'Único',
      '38',
      '40',
      '42',
      '44',
      '46',
      '48',
      '50',
    ],
  },
  {
    titulo: 'Grade Infantil',
    griffes: ['KING&JOE PLAY'],
    opcoes: ['01', '02', '03', '04', '05', '06', '07', '08', '10', '12', '14', '16', '18'],
  },
];

export function FichaTamanhosPicker({
  value,
  onChange,
  griffe,
}: {
  value: string[];
  onChange: (tamanhos: string[]) => void;
  griffe?: LinxGriffe | null;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gruposDaMarca = griffe ? GRUPOS.filter((grupo) => grupo.griffes.includes(griffe)) : GRUPOS;
  const extras = value.filter((tamanho) => !GRUPOS.some((grupo) => grupo.opcoes.includes(tamanho)));
  const grupos = extras.length
    ? [
        ...gruposDaMarca,
        {
          titulo: 'Outros tamanhos selecionados',
          opcoes: extras,
        },
      ]
    : gruposDaMarca;

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, []);

  const toggle = (tamanho: string) =>
    onChange(
      value.includes(tamanho) ? value.filter((item) => item !== tamanho) : [...value, tamanho]
    );

  return (
    <div
      ref={rootRef}
      className="space-y-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <label
        id={`${id}-label`}
        htmlFor={`${id}-trigger`}
        className="block font-semibold text-muted-foreground"
      >
        Tamanhos
      </label>
      <div className="relative">
        <button
          ref={triggerRef}
          id={`${id}-trigger`}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={`${id}-menu`}
          onClick={() => setOpen((previous) => !previous)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-primary outline-none hover:border-accent-camel focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
        >
          <span className={value.length ? 'font-medium' : 'text-muted'}>
            {value.length
              ? `${value.length} ${value.length === 1 ? 'tamanho selecionado' : 'tamanhos selecionados'}`
              : 'Clique para selecionar os tamanhos'}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div
            id={`${id}-menu`}
            role="dialog"
            aria-label="Selecionar tamanhos"
            className="absolute top-full left-0 z-50 mt-1 max-h-96 w-full overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-xl"
          >
            <div className="mb-3 flex justify-end border-b border-border pb-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] font-semibold text-muted hover:text-red-500"
              >
                Limpar seleção
              </button>
            </div>
            <div className="space-y-3">
              {grupos.map((grupo) => (
                <fieldset key={grupo.titulo} aria-label={grupo.titulo}>
                  <legend className="mb-2 w-full">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-xs font-semibold text-primary">{grupo.titulo}</span>
                      <button
                        type="button"
                        onClick={() => onChange(Array.from(new Set([...value, ...grupo.opcoes])))}
                        className="font-semibold text-accent-camel hover:underline"
                      >
                        + Selecionar grupo
                      </button>
                    </span>
                  </legend>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {grupo.opcoes.map((tamanho) => (
                      <button
                        key={tamanho}
                        type="button"
                        aria-pressed={value.includes(tamanho)}
                        onClick={() => toggle(tamanho)}
                        className={`rounded-md border px-3 py-1 text-xs font-semibold transition-colors ${
                          value.includes(tamanho)
                            ? 'border-accent-camel bg-accent-camel text-on-camel'
                            : 'border-border bg-surface text-muted-foreground hover:border-accent-camel/50'
                        }`}
                      >
                        {tamanho}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div aria-label="Tamanhos selecionados" className="flex flex-wrap gap-1.5">
          {value.map((tamanho) => (
            <span
              key={tamanho}
              className="rounded-md border border-accent-camel/20 bg-accent-camel/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
            >
              {tamanho}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
