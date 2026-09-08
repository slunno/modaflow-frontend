/**
 * ============================================================================
 * MODAL: Importar Insumos (ImportarInsumosModal)
 * ARQUIVO: src/pages/Gestao/modals/ImportarInsumosModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal com instruções e upload para importação de insumos via CSV.
 * ============================================================================
 */

import React from 'react';
import { X, UploadCloud, Info } from 'lucide-react';

interface ImportarInsumosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportarInsumosModal: React.FC<ImportarInsumosModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold font-editorial text-primary">Importação de Insumos</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-6 text-xs">
          <div className="space-y-2 text-primary font-medium">
            <p>Para realizar a importação siga os passos:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pl-1">
              <li>
                <a href="#modelo" className="text-accent-camel hover:underline font-semibold">
                  Baixe a planilha modelo clicando aqui.
                </a>
              </li>
              <li>Preencha com seus insumos seguindo o formato modelo.</li>
              <li>Importe o arquivo .CSV clicando no botão importar abaixo.</li>
            </ol>
          </div>
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              <span>Importar</span>
              <UploadCloud className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
            </button>
          </div>
          <div className="border-t border-border-muted pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Info className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
              <span>Atenção!</span>
            </div>
            <div className="text-muted-foreground space-y-2 text-[11px] leading-relaxed">
              <p>A planilha deve seguir o padrão abaixo:</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>
                  <strong className="text-primary">Nome do insumo:</strong> preenchimento
                  obrigatório
                </li>
                <li>
                  <strong className="text-primary">Tipo do preço:</strong>
                  <ul className="list-square list-inside pl-4 font-normal">
                    <li>Tecidos → somente KG ou M.</li>
                    <li>Aviamentos → somente M ou UN.</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-primary">composição:</strong> No formato _%Material +
                  _%Material
                  <span className="block italic pl-4">Ex.: 90% Poliamida + 10% Elastano.</span>
                </li>
                <li>
                  <strong className="text-primary">Fornecedor:</strong> Se já existir no CM informe
                  o Código exatamente como está cadastrado
                  <span className="block italic text-muted pl-4">
                    (Caso Preenchido na planilha com código diferente ou em branco será criado novo
                    fornecedor com o mesmo nome.)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
