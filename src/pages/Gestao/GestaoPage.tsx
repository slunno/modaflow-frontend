/**
 * ============================================================================
 * MÓDULO: Módulo de Gestão & Cadastros Base (GestaoPage)
 * ARQUIVO: src/pages/Gestao/GestaoPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Interface de gerenciamento centralizado de Marcas, Usuários, Times,
 *            Tecidos e Aviamentos.
 *            Suporta as visões de Marcas e Usuários (com "Editar Perfil / Cargos de usuário"
 *            e o modal "Criação de Usuário"), com estado dinâmico pronto para
 *            integração com API/Banco de Dados.
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
  ChevronRight,
  ArrowLeft,
  Info
} from 'lucide-react';

interface GestaoPageProps {
  onOpenColecoes: (marca: MarcaSummary) => void;
}

// OPÇÕES DE CARGOS DEFINIDAS NA TELA DE CARGOS DE USUÁRIO (PRINT 2)
const CARGOS_OPCOES = [
  'Nenhum',
  'Administrador',
  'Assistente',
  'Coordenador',
  'Observador',
  'Estilista'
];

// ESTRUTURAS DE DADOS DE USUÁRIOS DINÂMICAS
export interface UserBrandRole {
  marcaId: string;
  marcaNome: string;
  logoUrl?: string;
  cargo: string;
  times: string[];
}

export interface UserRecord {
  id: string;
  email: string;
  nome: string;
  codigo?: string;
  marcas: string[];
  status: 'Ativo' | 'Inativo';
  acesso: 'Permitido' | 'Bloqueado';
  isFantasma?: boolean;
  brandRoles: UserBrandRole[];
}

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

// LISTA DE USUÁRIOS REATIVA (PRONTA PARA CONSUMIR BANCO DE DADOS)
const INITIAL_USERS_DATA: UserRecord[] = [
  {
    id: 'u-1',
    email: 'suporte.kingjoe@colecao.moda',
    nome: 'Suporte Suporte',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: ['Estilista'] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
    ]
  },
  {
    id: 'u-2',
    email: 'fabiano.moutinho@kingjoe.com.br',
    nome: 'Fabiano',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: [] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
    ]
  },
  {
    id: 'u-3',
    email: 'jessica.oliveira@kingjoe.com.br',
    nome: 'Jéssica',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: [] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
    ]
  },
  {
    id: 'u-4',
    email: 'mariana.barbosa@kingjoe.com.br',
    nome: 'Mariana Barbosa',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: ['Estilista'] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
    ]
  },
  {
    id: 'u-5',
    email: 'desenvolvimento@kingjoe.com.br',
    nome: 'Ivonete Barbosa',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: ['Estilista'] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
    ]
  },
  {
    id: 'u-6',
    email: 'cleilson.teixeira@kingjoe.com.br',
    nome: 'Cleilson Teixeira',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Estilista', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Estilista', times: ['Modelista'] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Estilista', times: [] }
    ]
  },
  {
    id: 'u-7',
    email: 'marlaine.suave@kingjoe.com.br',
    nome: 'Marlaine',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: [] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
    ]
  },
  {
    id: 'u-8',
    email: 'juliano.brito@kingjoe.com.br',
    nome: 'Juliano',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: [] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
    ]
  },
  {
    id: 'u-9',
    email: 'beatriz.sparani@kingjoe.com.br',
    nome: 'Beatriz Sparani',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: ['Estilista'] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
    ]
  },
  {
    id: 'u-10',
    email: 'tatiana.gaio@kingjoe.com.br',
    nome: 'Tatiana',
    codigo: '--',
    marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
    status: 'Ativo',
    acesso: 'Permitido',
    isFantasma: false,
    brandRoles: [
      { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Assistente', times: [] },
      { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Assistente', times: [] },
      { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Assistente', times: [] }
    ]
  }
];

export const GestaoPage: React.FC<GestaoPageProps> = ({ onOpenColecoes }) => {
  // Aba de Gestão Ativa (Sub-navegação de cadastros)
  const [gestaoSubTab, setGestaoSubTab] = useState<
    'marcas' | 'usuarios' | 'times' | 'tecidos' | 'aviamentos' | 'caracteristicas' |
    'custos_fixos' | 'precificacao' | 'tipos_peca' | 'fornecedores' | 'tags' | 'fluxos' | 'campos_custom'
  >('marcas');

  // ============================================================================
  // ESTADOS DA SEÇÃO DE MARCAS
  // ============================================================================
  const [searchMarca, setSearchMarca] = useState('');
  const [openMenuMarcaId, setOpenMenuMarcaId] = useState<string | null>(null);
  const [showCriarMarcaModal, setShowCriarMarcaModal] = useState(false);
  const [editingMarca, setEditingMarca] = useState<MarcaSummary | null>(null);
  const [updatingTeamsMarca, setUpdatingTeamsMarca] = useState<MarcaSummary | null>(null);
  const [formMarcaNome, setFormMarcaNome] = useState('');
  const [formMarcaIntegracaoId, setFormMarcaIntegracaoId] = useState('');
  const [teamsList, setTeamsList] = useState<TeamItem[]>(INITIAL_TEAMS);

  // ============================================================================
  // ESTADOS DA SEÇÃO DE USUÁRIOS (PRINTS 1, 2, 3)
  // ============================================================================
  const [usersList, setUsersList] = useState<UserRecord[]>(INITIAL_USERS_DATA);
  const [userFilterMarca, setUserFilterMarca] = useState<'Todas' | 'King & Joe' | 'King & Joe Play' | 'K&J Black'>('Todas');
  const [userFilterStatus, setUserFilterStatus] = useState<'Ativos' | 'Todos' | 'Inativos'>('Ativos');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  // TELA DE EDITAR PERFIL / CARGOS DE USUÁRIO (PRINT 2)
  const [editingUserProfile, setEditingUserProfile] = useState<UserRecord | null>(null);
  const [filtrarCargosToggle, setFiltrarCargosToggle] = useState(false);
  const [searchCargoQuery, setSearchCargoQuery] = useState('');

  // MODAL DE CRIAÇÃO DE USUÁRIO (PRINT 3)
  const [showCriarUsuarioModal, setShowCriarUsuarioModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserCodigo, setNewUserCodigo] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIsFantasma, setNewUserIsFantasma] = useState(false);
  const [newUserSenha, setNewUserSenha] = useState('');
  const [newUserConfirmarSenha, setNewUserConfirmarSenha] = useState('');

  // Marcas filtradas
  const filteredMarcas = MOCK_MARCAS.filter(m => 
    m.nome.toLowerCase().includes(searchMarca.toLowerCase())
  );

  // Usuários filtrados
  const filteredUsers = usersList.filter(u => {
    // Filtro por marca
    if (userFilterMarca !== 'Todas' && !u.marcas.includes(userFilterMarca)) {
      return false;
    }
    // Filtro por status
    if (userFilterStatus === 'Ativos' && u.status !== 'Ativo') return false;
    if (userFilterStatus === 'Inativos' && u.status !== 'Inativo') return false;
    // Filtro por busca
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const matchName = u.nome.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchCode = u.codigo ? u.codigo.toLowerCase().includes(q) : false;
      if (!matchName && !matchEmail && !matchCode) return false;
    }
    return true;
  });

  // Handler de Criar Novo Usuário (Print 3)
  const handleCreateUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: UserRecord = {
      id: `u-${Date.now()}`,
      email: newUserEmail.trim(),
      nome: newUserName.trim(),
      codigo: newUserCodigo.trim() || '--',
      marcas: ['King & Joe', 'King & Joe Play', 'K&J Black'],
      status: 'Ativo',
      acesso: 'Permitido',
      isFantasma: newUserIsFantasma,
      brandRoles: [
        { marcaId: '2', marcaNome: 'K&J Black', cargo: 'Administrador', times: [] },
        { marcaId: '1', marcaNome: 'King & Joe', cargo: 'Administrador', times: [] },
        { marcaId: '3', marcaNome: 'King & Joe Play', cargo: 'Administrador', times: [] }
      ]
    };

    setUsersList(prev => [newUser, ...prev]);
    setShowCriarUsuarioModal(false);
    setNewUserName('');
    setNewUserCodigo('');
    setNewUserEmail('');
    setNewUserIsFantasma(false);
    setNewUserSenha('');
    setNewUserConfirmarSenha('');
  };

  // Abrir Tela de Editar Perfil (Print 2 - Cargos de Usuário)
  const handleOpenEditarPerfil = (user: UserRecord) => {
    setOpenMenuUserId(null);
    setEditingUserProfile(JSON.parse(JSON.stringify(user)));
  };

  // Salvar Alterações de Editar Perfil (Print 2)
  const handleSaveUserProfile = () => {
    if (!editingUserProfile) return;
    setUsersList(prev => prev.map(u => u.id === editingUserProfile.id ? editingUserProfile : u));
    setEditingUserProfile(null);
  };

  // Atualizar Cargo de Marca na Tela Editar Perfil
  const handleUpdateUserBrandRole = (marcaId: string, newCargo: string) => {
    if (!editingUserProfile) return;
    setEditingUserProfile(prev => {
      if (!prev) return null;
      const updatedRoles = prev.brandRoles.map(r => 
        r.marcaId === marcaId ? { ...r, cargo: newCargo } : r
      );
      return { ...prev, brandRoles: updatedRoles };
    });
  };

  // Abrir Modal de Edição de Marca (Print 3 Marca)
  const handleOpenEditarMarca = (marca: MarcaSummary) => {
    setOpenMenuMarcaId(null);
    setEditingMarca(marca);
    setFormMarcaNome(marca.nome);
    setFormMarcaIntegracaoId(marca.id === '2' ? 'KB_002' : marca.id === '1' ? 'KJ_001' : 'KP_003');
  };

  // Abrir Lista de Usuários Filtrada pela Marca
  const handleOpenEditarUsuarios = (marca: MarcaSummary) => {
    setOpenMenuMarcaId(null);
    if (marca.nome === 'King & Joe' || marca.nome === 'King & Joe Play' || marca.nome === 'K&J Black') {
      setUserFilterMarca(marca.nome as any);
    } else {
      setUserFilterMarca('Todas');
    }
    setGestaoSubTab('usuarios');
  };

  // Abrir Modal de Atualizar Times (Print 5 Marca)
  const handleOpenAtualizarTimes = (marca: MarcaSummary) => {
    setOpenMenuMarcaId(null);
    setUpdatingTeamsMarca(marca);
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
              onClick={() => {
                setEditingUserProfile(null);
                setGestaoSubTab('marcas');
              }}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'marcas' && !editingUserProfile
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Marcas
            </button>
            <button
              onClick={() => setGestaoSubTab('usuarios')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'usuarios' || editingUserProfile
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Usuários
            </button>
            <button
              onClick={() => {
                setEditingUserProfile(null);
                setGestaoSubTab('times');
              }}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'times'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Times
            </button>
            <button
              onClick={() => {
                setEditingUserProfile(null);
                setGestaoSubTab('tecidos');
              }}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'tecidos'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Tecidos
            </button>
            <button
              onClick={() => {
                setEditingUserProfile(null);
                setGestaoSubTab('aviamentos');
              }}
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

      {/* 2. CONTEÚDO PRINCIPAL DAS ABAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
        
        {/* ============================================================================ */}
        {/* SEÇÃO EDITAR PERFIL / CARGOS DE USUÁRIO (PRINT 2) */}
        {/* ============================================================================ */}
        {editingUserProfile ? (
          <div className="space-y-6 animate-in fade-in zoom-in-98 duration-200">
            
            {/* CABEÇALHO DO EDITAR PERFIL COM BOTÃO ATUALIZAR */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUserProfile(null)}
                  className="p-1.5 rounded-lg border border-border bg-surface text-muted hover:text-primary transition cursor-pointer"
                  title="Voltar para a lista de usuários"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <h2 className="text-lg font-bold font-editorial text-primary">Cargos de usuário</h2>
              </div>

              <button
                type="button"
                onClick={handleSaveUserProfile}
                className="px-5 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer"
              >
                Atualizar
              </button>
            </div>

            {/* CARD 1: INFORMAÇÕES DO USUÁRIO */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div className="text-xs font-bold text-muted uppercase tracking-wider">
                Informações do usuário
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* NOME * */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">
                    Nome <span className="text-accent-bordo">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingUserProfile.nome}
                    onChange={(e) => setEditingUserProfile({ ...editingUserProfile, nome: e.target.value })}
                    className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>

                {/* E-MAIL * */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">
                    E-mail <span className="text-accent-bordo">*</span>
                  </label>
                  <input
                    type="email"
                    value={editingUserProfile.email}
                    onChange={(e) => setEditingUserProfile({ ...editingUserProfile, email: e.target.value })}
                    className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>

                {/* CÓDIGO */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Código</span>
                    <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  </label>
                  <input
                    type="text"
                    value={editingUserProfile.codigo || ''}
                    onChange={(e) => setEditingUserProfile({ ...editingUserProfile, codigo: e.target.value })}
                    className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>

                {/* ATIVO SWITCH TOGGLE */}
                <div className="space-y-1 flex flex-col justify-end">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingUserProfile({ 
                        ...editingUserProfile, 
                        status: editingUserProfile.status === 'Ativo' ? 'Inativo' : 'Ativo' 
                      })}
                      className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${
                        editingUserProfile.status === 'Ativo' ? 'bg-accent-camel' : 'bg-surface-muted border border-border'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                        editingUserProfile.status === 'Ativo' ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-xs font-semibold text-primary">Ativo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: FILTROS */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div className="text-xs font-bold text-muted uppercase tracking-wider">
                Filtros
              </div>

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
                    <div className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                      filtrarCargosToggle ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                  <span className="text-xs font-semibold text-primary">Filtrar Cargos</span>
                </div>
              </div>
            </div>

            {/* CARD 3: TABELA DE CARGOS POR MARCA (PRINT 2) */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
              <div className="text-xs font-bold text-muted uppercase tracking-wider">
                Cargos
              </div>

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
                    {MOCK_MARCAS.map((marca) => {
                      const roleEntry = editingUserProfile.brandRoles.find(r => r.marcaId === marca.id) || {
                        marcaId: marca.id,
                        marcaNome: marca.nome,
                        cargo: 'Nenhum',
                        times: []
                      };

                      return (
                        <tr key={marca.id} className="hover:bg-surface-muted/30 transition">
                          {/* IMAGEM DA MARCA */}
                          <td className="py-3 px-4">
                            <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                              {marca.heroImageUrl ? (
                                <img src={marca.heroImageUrl} alt="" className="w-full h-full object-cover img-brand-treated" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                              )}
                            </div>
                          </td>

                          {/* NOME DA MARCA */}
                          <td className="py-3 px-4 font-bold text-primary">
                            {marca.nome}
                          </td>

                          {/* DROPDOWN SELECT DE CARGOS COM AS 6 OPÇÕES (PRINT 2) */}
                          <td className="py-3 px-4">
                            <select
                              value={roleEntry.cargo}
                              onChange={(e) => handleUpdateUserBrandRole(marca.id, e.target.value)}
                              className="bg-surface border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer w-48"
                            >
                              {CARGOS_OPCOES.map(cargo => (
                                <option key={cargo} value={cargo}>
                                  {cargo}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* COLUNA TIMES */}
                          <td className="py-3 px-4">
                            {roleEntry.times.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-muted border border-border text-muted-foreground text-[11px] font-medium">
                                {roleEntry.times.join(', ')}
                              </span>
                            ) : (
                              <div className="w-full max-w-xs h-9 rounded-lg border border-border bg-surface-muted/30"></div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINAÇÃO */}
              <div className="flex items-center justify-between border-t border-border-muted pt-4 text-xs text-muted">
                <span>1-3 de 3</span>
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
        ) : gestaoSubTab === 'usuarios' ? (
          /* ============================================================================ */
          /* TAB DE USUÁRIOS (PRINT 1) */
          /* ============================================================================ */
          <>
            {/* CARD DE FILTROS (PRINT 1) */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                <span>Filtros</span>
              </div>

              {/* FILTROS POR MARCAS E STATUS */}
              <div className="space-y-3">
                {/* MARCAS PILLS */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground w-16">Marcas</span>
                  <div className="flex items-center gap-1.5">
                    {(['Todas', 'King & Joe', 'King & Joe Play', 'K&J Black'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setUserFilterMarca(m)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          userFilterMarca === m
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* STATUS PILLS */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground w-16">Status</span>
                  <div className="flex items-center gap-1.5">
                    {(['Ativos', 'Todos', 'Inativos'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setUserFilterStatus(s)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          userFilterStatus === s
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* INPUT DE BUSCA (PRINT 1) */}
              <div className="space-y-1 max-w-xs pt-2">
                <label className="text-xs font-semibold text-muted-foreground block">Busca</label>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Código ou Nome"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>
            </div>

            {/* PAINEL DE USUÁRIOS E TABELA (PRINT 1) */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
              
              {/* CABEÇALHO DO PAINEL COM BOTÃO + CRIAR USUÁRIO */}
              <div className="flex items-center justify-between border-b border-border-muted pb-4">
                <h2 className="text-lg font-bold font-editorial text-primary">Usuários</h2>

                <button
                  type="button"
                  onClick={() => setShowCriarUsuarioModal(true)}
                  className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>Criar usuário</span>
                </button>
              </div>

              {/* TABELA DE USUÁRIOS (PRINT 1) */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                      <th className="py-3 px-4">E-mail</th>
                      <th className="py-3 px-4">Nome</th>
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Marcas</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Acesso</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-muted/30 transition">
                        {/* E-MAIL */}
                        <td className="py-3 px-4 font-medium text-muted-foreground">
                          {u.email}
                        </td>

                        {/* NOME */}
                        <td className="py-3 px-4 font-bold text-primary">
                          {u.nome}
                        </td>

                        {/* CÓDIGO */}
                        <td className="py-3 px-4 text-muted">
                          {u.codigo || '--'}
                        </td>

                        {/* MARCAS VINCULADAS */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {u.marcas.map(m => (
                              <span key={m} className="px-2 py-0.5 rounded-md bg-accent-camel/10 text-accent-camel font-semibold text-[11px]">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            u.status === 'Ativo' 
                              ? 'bg-emerald-500/10 text-emerald-700' 
                              : 'bg-rose-500/10 text-rose-700'
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        {/* ACESSO */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            u.acesso === 'Permitido' 
                              ? 'bg-emerald-500/10 text-emerald-700' 
                              : 'bg-rose-500/10 text-rose-700'
                          }`}>
                            {u.acesso}
                          </span>
                        </td>

                        {/* AÇÕES (3 PONTOS) */}
                        <td className="py-3 px-4 text-right relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenuUserId(openMenuUserId === u.id ? null : u.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                          </button>

                          {openMenuUserId === u.id && (
                            <div className="absolute right-4 top-10 w-40 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => handleOpenEditarPerfil(u)}
                                className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                              >
                                <UserCog className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                                <span>Editar perfil</span>
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
                <span>1-{filteredUsers.length} de {filteredUsers.length}</span>
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
        ) : gestaoSubTab === 'marcas' ? (
          /* ============================================================================ */
          /* TAB DE MARCAS (PRINT 2 DA ETAPA ANTERIOR) */
          /* ============================================================================ */
          <>
            {/* CARD DE FILTROS E BUSCA DE MARCAS */}
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

            {/* PAINEL PRINCIPAL DE MARCAS & TABELA */}
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
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

                        <td className="py-3 px-4 font-bold text-primary">
                          {marca.nome}
                        </td>

                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {marca.totalColecoes || marca.colecoesCount}
                        </td>

                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {marca.totalUsuarios || 16}
                        </td>

                        <td className="py-3 px-4 text-right relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenuMarcaId(openMenuMarcaId === marca.id ? null : marca.id)}
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
                                onClick={() => handleOpenEditarMarca(marca)}
                                className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                                <span>Editar Marca</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditarUsuarios(marca)}
                                className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                              >
                                <UserCog className="w-4 h-4 text-muted" strokeWidth={1.5} />
                                <span>Editar Usuários</span>
                              </button>

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
            </div>
          </>
        ) : (
          <div className="p-12 rounded-xl bg-surface border border-border shadow-2xs text-center space-y-3">
            <Users2 className="w-12 h-12 text-accent-camel mx-auto opacity-80" strokeWidth={1.5} />
            <h3 className="text-xl font-bold font-editorial text-primary uppercase tracking-wider">
              {gestaoSubTab.replace('_', ' ')}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Gerenciamento de {gestaoSubTab.replace('_', ' ')} para a holding AKR BRANDS.
            </p>
          </div>
        )}

      </div>

      {/* ============================================================================ */}
      {/* 3. MODAL DE CRIAÇÃO DE USUÁRIO (PRINT 3 DA NOVA SOLICITAÇÃO) */}
      {/* ============================================================================ */}
      {showCriarUsuarioModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* TOPO DO MODAL */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Criação de Usuário</h3>
              <button
                type="button"
                onClick={() => setShowCriarUsuarioModal(false)}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* TEXTO DE ORIENTAÇÃO */}
            <div className="px-6 pt-4 text-xs text-muted-foreground leading-relaxed">
              Ao criar um usuário, é necessário definir quais serão os Cargos em cada uma das Marcas que você deseja que ele tenha acesso.
            </div>

            {/* CONTEÚDO DO FORMULÁRIO (GRID 2 COLUNAS - PRINT 3) */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* NOME * */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">
                    Nome <span className="text-accent-bordo">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>

                {/* CÓDIGO ⓘ */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Código</span>
                    <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  </label>
                  <input
                    type="text"
                    value={newUserCodigo}
                    onChange={(e) => setNewUserCodigo(e.target.value)}
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>

                {/* E-MAIL * */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">
                    E-mail <span className="text-accent-bordo">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>

                {/* USUÁRIO FANTASMA ⓘ (TOGGLE) */}
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                    <span>Usuário fantasma</span>
                    <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setNewUserIsFantasma(!newUserIsFantasma)}
                      className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${
                        newUserIsFantasma ? 'bg-accent-camel' : 'bg-surface-muted border border-border'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                        newUserIsFantasma ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-xs font-semibold text-primary">
                      {newUserIsFantasma ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>

                {/* NOVA SENHA * */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">
                    Nova Senha <span className="text-accent-bordo">*</span>
                  </label>
                  <input
                    type="password"
                    value={newUserSenha}
                    onChange={(e) => setNewUserSenha(e.target.value)}
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>

                {/* CONFIRMAÇÃO DE SENHA * */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">
                    Confirmação de Senha <span className="text-accent-bordo">*</span>
                  </label>
                  <input
                    type="password"
                    value={newUserConfirmarSenha}
                    onChange={(e) => setNewUserConfirmarSenha(e.target.value)}
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>

              </div>
            </div>

            {/* RODAPÉ DO MODAL */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
              <button
                type="button"
                onClick={() => setShowCriarUsuarioModal(false)}
                className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                className="px-5 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
              >
                Criar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL EDIÇÃO DE MARCA */}
      {/* ============================================================================ */}
      {editingMarca && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Edição de marca</h3>
              <button type="button" onClick={() => setEditingMarca(null)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Imagem</label>
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
                  <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Nome *</label>
                <input
                  type="text"
                  value={formMarcaNome}
                  onChange={(e) => setFormMarcaNome(e.target.value)}
                  className="w-full bg-surface-muted border border-border text-primary font-semibold rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">ID de integração da marca</label>
                <input
                  type="text"
                  value={formMarcaIntegracaoId}
                  onChange={(e) => setFormMarcaIntegracaoId(e.target.value)}
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
              <button type="button" onClick={() => setEditingMarca(null)} className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs">Cancelar</button>
              <button type="button" onClick={() => setEditingMarca(null)} className="px-4 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs">Atualizar</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL CRIAÇÃO DE MARCA */}
      {/* ============================================================================ */}
      {showCriarMarcaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Criação de marca</h3>
              <button type="button" onClick={() => setShowCriarMarcaModal(false)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-5 text-xs">
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 font-medium leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <strong>Atenção!</strong> Ao criar uma nova marca, solicite a replicação da customização enviando um e-mail para <span className="font-bold underline text-amber-950">customizacoes@colecao.moda</span> detalhando sua demanda. Em caso de dúvidas, acione o Suporte.
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Imagem</label>
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
                  <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">Nome *</label>
                <input
                  type="text"
                  value={formMarcaNome}
                  onChange={(e) => setFormMarcaNome(e.target.value)}
                  placeholder="Ex: Majestoso Brocado, Anos 80, Pegada CoolVibe"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>
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
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
              <button type="button" onClick={() => setShowCriarMarcaModal(false)} className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs">Cancelar</button>
              <button type="button" onClick={() => setShowCriarMarcaModal(false)} className="px-4 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs">Criar Marca</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL MODIFICAR TIMES (PRINT 5 MARCA) */}
      {/* ============================================================================ */}
      {updatingTeamsMarca && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Modificar times</h3>
              <button type="button" onClick={() => setUpdatingTeamsMarca(null)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
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
                      <td className="py-3 px-4 font-semibold text-primary">{team.nome}</td>
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-muted/30 text-xs text-muted">
              <span>1-4 de 4</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50"><ChevronLeft className="w-4 h-4" strokeWidth={1.5} /></button>
                <button className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50"><ChevronRight className="w-4 h-4" strokeWidth={1.5} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
