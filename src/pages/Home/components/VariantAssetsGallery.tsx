import { useCallback, useId, useRef, useState } from 'react';
import { Download, Expand, FileText, ImageIcon, Plus } from 'lucide-react';
import { Button, Card, Dialog } from '../../../components/ui/FichaPrimitives';
import { FichaImageUpload } from './FichaImageUpload';
import type { FichaAnexosController } from './useFichaAnexos';

type AssetKind = 'piece' | 'drawing' | 'project';
const slots = [
  { id: 'piece', label: 'Imagem da peça', Icon: ImageIcon },
  { id: 'drawing', label: 'Desenho técnico', Icon: ImageIcon },
  { id: 'project', label: 'Arquivo de projeto', Icon: FileText },
] as const;

export function VariantAssetsGallery({
  name,
  photo,
  inherited,
  onImageChange,
  onImageFile,
  imageDisabled = false,
  controller,
  urls,
}: {
  name: string;
  photo?: string;
  inherited: boolean;
  onImageChange: (url: string | null, fileName?: string) => void | Promise<void>;
  onImageFile?: (file: File) => Promise<void>;
  imageDisabled?: boolean;
  controller: FichaAnexosController;
  urls: Record<string, string>;
}) {
  const [selected, setSelected] = useState<AssetKind>('piece');
  const [expanded, setExpanded] = useState(false);
  const refs = useRef(new Map<AssetKind, HTMLButtonElement>());
  const id = useId();
  const close = useCallback(() => setExpanded(false), []);
  const drawing = controller.items.filter((item) => item.categoria === 'desenhos').at(-1);
  const project = controller.items.filter((item) => item.categoria === 'projeto').at(-1);
  const file = selected === 'drawing' ? drawing : selected === 'project' ? project : undefined;
  const image =
    selected === 'piece' ? photo : selected === 'drawing' ? urls[file?.id ?? ''] : undefined;
  const url = urls[file?.id ?? ''];
  const label = slots.find((slot) => slot.id === selected)!.label;
  const isPdf =
    selected === 'project' &&
    !!file &&
    (file.tipo === 'application/pdf' || /\.pdf$/i.test(file.nome));
  const disabled = controller.disabled || controller.loading || !!controller.busy;
  const uploadLabel =
    selected === 'drawing'
      ? `${drawing ? 'Trocar' : 'Adicionar'} desenho técnico`
      : `${project ? 'Trocar' : 'Adicionar'} arquivo de projeto`;
  const upload = (files: File[]) => {
    if (selected !== 'piece')
      void controller.upload(selected === 'drawing' ? 'desenhos' : 'projeto', files.slice(0, 1));
  };

  return (
    <Card className="min-w-0" aria-label={`Imagens e arquivos — ${name}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs text-muted">
            {selected === 'piece'
              ? inherited
                ? 'Herdado da peça'
                : 'Específico desta variante'
              : 'Compartilhado com a peça'}
          </p>
        </div>
        {image && (
          <Button
            aria-label={
              selected === 'piece' ? `Ampliar imagem de ${name}` : 'Ampliar desenho técnico'
            }
            onClick={() => setExpanded(true)}
          >
            <Expand aria-hidden="true" className="h-4 w-4" /> Ampliar
          </Button>
        )}
      </div>
      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
        <div
          role="tablist"
          aria-label={`Visualizações da variante ${name}`}
          aria-orientation="vertical"
          className="space-y-2"
        >
          {slots.map((slot, index) => {
            const preview =
              slot.id === 'piece'
                ? photo
                : slot.id === 'drawing'
                  ? urls[drawing?.id ?? '']
                  : undefined;
            const present =
              slot.id === 'piece' ? !!photo : slot.id === 'drawing' ? !!drawing : !!project;
            return (
              <button
                key={slot.id}
                ref={(node) => {
                  if (node) refs.current.set(slot.id, node);
                  else refs.current.delete(slot.id);
                }}
                type="button"
                role="tab"
                aria-label={`Ver ${slot.label.toLocaleLowerCase('pt-BR')} de ${name}`}
                aria-selected={selected === slot.id}
                aria-controls={`${id}-preview`}
                tabIndex={selected === slot.id ? 0 : -1}
                onClick={() => setSelected(slot.id)}
                onKeyDown={(event) => {
                  if (
                    !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                      event.key
                    )
                  )
                    return;
                  event.preventDefault();
                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? slots.length - 1
                        : (index +
                            (event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1) +
                            slots.length) %
                          slots.length;
                  const target = slots[next]!;
                  setSelected(target.id);
                  refs.current.get(target.id)?.focus();
                }}
                className={`relative w-full rounded-control border p-2 text-center transition-colors ${selected === slot.id ? 'border-accent-camel bg-accent-camel/10 ring-1 ring-accent-camel' : 'border-border hover:bg-surface-muted'}`}
              >
                <span className="mb-2 flex h-16 items-center justify-center overflow-hidden rounded bg-surface-muted sm:h-24">
                  {preview ? (
                    <img src={preview} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <slot.Icon aria-hidden="true" className="h-5 w-5 text-muted" />
                  )}
                </span>
                <span className="block break-words text-xs leading-snug font-semibold">
                  {slot.label}
                </span>
                {!present && <span className="mt-1 block text-xs text-muted">Adicionar</span>}
              </button>
            );
          })}
        </div>
        <div
          id={`${id}-preview`}
          role="tabpanel"
          aria-label={`${label} — ${name}`}
          className="min-w-0"
        >
          {selected === 'piece' ? (
            <FichaImageUpload
              gallery
              label={`Imagem da peça — ${name}`}
              imageAlt={`Variante ${name}`}
              emptyMessage="Esta variante ainda não tem imagem"
              value={photo}
              onChange={onImageChange}
              onFileChange={onImageFile}
              disabled={imageDisabled}
            />
          ) : (
            <div className="flex min-h-80 items-center justify-center overflow-hidden rounded-control bg-surface-muted sm:min-h-[32rem] xl:min-h-[38rem]">
              {image ? (
                <img
                  src={image}
                  alt={`Desenho técnico — ${file?.nome}`}
                  className="max-h-[40rem] w-full object-contain"
                />
              ) : isPdf && url ? (
                <iframe
                  src={url}
                  title={`Prévia do projeto — ${file.nome}`}
                  className="h-80 w-full border-0 sm:h-[32rem] xl:h-[38rem]"
                />
              ) : (
                <div className="flex min-w-0 flex-col items-center gap-3 p-5 text-center text-muted">
                  {selected === 'project' ? (
                    <FileText aria-hidden="true" className="h-10 w-10" />
                  ) : (
                    <ImageIcon aria-hidden="true" className="h-10 w-10" />
                  )}
                  <p className="max-w-full break-words text-sm font-semibold">
                    {file?.nome ??
                      (selected === 'drawing'
                        ? 'Nenhum desenho técnico adicionado'
                        : 'Nenhum arquivo de projeto adicionado')}
                  </p>
                  <p className="text-xs">
                    {file
                      ? 'Este formato pode ser aberto ou baixado. A prévia não está disponível no navegador.'
                      : selected === 'drawing'
                        ? 'Adicione uma imagem de até 10 MB.'
                        : 'Adicione um arquivo de projeto ou PDF de até 100 MB.'}
                  </p>
                </div>
              )}
            </div>
          )}
          {selected !== 'piece' && (
            <div className="mt-4 space-y-3">
              {isPdf && (
                <p className="text-xs text-muted">
                  Se a prévia não aparecer, use Abrir arquivo ou Baixar arquivo.
                </p>
              )}
              {file && <p className="break-words text-xs text-muted">{file.nome}</p>}
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  upload(Array.from(event.dataTransfer.files));
                }}
                className={`relative inline-flex min-h-10 items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-sm font-semibold focus-within:ring-2 focus-within:ring-accent-camel ${disabled ? 'cursor-wait opacity-50' : 'cursor-pointer hover:bg-surface-muted'}`}
              >
                <Plus aria-hidden="true" className="h-4 w-4" /> {uploadLabel}
                <input
                  type="file"
                  aria-label={uploadLabel}
                  accept={selected === 'drawing' ? 'image/*' : '.cdr,.cpt,.ai,.eps,.psd,.psb,.pdf'}
                  disabled={disabled}
                  className="sr-only"
                  onChange={(event) => {
                    upload(Array.from(event.target.files ?? []));
                    event.target.value = '';
                  }}
                />
              </label>
              {url && file && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <a
                    href={url}
                    download={file.nome}
                    className="inline-flex min-h-9 items-center gap-1 underline"
                  >
                    <Download aria-hidden="true" className="h-4 w-4" /> Baixar arquivo
                  </a>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center underline"
                  >
                    Abrir arquivo
                  </a>
                </div>
              )}
              <p className="text-xs text-muted">
                Salvamento automático neste navegador ·{' '}
                {selected === 'drawing' ? 'até 10 MB' : 'até 100 MB'}. Arquivos anteriores ficam em
                Opções → Gerenciar anexos.
              </p>
            </div>
          )}
        </div>
      </div>
      {controller.loading && (
        <p role="status" className="mt-3 text-xs text-muted">
          Carregando anexos…
        </p>
      )}
      {controller.busy && (
        <p role="status" className="mt-3 text-xs text-muted">
          Salvando arquivo…
        </p>
      )}
      {controller.error && (
        <p role="alert" className="mt-3 text-sm text-status-error">
          {controller.error}
        </p>
      )}
      {controller.status && (
        <p role="status" className="mt-3 text-xs text-muted">
          {controller.status}
        </p>
      )}
      {expanded && image && (
        <Dialog
          title={selected === 'piece' ? `Imagem — ${name}` : 'Desenho técnico'}
          onClose={close}
        >
          <img
            src={image}
            alt={
              selected === 'piece'
                ? `Ampliação da variante ${name}`
                : `Ampliação do desenho técnico — ${file?.nome}`
            }
            className="max-h-[75dvh] w-full object-contain"
          />
        </Dialog>
      )}
    </Card>
  );
}
