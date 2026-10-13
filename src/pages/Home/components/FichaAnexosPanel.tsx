import { useEffect, useState } from 'react';
import { Download, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { FichaAnexo, FichaAnexoCategoria } from '../../../services/fichaAnexosStorage';
import {
  useFichaAnexos,
  type FichaAnexosController,
  type FichaAnexosOptions,
} from './useFichaAnexos';

const GROUPS: Array<{
  categoria: FichaAnexoCategoria;
  title: string;
  prompt: string;
  image: boolean;
  accept?: string;
}> = [
  {
    categoria: 'variantes',
    title: 'Variantes',
    prompt: 'Adicionar imagens de Variantes',
    image: true,
    accept: 'image/*',
  },
  {
    categoria: 'referencias',
    title: 'Referência',
    prompt: 'Adicionar imagens de Referência',
    image: true,
    accept: 'image/*',
  },
  {
    categoria: 'desenhos',
    title: 'Desenho Técnico',
    prompt: 'Adicionar imagens de Desenho Técnico',
    image: true,
    accept: 'image/*',
  },
  {
    categoria: 'projeto',
    title: 'Arquivos do projeto',
    prompt: 'Enviar arquivo de projeto',
    image: false,
    accept: '.cdr,.cpt,.ai,.eps,.psd,.psb,.pdf',
  },
  { categoria: 'outros', title: 'Outros arquivos', prompt: 'Enviar outro arquivo', image: false },
];

function AnexoCard({
  item,
  disabled,
  onRemove,
}: {
  item: FichaAnexo;
  disabled: boolean;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState('');
  const [previewFailed, setPreviewFailed] = useState(false);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(item.arquivo);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [item.arquivo]);
  return (
    <article className="rounded-xl border border-border bg-surface p-3 space-y-2">
      {url && item.tipo.startsWith('image/') && !previewFailed ? (
        <img
          src={url}
          alt={item.nome}
          onError={() => setPreviewFailed(true)}
          className="max-h-64 w-full rounded-lg object-contain"
        />
      ) : (
        <FileText className="h-8 w-8 text-muted" />
      )}
      <p className="break-words text-xs font-semibold">{item.nome}</p>
      <p className="text-[11px] text-muted">
        {(item.tamanho / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} MB
      </p>
      <div className="flex flex-wrap gap-3 text-xs">
        {url && (
          <a
            href={url}
            download={item.nome}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> Baixar
          </a>
        )}
        <button
          type="button"
          disabled={disabled}
          aria-label={`Remover anexo ${item.nome}`}
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remover
        </button>
      </div>
    </article>
  );
}

export function FichaAnexosPanel(props: FichaAnexosOptions) {
  const controller = useFichaAnexos(props);
  return <FichaAnexosContent {...controller} />;
}

export function FichaAnexosContent({
  shared,
  items,
  loading,
  busy,
  dragging,
  error,
  status,
  disabled,
  setDragging,
  upload,
  remove,
}: FichaAnexosController) {
  return (
    <aside
      aria-label="Anexos da ficha técnica"
      className="space-y-4 rounded-card border border-border bg-surface p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-editorial text-lg font-semibold">Anexos</h2>
        <span className="text-xs text-muted">{items.length} arquivo(s) · automático</span>
      </div>
      {loading && (
        <p role="status" className="text-xs text-muted">
          Carregando anexos…
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {status && (
        <p role="status" className="text-xs text-muted-foreground">
          {status}
        </p>
      )}
      {GROUPS.map((group) => (
        <details
          key={group.categoria}
          aria-label={group.title}
          className="group rounded-control border border-border p-3"
          open={items.some((item) => item.categoria === group.categoria) || undefined}
        >
          <summary className="flex min-h-8 cursor-pointer items-center justify-between gap-2 text-sm font-semibold">
            {group.title}
            <span className="text-xs font-normal text-muted">
              {items.filter((item) => item.categoria === group.categoria).length} · Adicionar
            </span>
          </summary>
          <div className="mt-3 space-y-2">
            {group.categoria === 'projeto' && (
              <p className="text-[11px] text-muted">
                Adicione aqui seu projeto do Corel, Illustrator, Photoshop ou PDF
              </p>
            )}
            {items
              .filter((item) => item.categoria === group.categoria)
              .map((item) => (
                <AnexoCard
                  key={item.id}
                  item={item}
                  disabled={disabled || !!busy}
                  onRemove={() => void remove(item)}
                />
              ))}
            <label
              onDragOver={(event) => {
                event.preventDefault();
                if (!disabled && !busy && !loading) setDragging(group.categoria);
              }}
              onDragLeave={() => setDragging(null)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(null);
                void upload(group.categoria, Array.from(event.dataTransfer.files));
              }}
              className={`flex ${group.image ? 'min-h-36 flex-col' : 'min-h-10'} items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-surface p-3 text-center transition-colors focus-within:border-accent-camel ${busy || loading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-accent-camel'} ${dragging === group.categoria ? 'border-accent-camel bg-accent-camel/10' : 'border-border'}`}
            >
              {group.image ? (
                <ImageIcon className="h-6 w-6 text-muted" />
              ) : (
                <FileText className="h-4 w-4 text-muted" />
              )}
              <span className="text-xs font-semibold">{group.prompt}</span>
              <input
                type="file"
                multiple
                accept={group.accept}
                aria-label={group.prompt}
                disabled={disabled || !!busy || loading}
                className="sr-only"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = '';
                  void upload(group.categoria, files);
                }}
              />
            </label>
            <p className="text-[10px] text-muted">
              {busy === group.categoria
                ? 'Salvando…'
                : `Clique ou arraste. Até ${group.image ? '10' : '100'} MB por arquivo.`}
            </p>
          </div>
        </details>
      ))}
      <p className="text-[11px] text-muted">
        {shared
          ? 'Anexos compartilhados pelo servidor com os usuários autorizados da marca.'
          : 'Anexos salvos automaticamente neste navegador. Limpar os dados do site remove estas cópias.'}
      </p>
    </aside>
  );
}
