/**
 * ============================================================================
 * COMPONENTE: Sub-aba de Marcas (MarcasTab)
 * ARQUIVO: src/pages/Gestao/tabs/MarcasTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tabela e filtros de gerenciamento de marcas do sistema.
 * ============================================================================
 */

import React from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  FolderOpen,
  Pencil,
  UserCog,
  Users2,
  Image as ImageIcon,
} from 'lucide-react';
import type { MarcaSummary } from '../../../types/auth';

interface MarcasTabProps {
  marcas: MarcaSummary[];
  searchMarca: string;
  setSearchMarca: (value: string) => void;
  openMenuMarcaId: string | null;
  setOpenMenuMarcaId: (id: string | null) => void;
  onOpenColecoes: (marca: MarcaSummary) => void;
  onOpenCriarMarca: () => void;
  onOpenEditarMarca: (marca: MarcaSummary) => void;
  onOpenEditarUsuarios: (marca: MarcaSummary) => void;
  onOpenAtualizarTimes: (marca: MarcaSummary) => void;
}

export const MarcasTab: React.FC<MarcasTabProps> = ({
  marcas,
  searchMarca,
  setSearchMarca,
  openMenuMarcaId,
  setOpenMenuMarcaId,
  onOpenColecoes,
  onOpenCriarMarca,
  onOpenEditarMarca,
  onOpenEditarUsuarios,
  onOpenAtualizarTimes,
}) => {
  const filteredMarcas = marcas.filter((m) =>
    m.nome.toLowerCase().includes(searchMarca.toLowerCase())
  );

  return (
    <>
      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
          <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
          <span>Filtros</span>
        </div>
        <div className="space-y-1 max-w-xs">
          <label className="text-xs font-semibold text-muted-foreground block">Busca</label>
          <input
            type="text"
            value={searchMarca}
            onChange={(e) => setSearchMarca(e.target.value)}
            placeholder="Buscar"
            className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
          />
        </div>
      </div>

      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-border-muted pb-4">
          <h2 className="text-lg font-bold font-editorial text-primary">Marcas</h2>
          <button
            type="button"
            onClick={onOpenCriarMarca}
            className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Nova Marca</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                <th className="py-3 px-4">Imagem</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Coleções</th>
                <th className="py-3 px-4">Usuários</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {filteredMarcas.map((marca) => (
                <tr key={marca.id} className="hover:bg-surface-muted/30 transition">
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                      {marca.heroImageUrl ? (
                        <img
                          src={marca.heroImageUrl}
                          alt={marca.nome}
                          className="w-full h-full object-cover img-brand-treated"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-primary">{marca.nome}</td>
                  <td className="py-3 px-4 text-muted-foreground font-medium">
                    {marca.totalColecoes || marca.colecoesCount}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-medium">
                    {marca.totalUsuarios || 16}
                  </td>
                  <td className="py-3 px-4 text-right relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuMarcaId(openMenuMarcaId === marca.id ? null : marca.id)
                      }
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    {openMenuMarcaId === marca.id && (
                      <div className="absolute right-4 top-10 w-44 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuMarcaId(null);
                            onOpenColecoes(marca);
                          }}
                          className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                        >
                          <FolderOpen className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                          <span>Abrir</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditarMarca(marca)}
                          className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditarUsuarios(marca)}
                          className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                        >
                          <UserCog className="w-4 h-4 text-muted" strokeWidth={1.5} />
                          <span>Usuários</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenAtualizarTimes(marca)}
                          className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                        >
                          <Users2 className="w-4 h-4 text-muted" strokeWidth={1.5} />
                          <span>Atualizar Times</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
