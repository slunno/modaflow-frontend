import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { FichaInsumo } from '../../../types/ficha';
import { CriarTecidoModal } from '../../Gestao/modals/CriarTecidoModal';
import { FichaInsumoCard } from './FichaInsumoCard';
import { getProductUsoKey } from '../../../services/productUsoStorage';
import type { LinxFichaCustos } from '../../../types/linx';
import { Button, EmptyState, Skeleton } from '../../../components/ui/FichaPrimitives';
import { mesclarCamposDaCor } from '../../../services/insumoInformacoesCores';

interface Props {
  variantName?: string;
  compact?: boolean;
  tipo: 'tecido' | 'aviamento';
  items: FichaInsumo[];
  produto: string;
  tamanhos?: readonly string[];
  onChange: (items: FichaInsumo[]) => void;
  custosLinx?: LinxFichaCustos | null;
  loadingCustosLinx?: boolean;
  errorCustosLinx?: string;
  onReloadCustosLinx?: () => void;
}

export function FichaInsumosEditor({
  variantName,
  compact = false,
  tipo,
  items,
  produto,
  tamanhos,
  onChange,
  custosLinx,
  loadingCustosLinx,
  errorCustosLinx,
  onReloadCustosLinx,
}: Props) {
  const [editing, setEditing] = useState<FichaInsumo | null | undefined>(undefined);
  const title = tipo === 'tecido' ? 'Tecidos' : 'Aviamentos';
  const usoKey = getProductUsoKey(produto, tipo);

  return (
    <section
      aria-label={variantName ? `${title} — ${variantName}` : undefined}
      className="rounded-card border border-border bg-surface p-card shadow-card space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-primary">
          {title} <span className="text-muted text-xs">({items.length})</span>
        </h3>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex min-h-control gap-1 items-center rounded-control border border-border px-3 py-1.5 text-xs font-semibold text-accent-camel hover:bg-surface-muted"
        >
          <Plus className="h-4 w-4" /> Adicionar {tipo}
        </button>
      </div>
      {loadingCustosLinx && (
        <Skeleton label="Consultando preços e custos no Linx…" className="h-12" />
      )}
      {errorCustosLinx && (
        <div role="alert" className="rounded-lg border border-border p-3 text-xs space-y-2">
          <p>{errorCustosLinx}</p>
          <p>Os insumos e preços manuais do rascunho foram preservados.</p>
          {onReloadCustosLinx && (
            <button type="button" onClick={onReloadCustosLinx} className="underline font-semibold">
              Tentar consultar novamente
            </button>
          )}
        </div>
      )}
      {!items.length && (
        <EmptyState
          title={`Nenhum ${tipo} nesta variante`}
          description="Adicione um insumo para definir fornecedor, consumo e preço."
          action={
            <Button variant="primary" onClick={() => setEditing(null)}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Adicionar {tipo}
            </Button>
          }
        />
      )}
      {items.map((item) => {
        const card = (
          <FichaInsumoCard
            key={item.id}
            item={item}
            tipo={tipo}
            custosLinx={custosLinx}
            usoKey={usoKey}
            produto={produto}
            tamanhos={tamanhos}
            onUpdate={(changes) =>
              onChange(
                items.map((entry) =>
                  entry.id === item.id ? mesclarCamposDaCor(entry, changes) : entry
                )
              )
            }
            onEdit={() => setEditing(item)}
            onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
          />
        );
        return compact ? (
          <details
            key={item.id}
            className="rounded-control border border-border bg-surface-muted/30 p-3"
          >
            <summary className="cursor-pointer space-y-1">
              <span className="text-sm font-semibold">
                {item.nome}{' '}
                <span className="text-xs font-normal text-muted">
                  {item.codigo || 'Sem código'}
                </span>
              </span>
              <span className="block text-xs text-muted">
                {item.fornecedores || 'Fornecedor a definir'}
              </span>
              <span className="block text-xs">
                Consumo: {item.consumo || item.quantidade || item.peso || 'Definir'} · Preço:{' '}
                {item.custo ? `R$ ${item.custo} / ${item.unidade}` : 'Definir'}
              </span>
              <span className="block text-xs text-accent-camel">
                Editar consumo, preço e detalhes
              </span>
            </summary>
            <div className="mt-3">{card}</div>
          </details>
        ) : (
          card
        );
      })}
      {editing !== undefined && (
        <CriarTecidoModal
          key={editing?.id ?? 'novo'}
          isOpen
          tipo={tipo}
          editingTecido={editing}
          onClose={() => setEditing(undefined)}
          onSave={(item) => {
            onChange(
              editing
                ? items.map((previous) =>
                    previous.id === editing.id
                      ? {
                          ...previous,
                          ...item,
                          precoOrigem: 'manual',
                          ...(previous.unidade !== item.unidade
                            ? { consumo: '', quantidade: '', consumoPorTamanho: {} }
                            : {}),
                        }
                      : previous
                  )
                : [...items, { ...item, precoOrigem: 'manual' }]
            );
            setEditing(undefined);
          }}
        />
      )}
    </section>
  );
}
