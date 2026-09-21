/**
 * ============================================================================
 * PÁGINA: Catálogo & Ficha Técnica de Peças (ProductsPage)
 * ARQUIVO: src/pages/Products/ProductsPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Página dedicada de Produtos / Peças do PLM. Permite listar,
 *            filtrar e inspecionar a ficha técnica completa da peça selecionada.
 * ============================================================================
 */

import React, { useState } from 'react';
import type { LinxProdutoValido } from '../../types/linx';
import { PecasTab } from '../Home/components/PecasTab';
import { LinxProdutoDetailView } from './LinxProdutoDetailView';
import { Shirt, Sparkles } from 'lucide-react';

interface SelectedLinxProduct {
  product: LinxProdutoValido;
  sourceDatabase: string;
}

export const ProductsPage: React.FC = () => {
  const [selection, setSelection] = useState<SelectedLinxProduct | null>(null);

  if (selection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
        <LinxProdutoDetailView
          product={selection.product}
          sourceDatabase={selection.sourceDatabase}
          onBack={() => setSelection(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* CABEÇALHO EDITORIAL DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-camel/10 text-accent-camel border border-accent-camel/20 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catálogo Geral de Produtos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-primary tracking-wide">
            Peças do Linx
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Produtos existentes no Linx e vinculados a coleções das griffes autorizadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted bg-surface px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 shadow-2xs">
            <Shirt className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
            <span>Fonte oficial · somente leitura</span>
          </span>
        </div>
      </div>

      {/* COMPONENTE REAPROVEITADO DE CATÁLOGO & FILTROS */}
      <PecasTab
        onSelectPeca={(product, sourceDatabase) => setSelection({ product, sourceDatabase })}
      />
    </div>
  );
};
export default ProductsPage;
