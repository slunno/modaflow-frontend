import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Check, Circle, Clock3, Minus, X, ImageIcon } from 'lucide-react';

export type FichaStatus = 'draft' | 'pending' | 'complete' | 'late' | 'error' | 'neutral' | 'na';
const statuses = {
  draft: ['Rascunho', 'text-status-draft', Circle],
  pending: ['Pendente', 'text-status-pending', Clock3],
  complete: ['Completa', 'text-status-complete', Check],
  late: ['Atrasado', 'text-status-late', Clock3],
  error: ['Erro', 'text-status-error', X],
  neutral: ['Sem avaliação', 'text-status-neutral', Circle],
  na: ['Não se aplica', 'text-status-neutral', Minus],
} as const;
export function StatusBadge({
  status,
  compact = false,
  label: customLabel,
}: {
  status: FichaStatus;
  compact?: boolean;
  label?: string;
}) {
  const [defaultLabel, color, Icon] = statuses[status];
  const label = customLabel ?? defaultLabel;
  return (
    <span
      className={`relative inline-flex items-center rounded-full text-xs font-medium ${compact ? 'shrink-0' : 'gap-1.5 px-2 py-1'} ${color}`}
      title={label}
    >
      <Icon aria-hidden="true" className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      <span className={compact ? 'sr-only' : ''}>{label}</span>
    </span>
  );
}
export function Card({ className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-card border border-border bg-surface p-5 shadow-card ${className}`}
      {...props}
    />
  );
}
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border-muted pb-4">
      <div>
        <h3 className="font-editorial text-lg font-semibold">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Button({
  variant = 'secondary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const style =
    variant === 'primary'
      ? 'border-accent-camel bg-accent-camel text-on-camel hover:bg-accent-camel/90'
      : variant === 'ghost'
        ? 'border-transparent hover:bg-surface-muted'
        : 'border-border bg-surface hover:bg-surface-muted';
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-control border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${style} ${className}`}
      {...props}
    />
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface-muted/50 p-6 text-center">
      <ImageIcon aria-hidden="true" className="h-7 w-7 text-muted" />
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}
export function Skeleton({
  label = 'Carregando…',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div role="status" className={`animate-pulse rounded-card bg-border-muted ${className}`}>
      <span className="sr-only">{label}</span>
    </div>
  );
}
export function Tooltip({
  text,
  children,
  className = '',
}: {
  text: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <span className={`group relative inline-flex ${className}`} tabIndex={0} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-52 -translate-x-1/2 rounded-control border border-border bg-surface p-3 text-xs font-normal text-primary shadow-lg group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  className = 'max-w-5xl',
  closeLabel = 'Fechar ampliação',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  closeLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    root?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        root?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
        ) ?? []
      );
      const first = focusable[0],
        last = focusable.at(-1);
      if (!first) {
        event.preventDefault();
        root?.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === root)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === root)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keydown, true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', keydown, true);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        className={`max-h-[92dvh] w-full overflow-auto rounded-card border border-border bg-surface p-5 text-primary shadow-xl ${className}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={id} className="font-editorial text-xl">
            {title}
          </h2>
          <Button aria-label={closeLabel} onClick={onClose}>
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
