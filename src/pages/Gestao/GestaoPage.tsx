/**
 * ============================================================================
 * MÓDULO: Módulo de Gestão & Cadastros Base (GestaoPage)
 * ARQUIVO: src/pages/Gestao/GestaoPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Interface de gerenciamento centralizado de Marcas, Usuários, Times,
 *            Tecidos, Aviamentos e Características.
 *            Refatorada com decomposição modular de abas, modais e custom hooks.
 * ============================================================================
 */

import React, { useState } from 'react';
import type { MarcaSummary } from '../../types/auth';
import type {
  GestaoPageProps,
  GestaoSubTab,
  TeamItem,
  TecidoInsumoItem,
  UserRecord,
} from '../../types/gestao';

import { useMarcasGestao } from './hooks/useMarcasGestao';
import { useUsuariosGestao } from './hooks/useUsuariosGestao';
import { registerUserApi } from '../../services/authService';
import { useTimesGestao } from './hooks/useTimesGestao';
import { useTecidosGestao } from './hooks/useTecidosGestao';
import { useAviamentosGestao } from './hooks/useAviamentosGestao';
import { useCaracteristicasGestao } from './hooks/useCaracteristicasGestao';

import { MarcasTab } from './tabs/MarcasTab';
import { UsuariosTab } from './tabs/UsuariosTab';
import { TimesTab } from './tabs/TimesTab';
import { TecidosTab } from './tabs/TecidosTab';
import { AviamentosTab } from './tabs/AviamentosTab';
import { CaracteristicasTab } from './tabs/CaracteristicasTab';
import { CustosFixosTab } from './tabs/CustosFixosTab';
import { PrecificacaoTab } from './tabs/PrecificacaoTab';
import { TiposPecaTab } from './tabs/TiposPecaTab';
import { FornecedoresTab } from './tabs/FornecedoresTab';
import { TagsTab } from './tabs/TagsTab';
import { FluxosTab } from './tabs/FluxosTab';
import { CamposCustomTab } from './tabs/CamposCustomTab';

import { CriarMarcaModal } from './modals/CriarMarcaModal';
import { EditarMarcaModal } from './modals/EditarMarcaModal';
import { AtualizarTimeModal } from './modals/AtualizarTimeModal';
import { ImportarInsumosModal } from './modals/ImportarInsumosModal';
import { CriarUsuarioModal } from './modals/CriarUsuarioModal';
import { CriarCaracteristicaModal } from './modals/CriarCaracteristicaModal';
import { ModificarTimesMarcaModal } from './modals/ModificarTimesMarcaModal';
import type { FormTabelaItem } from './modals/CriarCaracteristicaModal';
import { Users2, X, Plus, Image as ImageIcon } from 'lucide-react';

