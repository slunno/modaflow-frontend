/**
 * ============================================================================
 * MÓDULO: Módulo de Gestão & Cadastros Base (GestaoPage)
 * ARQUIVO: src/pages/Gestao/GestaoPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Interface de gerenciamento centralizado de Marcas, Usuários, Times,
 *            Tecidos e Aviamentos. Contém a tabela de Marcas com menu interativo
 *            de 3 pontos e os 4 modais (Criação de Marca, Edição de Marca,
 *            Edição de Usuários da Marca com os cargos Administrador, Assistente,
 *            Coordenador, Observador, Estilista, e Modificar Times).
 * ============================================================================
 */

import React, { useState } from 'react';
import type { MarcaSummary } from '../../types/auth';
import { MOCK_MARCAS } from '../../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  FolderOpen, 
  Pencil, 
  UserCog, 
  Users2, 
  X, 
  Image as ImageIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface GestaoPageProps {
  onOpenColecoes: (marca: MarcaSummary) => void;
}

// CARGOS PERMITIDOS EXPLICITAMENTE DEFINIDOS PELO USUÁRIO
const CARGOS_OPCOES = [
  'Administrador',
  'Assistente',
  'Coordenador',
  'Observador',
  'Estilista'
];

// MOCK DE USUÁRIOS DA MARCA PARA O EDITOR DE USUÁRIOS (PRINT 4)
interface BrandUser {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  timesBadge?: string;
}

const INITIAL_BRAND_USERS: BrandUser[] = [
  { id: '1', email: 'suporte.kingjoe@colecao.moda', nome: 'Suporte', cargo: 'Administrador', timesBadge: 'Estilista' },
  { id: '2', email: 'fabiano.moutinho@kingjoe.com.br', nome: 'Fabiano', cargo: 'Administrador' },
  { id: '3', email: 'jessica.oliveira@kingjoe.com.br', nome: 'Jéssica', cargo: 'Administrador' },
  { id: '4', email: 'mariana.barbosa@kingjoe.com.br', nome: 'Mariana Barbosa', cargo: 'Administrador', timesBadge: 'Estilista' },
  { id: '5', email: 'desenvolvimento@kingjoe.com.br', nome: 'Ivonete Barbosa', cargo: 'Administrador', timesBadge: 'Estilista' },
  { id: '6', email: 'cleilson.teixeira@kingjoe.com.br', nome: 'Cleilson Teixeira', cargo: 'Estilista', timesBadge: 'Modelista' },
  { id: '7', email: 'marlaine.suave@kingjoe.com.br', nome: 'Marlaine', cargo: 'Administrador' },
  { id: '8', email: 'juliano.brito@kingjoe.com.br', nome: 'Juliano', cargo: 'Administrador' },
  { id: '9', email: 'beatriz.sparani@kingjoe.com.br', nome: 'Beatriz Sparani', cargo: 'Administrador', timesBadge: 'Estilista' },
  { id: '10', email: 'luciana.gaio@kingjoe.com.br', nome: 'Luciana', cargo: 'Assistente' }
];

// MOCK DE TIMES DE PRODUTO PARA MODIFICAR TIMES (PRINT 5)
interface TeamItem {
  id: string;
  nome: string;
  designadoProduto: boolean;
}

const INITIAL_TEAMS: TeamItem[] = [
  { id: 't-1', nome: 'Administrador', designadoProduto: false },
  { id: 't-2', nome: 'Assistente', designadoProduto: false },
  { id: 't-3', nome: 'Coordenador', designadoProduto: false },
  { id: 't-4', nome: 'Espectador', designadoProduto: false }
];

