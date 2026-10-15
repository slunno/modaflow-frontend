import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = Array.from({ length: 12 }, (_, month) =>
  new Date(2026, month, 1).toLocaleDateString('pt-BR', { month: 'long' })
);

// Datas da coleção são dias locais, não instantes UTC.
function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return dateKey(date) === value ? date : null;
}

export function CollectionDeliveryDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const focusDay = useRef(false);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => parseDate(value) ?? new Date());
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const today = dateKey(new Date());
  const selected = parseDate(value);
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - monthStart.getDay());
  const days = Array.from(
    { length: 42 },
    (_, index) => new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + index)
  );

  useLayoutEffect(() => {
    if (!open) return;
    const reposition = () => {
      const field = trigger.current?.getBoundingClientRect();
      const calendar = panel.current?.getBoundingClientRect();
      if (!field || !calendar) return;
      const below = field.bottom + 8;
      const top =
        below + calendar.height <= window.innerHeight - 12
          ? below
          : Math.max(12, field.top - calendar.height - 8);
      setPosition({
        top,
        left: Math.max(12, Math.min(field.left, window.innerWidth - calendar.width - 12)),
      });
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target))
        setOpen(false);
    };
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    document.addEventListener('pointerdown', outside);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !focusDay.current) return;
    panel.current?.querySelector<HTMLButtonElement>(`[data-date="${dateKey(cursor)}"]`)?.focus();
    focusDay.current = false;
  }, [open, cursor]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const choose = (date: string) => {
    onChange(date);
    close();
  };
  const moveMonth = (offset: number) => {
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + offset + 1, 0).getDate();
    setCursor(
      new Date(cursor.getFullYear(), cursor.getMonth() + offset, Math.min(cursor.getDate(), last))
    );
  };
  const navigateDay = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -date.getDay(),
      End: 6 - date.getDay(),
    };
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      focusDay.current = true;
      moveMonth(event.key === 'PageUp' ? -1 : 1);
    } else if (offsets[event.key] !== undefined) {
      event.preventDefault();
      focusDay.current = true;
      setCursor(
        new Date(date.getFullYear(), date.getMonth(), date.getDate() + offsets[event.key]!)
      );
    }
  };

  return (
    <div
      ref={container}
      onKeyDown={(event) => {
        if (open && event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label id={`${id}-label`} className="mb-2 block text-xs font-semibold text-primary">
        Data de entrega <span className="ml-1 font-normal text-muted-foreground">(opcional)</span>
      </label>
      <button
        ref={trigger}
        type="button"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={open ? `${id}-calendar` : undefined}
        onClick={() => {
          if (open) return close();
          setCursor(selected ?? new Date());
          focusDay.current = true;
          setOpen(true);
        }}
        className={`flex min-h-12 w-full items-center gap-3 rounded-xl border bg-surface px-3.5 py-2.5 text-left text-sm transition-colors hover:border-accent-camel/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-camel ${open ? 'border-accent-camel' : 'border-border'}`}
      >
        <CalendarDays
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-accent-camel"
          strokeWidth={1.6}
        />
        <span
          id={`${id}-value`}
          className={`flex-1 ${selected ? 'font-medium text-primary' : 'text-muted-foreground'}`}
        >
          {selected ? selected.toLocaleDateString('pt-BR') : 'Selecionar uma data'}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <input type="hidden" name="dataEntrega" value={value} />
      {open && (
        <div
          ref={panel}
          id={`${id}-calendar`}
          role="group"
          aria-label="Calendário da data de entrega"
          style={position}
          className="fixed z-[110] max-h-[calc(100dvh-24px)] w-[320px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-2xl border border-border bg-surface p-3 text-primary shadow-xl"
        >
          <div className="mb-3 flex items-center gap-1">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => moveMonth(-1)}
              className="rounded-lg p-2 hover:bg-surface-muted focus-visible:outline-accent-camel"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <div className="flex flex-1 items-center justify-center gap-1">
              <select
                aria-label="Mês da entrega"
                value={cursor.getMonth()}
                onChange={(event) =>
                  setCursor(new Date(cursor.getFullYear(), Number(event.target.value), 1))
                }
                className="min-w-0 max-w-28 rounded-md bg-surface py-1 text-xs font-semibold capitalize focus-visible:outline-accent-camel"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                aria-label="Ano da entrega"
                value={cursor.getFullYear()}
                onChange={(event) =>
                  setCursor(new Date(Number(event.target.value), cursor.getMonth(), 1))
                }
                className="rounded-md bg-surface py-1 text-xs font-semibold focus-visible:outline-accent-camel"
              >
                {Array.from(
                  new Set([
                    ...Array.from(
                      { length: 26 },
                      (_, index) => new Date().getFullYear() - 10 + index
                    ),
                    cursor.getFullYear(),
                  ])
                )
                  .sort((a, b) => a - b)
                  .map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => moveMonth(1)}
              className="rounded-lg p-2 hover:bg-surface-muted focus-visible:outline-accent-camel"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <div
            role="grid"
            aria-label={cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          >
            <div role="row" className="mb-1 grid grid-cols-7">
              {weekdays.map((day) => (
                <span
                  key={day}
                  role="columnheader"
                  className="py-1 text-center text-[10px] font-semibold text-muted-foreground"
                >
                  {day}
                </span>
              ))}
            </div>
            {Array.from({ length: 6 }, (_, week) => (
              <div key={week} role="row" className="grid grid-cols-7 gap-0.5">
                {days.slice(week * 7, week * 7 + 7).map((date) => {
                  const key = dateKey(date);
                  const active = key === value;
                  return (
                    <div key={key} role="gridcell" aria-selected={active}>
                      <button
                        type="button"
                        data-date={key}
                        aria-label={date.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        aria-current={key === today ? 'date' : undefined}
                        tabIndex={key === dateKey(cursor) ? 0 : -1}
                        onClick={() => choose(key)}
                        onKeyDown={(event) => navigateDay(event, date)}
                        className={`my-0.5 flex h-8 w-full items-center justify-center rounded-lg text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-camel ${active ? 'bg-accent-camel font-semibold text-on-camel' : date.getMonth() !== cursor.getMonth() ? 'text-muted-foreground/60 hover:bg-surface-muted' : 'hover:bg-accent-camel/10'} ${key === today && !active ? 'font-bold ring-1 ring-inset ring-accent-camel/50' : ''}`}
                      >
                        {date.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border-muted pt-2">
            <button
              type="button"
              onClick={() => choose(today)}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-accent-camel hover:bg-accent-camel/10"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => choose('')}
              className="rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-surface-muted"
            >
              Limpar data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
