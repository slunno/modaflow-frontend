import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import {
  MEDIDAS_MODELAGEM_KEY,
  cadastrarMedidaModelagem,
  lerMedidasModelagem,
  normalizarMedida,
  removerMedidaModelagem,
} from '../../../services/fichaModelagem';
import { getLocalStateSnapshot, subscribeLocalState } from '../../../services/localStateStorage';

const subscribe = (listener: () => void) => subscribeLocalState(MEDIDAS_MODELAGEM_KEY, listener);
const getSnapshot = () => getLocalStateSnapshot(MEDIDAS_MODELAGEM_KEY);

export function FichaMedidasPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (medidas: string[]) => void;
}) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const catalogo = useMemo(() => lerMedidasModelagem(snapshot), [snapshot]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const opcoes = [...new Set([...catalogo, ...value])].filter((nome) =>
    normalizarMedida(nome).includes(normalizarMedida(query))
  );

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, []);

  const toggle = (nome: string) =>
    onChange(value.includes(nome) ? value.filter((item) => item !== nome) : [...value, nome]);
  const create = () => {
    try {
      const nome = cadastrarMedidaModelagem(query);
      if (!value.includes(nome)) onChange([...value, nome]);
      setQuery('');
      setError('');
    } catch {
      setError('Não foi possível cadastrar a medida no navegador.');
    }
  };

  return (
    <div
      ref={root}
      className="space-y-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <label
        id={`${id}-label`}
        htmlFor={`${id}-trigger`}
        className="block font-semibold text-muted-foreground"
      >
        Medidas
      </label>
      <div className="relative">
        <button
          ref={trigger}
          id={`${id}-trigger`}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={`${id}-menu`}
          onClick={() => setOpen((previous) => !previous)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left outline-none focus:border-accent-camel"
        >
          <span className="text-muted">Clique para criar, remover ou selecionar</span>
          <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted" />
        </button>
        {open && (
          <div
            id={`${id}-menu`}
            role="dialog"
            aria-label="Selecionar medidas"
            className="absolute top-full left-0 z-40 mt-1 w-full rounded-lg border border-border bg-surface p-2 shadow-xl"
          >
            <input
              aria-label="Buscar ou criar medida"
              placeholder="Buscar ou criar medida"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && query.trim()) {
                  event.preventDefault();
                  create();
                }
              }}
              className="mb-2 w-full rounded border border-border bg-surface-muted px-2 py-1.5"
            />
            <div className="max-h-48 overflow-y-auto">
              {opcoes.map((nome) => (
                <div
                  key={nome}
                  className="flex items-center gap-2 rounded px-2 hover:bg-surface-muted"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      checked={value.includes(nome)}
                      onChange={() => toggle(nome)}
                      className="accent-accent-camel"
                    />
                    <span>{nome}</span>
                  </label>
                  {catalogo.includes(nome) && (
                    <button
                      type="button"
                      aria-label={`Remover ${nome} do catálogo de medidas`}
                      onClick={() => {
                        try {
                          removerMedidaModelagem(nome);
                          setError('');
                        } catch {
                          setError('Não foi possível remover a medida do catálogo.');
                        }
                      }}
                      className="rounded p-1.5 text-muted hover:text-red-600"
                    >
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {!opcoes.length && <p className="p-2 text-muted">Nenhuma medida encontrada.</p>}
            </div>
            <button
              type="button"
              disabled={!query.trim()}
              onClick={create}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-border px-2 py-1.5 font-semibold disabled:opacity-50"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" /> Criar medida
            </button>
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((nome) => (
            <button
              key={nome}
              type="button"
              aria-label={`Retirar ${nome} da tabela`}
              onClick={() => toggle(nome)}
              className="rounded border border-accent-camel/20 bg-accent-camel/10 px-1.5 py-0.5 text-accent-camel"
            >
              {nome} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
