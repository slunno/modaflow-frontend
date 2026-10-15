import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Copy, Expand, ImageIcon, Plus } from 'lucide-react';
import type { FichaVariante } from '../../../types/ficha';
import type { CollectionPrintItem } from '../../../types/plm';
import {
  Button,
  Card,
  Dialog,
  SectionHeader,
  Skeleton,
  StatusBadge,
} from '../../../components/ui/FichaPrimitives';
import { FichaImageUpload } from './FichaImageUpload';
import { VariantAssetsGallery } from './VariantAssetsGallery';
import type { FichaAnexosController } from './useFichaAnexos';
import { SelectedPrintCard } from './SelectedPrintCard';

export function VariantGallery({
  images,
  name,
  inherited = false,
  upload,
  compact = false,
}: {
  images: string[];
  name: string;
  inherited?: boolean;
  upload?: ReactNode;
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const close = useCallback(() => setExpanded(false), []);
  const image = images[index] ?? images[0];
  return (
    <Card className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted">
          {compact
            ? 'Galeria da peça'
            : inherited
              ? 'Herdado da peça'
              : 'Específico desta variante'}
        </span>
        {image && (
          <Button aria-label={`Ampliar imagem de ${name}`} onClick={() => setExpanded(true)}>
            <Expand aria-hidden="true" className="h-4 w-4" /> Ampliar
          </Button>
        )}
      </div>
      <div
        className={`flex items-center justify-center overflow-hidden rounded-control bg-surface-muted ${!image ? (compact ? 'min-h-20' : 'min-h-gallery-empty') : 'min-h-gallery'}`}
      >
        {image ? (
          <img
            src={image}
            alt={`Variante ${name}`}
            className="max-h-gallery w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-muted">
            <ImageIcon aria-hidden="true" className="h-4 w-4" />
            <p>{compact ? 'Nenhuma imagem da peça' : 'Esta variante ainda não tem imagem'}</p>
            <p className="text-xs">
              {compact
                ? 'Adicione uma imagem na galeria de Anexos.'
                : 'Use Trocar imagem para adicionar uma referência.'}
            </p>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <Button
            aria-label="Imagem anterior"
            onClick={() => setIndex((index + images.length - 1) % images.length)}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <span className="text-xs">
            {index + 1} / {images.length}
          </span>
          <Button aria-label="Próxima imagem" onClick={() => setIndex((index + 1) % images.length)}>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      )}
      {upload && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-accent-camel">
            Trocar imagem
          </summary>
          <div className="mt-3">{upload}</div>
        </details>
      )}
      {expanded && image && (
        <Dialog title={`Imagem — ${name}`} onClose={close}>
          <img
            src={image}
            alt={`Ampliação da variante ${name}`}
            className="max-h-[75dvh] w-full object-contain"
          />
        </Dialog>
      )}
    </Card>
  );
}

