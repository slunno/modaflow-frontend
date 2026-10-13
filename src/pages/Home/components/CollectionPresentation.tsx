import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Info, Plus, X } from 'lucide-react';
import { Button, Dialog } from '../../../components/ui/FichaPrimitives';
import { getMaterialColorAppearance } from './materialColorAppearance';

export function CollectionDialog({
  title,
  onClose,
  children,
  className = 'max-w-4xl',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  const close = useCallback(() => closeRef.current(), []);
  return (
    <Dialog
      title={title}
      onClose={close}
      closeLabel="Fechar"
      className={`collection-workspace ${className}`}
    >
      {children}
    </Dialog>
  );
}
export function CollectionNotice({
  message,
  onRetry,
  busy = false,
}: {
  message: string;
  onRetry?: () => void;
  busy?: boolean;
}) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-control border border-accent-camel/25 bg-accent-camel/5 p-4 text-sm"
    >
      <Info aria-hidden="true" className="h-4 w-4 shrink-0 text-accent-camel" />
      <p className="min-w-0 flex-1 basis-48 text-muted">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} disabled={busy}>
          {busy ? 'Consultando…' : 'Tentar novamente'}
        </Button>
      )}
    </div>
  );
}
export function CollectionColorChips({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const [draft, setDraft] = useState('');
  const selected = value
    .split(',')
    .map((color) => color.trim())
    .filter(Boolean);
  const add = () => {
    const next = [
      ...new Set([
        ...selected,
        ...draft
          .split(',')
          .map((color) => color.trim())
          .filter(Boolean),
      ]),
    ];
    onChange(next.join(', '));
    setDraft('');
  };
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm font-semibold">Cores do tema</legend>
      <div className="flex flex-wrap gap-2">
        {selected.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted py-1 pl-2 pr-1 text-xs"
          >
            <span
              aria-hidden="true"
              className="h-4 w-4 rounded-full border border-border"
              style={{
                background: getMaterialColorAppearance({ id: name, nome: name, hex: '' })
                  .background,
              }}
            />
            {name}
            <button
              type="button"
              aria-label={`Remover cor ${name}`}
              onClick={() => onChange(selected.filter((color) => color !== name).join(', '))}
              className="rounded-full p-2 hover:bg-border"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <label className="min-w-0 flex-1 text-xs text-muted">
          Escolher ou digitar cor
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add();
              }
            }}
            list="collection-theme-color-options"
            className="mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-primary"
            placeholder="Nome da cor"
          />
        </label>
        <Button
          className="self-end"
          onClick={add}
          disabled={!draft.trim()}
          aria-label="Incluir cor no tema"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <datalist id="collection-theme-color-options">
        {options
          .filter((name) => !selected.includes(name))
          .map((name) => (
            <option key={name} value={name} />
          ))}
      </datalist>
      <p className="text-xs text-muted">Escolha várias cores ou inclua um nome personalizado.</p>
    </fieldset>
  );
}