export const GestaoPage: React.FC<GestaoPageProps> = ({ onOpenColecoes }) => {
  // Aba Ativa
  const [gestaoSubTab, setGestaoSubTab] = useState<GestaoSubTab>('marcas');

  // Custom Hooks por domínio
  const marcasHook = useMarcasGestao();
  const usuariosHook = useUsuariosGestao();
  const timesHook = useTimesGestao();
  const tecidosHook = useTecidosGestao();
  const aviamentosHook = useAviamentosGestao();
  const caracteristicasHook = useCaracteristicasGestao();

  // Estados de Modais
  const [showCriarMarcaModal, setShowCriarMarcaModal] = useState(false);
  const [editingMarca, setEditingMarca] = useState<MarcaSummary | null>(null);
  const [formMarcaNome, setFormMarcaNome] = useState('');
  const [formMarcaIntegracaoId, setFormMarcaIntegracaoId] = useState('');

  const [showAtualizarTimeModal, setShowAtualizarTimeModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);
  const [teamFormNome, setTeamFormNome] = useState('');
  const [teamFormDesignado, setTeamFormDesignado] = useState(false);
  const [teamFormDescricao, setTeamFormDescricao] = useState('');

  const [updatingTeamsMarca, setUpdatingTeamsMarca] = useState<MarcaSummary | null>(null);

  const [showCriandoInsumoModal, setShowCriandoInsumoModal] = useState(false);
  const [showInformacoesTecidoModal, setShowInformacoesTecidoModal] = useState(false);
  const [editingTecido, setEditingTecido] = useState<TecidoInsumoItem | null>(null);
  const [insumoNome, setInsumoNome] = useState('');
  const [insumoCodigo, setInsumoCodigo] = useState('');
  const [insumoPreco, setInsumoPreco] = useState('0');
  const [insumoUnidade, setInsumoUnidade] = useState<'Metros' | 'Kg'>('Metros');
  const [insumoObservacoes, setInsumoObservacoes] = useState('');

  const [showCriandoAviamentoModal, setShowCriandoAviamentoModal] = useState(false);
  const [showInformacoesAviamentoModal, setShowInformacoesAviamentoModal] = useState(false);
  const [editingAviamento, setEditingAviamento] = useState<TecidoInsumoItem | null>(null);
  const [aviamentoNome, setAviamentoNome] = useState('');
  const [aviamentoCodigo, setAviamentoCodigo] = useState('');
  const [aviamentoPreco, setAviamentoPreco] = useState('0');
  const [aviamentoUnidade, setAviamentoUnidade] = useState<'Unidade' | 'Metros'>('Unidade');
  const [aviamentoObservacoes, setAviamentoObservacoes] = useState('');

  const [showImportarInsumosModal, setShowImportarInsumosModal] = useState(false);

  const [showCriarUsuarioModal, setShowCriarUsuarioModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserCodigo, setNewUserCodigo] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIsFantasma, setNewUserIsFantasma] = useState(false);
  const [newUserSenha, setNewUserSenha] = useState('');
  const [newUserConfirmarSenha, setNewUserConfirmarSenha] = useState('');

  const [showCriarCaracteristicaModal, setShowCriarCaracteristicaModal] = useState(false);
  const [caracteristicaFormNome, setCaracteristicaFormNome] = useState('');
  const [caracteristicaFormTabelas, setCaracteristicaFormTabelas] = useState<FormTabelaItem[]>([
    { id: 'tab-1', nomeTabela: '', medidas: '' },
  ]);

  // Handlers para Marcas
  const handleOpenEditarMarca = (marca: MarcaSummary) => {
    marcasHook.setOpenMenuMarcaId(null);
    setEditingMarca(marca);
    setFormMarcaNome(marca.nome);
    setFormMarcaIntegracaoId(marca.code);
  };

  const handleOpenEditarUsuarios = (marca: MarcaSummary) => {
    marcasHook.setOpenMenuMarcaId(null);
    usuariosHook.setUserFilterMarca(marca.nome);
    setGestaoSubTab('usuarios');
  };

  const handleOpenAtualizarTimes = (marca: MarcaSummary) => {
    marcasHook.setOpenMenuMarcaId(null);
    setUpdatingTeamsMarca(marca);
  };

  // Handlers para Times
  const handleOpenEditTeamModal = (team: TeamItem) => {
    timesHook.setOpenMenuTeamId(null);
    setEditingTeam(team);
    setTeamFormNome(team.nome);
    setTeamFormDesignado(team.designadoProduto);
    setTeamFormDescricao(team.descricao || '');
    setShowAtualizarTimeModal(true);
  };

  const handleSaveTeam = () => {
    if (!teamFormNome.trim()) return;
    if (editingTeam) {
      timesHook.updateTeam({
        ...editingTeam,
        nome: teamFormNome.trim(),
        designadoProduto: teamFormDesignado,
        descricao: teamFormDescricao.trim() || '--',
      });
    } else {
      timesHook.addTeam({
        id: `t-${Date.now()}`,
        nome: teamFormNome.trim(),
        designadoProduto: teamFormDesignado,
        descricao: teamFormDescricao.trim() || '--',
      });
    }
    setShowAtualizarTimeModal(false);
    setEditingTeam(null);
  };

  // Handlers para Usuários
  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      // 1. Cadastra o novo usuário na API backend (com Hash BCrypt)
      const created = await registerUserApi({
        nome: newUserName.trim(),
        email: newUserEmail.trim(),
        senha: newUserSenha || '123456',
        cargo: 'Estilista',
        empresa: 'AKR BRANDS',
      });

      // 2. Adiciona o usuário recém-criado na lista local
      const newUser: UserRecord = {
        id: String(created.id || Date.now()),
        nome: newUserName.trim(),
        email: newUserEmail.trim(),
        codigo: newUserCodigo.trim() || undefined,
        marcas: marcasHook.marcasList.map((m) => m.nome),
        status: 'Ativo',
        acesso: 'Permitido',
        isFantasma: newUserIsFantasma,
        brandRoles: marcasHook.marcasList.map((m) => ({
          marcaId: m.id,
          marcaNome: m.nome,
          cargo: 'Nenhum',
          times: [],
        })),
      };
      usuariosHook.addUser(newUser);
      setShowCriarUsuarioModal(false);
      setNewUserName('');
      setNewUserCodigo('');
      setNewUserEmail('');
      setNewUserIsFantasma(false);
      setNewUserSenha('');
      setNewUserConfirmarSenha('');
    } catch (err: unknown) {
      const errorData = err as { message?: string };
      alert(errorData.message || 'Erro ao cadastrar usuário no backend.');
    }
  };

  const handleSaveUserProfile = () => {
    if (!usuariosHook.editingUserProfile) return;
    usuariosHook.updateUser(usuariosHook.editingUserProfile);
    usuariosHook.setEditingUserProfile(null);
  };

  // Handlers para Tecidos
  const handleCreateInsumo = () => {
    if (!insumoNome.trim()) return;
    const newInsumo: TecidoInsumoItem = {
      id: `tec-${Date.now()}`,
      nome: insumoNome.trim(),
      codigo: insumoCodigo.trim() || '3141592',
      temErp: true,
      fornecedores: 'FORNECEDOR PADRÃO',
      custo: `R$ ${insumoPreco || '0'},0000 /${insumoUnidade === 'Metros' ? 'M' : 'KG'}`,
      unidade: insumoUnidade,
    };
    tecidosHook.addTecido(newInsumo);
    setShowCriandoInsumoModal(false);
    setInsumoNome('');
    setInsumoCodigo('');
    setInsumoPreco('0');
    setInsumoObservacoes('');
  };

  const handleOpenEditarTecido = (tecido: TecidoInsumoItem) => {
    tecidosHook.setOpenMenuTecidoId(null);
    setEditingTecido(tecido);
    setInsumoNome(tecido.nome);
    setInsumoCodigo(tecido.codigo);
    setInsumoPreco(tecido.custo.split(' ')[1]?.split(',')[0] || '0');
    setInsumoUnidade(tecido.unidade === 'Kg' ? 'Kg' : 'Metros');
    setShowInformacoesTecidoModal(true);
  };

  const handleSaveEditTecido = () => {
    if (!editingTecido) return;
    tecidosHook.updateTecido({
      ...editingTecido,
      nome: insumoNome,
      codigo: insumoCodigo,
      custo: `R$ ${insumoPreco || '0'},0000 /${insumoUnidade === 'Metros' ? 'M' : 'KG'}`,
      unidade: insumoUnidade,
    });
    setShowInformacoesTecidoModal(false);
    setEditingTecido(null);
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
      unidade: aviamentoUnidade,
    };
    aviamentosHook.addAviamento(newAviamento);
    setShowCriandoAviamentoModal(false);
    setAviamentoNome('');
    setAviamentoCodigo('');
    setAviamentoPreco('0');
    setAviamentoObservacoes('');
  };

  const handleOpenEditarAviamento = (aviamento: TecidoInsumoItem) => {
    aviamentosHook.setOpenMenuAviamentoId(null);
    setEditingAviamento(aviamento);
    setAviamentoNome(aviamento.nome);
    setAviamentoCodigo(aviamento.codigo);
    setAviamentoPreco(aviamento.custo.split(' ')[1]?.split(',')[0] || '0');
    setAviamentoUnidade(aviamento.unidade === 'Metros' ? 'Metros' : 'Unidade');
    setShowInformacoesAviamentoModal(true);
  };

  const handleSaveEditAviamento = () => {
    if (!editingAviamento) return;
    aviamentosHook.updateAviamento({
      ...editingAviamento,
      nome: aviamentoNome,
      codigo: aviamentoCodigo,
      custo: `R$ ${aviamentoPreco || '0'},0000 /${aviamentoUnidade === 'Metros' ? 'M' : 'UN'}`,
      unidade: aviamentoUnidade,
    });
    setShowInformacoesAviamentoModal(false);
    setEditingAviamento(null);
  };

  // Handlers para Características
  const handleCreateCaracteristica = () => {
    if (!caracteristicaFormNome.trim()) return;
    caracteristicasHook.addCaracteristica({
      id: `car-${Date.now()}`,
      nome: caracteristicaFormNome.trim(),
      marca: caracteristicasHook.caracteristicaFilterMarca,
      tabelasMedidas: [...caracteristicaFormTabelas],
    });
    setShowCriarCaracteristicaModal(false);
    setCaracteristicaFormNome('');
    setCaracteristicaFormTabelas([{ id: 'tab-1', nomeTabela: '', medidas: '' }]);
  };

  const handleAddFormTabela = () => {
    setCaracteristicaFormTabelas((prev) => [
      ...prev,
      { id: `tab-${Date.now()}`, nomeTabela: '', medidas: '' },
    ]);
  };

  const handleRemoveFormTabela = (id: string) => {
    setCaracteristicaFormTabelas((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="w-full min-h-screen bg-bg text-primary pb-16 font-sans">
      {/* 1. SUB-NAVEGAÇÃO DE GESTÃO & CADASTROS BASE */}
      <div className="bg-surface border-b border-border shadow-2xs sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto py-3 text-xs font-semibold scrollbar-none">
            <button
              type="button"
              onClick={() => {
                usuariosHook.setEditingUserProfile(null);
                setGestaoSubTab('marcas');
              }}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'marcas' && !usuariosHook.editingUserProfile
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Marcas
            </button>
            <button
              type="button"
              onClick={() => setGestaoSubTab('usuarios')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'usuarios' || usuariosHook.editingUserProfile
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Usuários
            </button>
            <button
              type="button"
              onClick={() => {
                usuariosHook.setEditingUserProfile(null);
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
              type="button"
              onClick={() => {
                usuariosHook.setEditingUserProfile(null);
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
              type="button"
              onClick={() => {
                usuariosHook.setEditingUserProfile(null);
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
              type="button"
              onClick={() => setGestaoSubTab('caracteristicas')}
              className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                gestaoSubTab === 'caracteristicas'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              Características
            </button>
            {(
              [
                'custos_fixos',
                'precificacao',
                'tipos_peca',
                'fornecedores',
                'tags',
                'fluxos',
                'campos_custom',
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setGestaoSubTab(tab)}
                className={`whitespace-nowrap transition cursor-pointer pb-1 capitalize ${
                  gestaoSubTab === tab
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL DAS ABAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
        {gestaoSubTab === 'marcas' && !usuariosHook.editingUserProfile ? (
          <MarcasTab
            marcas={marcasHook.marcasList}
            searchMarca={marcasHook.searchMarca}
            setSearchMarca={marcasHook.setSearchMarca}
            openMenuMarcaId={marcasHook.openMenuMarcaId}
            setOpenMenuMarcaId={marcasHook.setOpenMenuMarcaId}
            onOpenColecoes={onOpenColecoes}
            onOpenCriarMarca={() => {
              setFormMarcaNome('');
              setFormMarcaIntegracaoId('');
              setShowCriarMarcaModal(true);
            }}
            onOpenEditarMarca={handleOpenEditarMarca}
            onOpenEditarUsuarios={handleOpenEditarUsuarios}
            onOpenAtualizarTimes={handleOpenAtualizarTimes}
          />
        ) : gestaoSubTab === 'usuarios' || usuariosHook.editingUserProfile ? (
          <UsuariosTab
            usersList={usuariosHook.usersList}
            marcas={marcasHook.marcasList}
            userFilterMarca={usuariosHook.userFilterMarca}
            setUserFilterMarca={usuariosHook.setUserFilterMarca}
            searchUser={usuariosHook.searchUser}
            setSearchUser={usuariosHook.setSearchUser}
            userFilterStatus={usuariosHook.userFilterStatus}
            setUserFilterStatus={usuariosHook.setUserFilterStatus}
            userFilterAcesso={usuariosHook.userFilterAcesso}
            setUserFilterAcesso={usuariosHook.setUserFilterAcesso}
            editingUserProfile={usuariosHook.editingUserProfile}
            setEditingUserProfile={usuariosHook.setEditingUserProfile}
            openMenuUserId={usuariosHook.openMenuUserId}
            setOpenMenuUserId={usuariosHook.setOpenMenuUserId}
            searchCargoQuery={usuariosHook.searchCargoQuery}
            setSearchCargoQuery={usuariosHook.setSearchCargoQuery}
            filtrarCargosToggle={usuariosHook.filtrarCargosToggle}
            setFiltrarCargosToggle={usuariosHook.setFiltrarCargosToggle}
            onOpenCriarUsuario={() => setShowCriarUsuarioModal(true)}
            onSaveUserProfile={handleSaveUserProfile}
            onToggleAccesoUser={usuariosHook.toggleAccess}
          />
        ) : gestaoSubTab === 'times' ? (
          <TimesTab
            teamsList={timesHook.teamsList}
            teamFilterMarca={timesHook.teamFilterMarca}
            setTeamFilterMarca={timesHook.setTeamFilterMarca}
            openMenuTeamId={timesHook.openMenuTeamId}
            setOpenMenuTeamId={timesHook.setOpenMenuTeamId}
            onOpenCriarTeamModal={() => {
              setEditingTeam(null);
              setTeamFormNome('');
              setTeamFormDesignado(false);
              setTeamFormDescricao('');
              setShowAtualizarTimeModal(true);
            }}
            onOpenEditTeamModal={handleOpenEditTeamModal}
          />
        ) : gestaoSubTab === 'tecidos' ? (
          <TecidosTab
            tecidosList={tecidosHook.tecidosList}
            searchTecidoInsumo={tecidosHook.searchTecidoInsumo}
            setSearchTecidoInsumo={tecidosHook.setSearchTecidoInsumo}
            searchTecidoCor={tecidosHook.searchTecidoCor}
            setSearchTecidoCor={tecidosHook.setSearchTecidoCor}
            searchTecidoFornecedor={tecidosHook.searchTecidoFornecedor}
            setSearchTecidoFornecedor={tecidosHook.setSearchTecidoFornecedor}
            showOpcoesTecidoMenu={tecidosHook.showOpcoesTecidoMenu}
            setShowOpcoesTecidoMenu={tecidosHook.setShowOpcoesTecidoMenu}
            opcoesTecidoSubMenu={tecidosHook.opcoesTecidoSubMenu}
            setOpcoesTecidoSubMenu={tecidosHook.setOpcoesTecidoSubMenu}
            openMenuTecidoId={tecidosHook.openMenuTecidoId}
            setOpenMenuTecidoId={tecidosHook.setOpenMenuTecidoId}
            onOpenCriandoInsumoModal={() => setShowCriandoInsumoModal(true)}
            onOpenImportarInsumosModal={() => setShowImportarInsumosModal(true)}
            onOpenEditarTecido={handleOpenEditarTecido}
            onDeleteTecido={tecidosHook.deleteTecido}
          />
        ) : gestaoSubTab === 'aviamentos' ? (
          <AviamentosTab
            aviamentosList={aviamentosHook.aviamentosList}
            searchAviamentoInsumo={aviamentosHook.searchAviamentoInsumo}
            setSearchAviamentoInsumo={aviamentosHook.setSearchAviamentoInsumo}
            searchAviamentoCor={aviamentosHook.searchAviamentoCor}
            setSearchAviamentoCor={aviamentosHook.setSearchAviamentoCor}
            searchAviamentoFornecedor={aviamentosHook.searchAviamentoFornecedor}
            setSearchAviamentoFornecedor={aviamentosHook.setSearchAviamentoFornecedor}
            showOpcoesAviamentoMenu={aviamentosHook.showOpcoesAviamentoMenu}
            setShowOpcoesAviamentoMenu={aviamentosHook.setShowOpcoesAviamentoMenu}
            opcoesAviamentoSubMenu={aviamentosHook.opcoesAviamentoSubMenu}
            setOpcoesAviamentoSubMenu={aviamentosHook.setOpcoesAviamentoSubMenu}
            openMenuAviamentoId={aviamentosHook.openMenuAviamentoId}
            setOpenMenuAviamentoId={aviamentosHook.setOpenMenuAviamentoId}
            onOpenCriandoAviamentoModal={() => {
              setAviamentoNome('');
              setAviamentoCodigo('');
              setAviamentoPreco('0');
              setAviamentoUnidade('Unidade');
              setShowCriandoAviamentoModal(true);
            }}
            onOpenImportarInsumosModal={() => setShowImportarInsumosModal(true)}
            onOpenEditarAviamento={handleOpenEditarAviamento}
            onDeleteAviamento={aviamentosHook.deleteAviamento}
          />
        ) : gestaoSubTab === 'caracteristicas' ? (
          <CaracteristicasTab
            caracteristicasList={caracteristicasHook.caracteristicasList}
            marcas={marcasHook.marcasList}
            caracteristicaFilterMarca={caracteristicasHook.caracteristicaFilterMarca}
            setCaracteristicaFilterMarca={caracteristicasHook.setCaracteristicaFilterMarca}
            caracteristicaSearchQuery={caracteristicasHook.caracteristicaSearchQuery}
            setCaracteristicaSearchQuery={caracteristicasHook.setCaracteristicaSearchQuery}
            openMenuCaracteristicaId={caracteristicasHook.openMenuCaracteristicaId}
            setOpenMenuCaracteristicaId={caracteristicasHook.setOpenMenuCaracteristicaId}
            onOpenCriarCaracteristicaModal={() => {
              setCaracteristicaFormNome('');
              setCaracteristicaFormTabelas([{ id: 'tab-1', nomeTabela: '', medidas: '' }]);
              setShowCriarCaracteristicaModal(true);
            }}
            onDeleteCaracteristica={caracteristicasHook.deleteCaracteristica}
          />
        ) : gestaoSubTab === 'custos_fixos' ? (
          <CustosFixosTab />
        ) : gestaoSubTab === 'precificacao' ? (
          <PrecificacaoTab />
        ) : gestaoSubTab === 'tipos_peca' ? (
          <TiposPecaTab />
        ) : gestaoSubTab === 'fornecedores' ? (
          <FornecedoresTab />
        ) : gestaoSubTab === 'tags' ? (
          <TagsTab />
        ) : gestaoSubTab === 'fluxos' ? (
          <FluxosTab />
        ) : gestaoSubTab === 'campos_custom' ? (
          <CamposCustomTab />
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

      {/* MODAIS */}
      <CriarMarcaModal
        isOpen={showCriarMarcaModal}
        onClose={() => setShowCriarMarcaModal(false)}
        formMarcaNome={formMarcaNome}
        setFormMarcaNome={setFormMarcaNome}
        formMarcaIntegracaoId={formMarcaIntegracaoId}
        setFormMarcaIntegracaoId={setFormMarcaIntegracaoId}
        onSave={() => setShowCriarMarcaModal(false)}
      />

      <EditarMarcaModal
        editingMarca={editingMarca}
        onClose={() => setEditingMarca(null)}
        formMarcaNome={formMarcaNome}
        setFormMarcaNome={setFormMarcaNome}
        formMarcaIntegracaoId={formMarcaIntegracaoId}
        setFormMarcaIntegracaoId={setFormMarcaIntegracaoId}
        onSave={() => setEditingMarca(null)}
      />

      <AtualizarTimeModal
        isOpen={showAtualizarTimeModal}
        onClose={() => setShowAtualizarTimeModal(false)}
        editingTeam={editingTeam}
        teamFormNome={teamFormNome}
        setTeamFormNome={setTeamFormNome}
        teamFormDesignado={teamFormDesignado}
        setTeamFormDesignado={setTeamFormDesignado}
        teamFormDescricao={teamFormDescricao}
        setTeamFormDescricao={setTeamFormDescricao}
        onSave={handleSaveTeam}
      />

      <ImportarInsumosModal
        isOpen={showImportarInsumosModal}
        onClose={() => setShowImportarInsumosModal(false)}
      />

      <CriarUsuarioModal
        isOpen={showCriarUsuarioModal}
        onClose={() => setShowCriarUsuarioModal(false)}
        newUserName={newUserName}
        setNewUserName={setNewUserName}
        newUserCodigo={newUserCodigo}
        setNewUserCodigo={setNewUserCodigo}
        newUserEmail={newUserEmail}
        setNewUserEmail={setNewUserEmail}
        newUserIsFantasma={newUserIsFantasma}
        setNewUserIsFantasma={setNewUserIsFantasma}
        newUserSenha={newUserSenha}
        setNewUserSenha={setNewUserSenha}
        newUserConfirmarSenha={newUserConfirmarSenha}
        setNewUserConfirmarSenha={setNewUserConfirmarSenha}
        onSave={handleCreateUser}
      />

      <CriarCaracteristicaModal
        isOpen={showCriarCaracteristicaModal}
        onClose={() => setShowCriarCaracteristicaModal(false)}
        caracteristicaFormNome={caracteristicaFormNome}
        setCaracteristicaFormNome={setCaracteristicaFormNome}
        caracteristicaFormTabelas={caracteristicaFormTabelas}
        setCaracteristicaFormTabelas={setCaracteristicaFormTabelas}
        onAddFormTabela={handleAddFormTabela}
        onRemoveFormTabela={handleRemoveFormTabela}
        onSave={handleCreateCaracteristica}
      />

      {/* Modais de Criar/Editar Tecido e Aviamento */}
      {(showCriandoInsumoModal || showInformacoesTecidoModal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">
                {showInformacoesTecidoModal ? 'Informações' : 'Criando insumo'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCriandoInsumoModal(false);
                  setShowInformacoesTecidoModal(false);
                }}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Identificação</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">
                    Nome do insumo e código de referência
                  </p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">
                      Nome <span className="text-accent-bordo">*</span>
                    </label>
                    <input
                      type="text"
                      value={insumoNome}
                      onChange={(e) => setInsumoNome(e.target.value)}
                      placeholder="Ex: Carmuça"
                      className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Código</label>
                    <input
                      type="text"
                      value={insumoCodigo}
                      onChange={(e) => setInsumoCodigo(e.target.value)}
                      placeholder="Ex: 3141592"
                      className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Fornecedores</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">
                    Cadastre ou selecione quais são todos os fornecedores deste insumo.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Imagens</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">
                    Imagens de referência
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
                    <ImageIcon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-border-muted pb-6">
                <div>
                  <h4 className="font-bold text-primary text-sm">Preço e observações</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">
                    Informações de preço e observações do insumo cadastrado.
                  </p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Preço</label>
                      <input
                        type="text"
                        value={insumoPreco}
                        onChange={(e) => setInsumoPreco(e.target.value)}
                        className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Unidade</label>
                      <select
                        value={insumoUnidade}
                        onChange={(e) => setInsumoUnidade(e.target.value as 'Metros' | 'Kg')}
                        className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
                      >
                        <option value="Metros">Metros</option>
                        <option value="Kg">Kg</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Observações</label>
                    <textarea
                      rows={3}
                      value={insumoObservacoes}
                      onChange={(e) => setInsumoObservacoes(e.target.value)}
                      className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-start px-6 py-4 border-t border-border bg-surface-muted/30">
              <button
                type="button"
                onClick={showInformacoesTecidoModal ? handleSaveEditTecido : handleCreateInsumo}
                className="px-6 py-2.5 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
              >
                {showInformacoesTecidoModal ? 'Salvar alterações' : 'Criar insumo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(showCriandoAviamentoModal || showInformacoesAviamentoModal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-bold font-editorial text-primary">
                {showInformacoesAviamentoModal ? 'Informações' : 'Criando insumo'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCriandoAviamentoModal(false);
                  setShowInformacoesAviamentoModal(false);
                }}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
                <div>
                  <h4 className="font-bold text-primary text-sm">Identificação</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">
                    Nome do insumo e código de referência
                  </p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">
                      Nome <span className="text-accent-bordo">*</span>
                    </label>
                    <input
                      type="text"
                      value={aviamentoNome}
                      onChange={(e) => setAviamentoNome(e.target.value)}
                      placeholder="Ex: Zíper Médio"
                      className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Código</label>
                    <input
                      type="text"
                      value={aviamentoCodigo}
                      onChange={(e) => setAviamentoCodigo(e.target.value)}
                      placeholder="Ex: 1234"
                      className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <h4 className="font-bold text-primary text-sm">Preço e observações</h4>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">
                    Informações de preço e observações do insumo cadastrado.
                  </p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Preço</label>
                      <input
                        type="text"
                        value={aviamentoPreco}
                        onChange={(e) => setAviamentoPreco(e.target.value)}
                        className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground block">Unidade</label>
                      <select
                        value={aviamentoUnidade}
                        onChange={(e) =>
                          setAviamentoUnidade(e.target.value as 'Unidade' | 'Metros')
                        }
                        className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
                      >
                        <option value="Unidade">Unidade</option>
                        <option value="Metros">Metros</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-muted-foreground block">Observações</label>
                    <textarea
                      rows={3}
                      value={aviamentoObservacoes}
                      onChange={(e) => setAviamentoObservacoes(e.target.value)}
                      placeholder="Ex.: Lembrar de adicionar uma versão sintética"
                      className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-start px-6 py-4 border-t border-border bg-surface-muted/30">
              <button
                type="button"
                onClick={
                  showInformacoesAviamentoModal ? handleSaveEditAviamento : handleCreateAviamento
                }
                className="px-6 py-2.5 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
              >
                {showInformacoesAviamentoModal ? 'Salvar alterações' : 'Criar insumo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModificarTimesMarcaModal
        updatingTeamsMarca={updatingTeamsMarca}
        onClose={() => setUpdatingTeamsMarca(null)}
        teamsList={timesHook.teamsList}
        onToggleTeamProductDesignated={(teamId) => {
          timesHook.setTeamsList((prev) =>
            prev.map((t) => (t.id === teamId ? { ...t, designadoProduto: !t.designadoProduto } : t))
          );
        }}
      />
    </div>
  );
};