export function VariantThumbnailStrip({
  variants,
  selected,
  onSelect,
  getPhoto,
  isPending,
  onAdd,
  disabled,
}: {
  variants: FichaVariante[];
  selected: string;
  onSelect: (id: string) => void;
  getPhoto: (item: FichaVariante, index: number) => string | undefined;
  isPending: (id: string) => boolean;
  onAdd: () => void;
  disabled: boolean;
}) {
  const refs = useRef(new Map<string, HTMLButtonElement>());
  return (
    <Card className="min-w-0">
      <p className="mb-3 text-xs text-muted">
        Selecione uma cor para editar a imagem e os insumos · Use as setas do teclado
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        <div role="tablist" aria-label="Selecionar variante" className="flex gap-3">
          {variants.map((item, index) => (
            <button
              ref={(node) => {
                if (node) refs.current.set(item.id, node);
                else refs.current.delete(item.id);
              }}
              key={item.id}
              type="button"
              role="tab"
              aria-label={`Selecionar variante ${item.nome}`}
              aria-selected={selected === item.id}
              aria-controls="variante-painel"
              tabIndex={selected === item.id ? 0 : -1}
              onClick={() => onSelect(item.id)}
              onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? variants.length - 1
                      : (index + (event.key === 'ArrowRight' ? 1 : -1) + variants.length) %
                        variants.length;
                const target = variants[next];
                if (target) {
                  onSelect(target.id);
                  refs.current.get(target.id)?.focus();
                  refs.current
                    .get(target.id)
                    ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
                }
              }}
              className={`w-32 shrink-0 rounded-control border p-2 text-left transition-colors ${selected === item.id ? 'border-accent-camel bg-accent-camel/10 ring-1 ring-accent-camel' : 'border-border hover:bg-surface-muted'}`}
            >
              <div className="mb-2 flex h-16 items-center justify-center overflow-hidden rounded-control bg-surface-muted">
                {getPhoto(item, index) ? (
                  <img src={getPhoto(item, index)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon aria-hidden="true" className="h-5 w-5 text-muted" />
                )}
              </div>
              <span className="block break-words text-xs font-semibold">
                {item.nome || 'Sem nome'}
              </span>
              <StatusBadge compact status={isPending(item.id) ? 'pending' : 'neutral'} />
            </button>
          ))}
        </div>
        <Button onClick={onAdd} disabled={disabled} className="w-32 shrink-0 border-dashed">
          + Nova variante
        </Button>
      </div>
    </Card>
  );
}

