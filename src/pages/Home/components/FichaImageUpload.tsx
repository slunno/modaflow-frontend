import React, { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';

interface FichaImageUploadProps {
  label: string;
  value?: string | null;
  onChange: (value: string | null, fileName?: string) => void | Promise<void>;
  onFileChange?: (file: File) => Promise<void>;
  disabled?: boolean;
}

export const FichaImageUpload: React.FC<FichaImageUploadProps> = ({
  label,
  value,
  onChange,
  onFileChange,
  disabled = false,
}) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const busy = disabled || saving;

  const loadFile = async (file?: File) => {
    if (!file || busy) return;
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
    if (onFileChange) {
      setSaving(true);
      try {
        await onFileChange(file);
        setStatus('Imagem salva.');
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a imagem.');
      } finally {
        setSaving(false);
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      onChange(typeof reader.result === 'string' ? reader.result : null, file.name);
    reader.onerror = () => setError('Não foi possível ler a imagem.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-muted-foreground">{label}</span>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void loadFile(event.dataTransfer.files?.[0]);
        }}
        className={`flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed p-card text-center transition-colors focus-within:ring-2 focus-within:ring-accent-camel ${dragging ? 'border-accent-camel bg-accent-camel/10' : 'border-border bg-surface-muted/50 hover:border-accent-camel'}`}
      >
        {value ? (
          <img src={value} alt={label} className="max-h-40 max-w-full rounded object-contain" />
        ) : (
          <>
            <Upload aria-hidden="true" strokeWidth={1.5} className="mb-2 h-4 w-4 text-muted" />
            <span className="text-xs font-medium text-primary">
              Arraste uma imagem ou clique para selecionar
            </span>
          </>
        )}
        <input
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
      {value && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
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
