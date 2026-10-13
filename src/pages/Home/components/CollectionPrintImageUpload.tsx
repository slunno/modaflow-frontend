import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';

export function CollectionPrintImageUpload({
  value,
  focusUpload = false,
  onChange,
  onReadingChange,
}: {
  value?: string;
  focusUpload?: boolean;
  onChange: (image: string | undefined) => void;
  onReadingChange: (reading: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const uploadButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!focusUpload) return;
    const frame = window.requestAnimationFrame(() => uploadButton.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [focusUpload]);
  const reader = useRef<FileReader | null>(null);
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      const activeReader = reader.current;
      reader.current = null;
      activeReader?.abort();
    },
    []
  );

  const loadFile = (file?: File) => {
    if (!file) return;
    const previousReader = reader.current;
    reader.current = null;
    previousReader?.abort();
    setReading(false);
    onReadingChange(false);
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 1_000_000) {
      setError('A imagem deve ter até 1 MB.');
      return;
    }
    const nextReader = new FileReader();
    reader.current = nextReader;
    setError('');
    setReading(true);
    onReadingChange(true);
    const finish = () => {
      setReading(false);
      onReadingChange(false);
    };
    nextReader.onload = () => {
      if (reader.current !== nextReader) return;
      if (typeof nextReader.result === 'string') onChange(nextReader.result);
      else setError('Não foi possível ler a imagem. Tente novamente.');
      finish();
    };
    nextReader.onerror = () => {
      if (reader.current !== nextReader) return;
      setError('Não foi possível ler a imagem. Tente novamente.');
      finish();
    };
    nextReader.readAsDataURL(file);
  };

  return (
    <section aria-label="Imagem da estampa" className="space-y-3">
      <h3 className="text-sm font-semibold">Imagem da estampa</h3>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          loadFile(event.dataTransfer.files[0]);
        }}
        className={`grid items-center gap-5 rounded-xl border-2 border-dashed p-4 ${dragging ? 'border-accent-camel bg-accent-camel/10' : 'border-accent-camel/40 bg-surface-muted/50'}`}
      >
        <div className="flex h-64 sm:h-72 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
          {value ? (
            <img src={value} alt="Prévia da estampa" className="h-full w-full object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted">
              <ImagePlus aria-hidden="true" className="h-9 w-9" />
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <input
            ref={input}
            type="file"
            accept="image/*"
            aria-label="Arquivo de imagem da estampa"
            className="sr-only"
            onChange={(event) => {
              loadFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <button
            ref={uploadButton}
            type="button"
            onClick={() => input.current?.click()}
            disabled={reading}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-camel px-4 py-3 text-sm font-semibold text-on-camel hover:bg-accent-camel/90 disabled:opacity-50"
          >
            <Upload aria-hidden="true" className="h-5 w-5" />
            {value ? 'Trocar imagem' : 'Adicionar imagem'}
          </button>
          <p className="text-sm text-muted">
            Clique no botão ou arraste uma imagem para esta área.
          </p>
          <p className="text-xs text-muted">Arquivo de imagem de até 1 MB.</p>
          {value && (
            <button
              type="button"
              disabled={reading}
              className="text-xs text-muted underline underline-offset-4 hover:text-primary"
              onClick={() => {
                onChange(undefined);
                setError('');
              }}
            >
              Remover imagem
            </button>
          )}
        </div>
      </div>
      {reading && (
        <p role="status" className="text-sm text-muted">
          Carregando imagem…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}
