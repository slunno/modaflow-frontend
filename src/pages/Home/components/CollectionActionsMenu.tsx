import { useEffect, useId, useRef, useState } from 'react';
import { Archive, ArchiveRestore, MoreVertical, Trash2 } from 'lucide-react';
import './collectionActions.css';

export function CollectionActionsMenu({
  name,
  archived,
  canRestore,
  onArchive,
  onDelete,
}: {
  name: string;
  archived: boolean;
  canRestore: boolean;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const initialItem = useRef<'first' | 'last'>('first');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const items = menu.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    (initialItem.current === 'last'
      ? items?.item((items?.length ?? 1) - 1)
      : items?.item(0)
    )?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div
      ref={root}
      className="relative shrink-0"
      onClick={(event) => event.stopPropagation()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={`Opções da coleção ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className="collection-actions-trigger flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-surface-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-camel"
        onClick={() => {
          initialItem.current = 'first';
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            initialItem.current = event.key === 'ArrowUp' ? 'last' : 'first';
            setOpen(true);
          }
        }}
      >
        <MoreVertical aria-hidden="true" className="h-4 w-4" />
      </button>
      {open && (
        <div
          ref={menu}
          id={id}
          role="menu"
          aria-label={`Ações da coleção ${name}`}
          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-border bg-surface p-1.5 text-xs font-medium text-primary shadow-lg"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              close();
            } else if (event.key === 'Tab') {
              close();
            } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              const items = Array.from(
                menu.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []
              );
              const current = items.indexOf(document.activeElement as HTMLButtonElement);
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? items.length - 1
                    : (current + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length;
              items[next]?.focus();
            }
          }}
        >
          <button
            type="button"
            role="menuitem"
            disabled={archived && !canRestore}
            title={archived && !canRestore ? 'Esta coleção já estava arquivada.' : undefined}
            onClick={() => {
              close();
              onArchive();
            }}
            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-surface-muted focus:bg-surface-muted focus:outline-none disabled:cursor-default disabled:opacity-50"
          >
            {archived ? (
              <ArchiveRestore aria-hidden="true" className="h-4 w-4 text-accent-camel" />
            ) : (
              <Archive aria-hidden="true" className="h-4 w-4 text-accent-camel" />
            )}
            {archived ? (canRestore ? 'Desarquivar' : 'Arquivada') : 'Arquivar'}
          </button>
          <div role="separator" className="my-1 border-t border-border-muted" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              onDelete();
            }}
            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:outline-none dark:text-rose-400"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}
