/**
 * ============================================================================
 * MÓDULO: Módulo de Gestão & Cadastros Base (GestaoPage)
 * ARQUIVO: src/pages/Gestao/GestaoPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Interface de gerenciamento centralizado de Marcas, Usuários, Times,
 *            Tecidos, Aviamentos, Características e cadastros administrativos.
 *            Conectado às APIs reais do backend com confirmação de salvamento,
 *            tratamento de erros e diferenciação clara de módulos planejados.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { MarcaSummary } from '../../types/auth';
import type { GestaoPageProps, GestaoSubTab, TeamItem, TecidoInsumoItem } from '../../types/gestao';

import { useMarcasGestao } from './hooks/useMarcasGestao';
import { useUsuariosGestao } from './hooks/useUsuariosGestao';
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
import { TagsTab } from './tabs/TagsTab';
import { FluxosTab } from './tabs/FluxosTab';
import { CamposCustomTab } from './tabs/CamposCustomTab';

import { CriarMarcaModal } from './modals/CriarMarcaModal';
import { EditarMarcaModal } from './modals/EditarMarcaModal';
import { AtualizarTimeModal } from './modals/AtualizarTimeModal';
import { CriarUsuarioModal } from './modals/CriarUsuarioModal';
import { CriarCaracteristicaModal } from './modals/CriarCaracteristicaModal';
import { ModificarTimesMarcaModal } from './modals/ModificarTimesMarcaModal';
import { CriarTecidoModal } from './modals/CriarTecidoModal';
import { ImportarInsumosModal } from './modals/ImportarInsumosModal';
import type { FormTabelaItem } from './modals/CriarCaracteristicaModal';

export const GestaoPage: React.FC<GestaoPageProps> = ({ onOpenColecoes }) => {
  // Aba Ativa
  const { tab } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const gestaoSubTab = (
    tab === 'caracteristicas-legado'
      ? 'caracteristicas'
      : tab === 'times-legado'
        ? 'times'
        : (tab ?? 'marcas')
  ) as GestaoSubTab;
  const setGestaoSubTab = (value: GestaoSubTab) => navigate('/gestao/' + value + search);

  // Custom Hooks por domínio
  const marcasHook = useMarcasGestao();
  const usuariosHook = useUsuariosGestao();
  const timesHook = useTimesGestao();
  const tecidosHook = useTecidosGestao();
  const aviamentosHook = useAviamentosGestao();
  const caracteristicasHook = useCaracteristicasGestao();

  // Estados de Modais de Marcas
  const [showCriarMarcaModal, setShowCriarMarcaModal] = useState(false);
  const [editingMarca, setEditingMarca] = useState<MarcaSummary | null>(null);
  const [formMarcaNome, setFormMarcaNome] = useState('');
  const [formMarcaIntegracaoId, setFormMarcaIntegracaoId] = useState('');

  // Estados de Modais de Times
  const [showAtualizarTimeModal, setShowAtualizarTimeModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);
  const [teamFormNome, setTeamFormNome] = useState('');
  const [teamFormDesignado, setTeamFormDesignado] = useState(false);
  const [teamFormDescricao, setTeamFormDescricao] = useState('');
  const [updatingTeamsMarca, setUpdatingTeamsMarca] = useState<MarcaSummary | null>(null);

  // Estados de Modais de Usuários
  const [showCriarUsuarioModal, setShowCriarUsuarioModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserCodigo, setNewUserCodigo] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIsFantasma, setNewUserIsFantasma] = useState(false);
  const [newUserSenha, setNewUserSenha] = useState('');
  const [newUserConfirmarSenha, setNewUserConfirmarSenha] = useState('');

  // Estados de Modais de Características
  const [showCriarCaracteristicaModal, setShowCriarCaracteristicaModal] = useState(false);
  const [caracteristicaFormNome, setCaracteristicaFormNome] = useState('');
  const [caracteristicaFormTabelas, setCaracteristicaFormTabelas] = useState<FormTabelaItem[]>([
    { id: 'tab-1', nomeTabela: '', medidas: '' },
  ]);

  // Estados de Modais de Insumos (Tecidos & Aviamentos)
  const [showCriarInsumoModal, setShowCriarInsumoModal] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<TecidoInsumoItem | null>(null);
  const [showImportarInsumosModal, setShowImportarInsumosModal] = useState(false);
  const [tipoInsumoModal, setTipoInsumoModal] = useState<'TECIDO' | 'AVIAMENTO'>('TECIDO');

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

  const handleSaveMarca = async () => {
    if (!formMarcaNome.trim()) return;
    await marcasHook.addMarca({
      nome: formMarcaNome.trim(),
      code: formMarcaIntegracaoId.trim() || formMarcaNome.slice(0, 4).toUpperCase(),
    });
    setShowCriarMarcaModal(false);
    setFormMarcaNome('');
    setFormMarcaIntegracaoId('');
  };

  const handleUpdateMarca = async () => {
    if (!editingMarca || !formMarcaNome.trim()) return;
    await marcasHook.updateMarca(editingMarca.id, {
      nome: formMarcaNome.trim(),
      code: formMarcaIntegracaoId.trim() || editingMarca.code,
    });
    setEditingMarca(null);
    setFormMarcaNome('');
    setFormMarcaIntegracaoId('');
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

    await usuariosHook.createUser({
      nome: newUserName.trim(),
      email: newUserEmail.trim(),
      senha: newUserSenha,
      cargo: newUserIsFantasma ? 'Fantasma' : 'Estilista',
      empresa: 'AKR BRANDS',
    });

    setShowCriarUsuarioModal(false);
    setNewUserName('');
    setNewUserCodigo('');
    setNewUserEmail('');
    setNewUserIsFantasma(false);
    setNewUserSenha('');
    setNewUserConfirmarSenha('');
  };

  const handleSaveUserProfile = async () => {
    if (!usuariosHook.editingUserProfile) return;
    await usuariosHook.updateUser(usuariosHook.editingUserProfile);
    usuariosHook.setEditingUserProfile(null);
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

  const subTabsList: Array<{ id: GestaoSubTab; label: string }> = [
    { id: 'marcas', label: 'Marcas' },
    { id: 'usuarios', label: 'Usuários' },
    { id: 'times', label: 'Times' },
    { id: 'tecidos', label: 'Tecidos' },
    { id: 'aviamentos', label: 'Aviamentos' },
    { id: 'caracteristicas', label: 'Características' },
    { id: 'custos_fixos', label: 'Custos Fixos' },
    { id: 'precificacao', label: 'Precificação' },
    { id: 'tipos_peca', label: 'Tipos de Peça' },
    { id: 'tags', label: 'Tags' },
    { id: 'fluxos', label: 'Fluxos' },
    { id: 'campos_custom', label: 'Campos Customizados' },
  ];

  return (
    <div className="w-full min-h-screen bg-bg text-primary pb-16 font-sans">
      {/* 1. SUB-NAVEGAÇÃO DE GESTÃO & CADASTROS BASE */}
      <div className="hidden" aria-hidden="true">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto py-3 text-xs font-semibold scrollbar-none">
            {subTabsList.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id !== 'usuarios') usuariosHook.setEditingUserProfile(null);
                  setGestaoSubTab(tab.id);
                }}
                className={`whitespace-nowrap transition cursor-pointer pb-1 ${
                  gestaoSubTab === tab.id
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {tab.label}
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
            usersList={usuariosHook.usersList}
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
            onOpenCriandoInsumoModal={() => {
              setEditingInsumo(null);
              setTipoInsumoModal('TECIDO');
              setShowCriarInsumoModal(true);
            }}
            onOpenImportarInsumosModal={() => setShowImportarInsumosModal(true)}
            onOpenEditarTecido={(item) => {
              setEditingInsumo(item);
              setTipoInsumoModal('TECIDO');
              setShowCriarInsumoModal(true);
            }}
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
              setEditingInsumo(null);
              setTipoInsumoModal('AVIAMENTO');
              setShowCriarInsumoModal(true);
            }}
            onOpenImportarInsumosModal={() => setShowImportarInsumosModal(true)}
            onOpenEditarAviamento={(item) => {
              setEditingInsumo(item);
              setTipoInsumoModal('AVIAMENTO');
              setShowCriarInsumoModal(true);
            }}
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
        ) : gestaoSubTab === 'tags' ? (
          <TagsTab />
        ) : gestaoSubTab === 'fluxos' ? (
          <FluxosTab />
        ) : (
          <CamposCustomTab />
        )}
      </div>

      {/* MODAIS DE MARCA */}
      <CriarMarcaModal
        isOpen={showCriarMarcaModal}
        onClose={() => setShowCriarMarcaModal(false)}
        formMarcaNome={formMarcaNome}
        setFormMarcaNome={setFormMarcaNome}
        formMarcaIntegracaoId={formMarcaIntegracaoId}
        setFormMarcaIntegracaoId={setFormMarcaIntegracaoId}
        onSave={handleSaveMarca}
      />

      <EditarMarcaModal
        editingMarca={editingMarca}
        onClose={() => setEditingMarca(null)}
        formMarcaNome={formMarcaNome}
        setFormMarcaNome={setFormMarcaNome}
        formMarcaIntegracaoId={formMarcaIntegracaoId}
        setFormMarcaIntegracaoId={setFormMarcaIntegracaoId}
        onSave={handleUpdateMarca}
      />

      {/* MODAL DE TIME */}
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

      {/* MODAL DE CRIAÇÃO DE USUÁRIO */}
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

      {/* MODAL DE CARACTERÍSTICA */}
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

      {/* MODAL DE TIMES DA MARCA */}
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

      {/* MODAL DE INSUMO (TECIDO / AVIAMENTO) */}
      <CriarTecidoModal
        isOpen={showCriarInsumoModal}
        editingTecido={editingInsumo}
        tipo={tipoInsumoModal === 'TECIDO' ? 'tecido' : 'aviamento'}
        onClose={() => {
          setShowCriarInsumoModal(false);
          setEditingInsumo(null);
        }}
        onSave={(item) => {
          if (tipoInsumoModal === 'TECIDO') {
            if (editingInsumo) {
              tecidosHook.updateTecido(item);
            } else {
              tecidosHook.addTecido(item);
            }
          } else {
            if (editingInsumo) {
              aviamentosHook.updateAviamento(item);
            } else {
              aviamentosHook.addAviamento(item);
            }
          }
          setShowCriarInsumoModal(false);
          setEditingInsumo(null);
        }}
      />

      {/* MODAL DE IMPORTAÇÃO DE INSUMOS */}
      <ImportarInsumosModal
        isOpen={showImportarInsumosModal}
        onClose={() => setShowImportarInsumosModal(false)}
        onImportSuccess={() => {
          tecidosHook.reloadTecidos();
          aviamentosHook.reloadAviamentos();
        }}
      />
    </div>
  );
};

export default GestaoPage;
