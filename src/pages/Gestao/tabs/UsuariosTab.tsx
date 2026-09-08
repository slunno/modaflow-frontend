/**
 * ============================================================================
 * COMPONENTE: Sub-aba de Usuários (UsuariosTab)
 * ARQUIVO: src/pages/Gestao/tabs/UsuariosTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tabela de usuários e visão de edição de cargos por marca.
 * ============================================================================
 */

import React from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Image as ImageIcon,
  ArrowLeft,
  Info,
} from 'lucide-react';
import type { MarcaSummary } from '../../../types/auth';
import type { UserRecord } from '../../../types/gestao';
import { CARGOS_OPCOES } from '../../../types/gestao';

interface UsuariosTabProps {
  usersList: UserRecord[];
  marcas: MarcaSummary[];
  userFilterMarca: string;
  setUserFilterMarca: (marca: 'Todas' | 'King & Joe' | 'King & Joe Play' | 'K&J Black') => void;
  searchUser: string;
  setSearchUser: (value: string) => void;
  userFilterStatus: 'Todos' | 'Ativo' | 'Inativo';
  setUserFilterStatus: (status: 'Todos' | 'Ativo' | 'Inativo') => void;
  userFilterAcesso: 'Todos' | 'Permitido' | 'Bloqueado';
  setUserFilterAcesso: (acesso: 'Todos' | 'Permitido' | 'Bloqueado') => void;
  editingUserProfile: UserRecord | null;
  setEditingUserProfile: (user: UserRecord | null) => void;
  openMenuUserId: string | null;
  setOpenMenuUserId: (id: string | null) => void;
  searchCargoQuery: string;
  setSearchCargoQuery: (query: string) => void;
  filtrarCargosToggle: boolean;
  setFiltrarCargosToggle: (toggle: boolean) => void;
  onOpenCriarUsuario: () => void;
  onSaveUserProfile: () => void;
  onToggleAccesoUser: (id: string) => void;
}

