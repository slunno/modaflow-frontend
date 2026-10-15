import React, { useRef, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';

interface FichaImageUploadProps {
  label: string;
  value?: string | null;
  onChange: (value: string | null, fileName?: string) => void | Promise<void>;
  onFileChange?: (file: File) => Promise<void>;
  disabled?: boolean;
  gallery?: boolean;
  imageAlt?: string;
  emptyMessage?: string;
}

export const FichaImageUpload: React.FC<FichaImageUploadProps> = ({
  label,
  value,
  onChange,
  onFileChange,
  disabled = false,
  gallery = false,
  imageAlt = label,
  emptyMessage,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const savingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const busy = disabled || saving;

  const loadFile = async (file?: File) => {
    if (!file || disabled || savingRef.current) return;
    setStatus('');
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.');
      return;
    }
    const limitMb = onFileChange ? 10 : 2;
    if (file.size > limitMb * 1024 * 1024) {
      setError(`A imagem deve ter no máximo ${limitMb} MB.`);
      return;
    }
    setError('');
    savingRef.current = true;
    setSaving(true);
    try {
      if (onFileChange) {
        await onFileChange(file);
        setStatus('Imagem salva.');
      } else {
        const result = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            typeof reader.result === 'string'
              ? resolve(reader.result)
              : reject(new Error('Não foi possível ler a imagem.'));
          reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
          reader.readAsDataURL(file);
        });
        await onChange(result, file.name);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a imagem.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className={gallery ? 'sr-only' : 'block text-xs font-semibold text-muted-foreground'}>
        {label}
      </span>
      <label
        onDragEnter={(event) => {
          event.preventDefault();
          if (busy || !Array.from(event.dataTransfer.types).includes('Files')) return;
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = busy ? 'none' : 'copy';
          if (!busy && Array.from(event.dataTransfer.types).includes('Files')) setDragging(true);
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          dragDepth.current = 0;
          setDragging(false);
          if (busy || savingRef.current) return;
          if (event.dataTransfer.files.length > 1) {
            setStatus('');
            setError('Adicione uma imagem por vez.');
            return;
          }
          void loadFile(event.dataTransfer.files?.[0]);
        }}
        className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-center transition-colors focus-within:ring-2 focus-within:ring-accent-camel ${gallery ? 'min-h-80 gap-3 bg-surface-muted sm:min-h-[32rem] xl:min-h-[38rem]' : 'min-h-28 p-4'} ${busy ? 'cursor-wait opacity-70' : 'cursor-pointer'} ${dragging ? 'border-accent-camel bg-accent-camel/10 ring-2 ring-accent-camel' : 'border-border bg-surface-muted/50 hover:border-accent-camel'}`}
      >
        {value ? (
          <img
            src={value}
            alt={imageAlt}
            draggable={false}
            className={
              gallery
                ? 'max-h-[40rem] w-full object-contain'
                : 'max-h-40 max-w-full rounded object-contain'
            }
          />
        ) : (
          <>
            <Upload
              aria-hidden="true"
              className={gallery ? 'h-10 w-10 text-muted' : 'mb-2 h-6 w-6 text-muted'}
            />
            {emptyMessage && <span className="px-4 text-sm text-muted">{emptyMessage}</span>}
            <span className="text-xs font-medium text-primary">
              Arraste uma imagem ou clique para selecionar
            </span>
          </>
        )}
        {gallery && (
          <span
            className={
              value
                ? 'absolute inset-x-3 bottom-3 rounded-lg bg-surface/95 p-2 text-xs text-muted'
                : 'text-xs text-muted'
            }
          >
            {value
              ? 'Arraste outra imagem aqui para substituir'
              : `Até ${onFileChange ? 10 : 2} MB`}
            {onFileChange ? ' · salvamento automático' : ''}
          </span>
        )}
        {dragging && !busy && (
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface/95 p-5 text-sm font-semibold text-accent-camel"
            role="status"
          >
            Solte a imagem para salvar
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          aria-label={label}
          disabled={busy}
          className="sr-only"
          onChange={(event) => {
            void loadFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      {gallery && (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="mr-4 min-h-9 text-sm font-semibold text-accent-camel hover:underline"
        >
          Trocar imagem
        </button>
      )}
      {value && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (savingRef.current) return;
            savingRef.current = true;
            setError('');
            setStatus('');
            setSaving(true);
            try {
              await onChange(null);
            } catch (cause) {
              setError(
                cause instanceof Error ? cause.message : 'Não foi possível remover a imagem.'
              );
            } finally {
              savingRef.current = false;
              setSaving(false);
            }
          }}
          className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remover imagem
        </button>
      )}
      {(saving || status) && (
        <p role="status" className="text-xs text-muted">
          {saving ? 'Salvando imagem…' : status}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