interface Props {
  variants: FichaVariante[];
  selected: FichaVariante;
  onSelect: (id: string) => void;
  getPhoto: (item: FichaVariante, index: number) => string | undefined;
  isPending: (id: string) => boolean;
  onNameChange: (name: string) => void;
  onImageChange: (url: string | null, fileName?: string) => void | Promise<void>;
  onImageFile?: (file: File) => Promise<void>;
  onAdd: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  disabled: boolean;
  loading: boolean;
  error: string;
  unsaved: boolean;
  inheritedImage: boolean;
  hasPrints: boolean;
  selectedPrint?: CollectionPrintItem;
  printReference?: string;
  onChoosePrint: () => void;
  assets?: { controller: FichaAnexosController; urls: Record<string, string> };
  materials: ReactNode;
  thirdParties: ReactNode;
}
export function VariantsTab({
  variants,
  selected,
  onSelect,
  getPhoto,
  isPending,
  onNameChange,
  onImageChange,
  onImageFile,
  onAdd,
  onDuplicate,
  onRemove,
  disabled,
  loading,
  error,
  unsaved,
  inheritedImage,
  hasPrints,
  selectedPrint,
  printReference,
  onChoosePrint,
  assets,
  materials,
  thirdParties,
}: Props) {
  const [creationOpen, setCreationOpen] = useState(false);
  const closeCreation = useCallback(() => setCreationOpen(false), []);
  const [renameOpen, setRenameOpen] = useState(false);
  const closeRename = useCallback(() => setRenameOpen(false), []);
  const index = variants.findIndex((item) => item.id === selected.id);
  const photo = getPhoto(selected, index);
  return (
    <section aria-label="Variantes da ficha">
      <SectionHeader
        title={`Variantes (${variants.length})`}
        description="Imagem, tecidos e aviamentos de cada cor, em um só lugar."
      />
      <p className="mb-3 text-xs text-muted">
        Somente a Principal (primeira variante) é preparada para o Linx. As demais variantes, cores
        personalizadas e imagens permanecem no portal.
      </p>
      {error && (
        <p role="alert" className="mb-3 text-status-error">
          {error}
        </p>
      )}
      {unsaved && (
        <p role="status" className="mb-3 text-sm text-status-draft">
          Salvando alterações da variante automaticamente…
        </p>
      )}
      <div
        id="variante-painel"
        role="tabpanel"
        aria-label={`Variante ${selected.nome}`}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <div className="min-w-0 space-y-5">
          {loading ? (
            <Skeleton className="h-96" />
          ) : assets ? (
            <VariantAssetsGallery
              key={selected.id}
              name={selected.nome}
              photo={photo}
              inherited={inheritedImage}
              onImageChange={onImageChange}
              onImageFile={onImageFile}
              imageDisabled={disabled}
              controller={assets.controller}
              urls={assets.urls}
            />
          ) : (
            <VariantGallery
              key={selected.id}
              images={photo ? [photo] : []}
              name={selected.nome}
              inherited={inheritedImage}
              upload={
                <FichaImageUpload
                  label={`Imagem da peça — ${selected.nome}`}
                  value={photo}
                  onChange={onImageChange}
                  onFileChange={onImageFile}
                  disabled={disabled}
                />
              }
            />
          )}
          <div>
            <VariantThumbnailStrip
              variants={variants}
              selected={selected.id}
              onSelect={onSelect}
              getPhoto={getPhoto}
              isPending={isPending}
              onAdd={() => setCreationOpen(true)}
              disabled={disabled}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="flex-1 text-xs text-muted">
                Use + Nova variante para começar vazia ou duplicar a variante selecionada.
              </p>
              <Button variant="ghost" disabled={disabled} onClick={() => setRenameOpen(true)}>
                Renomear variante
              </Button>
            </div>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-96" />
        ) : (
          <div key={selected.id} className="ficha-variant-enter min-w-0 space-y-4">
            {materials}
            {hasPrints && (
              <SelectedPrintCard
                key={selectedPrint?.id ?? printReference ?? ''}
                print={selectedPrint}
                reference={printReference}
                onChoose={onChoosePrint}
              />
            )}
            {thirdParties}
            {index > 0 && (
              <Button className="text-status-error" onClick={onRemove}>
                Remover variante
              </Button>
            )}
            <p className="text-xs text-muted">
              Grade e tamanhos: Herdado da peça. Tecidos e aviamentos: Específico desta variante.
            </p>
          </div>
        )}
      </div>
      {renameOpen && (
        <Dialog
          title="Renomear variante"
          onClose={closeRename}
          className="max-w-xl"
          closeLabel="Fechar nome da variante"
        >
          <label className="block text-sm font-semibold">
            Nome da variante {index === 0 ? '(principal)' : ''}
            <input
              autoFocus
              className="mt-2 w-full rounded-control border border-border bg-surface-muted px-3 py-2"
              value={selected.nome}
              onChange={(event) => onNameChange(event.target.value)}
            />
          </label>
          <div className="mt-5 flex justify-end">
            <Button onClick={closeRename}>Concluir</Button>
          </div>
        </Dialog>
      )}
      {creationOpen && (
        <Dialog
          title="Criar variante"
          onClose={closeCreation}
          className="max-w-2xl"
          closeLabel="Fechar criação de variante"
        >
          <p className="mb-5 text-sm text-muted">Como deseja criar a variante?</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="flex flex-col gap-4 shadow-none">
              <p className="flex-1 text-sm text-muted">
                Comece vazia, sem imagem, tecidos ou aviamentos.
              </p>
              <Button
                disabled={disabled}
                onClick={() => {
                  closeCreation();
                  onAdd();
                }}
              >
                <Plus aria-hidden="true" className="h-4 w-4" /> Nova variante
              </Button>
            </Card>
            <Card className="flex flex-col gap-4 shadow-none">
              <p className="flex-1 break-words text-sm text-muted">
                Copie a imagem, os insumos e os demais dados de{' '}
                <strong className="text-primary">{selected.nome || 'Sem nome'}</strong>. As edições
                ficam independentes.
              </p>
              <Button
                disabled={disabled}
                onClick={() => {
                  closeCreation();
                  onDuplicate();
                }}
              >
                <Copy aria-hidden="true" className="h-4 w-4" /> Duplicar variante
              </Button>
            </Card>
          </div>
          <p className="mt-5 text-xs text-muted">
            A grade de tamanhos continua herdada da peça. As alterações são salvas automaticamente.
          </p>
          <div className="mt-5 flex justify-end">
            <Button variant="ghost" onClick={closeCreation}>
              Cancelar
            </Button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
