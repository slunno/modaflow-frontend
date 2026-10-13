import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { TecidoCorItem } from '../../../types/gestao';
import { ColorToneEditor } from './ColorToneEditor';

export function CreateColorModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (color: TecidoCorItem) => void;
}) {
  const [hex, setHex] = useState('#456286');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [pantone, setPantone] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => previous?.focus();
  }, []);
  const field =
    'mt-1 block w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-primary focus:border-accent-camel focus:outline-none';
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-neutral-950/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Criar uma cor"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-xl"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
          if (event.key === 'Tab') {
            const controls = [
              ...event.currentTarget.querySelectorAll<HTMLElement>('button, input, [tabindex="0"]'),
            ];
            const first = controls[0],
              last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            }
            if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-editorial font-bold">Criar uma cor</h3>
          <button aria-label="Fechar criação de cor" type="button" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!/^#[0-9a-f]{6}$/i.test(hex)) {
              setError('Informe seis dígitos no hexadecimal.');
              return;
            }
            onCreate({
              id: crypto.randomUUID(),
              nome: name.trim(),
              codigo: code.trim() || undefined,
              hex,
              pantone: pantone.trim() || undefined,
            });
          }}
        >
          <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
            <div className="self-start rounded-lg border border-border p-3">
              <ColorToneEditor hex={hex} onChange={setHex} showRgb />
            </div>
            <div className="space-y-4 text-xs">
              <div>
                Cor escolhida
                <div
                  className="mt-2 h-9 rounded border border-border"
                  style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#456286' }}
                />
              </div>
              <p className="text-xs leading-relaxed text-muted">
                Escolha a tonalidade no painel ou informe os valores Hex e RGB.
              </p>
              <label className="block">
                Nome
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Azul Royal, Rosa, Amarelo"
                  className={field}
                />
              </label>
              <label className="block">
                Código (opcional)
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className={field}
                />
              </label>
              <label className="block">
                Código Pantone (opcional)
                <input
                  value={pantone}
                  onChange={(event) => setPantone(event.target.value)}
                  placeholder="Ex.: 19-4052"
                  className={field}
                />
              </label>
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-camel px-4 py-2 text-sm font-semibold text-on-camel"
            >
              Criar Cor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
