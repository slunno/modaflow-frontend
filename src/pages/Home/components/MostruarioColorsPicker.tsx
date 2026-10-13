import { useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { getLinxCoresMostruario } from '../../../services/linxService';
import { usePersistedState } from '../../../hooks/usePersistedState';
import type { TecidoCorItem } from '../../../types/gestao';

const key = (color: TecidoCorItem) => `${color.nome.toLocaleLowerCase()}:${color.codigo ?? ''}`;

export function MostruarioColorsPicker({
  value,
  onChange,
}: {
  value: TecidoCorItem[];
  onChange: (colors: TecidoCorItem[]) => void;
}) {
  const [names, setNames] = useState<string[]>([]);
  const [localColors] = usePersistedState<TecidoCorItem[]>('modaflow_colors', []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    getLinxCoresMostruario()
      .then((items) => {
        if (active) setNames(items);
      })
      .catch(() => {
        if (active) setError('Não foi possível consultar as cores do Linx.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const catalog = new Map<string, TecidoCorItem>();
  for (const color of [
    ...value.map((color) =>
      color.origemMostruario !== 'portal' &&
      color.id === 'linx-cor-' + color.nome &&
      names.includes(color.nome)
        ? { ...color, origemMostruario: 'linx' as const }
        : color
    ),
    ...localColors,
    ...names.map((name) => ({
      id: 'linx-cor-' + name,
      nome: name,
      hex: '',
      origemMostruario: 'linx' as const,
    })),
  ])
    if (!catalog.has(key(color))) catalog.set(key(color), color);
  const filtered = [...catalog.values()].filter((color) =>
    `${color.nome} ${color.codigo ?? ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  );
  const toggle = (color: TecidoCorItem) =>
    onChange(
      value.some((item) => key(item) === key(color))
        ? value.filter((item) => key(item) !== key(color))
        : [...value, color]
    );
  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery('');
        }
      }}
    >
      <label
        className="mb-1 block text-xs font-semibold text-muted-foreground"
        htmlFor={`${listId}-input`}
      >
        Cor de mostruário
      </label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined
        }
        value={open ? query : value.map((color) => color.nome).join(', ')}
        placeholder="Clique aqui para selecionar ou remover"
        onFocus={() => {
          setOpen(true);
          setQuery('');
          setActiveIndex(0);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            setOpen(false);
            setQuery('');
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => Math.min(index + 1, Math.max(0, filtered.length - 1)));
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(0, index - 1));
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            if (open && filtered[activeIndex]) toggle(filtered[activeIndex]);
            else setOpen(true);
          }
        }}
        className="w-full rounded-lg border border-border bg-surface-muted px-3.5 py-2.5 text-xs text-primary outline-none focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
      />
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Cores de mostruário"
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-xl"
        >
          {loading && (
            <p role="status" className="p-2 text-xs text-muted">
              Carregando cores...
            </p>
          )}
          {error && (
            <p role="alert" className="p-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {!loading && !filtered.length && (
            <p className="p-3 text-xs text-muted">Nenhuma cor encontrada.</p>
          )}
          {filtered.map((color, index) => {
            const selected = value.some((item) => key(item) === key(color));
            return (
              <button
                key={key(color)}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  toggle(color);
                  inputRef.current?.focus();
                }}
                className={`flex w-full items-center gap-3 rounded p-3 text-left text-xs ${index === activeIndex ? 'bg-accent-camel/10' : 'hover:bg-surface-muted'}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-accent-camel bg-accent-camel text-on-camel' : 'border-dashed border-border text-muted'}`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <span>
                  <span className="block font-semibold">{color.nome}</span>
                  {color.codigo && <span className="mt-1 block text-muted">{color.codigo}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
