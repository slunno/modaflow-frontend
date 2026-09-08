/**
 * ============================================================================
 * COMPONENTE: Sub-aba de Tecidos (TecidosTab)
 * ARQUIVO: src/pages/Gestao/tabs/TecidosTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tabela e controle de insumos de tecido da coleção.
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
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  Pencil,
  Image as ImageIcon,
} from 'lucide-react';
import type { TecidoInsumoItem } from '../../../types/gestao';

interface TecidosTabProps {
  tecidosList: TecidoInsumoItem[];
  searchTecidoInsumo: string;
  setSearchTecidoInsumo: (v: string) => void;
  searchTecidoCor: string;
  setSearchTecidoCor: (v: string) => void;
  searchTecidoFornecedor: string;
  setSearchTecidoFornecedor: (v: string) => void;
  showOpcoesTecidoMenu: boolean;
  setShowOpcoesTecidoMenu: (v: boolean) => void;
  opcoesTecidoSubMenu: 'main' | 'exportar';
  setOpcoesTecidoSubMenu: (v: 'main' | 'exportar') => void;
  openMenuTecidoId: string | null;
  setOpenMenuTecidoId: (id: string | null) => void;
  onOpenCriandoInsumoModal: () => void;
  onOpenImportarInsumosModal: () => void;
  onOpenEditarTecido: (tecido: TecidoInsumoItem) => void;
  onDeleteTecido: (id: string) => void;
}

export const TecidosTab: React.FC<TecidosTabProps> = ({
  tecidosList,
  searchTecidoInsumo,
  setSearchTecidoInsumo,
  searchTecidoCor,
  setSearchTecidoCor,
  searchTecidoFornecedor,
  setSearchTecidoFornecedor,
  showOpcoesTecidoMenu,
  setShowOpcoesTecidoMenu,
  opcoesTecidoSubMenu,
  setOpcoesTecidoSubMenu,
  openMenuTecidoId,
  setOpenMenuTecidoId,
  onOpenCriandoInsumoModal,
  onOpenImportarInsumosModal,
  onOpenEditarTecido,
  onDeleteTecido,
}) => {
  const filteredTecidos = tecidosList.filter((t) => {
    if (searchTecidoInsumo.trim()) {
      const q = searchTecidoInsumo.toLowerCase();
      if (!t.nome.toLowerCase().includes(q) && !t.codigo.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (searchTecidoFornecedor.trim()) {
      if (!t.fornecedores.toLowerCase().includes(searchTecidoFornecedor.toLowerCase())) {
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
              value={searchTecidoInsumo}
              onChange={(e) => setSearchTecidoInsumo(e.target.value)}
              placeholder="Código ou Nome"
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Cor</label>
            <input
              type="text"
              value={searchTecidoCor}
              onChange={(e) => setSearchTecidoCor(e.target.value)}
              placeholder="Código ou Nome"
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Fornecedor</label>
            <input
              type="text"
              value={searchTecidoFornecedor}
              onChange={(e) => setSearchTecidoFornecedor(e.target.value)}
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
                setShowOpcoesTecidoMenu(!showOpcoesTecidoMenu);
                setOpcoesTecidoSubMenu('main');
              }}
              className="px-4 py-2 border border-border hover:bg-surface-muted font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 text-primary cursor-pointer"
            >
              <span>Opções</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            </button>

            {showOpcoesTecidoMenu && (
              <div className="absolute right-32 top-11 w-44 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                {opcoesTecidoSubMenu === 'main' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowOpcoesTecidoMenu(false);
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
                      onClick={() => setOpcoesTecidoSubMenu('exportar')}
                      className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-muted" strokeWidth={1.5} />
                        <span>Exportar</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOpcoesTecidoMenu(false)}
                      className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-muted" strokeWidth={1.5} />
                      <span>Restaurar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOpcoesTecidoMenu(false)}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
                      <span>Excluir</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpcoesTecidoSubMenu('main')}
                      className="w-full text-left px-3 py-2 text-muted-foreground hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 text-muted" strokeWidth={1.5} />
                      <span>Voltar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOpcoesTecidoMenu(false)}
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
              onClick={onOpenCriandoInsumoModal}
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
              {filteredTecidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium">
                    Nenhum insumo cadastrado. Clique em "+ Adicionar" ou "Importar" para cadastrar
                    insumos.
                  </td>
                </tr>
              ) : (
                filteredTecidos.map((tecido) => (
                  <tr key={tecido.id} className="hover:bg-surface-muted/30 transition">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border accent-accent-camel cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{tecido.nome}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{tecido.codigo}</td>
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                        {tecido.imagemUrl ? (
                          <img
                            src={tecido.imagemUrl}
                            alt={tecido.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {tecido.fornecedores}
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{tecido.custo}</td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuTecidoId(openMenuTecidoId === tecido.id ? null : tecido.id)
                        }
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      {openMenuTecidoId === tecido.id && (
                        <div className="absolute right-4 top-10 w-32 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuTecidoId(null);
                              onOpenEditarTecido(tecido);
                            }}
                            className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                          >
                            <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTecido(tecido.id)}
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
