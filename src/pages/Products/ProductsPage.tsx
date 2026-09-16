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
import type { PecaItem, ColecaoItem } from '../../types/plm';
import type { MarcaSummary } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { PecasTab } from '../Home/components/PecasTab';
import { PecaFichaTecnicaView } from '../Home/components/PecaFichaTecnicaView';
import { Shirt, Sparkles } from 'lucide-react';
import { MOCK_MARCAS, MOCK_COLECOES } from '../../constants/mockData';

export const ProductsPage: React.FC = () => {
  const { activeMarca } = useAuth();
  const [selectedPeca, setSelectedPeca] = useState<PecaItem | null>(null);

  // Se o usuário selecionou uma peça, abre a visão completa da ficha técnica
  if (selectedPeca) {
    const fallbackMarca: MarcaSummary =
      MOCK_MARCAS.find((m) => m.nome === selectedPeca.marcaNome) || activeMarca || MOCK_MARCAS[0]!;

    const fallbackColecao: ColecaoItem = MOCK_COLECOES.find(
      (c) => c.nome === selectedPeca.colecaoNome
    ) || {
      id: selectedPeca.colecaoId || 'col-default',
      nome: selectedPeca.colecaoNome,
      marcaNome: selectedPeca.marcaNome,
      status: 'Em andamento',
      progressoPercent: 50,
      pecasConcluidas: 12,
      pecasTotal: 24,
      dataEntrega: selectedPeca.previsaoEntrega,
      diasAtraso: selectedPeca.diasAtraso || 0,
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
        <PecaFichaTecnicaView
          peca={selectedPeca}
          marca={fallbackMarca}
          colecao={fallbackColecao}
          onBack={() => setSelectedPeca(null)}
          onUpdatePeca={(updated) => setSelectedPeca(updated)}
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
            Peças & Modelagens
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestão de peças, fichas técnicas, tecidos e percurso de etapas da produção AKR BRANDS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted bg-surface px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 shadow-2xs">
            <Shirt className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
            <span>Módulo PLM Oficial</span>
          </span>
        </div>
      </div>

      {/* COMPONENTE REAPROVEITADO DE CATÁLOGO & FILTROS */}
      <PecasTab onSelectPeca={(peca) => setSelectedPeca(peca)} />
    </div>
  );
};
export default ProductsPage;
