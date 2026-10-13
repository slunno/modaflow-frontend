import { useEffect, useId, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  PRODUCT_USO_EVENT,
  isProductUsoStorageKey,
  normalizeProductUso,
  readProductUsos,
  saveProductUso,
} from '../../../services/productUsoStorage';

interface Props {
  storageKey: string;
  produto: string;
  label: string;
  placeholder: string;
  listLabel: string;
  description: string;
  saveLabel: string;
  savedMessage: string;
  emptyMessage: string;
  removeOption?: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export function ProductOptionField({
  storageKey,
  produto,
  label,
  placeholder,
  listLabel,
  description,
  saveLabel,
  savedMessage,
  emptyMessage,
  value,
  onChange,
  removeOption,
}: Props) {
  const listId = useId();
  const [options, setOptions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reload = () => {
      try {
        setOptions(readProductUsos(storageKey));
        setError('');
      } catch {
        setOptions([]);
        setError('Não foi possível ler as opções salvas neste navegador.');
      }
    };
    const handleLocalSave = (event: Event) => {
      if (isProductUsoStorageKey((event as CustomEvent<string>).detail, storageKey)) reload();
    };
    const handleStorage = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        (event.key === null || isProductUsoStorageKey(event.key, storageKey))
      )
        reload();
    };
    reload();
    window.addEventListener(PRODUCT_USO_EVENT, handleLocalSave);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(PRODUCT_USO_EVENT, handleLocalSave);
      window.removeEventListener('storage', handleStorage);
    };
  }, [storageKey]);

  const filtered = options.filter((option) =>
    normalizeProductUso(option).includes(normalizeProductUso(query))
  );
  const activeIndex = Math.min(index, Math.max(0, filtered.length - 1));
  const openOptions = () => {
    setOpen(true);
    setQuery('');
    setIndex(0);
  };
  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    setStatus('');
  };
  const save = () => {
    if (!query.trim() || !produto.trim()) return;
    try {
      saveProductUso(storageKey, query);
      onChange(query.trim());
      setOpen(false);
      setError('');
      setStatus(savedMessage);
    } catch {
      setStatus('');
      setError('Não foi possível salvar a opção. Verifique o armazenamento do navegador.');
    }
  };

  return (
    <div
      className="space-y-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label
        htmlFor={`${listId}-input`}
        className="block text-xs font-semibold text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={`${listId}-input`}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={
            open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined
          }
          value={open ? query : value}
          onFocus={openOptions}
          onClick={() => {
            if (!open) openOptions();
          }}
          onChange={(event) => {
            onChange(event.target.value);
            setQuery(event.target.value);
            setOpen(true);
            setIndex(0);
            setStatus('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              setOpen(false);
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              if (!open) openOptions();
              else setIndex(Math.min(activeIndex + 1, Math.max(0, filtered.length - 1)));
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              if (!open) openOptions();
              else setIndex(Math.max(activeIndex - 1, 0));
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              if (!open) openOptions();
              else if (filtered[activeIndex]) choose(filtered[activeIndex]);
              else save();
            }
          }}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-border bg-surface-muted px-3 py-2 pr-9 text-primary outline-none focus:border-accent-camel"
        />
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted"
        />
        {open && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-lg border border-border bg-surface p-2 shadow-xl">
            <div
              id={listId}
              role="listbox"
              aria-label={listLabel}
              className="max-h-44 overflow-y-auto"
            >
              {filtered.map((option, position) => (
                <button
                  key={option}
                  id={`${listId}-${position}`}
                  type="button"
                  role="option"
                  aria-selected={normalizeProductUso(value) === normalizeProductUso(option)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-left text-xs ${position === activeIndex ? 'bg-surface-muted' : 'hover:bg-surface-muted'}`}
                >
                  {option}
                  {normalizeProductUso(value) === normalizeProductUso(option) && (
                    <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-accent-camel" />
                  )}
                </button>
              ))}
            </div>
            {!filtered.length && (
              <p className="p-2 text-xs text-muted">
                {query.trim()
                  ? 'Nenhuma opção encontrada. Salve o texto digitado para cadastrá-la.'
                  : emptyMessage}
              </p>
            )}
            <div className="mt-2 border-t border-border pt-2">
              <button
                type="button"
                disabled={!query.trim() || !produto.trim()}
                onClick={save}
                className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted disabled:opacity-50"
              >
                {saveLabel}
              </button>
              {removeOption &&
                value &&
                options.some(
                  (option) => normalizeProductUso(option) === normalizeProductUso(value)
                ) && (
                  <button
                    type="button"
                    aria-label={`Remover ${value} do catálogo de ${label}`}
                    className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs text-red-600 hover:bg-surface-muted dark:text-red-400"
                    onClick={() => {
                      try {
                        removeOption(value);
                        setOpen(false);
                        setStatus(`Opção removida do catálogo de ${label}.`);
                        setError('');
                      } catch {
                        setError(
                          'Não foi possível remover a opção. Verifique o armazenamento do navegador.'
                        );
                      }
                    }}
                  >
                    Remover do catálogo
                  </button>
                )}
              {removeOption && value && (
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs hover:bg-surface-muted"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                    setStatus('');
                  }}
                >
                  Limpar seleção
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted">{description}</p>
      {status && (
        <p role="status" className="text-muted-foreground">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
