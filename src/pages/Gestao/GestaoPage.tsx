/**
 * ============================================================================
 * MÓDULO: Módulo de Gestão & Cadastros Base (GestaoPage)
 * ARQUIVO: src/pages/Gestao/GestaoPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Interface de gerenciamento centralizado de Marcas, Usuários, Times,
 *            Tecidos e Aviamentos.
 *            Possui 4 visões interativas: Marcas, Usuários, Times (com modal Atualizar Time)
 *            e Tecidos (com busca por Insumo/Cor/Fornecedor, menu de Opções com sub-menu Exportar,
 *            modal Criando Insumo e modal Importar).
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
  Info,
  ChevronDown,
  UploadCloud,
  Download,
  RotateCcw,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';

interface GestaoPageProps {
  onOpenColecoes: (marca: MarcaSummary) => void;
}

// OPÇÕES DE CARGOS DEFINIDAS NA TELA DE CARGOS DE USUÁRIO
const CARGOS_OPCOES = [
  'Nenhum',
  'Administrador',
  'Assistente',
  'Coordenador',
  'Observador',
  'Estilista'
];

// ESTRUTURAS DE DADOS DE USUÁRIOS
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

// ESTRUTURA DE TIMES
interface TeamItem {
  id: string;
  nome: string;
  descricao?: string;
  designadoProduto: boolean;
}

const INITIAL_TEAMS: TeamItem[] = [
  { id: 't-1', nome: 'Administrador', descricao: '--', designadoProduto: false },
  { id: 't-2', nome: 'Assistente', descricao: '--', designadoProduto: false },
  { id: 't-3', nome: 'Coordenador', descricao: '--', designadoProduto: false },
  { id: 't-4', nome: 'Espectador', descricao: '--', designadoProduto: false },
  { id: 't-5', nome: 'Estilista', descricao: '--', designadoProduto: false },
  { id: 't-6', nome: 'Modelista', descricao: '--', designadoProduto: false }
];

// ESTRUTURA DE TECIDOS / INSUMOS
interface TecidoInsumoItem {
  id: string;
  nome: string;
  codigo: string;
  temErp: boolean;
  imagemUrl?: string;
  fornecedores: string;
  custo: string;
  unidade: 'M' | 'Kg' | 'Metros';
}

const INITIAL_TECIDOS_DATA: TecidoInsumoItem[] = [];

// LISTA DE USUÁRIOS REATIVA (ARRAY VAZIO POR PADRÃO CONFORME ORIENTAÇÃO)
const INITIAL_USERS_DATA: UserRecord[] = [];

export const GestaoPage: React.FC<GestaoPageProps> = ({ onOpenColecoes }) => {
  // Aba de Gestão Ativa
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

  // ============================================================================
  // ESTADOS DA SEÇÃO DE USUÁRIOS
  // ============================================================================
  const [usersList, setUsersList] = useState<UserRecord[]>(INITIAL_USERS_DATA);
  const [userFilterMarca, setUserFilterMarca] = useState<'Todas' | 'King & Joe' | 'King & Joe Play' | 'K&J Black'>('Todas');
  const [userFilterStatus, setUserFilterStatus] = useState<'Ativos' | 'Todos' | 'Inativos'>('Ativos');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  // TELA DE EDITAR PERFIL / CARGOS DE USUÁRIO
  const [editingUserProfile, setEditingUserProfile] = useState<UserRecord | null>(null);
  const [filtrarCargosToggle, setFiltrarCargosToggle] = useState(false);
  const [searchCargoQuery, setSearchCargoQuery] = useState('');

  // MODAL DE CRIAÇÃO DE USUÁRIO
  const [showCriarUsuarioModal, setShowCriarUsuarioModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserCodigo, setNewUserCodigo] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIsFantasma, setNewUserIsFantasma] = useState(false);
  const [newUserSenha, setNewUserSenha] = useState('');
  const [newUserConfirmarSenha, setNewUserConfirmarSenha] = useState('');

  // ============================================================================
  // ESTADOS DA SEÇÃO DE TIMES (PRINTS 1 E 2)
  // ============================================================================
  const [teamFilterMarca, setTeamFilterMarca] = useState('King & Joe');
  const [teamsList, setTeamsList] = useState<TeamItem[]>(INITIAL_TEAMS);
  const [openMenuTeamId, setOpenMenuTeamId] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);
  const [showAtualizarTimeModal, setShowAtualizarTimeModal] = useState(false);
  const [teamFormNome, setTeamFormNome] = useState('');
  const [teamFormDesignado, setTeamFormDesignado] = useState(false);
  const [teamFormDescricao, setTeamFormDescricao] = useState('');

  // ============================================================================
  // ESTADOS DA SEÇÃO DE TECIDOS (PRINTS 3, 4, 5)
  // ============================================================================
  const [searchTecidoInsumo, setSearchTecidoInsumo] = useState('');
  const [searchTecidoCor, setSearchTecidoCor] = useState('');
  const [searchTecidoFornecedor, setSearchTecidoFornecedor] = useState('');
  const [tecidosList, setTecidosList] = useState<TecidoInsumoItem[]>(INITIAL_TECIDOS_DATA);
  
  // MENU DE OPÇÕES (IMPORTAR, EXPORTAR SUB-MENU, RESTAURAR, EXCLUIR)
  const [showOpcoesTecidoMenu, setShowOpcoesTecidoMenu] = useState(false);
  const [opcoesTecidoSubMenu, setOpcoesTecidoSubMenu] = useState<'main' | 'exportar'>('main');

  // MODAIS DE TECIDOS
  const [showCriandoInsumoModal, setShowCriandoInsumoModal] = useState(false);
  const [showImportarInsumosModal, setShowImportarInsumosModal] = useState(false);

  // FORMULÁRIO DO MODAL "CRIANDO INSUMO" (PRINT 4)
  const [insumoNome, setInsumoNome] = useState('');
  const [insumoCodigo, setInsumoCodigo] = useState('');
  const [insumoPreco, setInsumoPreco] = useState('0');
  const [insumoUnidade, setInsumoUnidade] = useState<'Metros' | 'Kg'>('Metros');
  const [insumoGramatura, setInsumoGramatura] = useState('0');
  const [insumoLargura, setInsumoLargura] = useState('0');
  const [insumoRendimento1, setInsumoRendimento1] = useState('0.00');
  const [insumoRendimento2, setInsumoRendimento2] = useState('0.00');
  const [insumoEncolhimento, setInsumoEncolhimento] = useState('');
  const [insumoConstrucao, setInsumoConstrucao] = useState('');
  const [insumoObservacoes, setInsumoObservacoes] = useState('');

  // ESTADOS DE EDIÇÃO / AÇÕES DE TECIDOS
  const [openMenuTecidoId, setOpenMenuTecidoId] = useState<string | null>(null);
  const [editingTecido, setEditingTecido] = useState<TecidoInsumoItem | null>(null);
  const [showInformacoesTecidoModal, setShowInformacoesTecidoModal] = useState(false);

  // ============================================================================
  // ESTADOS DA SEÇÃO DE AVIAMENTOS (PRINTS 2 E 3)
  // ============================================================================
  const [searchAviamentoInsumo, setSearchAviamentoInsumo] = useState('');
  const [searchAviamentoCor, setSearchAviamentoCor] = useState('');
  const [searchAviamentoFornecedor, setSearchAviamentoFornecedor] = useState('');
  const [aviamentosList, setAviamentosList] = useState<TecidoInsumoItem[]>([]);
  const [openMenuAviamentoId, setOpenMenuAviamentoId] = useState<string | null>(null);
  const [showOpcoesAviamentoMenu, setShowOpcoesAviamentoMenu] = useState(false);
  const [opcoesAviamentoSubMenu, setOpcoesAviamentoSubMenu] = useState<'main' | 'exportar'>('main');
  const [showCriandoAviamentoModal, setShowCriandoAviamentoModal] = useState(false);
  const [showInformacoesAviamentoModal, setShowInformacoesAviamentoModal] = useState(false);
  const [editingAviamento, setEditingAviamento] = useState<TecidoInsumoItem | null>(null);
  const [aviamentoNome, setAviamentoNome] = useState('');
  const [aviamentoCodigo, setAviamentoCodigo] = useState('');
  const [aviamentoPreco, setAviamentoPreco] = useState('0');
  const [aviamentoUnidade, setAviamentoUnidade] = useState<'Unidade' | 'Metros'>('Unidade');
  const [aviamentoObservacoes, setAviamentoObservacoes] = useState('');

  // ============================================================================
  // ESTADOS DA SEÇÃO DE CARACTERÍSTICAS (PRINTS 4 E 5)
  // ============================================================================
  const [caracteristicaFilterMarca, setCaracteristicaFilterMarca] = useState<'K&J Black' | 'King & Joe' | 'King & Joe Play'>('K&J Black');
  const [caracteristicaSearchQuery, setCaracteristicaSearchQuery] = useState('');
  const [caracteristicasList, setCaracteristicasList] = useState<{
    id: string;
    nome: string;
    marca: string;
    tabelasMedidas: { id: string; nomeTabela: string; medidas: string }[];
  }[]>([]);
  const [openMenuCaracteristicaId, setOpenMenuCaracteristicaId] = useState<string | null>(null);
  const [showCriarCaracteristicaModal, setShowCriarCaracteristicaModal] = useState(false);
  const [caracteristicaFormNome, setCaracteristicaFormNome] = useState('');
  const [caracteristicaFormTabelas, setCaracteristicaFormTabelas] = useState<
    { id: string; nomeTabela: string; medidas: string }[]
  >([{ id: 'tab-1', nomeTabela: '', medidas: '' }]);

  // Marcas filtradas
  const filteredMarcas = MOCK_MARCAS.filter(m => 
    m.nome.toLowerCase().includes(searchMarca.toLowerCase())
  );

  // Usuários filtrados
  const filteredUsers = usersList.filter(u => {
    if (userFilterMarca !== 'Todas' && !u.marcas.includes(userFilterMarca)) return false;
    if (userFilterStatus === 'Ativos' && u.status !== 'Ativo') return false;
    if (userFilterStatus === 'Inativos' && u.status !== 'Inativo') return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const matchName = u.nome.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchCode = u.codigo ? u.codigo.toLowerCase().includes(q) : false;
      if (!matchName && !matchEmail && !matchCode) return false;
    }
    return true;
  });

  // Handler de Criar Novo Usuário
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

  // Abrir Tela de Editar Perfil
  const handleOpenEditarPerfil = (user: UserRecord) => {
    setOpenMenuUserId(null);
    setEditingUserProfile(JSON.parse(JSON.stringify(user)));
  };

  // Salvar Alterações de Editar Perfil
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

  // Abrir Modal de Edição de Marca
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

  // Abrir Modal de Atualizar Times na Marca
  const handleOpenAtualizarTimes = (marca: MarcaSummary) => {
    setOpenMenuMarcaId(null);
    setUpdatingTeamsMarca(marca);
  };

  // Toggle checkbox em Modificar Times
  const handleToggleTeamProductDesignated = (teamId: string) => {
    setTeamsList(prev => prev.map(t => t.id === teamId ? { ...t, designadoProduto: !t.designadoProduto } : t));
  };

  // Abrir Modal de Editar/Atualizar Time na tela Times (Print 1)
  const handleOpenEditTeamModal = (team: TeamItem) => {
    setOpenMenuTeamId(null);
    setEditingTeam(team);
    setTeamFormNome(team.nome);
    setTeamFormDesignado(team.designadoProduto);
    setTeamFormDescricao(team.descricao || '');
    setShowAtualizarTimeModal(true);
  };

  // Salvar Time
  const handleSaveTeam = () => {
    if (editingTeam) {
      setTeamsList(prev => prev.map(t => t.id === editingTeam.id ? { 
        ...t, 
        nome: teamFormNome, 
        designadoProduto: teamFormDesignado, 
        descricao: teamFormDescricao || '--' 
      } : t));
    } else {
      const newT: TeamItem = {
        id: `t-${Date.now()}`,
        nome: teamFormNome || 'Novo Time',
        descricao: teamFormDescricao || '--',
        designadoProduto: teamFormDesignado
      };
      setTeamsList(prev => [...prev, newT]);
    }
    setShowAtualizarTimeModal(false);
    setEditingTeam(null);
  };

  // Handler do Form de Criar Insumo (Print 4)
  const handleCreateInsumo = () => {
    if (!insumoNome.trim()) return;

    const newInsumo: TecidoInsumoItem = {
      id: `tec-${Date.now()}`,
      nome: insumoNome.trim(),
      codigo: insumoCodigo.trim() || '01010001',
      temErp: true,
      fornecedores: 'VICUNHA - MARACANAÚ 010020',
      custo: `R$ ${insumoPreco || '0'},0000 /${insumoUnidade === 'Metros' ? 'M' : 'Kg'}`,
      unidade: insumoUnidade
    };

    setTecidosList(prev => [newInsumo, ...prev]);
    setShowCriandoInsumoModal(false);
    setInsumoNome('');
    setInsumoCodigo('');
    setInsumoPreco('0');
    setInsumoObservacoes('');
  };

  // Handlers para Edição/Exclusão de Tecidos
  const handleOpenEditarTecido = (tecido: TecidoInsumoItem) => {
    setOpenMenuTecidoId(null);
    setEditingTecido(tecido);
    setInsumoNome(tecido.nome);
    setInsumoCodigo(tecido.codigo);
    setInsumoPreco(tecido.custo.split(' ')[1]?.split(',')[0] || '0');
    setInsumoUnidade(tecido.unidade === 'Kg' ? 'Kg' : 'Metros');
    setShowInformacoesTecidoModal(true);
  };

  const handleSaveEditTecido = () => {
    if (!editingTecido) return;
    setTecidosList(prev => prev.map(t => t.id === editingTecido.id ? {
      ...t,
      nome: insumoNome,
      codigo: insumoCodigo,
      custo: `R$ ${insumoPreco || '0'},0000 /${insumoUnidade === 'Metros' ? 'M' : 'Kg'}`,
      unidade: insumoUnidade
    } : t));
    setShowInformacoesTecidoModal(false);
    setEditingTecido(null);
  };

  const handleDeleteTecido = (id: string) => {
    setOpenMenuTecidoId(null);
    setTecidosList(prev => prev.filter(t => t.id !== id));
  };

  // Handlers para Aviamentos
  const handleCreateAviamento = () => {
    if (!aviamentoNome.trim()) return;
    const newAviamento: TecidoInsumoItem = {
      id: `avi-${Date.now()}`,
      nome: aviamentoNome.trim(),
      codigo: aviamentoCodigo.trim() || '1234',
      temErp: true,
      fornecedores: 'FORNECEDOR PADRÃO',
      custo: `R$ ${aviamentoPreco || '0'},0000 /${aviamentoUnidade === 'Metros' ? 'M' : 'UN'}`,
      unidade: aviamentoUnidade as any
    };
    setAviamentosList(prev => [newAviamento, ...prev]);
    setShowCriandoAviamentoModal(false);
    setAviamentoNome('');
    setAviamentoCodigo('');
    setAviamentoPreco('0');
    setAviamentoObservacoes('');
  };

  const handleOpenEditarAviamento = (aviamento: TecidoInsumoItem) => {
    setOpenMenuAviamentoId(null);
    setEditingAviamento(aviamento);
    setAviamentoNome(aviamento.nome);
    setAviamentoCodigo(aviamento.codigo);
    setAviamentoPreco(aviamento.custo.split(' ')[1]?.split(',')[0] || '0');
    setAviamentoUnidade(aviamento.unidade === 'Metros' ? 'Metros' : 'Unidade');
    setShowInformacoesAviamentoModal(true);
  };

  const handleSaveEditAviamento = () => {
    if (!editingAviamento) return;
    setAviamentosList(prev => prev.map(a => a.id === editingAviamento.id ? {
      ...a,
      nome: aviamentoNome,
      codigo: aviamentoCodigo,
      custo: `R$ ${aviamentoPreco || '0'},0000 /${aviamentoUnidade === 'Metros' ? 'M' : 'UN'}`,
      unidade: aviamentoUnidade as any
    } : a));
    setShowInformacoesAviamentoModal(false);
    setEditingAviamento(null);
  };

  const handleDeleteAviamento = (id: string) => {
    setOpenMenuAviamentoId(null);
    setAviamentosList(prev => prev.filter(a => a.id !== id));
  };

  // Handlers para Características
  const handleCreateCaracteristica = () => {
    if (!caracteristicaFormNome.trim()) return;
    const newCarac = {
      id: `car-${Date.now()}`,
      nome: caracteristicaFormNome.trim(),
      marca: caracteristicaFilterMarca,
      tabelasMedidas: [...caracteristicaFormTabelas]
    };
    setCaracteristicasList(prev => [newCarac, ...prev]);
    setShowCriarCaracteristicaModal(false);
    setCaracteristicaFormNome('');
    setCaracteristicaFormTabelas([{ id: 'tab-1', nomeTabela: '', medidas: '' }]);
  };

  const handleAddFormTabela = () => {
    setCaracteristicaFormTabelas(prev => [
      ...prev,
      { id: `tab-${Date.now()}`, nomeTabela: '', medidas: '' }
    ]);
  };

  const handleRemoveFormTabela = (id: string) => {
    setCaracteristicaFormTabelas(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteCaracteristica = (id: string) => {
    setOpenMenuCaracteristicaId(null);
    setCaracteristicasList(prev => prev.filter(c => c.id !== id));
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
        {/* SEÇÃO 1: MARCAS */}
        {/* ============================================================================ */}
        {gestaoSubTab === 'marcas' && !editingUserProfile ? (
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
                              <img src={marca.heroImageUrl} alt={marca.nome} className="w-full h-full object-cover img-brand-treated" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-primary">{marca.nome}</td>
                        <td className="py-3 px-4 text-muted-foreground font-medium">{marca.totalColecoes || marca.colecoesCount}</td>
                        <td className="py-3 px-4 text-muted-foreground font-medium">{marca.totalUsuarios || 16}</td>
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
        ) : editingUserProfile ? (
          /* ============================================================================ */
          /* SEÇÃO EDITAR PERFIL / CARGOS DE USUÁRIO */
          /* ============================================================================ */
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
                onClick={handleSaveUserProfile}
                className="px-5 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer"
              >
                Atualizar
              </button>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div className="text-xs font-bold text-muted uppercase tracking-wider">Informações do usuário</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Nome <span className="text-accent-bordo">*</span></label>
                  <input
                    type="text"
                    value={editingUserProfile.nome}
                    onChange={(e) => setEditingUserProfile({ ...editingUserProfile, nome: e.target.value })}
                    className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">E-mail <span className="text-accent-bordo">*</span></label>
                  <input
                    type="email"
                    value={editingUserProfile.email}
                    onChange={(e) => setEditingUserProfile({ ...editingUserProfile, email: e.target.value })}
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
                    onChange={(e) => setEditingUserProfile({ ...editingUserProfile, codigo: e.target.value })}
                    className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
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
                    <div className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                      filtrarCargosToggle ? 'translate-x-5' : 'translate-x-0'
                    }`} />
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
                    {MOCK_MARCAS.map((marca) => {
                      const roleEntry = editingUserProfile.brandRoles.find(r => r.marcaId === marca.id) || {
                        marcaId: marca.id,
                        marcaNome: marca.nome,
                        cargo: 'Nenhum',
                        times: []
                      };
                      return (
                        <tr key={marca.id} className="hover:bg-surface-muted/30 transition">
                          <td className="py-3 px-4">
                            <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                              <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-primary">{marca.nome}</td>
                          <td className="py-3 px-4">
                            <select
                              value={roleEntry.cargo}
                              onChange={(e) => handleUpdateUserBrandRole(marca.id, e.target.value)}
                              className="bg-surface border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer w-48"
                            >
                              {CARGOS_OPCOES.map(cargo => (
                                <option key={cargo} value={cargo}>{cargo}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-full max-w-xs h-9 rounded-lg border border-border bg-surface-muted/30"></div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : gestaoSubTab === 'usuarios' ? (
          /* ============================================================================ */
          /* SEÇÃO USUÁRIOS */
          /* ============================================================================ */
          <>
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                <span>Filtros</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground w-16">Marcas</span>
                  <div className="flex items-center gap-1.5">
                    {(['Todas', 'King & Joe', 'King & Joe Play', 'K&J Black'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setUserFilterMarca(m)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          userFilterMarca === m ? 'bg-primary text-white shadow-2xs' : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground w-16">Status</span>
                  <div className="flex items-center gap-1.5">
                    {(['Ativos', 'Todos', 'Inativos'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setUserFilterStatus(s)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          userFilterStatus === s ? 'bg-primary text-white shadow-2xs' : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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

            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
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
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium">
                          Nenhum usuário cadastrado. Clique em "+ Criar usuário" para cadastrar um novo perfil.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-muted/30 transition">
                          <td className="py-3 px-4 font-medium text-muted-foreground">{u.email}</td>
                          <td className="py-3 px-4 font-bold text-primary">{u.nome}</td>
                          <td className="py-3 px-4 text-muted">{u.codigo || '--'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {u.marcas.map(m => (
                                <span key={m} className="px-2 py-0.5 rounded-md bg-accent-camel/10 text-accent-camel font-semibold text-[11px]">{m}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${u.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${u.acesso === 'Permitido' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'}`}>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : gestaoSubTab === 'times' ? (
          /* ============================================================================ */
          /* SEÇÃO TIMES (PRINTS 1 E 2) */
          /* ============================================================================ */
          <>
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                <span>Filtros</span>
              </div>
              <div className="space-y-1 max-w-xs">
                <label className="text-xs font-semibold text-muted-foreground block">Marca</label>
                <select
                  value={teamFilterMarca}
                  onChange={(e) => setTeamFilterMarca(e.target.value)}
                  className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
                >
                  <option value="King & Joe">King & Joe</option>
                  <option value="King & Joe Play">King & Joe Play</option>
                  <option value="K&J Black">K&J Black</option>
                </select>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-border-muted pb-4">
                <h2 className="text-lg font-bold font-editorial text-primary">Times</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTeam(null);
                    setTeamFormNome('');
                    setTeamFormDesignado(false);
                    setTeamFormDescricao('');
                    setShowAtualizarTimeModal(true);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                      <th className="py-3 px-4">Nome</th>
                      <th className="py-3 px-4">Descrição</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted">
                    {teamsList.map((team) => (
                      <tr key={team.id} className="hover:bg-surface-muted/30 transition">
                        <td className="py-3 px-4 font-bold text-primary">{team.nome}</td>
                        <td className="py-3 px-4 text-muted-foreground font-medium">{team.descricao || '--'}</td>
                        <td className="py-3 px-4 text-right relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenuTeamId(openMenuTeamId === team.id ? null : team.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          {openMenuTeamId === team.id && (
                            <div className="absolute right-4 top-10 w-36 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => handleOpenEditTeamModal(team)}
                                className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                                <span>Editar</span>
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
        ) : gestaoSubTab === 'tecidos' ? (
          /* ============================================================================ */
          /* SEÇÃO TECIDOS (PRINTS 3, 4, 5) */
          /* ============================================================================ */
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
                              setShowImportarInsumosModal(true);
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
                    onClick={() => setShowCriandoInsumoModal(true)}
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
                        <input type="checkbox" className="w-4 h-4 rounded border-border accent-accent-camel cursor-pointer" />
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
                    {tecidosList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium">
                          Nenhum insumo cadastrado. Clique em "+ Adicionar" ou "Importar" para cadastrar insumos.
                        </td>
                      </tr>
                    ) : (
                      tecidosList
                        .filter(t => {
                          if (searchTecidoInsumo.trim()) {
                            const q = searchTecidoInsumo.toLowerCase();
                            if (!t.nome.toLowerCase().includes(q) && !t.codigo.toLowerCase().includes(q)) return false;
                          }
                          if (searchTecidoFornecedor.trim()) {
                            if (!t.fornecedores.toLowerCase().includes(searchTecidoFornecedor.toLowerCase())) return false;
                          }
                          return true;
                        })
                        .map((tecido) => (
                          <tr key={tecido.id} className="hover:bg-surface-muted/30 transition">
                            <td className="py-3 px-4">
                              <input type="checkbox" className="w-4 h-4 rounded border-border accent-accent-camel cursor-pointer" />
                            </td>
                            <td className="py-3 px-4 font-bold text-primary">{tecido.nome}</td>
                            <td className="py-3 px-4 font-mono text-muted-foreground">{tecido.codigo}</td>
                            <td className="py-3 px-4">
                              <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                                {tecido.imagemUrl ? (
                                  <img src={tecido.imagemUrl} alt={tecido.nome} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-medium">{tecido.fornecedores}</td>
                            <td className="py-3 px-4 font-bold text-primary">{tecido.custo}</td>
                            <td className="py-3 px-4 text-right relative">
                              <button
                                type="button"
                                onClick={() => setOpenMenuTecidoId(openMenuTecidoId === tecido.id ? null : tecido.id)}
                                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                              {openMenuTecidoId === tecido.id && (
                                <div className="absolute right-4 top-10 w-32 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditarTecido(tecido)}
                                    className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTecido(tecido.id)}
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
        ) : gestaoSubTab === 'aviamentos' ? (
          /* ============================================================================ */
          /* SEÇÃO AVIAMENTOS (PRINTS 2 E 3) */
          /* ============================================================================ */
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
                              setShowImportarInsumosModal(true);
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
                    onClick={() => {
                      setAviamentoNome('');
                      setAviamentoCodigo('');
                      setAviamentoPreco('0');
                      setAviamentoUnidade('Unidade');
                      setShowCriandoAviamentoModal(true);
                    }}
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
                        <input type="checkbox" className="w-4 h-4 rounded border-border accent-accent-camel cursor-pointer" />
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
                    {aviamentosList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium">
                          Nenhum aviamento cadastrado. Clique em "+ Adicionar" ou "Importar" para cadastrar aviamentos.
                        </td>
                      </tr>
                    ) : (
                      aviamentosList
                        .filter(a => {
                          if (searchAviamentoInsumo.trim()) {
                            const q = searchAviamentoInsumo.toLowerCase();
                            if (!a.nome.toLowerCase().includes(q) && !a.codigo.toLowerCase().includes(q)) return false;
                          }
                          return true;
                        })
                        .map((aviamento) => (
                          <tr key={aviamento.id} className="hover:bg-surface-muted/30 transition">
                            <td className="py-3 px-4">
                              <input type="checkbox" className="w-4 h-4 rounded border-border accent-accent-camel cursor-pointer" />
                            </td>
                            <td className="py-3 px-4 font-bold text-primary">{aviamento.nome}</td>
                            <td className="py-3 px-4 font-mono text-muted-foreground">{aviamento.codigo}</td>
                            <td className="py-3 px-4">
                              <div className="w-10 h-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center overflow-hidden">
                                <ImageIcon className="w-5 h-5 text-muted opacity-50" strokeWidth={1.5} />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-medium">{aviamento.fornecedores}</td>
                            <td className="py-3 px-4 font-bold text-primary">{aviamento.custo}</td>
                            <td className="py-3 px-4 text-right relative">
                              <button
                                type="button"
                                onClick={() => setOpenMenuAviamentoId(openMenuAviamentoId === aviamento.id ? null : aviamento.id)}
                                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                              {openMenuAviamentoId === aviamento.id && (
                                <div className="absolute right-4 top-10 w-32 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditarAviamento(aviamento)}
                                    className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAviamento(aviamento.id)}
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
        ) : gestaoSubTab === 'caracteristicas' ? (
          /* ============================================================================ */
          /* SEÇÃO CARACTERÍSTICAS (PRINTS 4 E 5) */
          /* ============================================================================ */
          <>
            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                <span>Filtros</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground w-16">Marcas</span>
                  <div className="flex items-center gap-1.5">
                    {(['K&J Black', 'King & Joe', 'King & Joe Play'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCaracteristicaFilterMarca(m)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          caracteristicaFilterMarca === m ? 'bg-primary text-white shadow-2xs' : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 max-w-xs pt-1">
                  <label className="text-xs font-semibold text-muted-foreground block">Busca</label>
                  <input
                    type="text"
                    value={caracteristicaSearchQuery}
                    onChange={(e) => setCaracteristicaSearchQuery(e.target.value)}
                    placeholder="Código ou Nome."
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-border-muted pb-4">
                <h2 className="text-lg font-bold font-editorial text-primary">Características de Marca</h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-border hover:bg-surface-muted font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 text-primary cursor-pointer"
                  >
                    <span>Opções</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCaracteristicaFormNome('');
                      setCaracteristicaFormTabelas([{ id: 'tab-1', nomeTabela: '', medidas: '' }]);
                      setShowCriarCaracteristicaModal(true);
                    }}
                    className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Adicionar</span>
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                      <th className="py-3 px-4">Nome</th>
                      <th className="py-3 px-4">Tabelas de medidas</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted">
                    {caracteristicasList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-muted-foreground font-medium">
                          Nenhum item listado
                        </td>
                      </tr>
                    ) : (
                      caracteristicasList
                        .filter(c => c.marca === caracteristicaFilterMarca)
                        .filter(c => !caracteristicaSearchQuery || c.nome.toLowerCase().includes(caracteristicaSearchQuery.toLowerCase()))
                        .map((c) => (
                          <tr key={c.id} className="hover:bg-surface-muted/30 transition">
                            <td className="py-3 px-4 font-bold text-primary">{c.nome}</td>
                            <td className="py-3 px-4 text-muted-foreground font-medium">{c.tabelasMedidas.length} tabela(s)</td>
                            <td className="py-3 px-4 text-right relative">
                              <button
                                type="button"
                                onClick={() => setOpenMenuCaracteristicaId(openMenuCaracteristicaId === c.id ? null : c.id)}
                                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                              {openMenuCaracteristicaId === c.id && (
                                <div className="absolute right-4 top-10 w-32 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCaracteristica(c.id)}
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
      {/* MODAL DE ATUALIZAR TIME (PRINT 1 - SEÇÃO TIMES) */}
      {/* ============================================================================ */}
      {showAtualizarTimeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">
                {editingTeam ? 'Atualizar time' : 'Criar time'}
              </h3>
              <button type="button" onClick={() => setShowAtualizarTimeModal(false)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground block">Nome <span className="text-accent-bordo">*</span></label>
                <input
                  type="text"
                  value={teamFormNome}
                  onChange={(e) => setTeamFormNome(e.target.value)}
                  placeholder="Administrador"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none font-medium"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="designadoProdutoCheck"
                  checked={teamFormDesignado}
                  onChange={(e) => setTeamFormDesignado(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary accent-accent-camel cursor-pointer"
                />
                <label htmlFor="designadoProdutoCheck" className="font-semibold text-muted-foreground cursor-pointer flex items-center gap-1">
                  <span>Designado de Produto</span>
                  <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                </label>
              </div>
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-muted-foreground block">Descrição</label>
                <textarea
                  rows={3}
                  value={teamFormDescricao}
                  onChange={(e) => setTeamFormDescricao(e.target.value)}
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30 text-xs">
              <button type="button" onClick={() => setShowAtualizarTimeModal(false)} className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer">Cancelar</button>
              <button type="button" onClick={handleSaveTeam} className="px-5 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs">{editingTeam ? 'Atualizar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL "CRIANDO INSUMO" (PRINT 4 - SEÇÃO TECIDOS) */}
      {/* ============================================================================ */}
      {showCriandoInsumoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Criando insumo</h3>
              <button type="button" onClick={() => setShowCriandoInsumoModal(false)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Identificação</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Nome do insumo e código de referência</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Nome <span className="text-accent-bordo">*</span></label>
                    <input type="text" value={insumoNome} onChange={(e) => setInsumoNome(e.target.value)} placeholder="Ex: Carmuça" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Código</label>
                    <input type="text" value={insumoCodigo} onChange={(e) => setInsumoCodigo(e.target.value)} placeholder="Ex: 3141592" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Fornecedores</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Cadastre ou selecione quais são todos os fornecedores deste insumo.</p>
                </div>
                <div className="md:col-span-2">
                  <button type="button" className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-1"><Plus className="w-3.5 h-3.5" strokeWidth={1.5} /><span>Adicionar</span></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Imagens</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Imagens de referência</p>
                </div>
                <div className="md:col-span-2">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
                    <ImageIcon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Composição</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Ex.: 97% Poliéster, 3% Elastano</p>
                </div>
                <div className="md:col-span-2">
                  <button type="button" className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-1"><Plus className="w-3.5 h-3.5" strokeWidth={1.5} /><span>Adicionar</span></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Cores</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Ex.: Azul 2369 C</p>
                </div>
                <div className="md:col-span-2 flex items-center gap-2 flex-wrap">
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-surface-muted text-muted cursor-pointer hover:border-accent-camel transition">
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Propriedades</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Definição das propriedades do tecido para cálculo de custos</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Gramatura</label>
                    <input type="text" value={insumoGramatura} onChange={(e) => setInsumoGramatura(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Largura (em metros)</label>
                    <input type="text" value={insumoLargura} onChange={(e) => setInsumoLargura(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Rendimento</label>
                    <input type="text" value={insumoRendimento1} onChange={(e) => setInsumoRendimento1(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Rendimento</label>
                    <input type="text" value={insumoRendimento2} onChange={(e) => setInsumoRendimento2(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Encolhimento</label>
                    <input type="text" value={insumoEncolhimento} onChange={(e) => setInsumoEncolhimento(e.target.value)} placeholder="Ex.: Urdume 2 Trama 9" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Construção</label>
                    <input type="text" value={insumoConstrucao} onChange={(e) => setInsumoConstrucao(e.target.value)} placeholder="Ex.: Sarja 2x1 z" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <h4 className="font-bold text-primary text-sm">Preço e observações</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Informações de preço e observações do insumo cadastrado.</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Preço</label>
                      <input type="text" value={insumoPreco} onChange={(e) => setInsumoPreco(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Unidade</label>
                      <select value={insumoUnidade} onChange={(e) => setInsumoUnidade(e.target.value as any)} className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer">
                        <option value="Metros">Metros</option>
                        <option value="Kg">Kg</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Observações</label>
                    <textarea rows={3} value={insumoObservacoes} onChange={(e) => setInsumoObservacoes(e.target.value)} placeholder="Ex.: Lembrar de adicionar uma versão..." className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-start px-6 py-4 border-t border-border bg-surface-muted/30">
              <button type="button" onClick={handleCreateInsumo} className="px-6 py-2.5 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs">Criar insumo</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL "INFORMAÇÕES" (EDIÇÃO DE TECIDO - PRINT 1) */}
      {/* ============================================================================ */}
      {showInformacoesTecidoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Informações</h3>
              <button type="button" onClick={() => setShowInformacoesTecidoModal(false)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Identificação</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Nome do insumo e código de referência</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Nome <span className="text-accent-bordo">*</span></label>
                    <input type="text" value={insumoNome} onChange={(e) => setInsumoNome(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Código</label>
                    <input type="text" value={insumoCodigo} onChange={(e) => setInsumoCodigo(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Fornecedores</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Cadastre ou selecione quais são todos os fornecedores deste insumo.</p>
                </div>
                <div className="md:col-span-2">
                  <button type="button" className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-1"><Plus className="w-3.5 h-3.5" strokeWidth={1.5} /><span>Adicionar</span></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Imagens</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Imagens de referência</p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3 flex-wrap">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
                    <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Composição</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Ex.: 97% Poliéster, 3% Elastano</p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="text" defaultValue="95" className="w-16 bg-surface-muted border border-border text-primary rounded-lg px-3 py-1.5 text-xs text-center" />
                    <select defaultValue="Algodão" className="bg-surface-muted border border-border text-primary rounded-lg px-3 py-1.5 text-xs font-medium">
                      <option value="Algodão">Algodão</option>
                      <option value="Poliéster">Poliéster</option>
                      <option value="Elastano">Elastano</option>
                    </select>
                    <button type="button" className="text-muted hover:text-rose-600"><X className="w-4 h-4" strokeWidth={1.5} /></button>
                  </div>
                  <button type="button" className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-1"><Plus className="w-3.5 h-3.5" strokeWidth={1.5} /><span>Adicionar</span></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Cores</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Ex.: Azul 2369 C</p>
                </div>
                <div className="md:col-span-2 flex items-center gap-2 flex-wrap">
                  <div className="w-10 h-10 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-surface-muted text-muted cursor-pointer hover:border-accent-camel transition">
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="px-3 py-2 bg-emerald-700 text-white font-bold rounded-lg text-[11px] uppercase">Verde</div>
                  <div className="px-3 py-2 bg-stone-500 text-white font-bold rounded-lg text-[11px] uppercase">Cinza</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Propriedades</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Definição das propriedades do tecido para cálculo de custos</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Gramatura</label>
                    <input type="text" value={insumoGramatura} onChange={(e) => setInsumoGramatura(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Largura (em metros)</label>
                    <input type="text" value={insumoLargura} onChange={(e) => setInsumoLargura(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Rendimento</label>
                    <input type="text" value={insumoRendimento1} onChange={(e) => setInsumoRendimento1(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Rendimento</label>
                    <input type="text" value={insumoRendimento2} onChange={(e) => setInsumoRendimento2(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Encolhimento</label>
                    <input type="text" value={insumoEncolhimento} onChange={(e) => setInsumoEncolhimento(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Construção</label>
                    <input type="text" value={insumoConstrucao} onChange={(e) => setInsumoConstrucao(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <h4 className="font-bold text-primary text-sm">Preço e observações</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Informações de preço e observações do insumo cadastrado.</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Preço</label>
                      <input type="text" value={insumoPreco} onChange={(e) => setInsumoPreco(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Unidade</label>
                      <select value={insumoUnidade} onChange={(e) => setInsumoUnidade(e.target.value as any)} className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer">
                        <option value="Metros">Metros</option>
                        <option value="Kg">Kg</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Observações</label>
                    <textarea rows={3} value={insumoObservacoes} onChange={(e) => setInsumoObservacoes(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-start px-6 py-4 border-t border-border bg-surface-muted/30">
              <button type="button" onClick={handleSaveEditTecido} className="px-6 py-2.5 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs">Salvar alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL "CRIANDO INSUMO" / "INFORMAÇÕES" (AVIAMENTOS - PRINTS 2 E 3) */}
      {/* ============================================================================ */}
      {(showCriandoAviamentoModal || showInformacoesAviamentoModal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">
                {showInformacoesAviamentoModal ? 'Informações' : 'Criando insumo'}
              </h3>
              <button type="button" onClick={() => { setShowCriandoAviamentoModal(false); setShowInformacoesAviamentoModal(false); }} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Identificação</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Nome do insumo e código de referência</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Nome <span className="text-accent-bordo">*</span></label>
                    <input type="text" value={aviamentoNome} onChange={(e) => setAviamentoNome(e.target.value)} placeholder="Ex: Zíper Médio" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Código</label>
                    <input type="text" value={aviamentoCodigo} onChange={(e) => setAviamentoCodigo(e.target.value)} placeholder="Ex: 1234" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Fornecedores</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Cadastre ou selecione quais são todos os fornecedores deste insumo.</p>
                </div>
                <div className="md:col-span-2">
                  <button type="button" className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-1"><Plus className="w-3.5 h-3.5" strokeWidth={1.5} /><span>Adicionar</span></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Imagens</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Imagens de referência</p>
                </div>
                <div className="md:col-span-2">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
                    <ImageIcon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Composição</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Ex.: 97% Poliéster, 3% Elastano</p>
                </div>
                <div className="md:col-span-2">
                  <button type="button" className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-1"><Plus className="w-3.5 h-3.5" strokeWidth={1.5} /><span>Adicionar</span></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Cores</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Ex.: Azul 2369 C</p>
                </div>
                <div className="md:col-span-2">
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-surface-muted text-muted cursor-pointer hover:border-accent-camel transition">
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <h4 className="font-bold text-primary text-sm">Preço e observações</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Informações de preço e observações do insumo cadastrado.</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Preço</label>
                      <input type="text" value={aviamentoPreco} onChange={(e) => setAviamentoPreco(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Unidade</label>
                      <select value={aviamentoUnidade} onChange={(e) => setAviamentoUnidade(e.target.value as any)} className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer">
                        <option value="Unidade">Unidade</option>
                        <option value="Metros">Metros</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Observações</label>
                    <textarea rows={3} value={aviamentoObservacoes} onChange={(e) => setAviamentoObservacoes(e.target.value)} placeholder="Ex.: Lembrar de adicionar uma versão sintética" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-start px-6 py-4 border-t border-border bg-surface-muted/30">
              <button
                type="button"
                onClick={showInformacoesAviamentoModal ? handleSaveEditAviamento : handleCreateAviamento}
                className="px-6 py-2.5 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
              >
                {showInformacoesAviamentoModal ? 'Salvar alterações' : 'Criar insumo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL "CRIAR CARACTERÍSTICA DE MARCA" (PRINT 4) */}
      {/* ============================================================================ */}
      {showCriarCaracteristicaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Criar característica de marca</h3>
              <button type="button" onClick={() => setShowCriarCaracteristicaModal(false)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-6 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground block">Nome</label>
                <input
                  type="text"
                  value={caracteristicaFormNome}
                  onChange={(e) => setCaracteristicaFormNome(e.target.value)}
                  placeholder="Ex.: Blusa V"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                        <th className="py-2.5 px-3">Nome da tabela</th>
                        <th className="py-2.5 px-3">Medidas</th>
                        <th className="py-2.5 px-3 w-20 text-center">Imagem</th>
                        <th className="py-2.5 px-3 w-16 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-muted">
                      {caracteristicaFormTabelas.map((tab) => (
                        <tr key={tab.id}>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={tab.nomeTabela}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCaracteristicaFormTabelas(prev => prev.map(t => t.id === tab.id ? { ...t, nomeTabela: val } : t));
                              }}
                              placeholder="Ex.: Top, Bottom, ..."
                              className="w-full bg-surface-muted border border-border text-primary rounded-md px-2.5 py-1.5 text-xs outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={tab.medidas}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCaracteristicaFormTabelas(prev => prev.map(t => t.id === tab.id ? { ...t, medidas: val } : t));
                              }}
                              placeholder="Ex.: Gola V, Manga, ..."
                              className="w-full bg-surface-muted border border-border text-primary rounded-md px-2.5 py-1.5 text-xs outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-1 bg-surface-muted border border-border rounded text-[11px] text-muted-foreground">Sim</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveFormTabela(tab.id)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleAddFormTabela}
                  className="px-3 py-1.5 bg-primary text-white font-bold rounded-md hover:bg-neutral-800 transition cursor-pointer text-xs inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Tabela</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
              <button
                type="button"
                onClick={() => setShowCriarCaracteristicaModal(false)}
                className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateCaracteristica}
                className="px-5 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL "IMPORTAÇÃO DE INSUMOS" (PRINT 5 - SEÇÃO TECIDOS) */}
      {/* ============================================================================ */}
      {showImportarInsumosModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Importação de Insumos</h3>
              <button type="button" onClick={() => setShowImportarInsumosModal(false)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-6 text-xs">
              <div className="space-y-2 text-primary font-medium">
                <p>Para realizar a importação siga os passos:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pl-1">
                  <li><a href="#modelo" className="text-accent-camel hover:underline font-semibold">Baixe a planilha modelo clicando aqui.</a></li>
                  <li>Preencha com seus insumos seguindo o formato modelo.</li>
                  <li>Importe o arquivo .CSV clicando no botão importar abaixo.</li>
                </ol>
              </div>
              <div className="flex justify-center py-2">
                <button type="button" onClick={() => setShowImportarInsumosModal(false)} className="px-5 py-2.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-2 shadow-2xs">
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
                    <li><strong className="text-primary">Nome do insumo:</strong> preenchimento obrigatório</li>
                    <li>
                      <strong className="text-primary">Tipo do preço:</strong>
                      <ul className="list-square list-inside pl-4 font-normal">
                        <li>Tecidos → somente KG ou M.</li>
                        <li>Aviamentos → somente M ou UN.</li>
                      </ul>
                    </li>
                    <li>
                      <strong className="text-primary">composição:</strong> No formato _%Material + _%Material
                      <span className="block italic pl-4">Ex.: 90% Poliamida + 10% Elastano.</span>
                    </li>
                    <li>
                      <strong className="text-primary">Fornecedor:</strong> Se já existir no CM informe o Código exatamente como está cadastrado
                      <span className="block italic text-muted pl-4">(Caso Preenchido na planilha com código diferente ou em branco será criado novo fornecedor com o mesmo nome.)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL CRIAÇÃO DE USUÁRIO */}
      {/* ============================================================================ */}
      {showCriarUsuarioModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">Criação de Usuário</h3>
              <button type="button" onClick={() => setShowCriarUsuarioModal(false)} className="text-muted hover:text-primary transition cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-6 pt-4 text-xs text-muted-foreground leading-relaxed">
              Ao criar um usuário, é necessário definir quais serão os Cargos em cada uma das Marcas que você deseja que ele tenha acesso.
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Nome <span className="text-accent-bordo">*</span></label>
                  <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground flex items-center gap-1"><span>Código</span><Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /></label>
                  <input type="text" value={newUserCodigo} onChange={(e) => setNewUserCodigo(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">E-mail <span className="text-accent-bordo">*</span></label>
                  <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="font-semibold text-muted-foreground flex items-center gap-1 mb-1"><span>Usuário fantasma</span><Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /></label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setNewUserIsFantasma(!newUserIsFantasma)} className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${newUserIsFantasma ? 'bg-accent-camel' : 'bg-surface-muted border border-border'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${newUserIsFantasma ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs font-semibold text-primary">{newUserIsFantasma ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Nova Senha <span className="text-accent-bordo">*</span></label>
                  <input type="password" value={newUserSenha} onChange={(e) => setNewUserSenha(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Confirmação de Senha <span className="text-accent-bordo">*</span></label>
                  <input type="password" value={newUserConfirmarSenha} onChange={(e) => setNewUserConfirmarSenha(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
              <button type="button" onClick={() => setShowCriarUsuarioModal(false)} className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs">Cancelar</button>
              <button type="button" onClick={handleCreateUser} className="px-5 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs">Criar</button>
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
                <input type="text" value={formMarcaNome} onChange={(e) => setFormMarcaNome(e.target.value)} className="w-full bg-surface-muted border border-border text-primary font-semibold rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">ID de integração da marca</label>
                <input type="text" value={formMarcaIntegracaoId} onChange={(e) => setFormMarcaIntegracaoId(e.target.value)} className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
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
                <input type="text" value={formMarcaNome} onChange={(e) => setFormMarcaNome(e.target.value)} placeholder="Ex: Majestoso Brocado, Anos 80, Pegada CoolVibe" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground block">ID de integração da marca</label>
                <input type="text" value={formMarcaIntegracaoId} onChange={(e) => setFormMarcaIntegracaoId(e.target.value)} placeholder="Ex: BRAND_123" className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none" />
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
      {/* MODAL MODIFICAR TIMES MARCA */}
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
