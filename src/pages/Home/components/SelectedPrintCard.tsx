import { useCallback, useState } from 'react';
import { Expand } from 'lucide-react';
import type { CollectionPrintItem } from '../../../types/plm';
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  SectionHeader,
} from '../../../components/ui/FichaPrimitives';

export function SelectedPrintCard({
  print,
  reference = '',
  onChoose,
}: {
  print?: CollectionPrintItem;
  reference?: string;
  onChoose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [failedImage, setFailedImage] = useState<string>();
  const close = useCallback(() => setExpanded(false), []);
  const name = print?.reference || reference;
  const image = print?.image;
  const showImage = !!image && image !== failedImage;

  return (
    <Card aria-label="Estampa selecionada" className="min-w-0">
      <SectionHeader
        title="Estampa selecionada"
        description="Selecionada em Geral · Compartilhada com a peça"
        action={
          <Button onClick={onChoose}>{name ? 'Alterar estampa' : 'Selecionar estampa'}</Button>
        }
      />
      {showImage ? (
        <button
          type="button"
          aria-label={`Ampliar estampa ${name}`}
          onClick={() => setExpanded(true)}
          className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-control bg-surface-muted sm:h-64"
        >
          <img
            src={image}
            alt={`Estampa ${name}`}
            className="h-full w-full object-contain p-3"
            onError={() => setFailedImage(image)}
          />
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-xs font-semibold">
            <Expand aria-hidden="true" className="h-4 w-4" /> Ampliar
          </span>
        </button>
      ) : (
        <EmptyState
          title={name ? 'Imagem da estampa indisponível' : 'Nenhuma estampa selecionada'}
          description={
            name
              ? print
                ? 'Adicione uma imagem no cadastro de Estampas da coleção.'
                : 'Selecione uma estampa cadastrada na coleção para apresentar sua imagem.'
              : 'Escolha uma estampa em Geral para apresentar a imagem aqui.'
          }
        />
      )}
      {name && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 break-words text-sm font-semibold">{name}</p>
          {print?.type && <span className="text-xs text-muted">{print.type}</span>}
        </div>
      )}
      {expanded && showImage && (
        <Dialog title={`Estampa — ${name}`} onClose={close}>
          <img
            src={image}
            alt={`Ampliação da estampa ${name}`}
            className="max-h-[75dvh] w-full object-contain"
          />
        </Dialog>
      )}
    </Card>
  );
}
