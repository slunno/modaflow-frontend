/**
 * ============================================================================
 * MODAL: Seleção de Campos para Miniaturas (MiniaturaModal)
 * ARQUIVO: src/pages/Home/components/MiniaturaModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Permite escolher quais campos da Ficha Técnica serão exibidos
 *            nas miniaturas de cards de peças na tela inicial da coleção.
 *            Conforme o Print 1.
 * ============================================================================
 */

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { PecaItem } from '../../../types/plm';
import { CAMPOS_FICHA_CONECTADOS } from '../../../services/pecaFichaSelectors';
import { CollectionDialog } from './CollectionPresentation';
import { collectionFooter } from './collectionFormatting';
import { PecaMiniaturaFields } from './PecaMiniaturaFields';

interface MiniaturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFields: string[];
  onSave: (fields: string[]) => void;
  previewPeca?: PecaItem;
}

const CATEGORIAS_CAMPOS = [
  {
    titulo: 'Informações Gerais',
    campos: [
      'Status',
      'Código',
      'Completa por',
      'Etapas',
      'Previsão',
      'Resp. da etapa',
      'Estilista',
      'Modelista',
      'Custo',
      'Preço',
      'Markup',
      'Margem',
      'Cores',
      'Pantone',
      'Cores variantes',
      'Estampas',
      'Variantes (Miniaturas)',
      'Variantes (Cores)',
      'Variantes',
      'Quantidade a ser produzida',
      'Custo em quantidade',
      'Preço em quantidade',
      'Preço aprovado',
    ],
  },
  {
    titulo: 'Outros Campos da Ficha Técnica',
    campos: ['Descrição', 'Modelagem', 'Medidas', 'Tamanhos', 'Técnica'],
  },
  {
    titulo: 'Insumos',
    campos: [
      'Tecidos',
      'Tecido principal',
      'Aviamentos',
      'Aviamento principal',
      'Fornec. de Tecido',
      'Fornec. de Aviamento',
      'Fornec. de Terc.',
      'Terceiros',
    ],
  },
  {
    titulo: 'Informações de cancelamento',
    campos: ['Data do cancelamento', 'Motivo do cancelamento', 'Cancelado por'],
  },
  {
    titulo: 'Imagens',
    campos: ['Referência'],
  },
  {
    titulo: 'Tags',
    campos: [
      'BASE',
      'ENTREGAS',
      'FAIXA DE PREÇO',
      'FICHA TÉCNICA',
      'FORNECEDOR',
      'LINHA',
      'SUBCATEGORIA',
      'TECIDO',
      'TEMA',
    ],
  },
  {
    titulo: 'Campos Customizados',
    campos: [
      'Categoria',
      'Grade',
      'Griffe',
      'Inspetor de qualidade',
      'Lacre Referência',
      'Linha',
      'Nome do Produto',
      'Observações de Corte',
      'Observações Gerais',
      'Observações Modelagem',
      'Sub-grupo',
      'Subcategoria',
      'Tipo de matéria-prima',
    ],
  },
  {
    titulo: 'Campos Customizados de terceiros',
    campos: ['Observações do terceiro', 'Tela', 'Tradução'],
  },
];

export const MiniaturaModal: React.FC<MiniaturaModalProps> = ({
  isOpen,
  onClose,
  selectedFields,
  onSave,
  previewPeca,
}) => {
  const [fields, setFields] = useState<string[]>(
    selectedFields && selectedFields.length > 0
      ? selectedFields
      : ['Status', 'Etapas', 'Previsão', 'Estilista', 'Tecidos']
  );

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && selectedFields && selectedFields.length > 0) {
      setFields(selectedFields);
    }
  }

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleField = (field: string) => {
    if (fields.includes(field)) {
      setFields(fields.filter((f) => f !== field));
    } else {
      setFields([...fields, field]);
    }
  };

  const handleSave = () => {
    onSave(fields);
    onClose();
  };

  return (
    <CollectionDialog title="Miniatura" onClose={onClose} className="max-w-5xl">
      {/* Body 2 Colunas (Painel Esquerdo: Preview ao Vivo | Painel Direito: Seletor de Campos) */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Preview da Peça */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-2xs space-y-3 sticky top-0">
            <div className="text-sm font-bold text-primary">
              {previewPeca?.tipo ?? 'Prévia da peça'}
            </div>

            {/* Desenho do Cabide */}
            <div className="w-full h-40 bg-surface-muted rounded-lg flex items-center justify-center border border-border-muted">
              <svg
                className="w-16 h-16 text-slate-300 stroke-[1.2]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4a2 2 0 0 0-2 2c0 .83.5 1.5 1.2 1.83L3.5 13.5A1.5 1.5 0 0 0 4.5 16h15a1.5 1.5 0 0 0 1-2.5L12.8 7.83A2.001 2.001 0 0 0 12 4z"
                />
              </svg>
            </div>

            {/* Lista dos Campos Selecionados no Card */}
            <div className="space-y-1.5 pt-2 text-xs font-semibold text-primary">
              {previewPeca ? (
                <PecaMiniaturaFields peca={previewPeca} fields={fields} />
              ) : fields.length === 0 ? (
                <div className="text-muted italic text-[11px]">Nenhum campo selecionado</div>
              ) : (
                fields.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="text-muted text-[10px]">⊹</span>
                    <span>{f}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Painel Direito (2 cols): Grupos de Campos */}
        <div className="md:col-span-2 space-y-6 text-xs">
          {CATEGORIAS_CAMPOS.map((cat) => (
            <div key={cat.titulo} className="space-y-2">
              <h4 className="font-bold text-primary text-xs font-editorial uppercase tracking-wide">
                {cat.titulo}
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {cat.campos.map((campo) => {
                  const isSelected = fields.includes(campo);
                  return (
                    <button
                      key={campo}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={!CAMPOS_FICHA_CONECTADOS.has(campo)}
                      title={
                        !CAMPOS_FICHA_CONECTADOS.has(campo)
                          ? 'Origem dos dados ainda não implementada; nenhum valor será inventado.'
                          : undefined
                      }
                      onClick={() => toggleField(campo)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'bg-accent-camel/10 text-accent-camel border-accent-camel shadow-2xs font-bold'
                          : 'bg-surface-muted text-muted-foreground border-border hover:bg-border-muted'
                      }`}
                    >
                      {campo}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé com botão Salvar */}
      <div className={collectionFooter}>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 bg-accent-camel hover:bg-accent-camel/90 text-on-camel font-bold text-xs rounded-lg shadow-2xs transition-all duration-200 cursor-pointer flex items-center gap-1.5"
        >
          <span>Salvar</span>
          <Check className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </CollectionDialog>
  );
};