export const GestaoPage: React.FC<GestaoPageProps> = ({ onOpenColecoes }) => {
  // Aba de Gestão Ativa (Sub-navegação de cadastros)
  const [gestaoSubTab, setGestaoSubTab] = useState<
    'marcas' | 'usuarios' | 'times' | 'tecidos' | 'aviamentos' | 'caracteristicas' |
    'custos_fixos' | 'precificacao' | 'tipos_peca' | 'fornecedores' | 'tags' | 'fluxos' | 'campos_custom'
  >('marcas');

  // Filtros de busca de Marcas
  const [searchMarca, setSearchMarca] = useState('');
  
  // Menu de 3 Pontos da Tabela de Marcas
  const [openMenuMarcaId, setOpenMenuMarcaId] = useState<string | null>(null);

  // Estados dos Modais
  const [showCriarMarcaModal, setShowCriarMarcaModal] = useState(false);
  const [editingMarca, setEditingMarca] = useState<MarcaSummary | null>(null);
  const [editingUsersMarca, setEditingUsersMarca] = useState<MarcaSummary | null>(null);
  const [updatingTeamsMarca, setUpdatingTeamsMarca] = useState<MarcaSummary | null>(null);

  // Formulário de Criar/Editar Marca
  const [formMarcaNome, setFormMarcaNome] = useState('');
  const [formMarcaIntegracaoId, setFormMarcaIntegracaoId] = useState('');

  // Estado de Usuários da Marca no Modal (Print 4)
  const [brandUsers, setBrandUsers] = useState<BrandUser[]>(INITIAL_BRAND_USERS);
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Estado dos Times no Modal (Print 5)
  const [teamsList, setTeamsList] = useState<TeamItem[]>(INITIAL_TEAMS);

  // Marcas filtradas
  const filteredMarcas = MOCK_MARCAS.filter(m => 
    m.nome.toLowerCase().includes(searchMarca.toLowerCase())
  );

  // Abrir Modal de Edição de Marca (Print 3)
  const handleOpenEditarMarca = (marca: MarcaSummary) => {
    setOpenMenuMarcaId(null);
    setEditingMarca(marca);
    setFormMarcaNome(marca.nome);
    setFormMarcaIntegracaoId(marca.id === '2' ? 'KB_002' : marca.id === '1' ? 'KJ_001' : 'KP_003');
  };

  // Abrir Modal de Edição de Usuários (Print 4)
  const handleOpenEditarUsuarios = (marca: MarcaSummary) => {
    setOpenMenuMarcaId(null);
    setEditingUsersMarca(marca);
    setSearchUserQuery('');
  };

  // Abrir Modal de Atualizar Times (Print 5)
  const handleOpenAtualizarTimes = (marca: MarcaSummary) => {
    setOpenMenuMarcaId(null);
    setUpdatingTeamsMarca(marca);
  };

  // Alterar cargo de um usuário
  const handleCargoChange = (userId: string, newCargo: string) => {
    setBrandUsers(prev => prev.map(u => u.id === userId ? { ...u, cargo: newCargo } : u));
  };

  // Toggle checkbox em Modificar Times
  const handleToggleTeamProductDesignated = (teamId: string) => {
    setTeamsList(prev => prev.map(t => t.id === teamId ? { ...t, designadoProduto: !t.designadoProduto } : t));
  };

  return (
    <div className="w-full min-h-screen bg-bg text-primary pb-16 font-sans">
      
      {/* 1. SUB-NAVEGAÇÃO DE GESTÃO & CADASTROS BASE */}
      <div className="bg-surface border-b border-border shadow-2xs sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto py-3 text-xs font-semibold scrollbar-none">
            <button
              onClick={() => setGestaoSubTab('marcas')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'marcas'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Marcas
            </button>
            <button
              onClick={() => setGestaoSubTab('usuarios')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'usuarios'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Usuários
            </button>
            <button
              onClick={() => setGestaoSubTab('times')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'times'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Times
            </button>
            <button
              onClick={() => setGestaoSubTab('tecidos')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'tecidos'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Tecidos
            </button>
            <button
              onClick={() => setGestaoSubTab('aviamentos')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'aviamentos'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Aviamentos
            </button>
            <button
              onClick={() => setGestaoSubTab('caracteristicas')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'caracteristicas'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Características
            </button>
            <button
              onClick={() => setGestaoSubTab('custos_fixos')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'custos_fixos'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Custos fixos
            </button>
            <button
              onClick={() => setGestaoSubTab('precificacao')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'precificacao'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Precificação
            </button>
            <button
              onClick={() => setGestaoSubTab('tipos_peca')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'tipos_peca'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Tipos de peça
            </button>
            <button
              onClick={() => setGestaoSubTab('fornecedores')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'fornecedores'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Fornecedores
            </button>
            <button
              onClick={() => setGestaoSubTab('tags')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'tags'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Tags
            </button>
            <button
              onClick={() => setGestaoSubTab('fluxos')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'fluxos'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Fluxos
            </button>
            <button
              onClick={() => setGestaoSubTab('campos_custom')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'campos_custom'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Campos Customizados
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL (SEÇÃO MARCAS - PRINT 2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
        
        {gestaoSubTab === 'marcas' ? (
          <>
            {/* CARD DE FILTROS E BUSCA DE MARCAS */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                <span>Filtros</span>
              </div>

              <div className="space-y-1 max-w-xs">
                <label className="text-xs font-semibold text-muted-foreground block">Busca</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchMarca}
                    onChange={(e) => setSearchMarca(e.target.value)}
                    placeholder="Buscar"
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
              </div>
            </div>

            {/* PAINEL PRINCIPAL DE MARCAS & TABELA (PRINT 2) */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
              
              {/* CABEÇALHO DO PAINEL COM BOTÃO + NOVA MARCA */}
              <div className="flex items-center justify-between border-b border-border-muted pb-4">
                <h2 className="text-lg font-bold font-editorial text-primary">Marcas</h2>

                <button
                  type="button"
                  onClick={() => {
                    setFormMarcaNome('');
                    setFormMarcaIntegracaoId('');
                    setShowCriarMarcaModal(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>Nova Marca</span>
                </button>
              </div>

              {/* TABELA DE MARCAS */}
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
                        {/* IMAGEM */}
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                            {marca.logoUrl ? (
                              <img 
                                src={marca.logoUrl} 
                                alt={marca.nome} 
                                className="w-full h-full object-cover img-brand-treated" 
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                            )}
                          </div>
                        </td>

                        {/* NOME DA MARCA */}
                        <td className="py-3 px-4 font-bold text-primary">
                          {marca.nome}
                        </td>

                        {/* TOTAL DE COLEÇÕES */}
                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {marca.totalColecoes}
                        </td>

                        {/* TOTAL DE USUÁRIOS */}
                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {marca.totalUsuarios}
                        </td>

                        {/* BOTÃO DE AÇÕES COM MENU DROP-DOWN DE 3 PONTOS (PRINT 2) */}
                        <td className="py-3 px-4 text-right relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenuMarcaId(openMenuMarcaId === marca.id ? null : marca.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                            title="Ações da Marca"
                          >
                            <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                          </button>

                          {/* DROPDOWN DE AÇÕES */}
                          {openMenuMarcaId === marca.id && (
                            <div className="absolute right-4 top-10 w-44 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                              
                              {/* 1. ABRIR (VAI PARA COLEÇÕES) */}
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

                              {/* 2. EDITAR MARCA (PRINT 3) */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditarMarca(marca)}
                                className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                                <span>Editar Marca</span>
                              </button>

                              {/* (TRADUÇÃO REMOVIDA CONFORME SOLICITAÇÃO EXPRÉSSA DO USUÁRIO) */}

                              {/* 3. EDITAR USUÁRIOS (PRINT 4) */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditarUsuarios(marca)}
                                className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                              >
                                <UserCog className="w-4 h-4 text-muted" strokeWidth={1.5} />
                                <span>Editar Usuários</span>
                              </button>

                              {/* 4. ATUALIZAR TIMES (PRINT 5) */}
                              <button
                                type="button"
                                onClick={() => handleOpenAtualizarTimes(marca)}
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

              {/* PAGINAÇÃO */}
              <div className="flex items-center justify-between border-t border-border-muted pt-4 text-xs text-muted">
                <span>1-{filteredMarcas.length} de {filteredMarcas.length}</span>
                <div className="flex items-center gap-1">
                  <button className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50">
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50">
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="p-12 rounded-xl bg-surface border border-border shadow-2xs text-center space-y-3">
            <Users2 className="w-12 h-12 text-accent-camel mx-auto opacity-80" strokeWidth={1.5} />
            <h3 className="text-xl font-bold font-editorial text-primary uppercase tracking-wider">
              {gestaoSubTab.replace('_', ' ')}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Gerenciamento de {gestaoSubTab.replace('_', ' ')} para o grupo AKR BRANDS.
            </p>
          </div>
        )}

      </div>

      {/* ============================================================================ */}
      {/* 3. MODAL 1: CRIAÇÃO DE MARCA (PRINT 1) */}
      {/* ============================================================================ */}
      {showCriarMarcaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* TOPO DO MODAL */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Criação de marca</h3>
              <button
                type="button"
                onClick={() => setShowCriarMarcaModal(false)}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* CONTEÚDO DO MODAL */}
            <div className="p-6 space-y-5 text-xs">
              
              {/* BANNER DE ALERTA AMARELO DA REPLICAÇÃO */}
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 font-medium leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <strong>Atenção!</strong> Ao criar uma nova marca, solicite a replicação da customização enviando um e-mail para <span className="font-bold underline text-amber-950">customizacoes@colecao.moda</span> detalhando sua demanda. Em caso de dúvidas, acione o Suporte.
                </div>
              </div>

              {/* UPLOAD DE IMAGEM */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Imagem</label>
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
                  <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                </div>
              </div>

              {/* INPUT NOME */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">
                  Nome <span className="text-accent-bordo">*</span>
                </label>
                <input
                  type="text"
                  value={formMarcaNome}
                  onChange={(e) => setFormMarcaNome(e.target.value)}
                  placeholder="Ex: Majestoso Brocado, Anos 80, Pegada CoolVibe"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>

              {/* INPUT ID DE INTEGRAÇÃO */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">ID de integração da marca</label>
                <input
                  type="text"
                  value={formMarcaIntegracaoId}
                  onChange={(e) => setFormMarcaIntegracaoId(e.target.value)}
                  placeholder="Ex: BRAND_123"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>

            </div>

            {/* RODAPÉ DO MODAL */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
              <button
                type="button"
                onClick={() => setShowCriarMarcaModal(false)}
                className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setShowCriarMarcaModal(false)}
                className="px-4 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
              >
                Criar Marca
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 4. MODAL 2: EDIÇÃO DE MARCA (PRINT 3) */}
      {/* ============================================================================ */}
      {editingMarca && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* TOPO DO MODAL */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Edição de marca</h3>
              <button
                type="button"
                onClick={() => setEditingMarca(null)}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* CONTEÚDO DO MODAL */}
            <div className="p-6 space-y-5 text-xs">
              
              {/* UPLOAD DE IMAGEM */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Imagem</label>
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
                  {editingMarca.logoUrl ? (
                    <img src={editingMarca.logoUrl} alt="" className="w-full h-full object-cover rounded-lg img-brand-treated" />
                  ) : (
                    <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                  )}
                </div>
              </div>

              {/* INPUT NOME PREENCHIDO */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">
                  Nome <span className="text-accent-bordo">*</span>
                </label>
                <input
                  type="text"
                  value={formMarcaNome}
                  onChange={(e) => setFormMarcaNome(e.target.value)}
                  placeholder="Ex: K&J Black"
                  className="w-full bg-surface-muted border border-border text-primary font-semibold rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>

              {/* INPUT ID DE INTEGRAÇÃO */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">ID de integração da marca</label>
                <input
                  type="text"
                  value={formMarcaIntegracaoId}
                  onChange={(e) => setFormMarcaIntegracaoId(e.target.value)}
                  placeholder="Ex: BRAND_123"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>

            </div>

            {/* RODAPÉ DO MODAL */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
              <button
                type="button"
                onClick={() => setEditingMarca(null)}
                className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setEditingMarca(null)}
                className="px-4 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
              >
                Atualizar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 5. MODAL 3: EDIÇÃO DE USUÁRIOS DA MARCA (PRINT 4) */}
      {/* ============================================================================ */}
      {editingUsersMarca && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* TOPO DO MODAL */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Edição de usuários da marca</h3>
              <button
                type="button"
                onClick={() => setEditingUsersMarca(null)}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* PAINEL SUPERIOR COM MARCA E BUSCA */}
            <div className="p-6 border-b border-border-muted bg-surface-muted/20 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground block">Marca</label>
                  <input
                    type="text"
                    value={editingUsersMarca.nome}
                    disabled
                    className="w-full bg-surface-muted border border-border text-primary font-bold rounded-lg px-3 py-2 text-xs opacity-90 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground block">Busca</label>
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="Buscar"
                    className="w-full bg-surface border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
              </div>
            </div>

            {/* TABELA DE USUÁRIOS COM SELECT DE CARGOS SOLICITADOS */}
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Nome</th>
                    <th className="py-2.5 px-3">Cargo</th>
                    <th className="py-2.5 px-3">Times</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted">
                  {brandUsers
                    .filter(u => 
                      u.nome.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
                    )
                    .map((usr) => (
                      <tr key={usr.id} className="hover:bg-surface-muted/30 transition">
                        <td className="py-2.5 px-3 font-medium text-muted-foreground">
                          {usr.email}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-primary">
                          {usr.nome}
                        </td>
                        
                        {/* DROPDOWN DE CARGOS COM AS 5 OPÇÕES EXATAS */}
                        <td className="py-2.5 px-3">
                          <select
                            value={usr.cargo}
                            onChange={(e) => handleCargoChange(usr.id, e.target.value)}
                            className="bg-surface border border-border text-primary font-medium rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
                          >
                            {CARGOS_OPCOES.map(cargo => (
                              <option key={cargo} value={cargo}>
                                {cargo}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* COLUNA TIMES */}
                        <td className="py-2.5 px-3">
                          {usr.timesBadge ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-muted border border-border text-muted-foreground text-[11px] font-medium">
                              {usr.timesBadge}
                            </span>
                          ) : (
                            <div className="w-48 h-8 rounded-lg border border-border bg-surface-muted/30"></div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* RODAPÉ E PAGINAÇÃO */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-muted/30 text-xs text-muted">
              <span>1-10 de 10</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* 6. MODAL 4: MODIFICAR TIMES (PRINT 5) */}
      {/* ============================================================================ */}
      {updatingTeamsMarca && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* TOPO DO MODAL */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Modificar times</h3>
              <button
                type="button"
                onClick={() => setUpdatingTeamsMarca(null)}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* TABELA DE TIMES COM CHECKBOX DESIGNADO DE PRODUTO */}
            <div className="p-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4 text-center">Designado de produto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted">
                  {teamsList.map((team) => (
                    <tr key={team.id} className="hover:bg-surface-muted/30 transition">
                      <td className="py-3 px-4 font-semibold text-primary">
                        {team.nome}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={team.designadoProduto}
                          onChange={() => handleToggleTeamProductDesignated(team.id)}
                          className="w-4 h-4 rounded border-border text-primary accent-accent-camel cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RODAPÉ E PAGINAÇÃO DE TIMES */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-muted/30 text-xs text-muted">
              <span>1-4 de 4</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