export const UsuariosTab: React.FC<UsuariosTabProps> = ({
  usersList,
  marcas,
  userFilterMarca,
  setUserFilterMarca,
  searchUser,
  setSearchUser,
  userFilterStatus,
  setUserFilterStatus,
  userFilterAcesso,
  setUserFilterAcesso,
  editingUserProfile,
  setEditingUserProfile,
  openMenuUserId,
  setOpenMenuUserId,
  searchCargoQuery,
  setSearchCargoQuery,
  filtrarCargosToggle,
  setFiltrarCargosToggle,
  onOpenCriarUsuario,
  onSaveUserProfile,
  onToggleAccesoUser,
}) => {
  if (editingUserProfile) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-98 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingUserProfile(null)}
              className="p-1.5 rounded-lg border border-border bg-surface text-muted hover:text-primary transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <h2 className="text-lg font-bold font-editorial text-primary">Cargos de usuário</h2>
          </div>
          <button
            type="button"
            onClick={onSaveUserProfile}
            className="px-5 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer"
          >
            Atualizar
          </button>
        </div>

        <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">
            Informações do usuário
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">
                Nome <span className="text-accent-bordo">*</span>
              </label>
              <input
                type="text"
                value={editingUserProfile.nome}
                onChange={(e) =>
                  setEditingUserProfile({ ...editingUserProfile, nome: e.target.value })
                }
                className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">
                E-mail <span className="text-accent-bordo">*</span>
              </label>
              <input
                type="email"
                value={editingUserProfile.email}
                onChange={(e) =>
                  setEditingUserProfile({ ...editingUserProfile, email: e.target.value })
                }
                className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <span>Código</span>
                <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </label>
              <input
                type="text"
                value={editingUserProfile.codigo || ''}
                onChange={(e) =>
                  setEditingUserProfile({ ...editingUserProfile, codigo: e.target.value })
                }
                className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
              />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditingUserProfile({
                      ...editingUserProfile,
                      status: editingUserProfile.status === 'Ativo' ? 'Inativo' : 'Ativo',
                    })
                  }
                  className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${
                    editingUserProfile.status === 'Ativo'
                      ? 'bg-accent-camel'
                      : 'bg-surface-muted border border-border'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                      editingUserProfile.status === 'Ativo' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-primary">Ativo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Filtros</div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              value={searchCargoQuery}
              onChange={(e) => setSearchCargoQuery(e.target.value)}
              placeholder="Buscar"
              className="max-w-xs bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFiltrarCargosToggle(!filtrarCargosToggle)}
                className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${
                  filtrarCargosToggle ? 'bg-accent-camel' : 'bg-surface-muted border border-border'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                    filtrarCargosToggle ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-primary">Filtrar Cargos</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Cargos</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                  <th className="py-3 px-4 w-16">Imagem</th>
                  <th className="py-3 px-4">Marca</th>
                  <th className="py-3 px-4">Cargo</th>
                  <th className="py-3 px-4">Times</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {marcas.map((marca) => {
                  const roleEntry = editingUserProfile.brandRoles.find(
                    (r) => r.marcaId === marca.id
                  ) || {
                    marcaId: marca.id,
                    marcaNome: marca.nome,
                    cargo: 'Nenhum',
                    times: [],
                  };
                  return (
                    <tr key={marca.id} className="hover:bg-surface-muted/30 transition">
                      <td className="py-3 px-4">
                        <div className="w-8 h-8 rounded bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                          {marca.heroImageUrl ? (
                            <img
                              src={marca.heroImageUrl}
                              alt={marca.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-muted opacity-50" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-primary">{marca.nome}</td>
                      <td className="py-3 px-4">
                        <select
                          value={roleEntry.cargo}
                          onChange={(e) => {
                            const newCargo = e.target.value;
                            setEditingUserProfile({
                              ...editingUserProfile,
                              brandRoles: editingUserProfile.brandRoles.map((r) =>
                                r.marcaId === marca.id ? { ...r, cargo: newCargo } : r
                              ),
                            });
                          }}
                          className="bg-surface-muted border border-border text-primary rounded px-2 py-1 text-xs outline-none"
                        >
                          {CARGOS_OPCOES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {roleEntry.times.join(', ') || 'Nenhum'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesMarca = userFilterMarca === 'Todas' || u.marcas.includes(userFilterMarca);
    const matchesStatus = userFilterStatus === 'Todos' || u.status === userFilterStatus;
    const matchesAcesso = userFilterAcesso === 'Todos' || u.acesso === userFilterAcesso;
    return matchesSearch && matchesMarca && matchesStatus && matchesAcesso;
  });

  return (
    <>
      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
          <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
          <span>Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Busca</label>
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Buscar por nome ou e-mail"
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Marca</label>
            <select
              value={userFilterMarca}
              onChange={(e) =>
                setUserFilterMarca(
                  e.target.value as 'Todas' | 'King & Joe' | 'King & Joe Play' | 'K&J Black'
                )
              }
              className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
            >
              <option value="Todas">Todas</option>
              <option value="King & Joe">King & Joe</option>
              <option value="King & Joe Play">King & Joe Play</option>
              <option value="K&J Black">K&J Black</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Status</label>
            <select
              value={userFilterStatus}
              onChange={(e) => setUserFilterStatus(e.target.value as 'Todos' | 'Ativo' | 'Inativo')}
              className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Acesso</label>
            <select
              value={userFilterAcesso}
              onChange={(e) =>
                setUserFilterAcesso(e.target.value as 'Todos' | 'Permitido' | 'Bloqueado')
              }
              className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Permitido">Permitido</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-border-muted pb-4">
          <h2 className="text-lg font-bold font-editorial text-primary">Usuários</h2>
          <button
            type="button"
            onClick={onOpenCriarUsuario}
            className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Criar Usuário</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Acesso</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-muted/30 transition">
                    <td className="py-3 px-4 font-bold text-primary">{u.nome}</td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">{u.email}</td>
                    <td className="py-3 px-4 font-medium">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.status === 'Ativo'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-surface-muted text-muted'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.acesso === 'Permitido'
                            ? 'bg-accent-camel/10 text-accent-camel'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {u.acesso}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuUserId(openMenuUserId === u.id ? null : u.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      {openMenuUserId === u.id && (
                        <div className="absolute right-4 top-10 w-44 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuUserId(null);
                              setEditingUserProfile(u);
                            }}
                            className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                          >
                            <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuUserId(null);
                              onToggleAccesoUser(u.id);
                            }}
                            className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                          >
                            <span>{u.acesso === 'Permitido' ? 'Bloquear' : 'Permitir'} Acesso</span>
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
