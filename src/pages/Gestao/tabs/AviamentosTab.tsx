/**
 * ============================================================================
 * COMPONENTE: Sub-aba de Aviamentos (AviamentosTab)
 * ARQUIVO: src/pages/Gestao/tabs/AviamentosTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tabela e filtros de aviamentos do sistema.
 * ============================================================================
 */

import React from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  Download,
  FileSpreadsheet,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import type { TecidoInsumoItem } from '../../../types/gestao';

interface AviamentosTabProps {
  aviamentosList: TecidoInsumoItem[];
  searchAviamentoInsumo: string;
  setSearchAviamentoInsumo: (v: string) => void;
  searchAviamentoCor: string;
  setSearchAviamentoCor: (v: string) => void;
  searchAviamentoFornecedor: string;
  setSearchAviamentoFornecedor: (v: string) => void;
  showOpcoesAviamentoMenu: boolean;
  setShowOpcoesAviamentoMenu: (v: boolean) => void;
  opcoesAviamentoSubMenu: 'main' | 'exportar';
  setOpcoesAviamentoSubMenu: (v: 'main' | 'exportar') => void;
  openMenuAviamentoId: string | null;
  setOpenMenuAviamentoId: (id: string | null) => void;
  onOpenCriandoAviamentoModal: () => void;
  onOpenImportarInsumosModal: () => void;
  onOpenEditarAviamento: (aviamento: TecidoInsumoItem) => void;
  onDeleteAviamento: (id: string) => void;
}

export const AviamentosTab: React.FC<AviamentosTabProps> = ({
  aviamentosList,
  searchAviamentoInsumo,
  setSearchAviamentoInsumo,
  searchAviamentoCor,
  setSearchAviamentoCor,
  searchAviamentoFornecedor,
  setSearchAviamentoFornecedor,
  showOpcoesAviamentoMenu,
  setShowOpcoesAviamentoMenu,
  opcoesAviamentoSubMenu,
  setOpcoesAviamentoSubMenu,
  openMenuAviamentoId,
  setOpenMenuAviamentoId,
  onOpenCriandoAviamentoModal,
  onOpenImportarInsumosModal,
  onOpenEditarAviamento,
  onDeleteAviamento,
}) => {
  const filteredAviamentos = aviamentosList.filter((a) => {
    if (searchAviamentoInsumo.trim()) {
      const q = searchAviamentoInsumo.toLowerCase();
      if (!a.nome.toLowerCase().includes(q) && !a.codigo.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
          <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
          <span>Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Insumo</label>
            <input
              type="text"
              value={searchAviamentoInsumo}
              onChange={(e) => setSearchAviamentoInsumo(e.target.value)}
              placeholder="Ex.: Crepe 2019..."
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Cor</label>
            <input
              type="text"
              value={searchAviamentoCor}
              onChange={(e) => setSearchAviamentoCor(e.target.value)}
              placeholder="Código ou Nome"
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Fornecedor</label>
            <input
              type="text"
              value={searchAviamentoFornecedor}
              onChange={(e) => setSearchAviamentoFornecedor(e.target.value)}
              placeholder="Código ou Nome"
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-border-muted pb-4">
          <h2 className="text-lg font-bold font-editorial text-primary">Insumos</h2>
          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              onClick={() => {
                setShowOpcoesAviamentoMenu(!showOpcoesAviamentoMenu);
                setOpcoesAviamentoSubMenu('main');
              }}
              className="px-4 py-2 border border-border hover:bg-surface-muted font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 text-primary cursor-pointer"
            >
              <span>Opções</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            </button>

            {showOpcoesAviamentoMenu && (
              <div className="absolute right-32 top-11 w-44 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                {opcoesAviamentoSubMenu === 'main' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOpcoesAviamentoMenu(false);
                        onOpenImportarInsumosModal();
                      }}
                      className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                        <span>Importar</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpcoesAviamentoSubMenu('exportar')}
                      className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-muted" strokeWidth={1.5} />
                        <span>Exportar</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpcoesAviamentoSubMenu('main')}
                      className="w-full text-left px-3 py-2 text-muted-foreground hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-muted" strokeWidth={1.5} />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOpcoesAviamentoMenu(false)}
                      className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                      <span>Planilha</span>
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onOpenCriandoAviamentoModal}
              className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border accent-accent-camel cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Imagem</th>
                <th className="py-3 px-4">Fornecedores</th>
                <th className="py-3 px-4">Custo</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {filteredAviamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium">
                    Nenhum aviamento cadastrado. Clique em "+ Adicionar" ou "Importar" para
                    cadastrar aviamentos.
                  </td>
                </tr>
              ) : (
                filteredAviamentos.map((aviamento) => (
                  <tr key={aviamento.id} className="hover:bg-surface-muted/30 transition">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border accent-accent-camel cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{aviamento.nome}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground font-medium">
                      {aviamento.codigo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                        <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {aviamento.fornecedores}
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{aviamento.custo}</td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuAviamentoId(
                            openMenuAviamentoId === aviamento.id ? null : aviamento.id
                          )
                        }
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      {openMenuAviamentoId === aviamento.id && (
                        <div className="absolute right-4 top-10 w-32 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuAviamentoId(null);
                              onOpenEditarAviamento(aviamento);
                            }}
                            className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                          >
                            <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteAviamento(aviamento.id)}
                            className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
