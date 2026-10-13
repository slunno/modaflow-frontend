import { useEffect, useId, useState } from 'react';
import { getLinxFornecedores, type LinxFornecedor } from '../../../services/linxService';

interface Props {
  value: LinxFornecedor;
  onChange: (value: LinxFornecedor) => void;
  showCode?: boolean;
  /** Quando informado, pesquisa somente no catálogo já filtrado do material/cor. */
  options?: LinxFornecedor[];
}

/** Pesquisa no servidor; nome e código sempre identificam o mesmo registro. */
export function LinxFornecedorPicker({ value, onChange, showCode = true, options }: Props) {
  const id = useId();
  const [field, setField] = useState<'fornecedor' | 'codigo' | null>(null);
  const [query, setQuery] = useState('');
  const [remoteResults, setResults] = useState<LinxFornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const termo = query.trim().toLocaleLowerCase('pt-BR');
  const results =
    options === undefined
      ? remoteResults
      : options.filter(
          (supplier) =>
            supplier.fornecedor.toLocaleLowerCase('pt-BR').includes(termo) ||
            supplier.codigo.toLocaleLowerCase('pt-BR').includes(termo)
        );
  const isLoading = options === undefined && loading;
  const lookupError = options === undefined ? error : '';

  useEffect(() => {
    if (!field || options !== undefined) return;
    let active = true;
    const timer = window.setTimeout(() => {
      getLinxFornecedores(query)
        .then((data) => {
          if (active) {
            setResults(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setError('Não foi possível consultar os fornecedores. Tente novamente.');
            setLoading(false);
          }
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [field, query, options]);

  const search = (nextField: 'fornecedor' | 'codigo', text: string) => {
    setField(nextField);
    setQuery(text);
    setResults([]);
    setLoading(true);
    setError('');
    setIndex(0);
  };
  const choose = (supplier: LinxFornecedor) => {
    onChange(supplier);
    setField(null);
  };

  return (
    <div
      className={`relative grid grid-cols-1 ${showCode ? 'sm:grid-cols-2' : ''} gap-2 flex-1`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setField(null);
      }}
    >
      {(showCode ? (['fornecedor', 'codigo'] as const) : (['fornecedor'] as const)).map((key) => (
        <label key={key} className="block space-y-1 text-xs font-semibold text-muted-foreground">
          {key === 'fornecedor' ? 'Fornecedor' : 'Código do fornecedor'}
          <input
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={field === key}
            aria-controls={`${id}-options`}
            aria-activedescendant={field === key && results[index] ? `${id}-${index}` : undefined}
            value={field === key ? query : value[key]}
            onFocus={() => search(key, '')}
            onChange={(event) => search(key, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                setField(null);
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setIndex((previous) => Math.min(previous + 1, results.length - 1));
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setIndex((previous) => Math.max(previous - 1, 0));
              }
              if (event.key === 'Enter' && field === key) {
                event.preventDefault();
                if (results[index]) choose(results[index]);
              }
            }}
            placeholder={key === 'fornecedor' ? 'Pesquisar pelo nome' : 'Pesquisar pelo código'}
            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-primary"
          />
        </label>
      ))}
      {field && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-lg border border-border bg-surface p-2 shadow-xl">
          <p className="text-[11px] text-muted mb-1">
            {options === undefined
              ? 'Até 50 resultados. Digite para buscar nos fornecedores ativos.'
              : 'Somente fornecedores ativos vinculados ao material e à cor selecionada.'}
          </p>
          {isLoading && (
            <p role="status" className="p-2 text-xs">
              Buscando fornecedores…
            </p>
          )}
          {lookupError && (
            <p role="alert" className="p-2 text-xs text-red-600 dark:text-red-400">
              {lookupError}
            </p>
          )}
          {!isLoading && !lookupError && results.length === 0 && (
            <p role="status" className="p-2 text-xs">
              Nenhum fornecedor encontrado.
            </p>
          )}
          <div
            id={`${id}-options`}
            role="listbox"
            aria-label="Fornecedores encontrados"
            className="max-h-44 overflow-y-auto"
          >
            {results.map((supplier, position) => (
              <button
                key={`${supplier.codigo}-${supplier.fornecedor}`}
                id={`${id}-${position}`}
                type="button"
                role="option"
                aria-selected={position === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(supplier)}
                className={`block w-full rounded px-2 py-2 text-left text-xs ${position === index ? 'bg-surface-muted' : 'hover:bg-surface-muted'}`}
              >
                {supplier.fornecedor} — {supplier.codigo}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
