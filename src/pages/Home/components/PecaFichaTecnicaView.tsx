/**
 * ============================================================================
 * COMPONENTE: Ficha Técnica da Peça (PecaFichaTecnicaView)
 * ARQUIVO: src/pages/Home/components/PecaFichaTecnicaView.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Visão detalhada da ficha técnica do produto com abas de Geral,
 *            Corte, Modelagem, Tecidos, Aviamentos, Terceiros, Custos, etc.
 *            Conforme os Prints 1, 2, 3, 4 e 5.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useContext } from 'react';
import './fichaSubmenus.css';
import { AuthContext } from '../../../contexts/authContextInstance';
import {
  registrarAlteracoesFicha,
  registrarAlteracoesAnexos,
} from '../../../services/fichaAlteracoes';
import {
  copiarImagemVariante,
  listFichaAnexos,
  type FichaAnexo,
} from '../../../services/fichaAnexosStorage';
import type { MarcaSummary } from '../../../types/auth';
import type { ColecaoItem, CollectionPrintItem, PecaItem } from '../../../types/plm';
import { usePersistedState } from '../../../hooks/usePersistedState';
import {
  getLinxFichaAtual,
  getLinxFichaCustos,
  resolveLinxGriffe,
} from '../../../services/linxService';
import { MostruarioColorsPicker } from './MostruarioColorsPicker';
import type { TecidoCorItem, UserRecord } from '../../../types/gestao';
import type { FichaConferencia, FichaProcesso } from '../../../types/fichaProcesso';
import {
  assinaturaAnexos,
  atualizarRevisao,
  conteudoFicha,
  prepararContratoLinx,
  validarConferenciaServidor,
  etapaPermiteConclusao,
  formatarCusto,
  conferirFicha,
  COMPONENTES_FICHA,
  exigeConferencia,
} from '../../../services/fichaProcesso';
import { calcularCustosFicha } from '../../../services/fichaCustos';
import { precificacaoVariante } from '../../../services/fichaPrecificacao';
import { currency, displayDate } from '../../../services/workspaceDomain';
import { proximaEtapaNumerica } from '../../../services/fichaFluxos';
import { FichaConferenciaPanel } from './FichaConferenciaPanel';
import { PecaFluxoEtapasModal } from './PecaFluxoEtapasModal';
import { FichaImageUpload } from './FichaImageUpload';
import { FichaInsumosEditor } from './FichaInsumosEditor';
import { FichaTerceirosEditor } from './FichaTerceirosEditor';
import { FichaCustosView } from './FichaCustosView';
import { FichaPrecificacaoEditor } from './FichaPrecificacaoEditor';
import { FichaAnexosContent } from './FichaAnexosPanel';
import { useFichaAnexos } from './useFichaAnexos';
import { useFichaAutosave } from './useFichaAutosave';
import { useFichaLinxAlteracoes } from './useFichaLinxAlteracoes';
import { LinxFichaPanel } from './LinxFichaPanel';
import { FichaHistoricoPanel } from './FichaHistoricoPanel';
import { FichaProvaRoupaEditor } from './FichaProvaRoupaEditor';
import { FichaCorteEditor } from './FichaCorteEditor';
import { FichaTamanhosPicker } from './FichaTamanhosPicker';
import { FichaModelagemEditor } from './FichaModelagemEditor';
import { sincronizarTabelaCorte } from '../../../services/fichaCorte';
import {
  clonarInsumoSemConfirmacoes,
  removerConfirmacoesInsumo,
} from '../../../services/fichaConsumoTamanhos';
import { getPecaUsoProduct } from '../../../services/productUsoStorage';
import { getLinxFichaInsumos, getLinxFichaTamanhos } from '../../../services/linxFichaMappers';
import type { LinxFichaVersao, LinxFichaCustos } from '../../../types/linx';
import type {
  FichaVariante,
  FichaTerceiro,
  FichaInsumo,
  FichaProvaRoupa,
  FichaCorte,
  FichaTabelaMedidas,
} from '../../../types/ficha';
import { ArrowLeft, Rss, ChevronDown, ImageIcon, RefreshCw } from 'lucide-react';
import {
  Button,
  StatusBadge,
  Card,
  SectionHeader,
  Dialog,
} from '../../../components/ui/FichaPrimitives';
import { FichaGraficosPanel } from './FichaGraficosPanel';
import { FichaNavigation } from './FichaNavigation';
import { VariantsTab } from './VariantsTab';

const VARIANTE_INICIAL: FichaVariante = {
  id: 'principal',
  nome: 'Principal',
  tecidos: [],
  aviamentos: [],
};

interface PecaFichaTecnicaViewProps {
  peca: PecaItem;
  colecao: ColecaoItem;
  marca: MarcaSummary;
  onBack: () => void;
  onUpdatePeca?: (updatedPeca: PecaItem) => void | Promise<void>;
  shared?: boolean;
  sharedDocumentId?: string;
  flowStages?: string[];
  flowFinal?: string;
  sharedTimeline?: React.ReactNode;
  usuarios?: UserRecord[];
  usuariosCarregando?: boolean;
  erroUsuarios?: string;
  onTentarCarregarUsuarios?: () => void;
}

export const PecaFichaTecnicaView: React.FC<PecaFichaTecnicaViewProps> = ({
  peca,
  colecao,
  marca,
  onBack,
  onUpdatePeca,
  shared = false,
  sharedDocumentId,
  flowStages,
  flowFinal,
  sharedTimeline,
  usuarios = [],
  usuariosCarregando = false,
  erroUsuarios = '',
  onTentarCarregarUsuarios,
}) => {
  const autor = useContext(AuthContext)?.user;
  // Aba ativa da Ficha Técnica
  const [activeFichaTab, setActiveFichaTab] = useState<
    | 'geral'
    | 'corte'
    | 'modelagem'
    | 'tecidos'
    | 'aviamentos'
    | 'terceiros'
    | 'custos'
    | 'precificacao'
    | 'variantes'
    | 'anexos'
    | 'prova_roupa'
    | 'historico'
    | 'graficos'
  >('geral');

  // ===== ESTADOS DA ABA GERAL =====
  const [nomeProduto, setNomeProduto] = useState(
    peca.fichaTecnica?.nomeProduto || (shared ? peca.nome : '')
  );
  const [codigoRef, setCodigoRef] = useState(peca.fichaTecnica?.codigoReferencia ?? '');
  const [codigoProduto, setCodigoProduto] = useState(peca.codigo);
  const codigoIntegrado = Boolean(
    peca.linxOrigem ||
    peca.historicoIntegracoes?.some(
      (item) =>
        item.pecaId === peca.id &&
        item.recibo.colecaoId === colecao.id &&
        item.recibo.status === 'CONFIRMADA'
    )
  );
  const [descricao, setDescricao] = useState(peca.fichaTecnica?.descricao || '');
  const [tecnica, setTecnica] = useState(peca.fichaTecnica?.tecnica || '');
  const [selectedMostruario, setSelectedMostruario] = useState<TecidoCorItem[]>(() =>
    structuredClone(
      peca.fichaTecnica?.coresMostruario ??
        (peca.fichaTecnica?.corMostruario
          ? [
              {
                id: 'linx-cor-' + peca.fichaTecnica.corMostruario,
                nome: peca.fichaTecnica.corMostruario,
                hex: '',
              },
            ]
          : [])
    )
  );
  const [estampa, setEstampa] = useState({
    id: peca.fichaTecnica?.estampaId,
    reference: peca.fichaTecnica?.estampa || '',
  });
  const focusPrintOnMount = useRef(false);
  const [allPrints] = usePersistedState<CollectionPrintItem[]>('modaflow_collection_prints', []);
  const estampasDaColecao = allPrints.filter((item) => item.collectionId === colecao.id);
  const estampaSelecionada = estampasDaColecao.find((item) =>
    estampa.id ? item.id === estampa.id : item.reference === estampa.reference
  );

  const [obsGerais, setObsGerais] = useState(peca.fichaTecnica?.observacoesGerais || '');
  const [obsCorte, setObsCorte] = useState(peca.fichaTecnica?.observacoesCorte || '');
  const [simbologiaImagemUrl, setSimbologiaImagemUrl] = useState<string | null>(
    peca.fichaTecnica?.simbologiaImagemUrl || null
  );
  const [simbologiaDescricao, setSimbologiaDescricao] = useState(
    peca.fichaTecnica?.simbologiaDescricao || ''
  );

  const [subgrupo] = useState(
    peca.fichaTecnica?.integracao?.subgrupo ??
      peca.linxCadastro?.subgrupo ??
      peca.tipo?.toUpperCase() ??
      ''
  );
  const [linha] = useState(peca.fichaTecnica?.integracao?.linha ?? peca.linxCadastro?.linha ?? '');
  const [grade] = useState(peca.fichaTecnica?.integracao?.grade ?? peca.linxCadastro?.grade ?? '');
  const [gradeLinx] = useState(peca.fichaTecnica?.gradeLinx);
  const [griffe] = useState(
    peca.fichaTecnica?.integracao?.griffe ??
      peca.linxOrigem?.griffe ??
      colecao.griffe ??
      resolveLinxGriffe(marca) ??
      ''
  );
  const [tipoMateriaPrima] = useState(peca.fichaTecnica?.integracao?.tipoMateriaPrima ?? '');
  const [categoria] = useState(peca.fichaTecnica?.integracao?.categoria ?? '');
  const [subcategoria] = useState(peca.fichaTecnica?.integracao?.subcategoria ?? '');
  const [tamanhos, setTamanhos] = useState<string[]>(peca.fichaTecnica?.tamanhos ?? []);
  const [corte, setCorte] = useState<FichaCorte | undefined>(peca.fichaTecnica?.corte);
  const corteAtual = corte
    ? sincronizarTabelaCorte(corte, tamanhos, selectedMostruario)
    : undefined;
  const tamanhosEditados = useRef(peca.fichaTecnica?.tamanhos !== undefined);
  const [conferencia, setConferencia] = useState<FichaConferencia>(
    peca.fichaTecnica?.conferencia ?? {}
  );
  const [processo, setProcesso] = useState<FichaProcesso | undefined>(peca.fichaTecnica?.processo);
  const [mostrarConferencia, setMostrarConferencia] = useState(false);
  const [mostrarResumoMobile, setMostrarResumoMobile] = useState(false);
  const [movimentando, setMovimentando] = useState(false);
  const [etapaDestino, setEtapaDestino] = useState<string>();
  const [movimentacao, setMovimentacao] = useState(() => ({
    etapaAtual: peca.etapaAtual,
    fluxo: peca.fluxo,
    responsavel: peca.responsavel,
    previsaoEntrega: peca.previsaoEntrega,
    observacaoEtapa: peca.observacaoEtapa,
  }));
  const [validandoProcesso, setValidandoProcesso] = useState(false);

  // ===== ESTADOS DA ABA MODELAGEM =====
  const [modelagemInput] = useState(peca.fichaTecnica?.modelagem || '');
  const [obsModelagem, setObsModelagem] = useState(peca.fichaTecnica?.observacoesModelagem || '');

  const [tabelasMedidas, setTabelasMedidas] = useState<FichaTabelaMedidas[]>(
    peca.fichaTecnica?.tabelasMedidas || []
  );

  // Rascunho da ficha no portal. Nenhuma edição chama endpoints de gravação.
  const [variantes, setVariantes] = useState<FichaVariante[]>(() =>
    peca.fichaTecnica?.variantes?.length
      ? structuredClone(peca.fichaTecnica.variantes)
      : [{ id: crypto.randomUUID(), nome: 'Principal', tecidos: [], aviamentos: [] }]
  );
  const [activeVarianteId, setActiveVarianteId] = useState(variantes[0]?.id ?? VARIANTE_INICIAL.id);
  const [terceirosItems, setTerceirosItems] = useState<FichaTerceiro[]>(() =>
    structuredClone(peca.fichaTecnica?.terceiros ?? [])
  );
  const [provaRoupa, setProvaRoupa] = useState<FichaProvaRoupa>(() =>
    structuredClone(peca.fichaTecnica?.provaRoupa ?? { data: '', observacoes: '', fotos: [] })
  );
  const [historicoAlteracoes, setHistoricoAlteracoes] = useState(peca.historicoAlteracoes ?? []);
  const [mostrarAnexos, setMostrarAnexos] = useState(false);
  const [mostrarIntegracaoLinx, setMostrarIntegracaoLinx] = useState(false);
  const [anexos, setAnexos] = useState<FichaAnexo[]>([]);
  const [anexosRevision, setAnexosRevision] = useState(0);
  const [anexoUrls, setAnexoUrls] = useState<Record<string, string>>({});
  const [copiandoVariante, setCopiandoVariante] = useState(false);
  const [varianteError, setVarianteError] = useState('');
  const pieceKey = sharedDocumentId
    ? `shared:${marca.id}:${sharedDocumentId}`
    : `${marca.id}:${peca.id}`;
  useEffect(() => {
    const urls = Object.fromEntries(
      anexos.map((item) => [item.id, URL.createObjectURL(item.arquivo)])
    );
    setAnexoUrls(urls);
    return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }, [anexos]);
  const [saveFeedback, setSaveFeedback] = useState({ message: '', error: false });
  const saveStatus = saveFeedback.message;
  const setSaveStatus = (message: string, error = false) => setSaveFeedback({ message, error });
  const [linxVersaoImportada, setLinxVersaoImportada] = useState(
    peca.fichaTecnica?.linxVersaoImportada
  );
  const [linxColecaoOrigem, setLinxColecaoOrigem] = useState(peca.fichaTecnica?.linxColecaoOrigem);
  const insumosEditados = useRef(!!peca.fichaTecnica?.variantes);
  const [temRascunhoInsumos, setTemRascunhoInsumos] = useState(!!peca.fichaTecnica?.variantes);
  const [loadingFichaLinx, setLoadingFichaLinx] = useState(
    () =>
      colecao.regraFicha !== 'integracao-colecao-v1' &&
      !!peca.linxOrigem &&
      !peca.fichaTecnica?.variantes
  );
  const [fichaLinxError, setFichaLinxError] = useState('');
  const [fichaLinxVersao, setFichaLinxVersao] = useState<LinxFichaVersao | null>(null);
  const codigoProdutoLinx = peca.linxOrigem?.codigoProduto;
  const codigoColecaoLinx = peca.linxOrigem?.colecaoCodigo;
  const griffeProdutoLinx = peca.linxOrigem?.griffe;
  const fichaLegada = colecao.regraFicha !== 'integracao-colecao-v1';
  const [custosRevision, setCustosRevision] = useState(0);
  const [consultaCustos, setConsultaCustos] = useState<{
    key: string;
    dados: LinxFichaCustos | null;
    loading: boolean;
    error: string;
  }>({ key: '', dados: null, loading: false, error: '' });
  const versaoConsultaCustos = linxVersaoImportada ?? fichaLinxVersao?.versao;
  const podeConsultarCustos = !!(
    codigoProdutoLinx &&
    codigoColecaoLinx &&
    griffeProdutoLinx &&
    (fichaLegada || versaoConsultaCustos)
  );
  const custosKey = JSON.stringify([
    codigoProdutoLinx,
    codigoColecaoLinx,
    griffeProdutoLinx,
    colecao.nome,
    versaoConsultaCustos,
    fichaLegada,
    custosRevision,
  ]);
  const custosLinx = consultaCustos.key === custosKey ? consultaCustos.dados : null;
  const custosLinxError = consultaCustos.key === custosKey ? consultaCustos.error : '';
  const loadingCustosLinx = consultaCustos.key === custosKey && consultaCustos.loading;
  useEffect(() => {
    if (
      !podeConsultarCustos ||
      loadingFichaLinx ||
      !codigoProdutoLinx ||
      !codigoColecaoLinx ||
      !griffeProdutoLinx
    )
      return;
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setConsultaCustos({ key: custosKey, dados: null, loading: true, error: '' });
      try {
        // Rascunhos locais não são substituídos por esta consulta de custos.
        // Legado consulta sempre o cabeçalho atual: o rascunho pode preservar uma versão antiga.
        const versao = fichaLegada
          ? (
              await getLinxFichaAtual(
                codigoProdutoLinx,
                griffeProdutoLinx,
                codigoColecaoLinx,
                colecao.nome
              )
            ).versao.versao
          : versaoConsultaCustos;
        if (!versao) throw new Error('Nenhuma versão integrada disponível para consultar custos.');
        if (!active) return;
        const dados = await getLinxFichaCustos(
          codigoProdutoLinx,
          versao,
          griffeProdutoLinx,
          codigoColecaoLinx,
          colecao.nome,
          fichaLegada
        );
        if (active) setConsultaCustos({ key: custosKey, dados, loading: false, error: '' });
      } catch (error) {
        if (active)
          setConsultaCustos({
            key: custosKey,
            dados: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Não foi possível consultar os custos do Linx.',
          });
      }
    })();
    return () => {
      active = false;
    };
  }, [
    podeConsultarCustos,
    loadingFichaLinx,
    codigoProdutoLinx,
    codigoColecaoLinx,
    griffeProdutoLinx,
    colecao.nome,
    versaoConsultaCustos,
    fichaLegada,
    custosKey,
  ]);
  const draft: PecaItem = {
    ...peca,
    ...movimentacao,
    nome: nomeProduto.trim() || peca.nome,
    codigo: codigoProduto.trim(),
    historicoAlteracoes,
    fichaTecnica: {
      ...peca.fichaTecnica,
      conferencia,
      processo,
      linxVersaoImportada,
      linxColecaoOrigem,
      gradeLinx,
      integracao: { subgrupo, linha, grade, griffe, tipoMateriaPrima, categoria, subcategoria },
      nomeProduto: nomeProduto.trim(),
      codigoReferencia: codigoRef.trim(),
      descricao,
      tamanhos,
      tecnica,
      corMostruario: selectedMostruario[0]?.nome ?? '',
      coresMostruario: selectedMostruario,
      estampa: estampa.reference,
      estampaId: estampa.id,
      corte: corteAtual,
      observacoesGerais: obsGerais,
      observacoesCorte: obsCorte,
      simbologiaImagemUrl,
      simbologiaDescricao,
      modelagem: modelagemInput,
      observacoesModelagem: obsModelagem,
      tabelasMedidas,
      variantes,
      terceiros: terceirosItems,
      provaRoupa,
    },
  };
  const auditBaselineRef = useRef(draft);
  const [linxReferencia, setLinxReferencia] = useState(draft);
  const savedPecaRef = useRef(peca);
  const [conteudoSalvo, setConteudoSalvo] = useState(() => conteudoFicha(draft));
  const latestDraftRef = useRef(draft);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    latestDraftRef.current = draft;
  });
  useEffect(() => {
    if (
      !fichaLegada ||
      !codigoProdutoLinx ||
      !codigoColecaoLinx ||
      !griffeProdutoLinx ||
      insumosEditados.current
    )
      return;
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setLoadingFichaLinx(true);
      setFichaLinxError('');
      try {
        const ficha = await getLinxFichaAtual(
          codigoProdutoLinx,
          griffeProdutoLinx,
          codigoColecaoLinx,
          colecao.nome
        );
        if (!active) return;
        setFichaLinxVersao(ficha.versao);
        // Uma resposta atrasada nunca substitui insumos que o usuário já começou a editar.
        if (insumosEditados.current) return;
        const insumos = getLinxFichaInsumos(ficha);
        const tamanhosLinx = getLinxFichaTamanhos(ficha);
        if (!tamanhosEditados.current && tamanhosLinx.length) setTamanhos(tamanhosLinx);
        setVariantes((previous) =>
          previous.map((item, index) => (index === 0 ? { ...item, ...insumos } : item))
        );
        // Leitura automática do ERP é a base de comparação, não uma alteração do usuário.
        if (auditBaselineRef.current.fichaTecnica?.variantes) {
          auditBaselineRef.current = {
            ...auditBaselineRef.current,
            fichaTecnica: {
              ...auditBaselineRef.current.fichaTecnica,
              variantes: auditBaselineRef.current.fichaTecnica.variantes.map((item, index) =>
                index === 0 ? { ...item, ...structuredClone(insumos) } : item
              ),
              ...(!tamanhosEditados.current && tamanhosLinx.length
                ? { tamanhos: tamanhosLinx }
                : {}),
            },
          };
        }
        setLinxReferencia((previous) => ({
          ...previous,
          fichaTecnica: {
            ...previous.fichaTecnica,
            variantes: previous.fichaTecnica?.variantes?.map((item, index) =>
              index === 0 ? { ...item, ...structuredClone(insumos) } : item
            ),
            ...(!tamanhosEditados.current && tamanhosLinx.length ? { tamanhos: tamanhosLinx } : {}),
          },
        }));
        setLinxVersaoImportada(ficha.versao.versao);
        setLinxColecaoOrigem(ficha.versao.colecaoCodigo);
      } catch {
        if (active)
          setFichaLinxError(
            'Não foi possível carregar a ficha atual desta peça e coleção. Nenhum rascunho foi substituído.'
          );
      } finally {
        if (active) setLoadingFichaLinx(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fichaLegada, codigoProdutoLinx, codigoColecaoLinx, griffeProdutoLinx, colecao.nome]);
  const variante =
    variantes.find((item) => item.id === activeVarianteId) ?? variantes[0] ?? VARIANTE_INICIAL;
  const custosDoCabecalho = calcularCustosFicha(variante, custosLinx, terceirosItems);
  const precificacaoDoCabecalho = precificacaoVariante(variante, custosLinx, terceirosItems);
  const flowIndex = flowStages?.indexOf(draft.etapaAtual) ?? -1;
  const proximaEtapa =
    draft.etapaAtual === flowFinal
      ? null
      : flowStages
        ? flowIndex >= 0
          ? (flowStages[flowIndex + 1] ?? null)
          : null
        : proximaEtapaNumerica(draft.etapaAtual);
  const updateInsumos = (tipo: 'tecidos' | 'aviamentos', items: FichaInsumo[]) => {
    if (JSON.stringify(variante[tipo]) === JSON.stringify(items)) return;
    insumosEditados.current = true;
    setTemRascunhoInsumos(true);
    setConferencia((previous) => {
      const componentesPorVariante = { ...previous.componentesPorVariante };
      delete componentesPorVariante[variante.id];
      return { ...previous, componentesPorVariante };
    });
    setVariantes((previous) =>
      previous.map((item) =>
        item.id === variante.id
          ? {
              ...item,
              tecidos: (tipo === 'tecidos' ? items : item.tecidos).map(removerConfirmacoesInsumo),
              aviamentos: (tipo === 'aviamentos' ? items : item.aviamentos).map(
                removerConfirmacoesInsumo
              ),
            }
          : item
      )
    );
  };

  const addVariante = async (origem?: FichaVariante) => {
    if (copiandoVariante || loadingFichaLinx) return;
    setVarianteError('');
    setCopiandoVariante(true);
    insumosEditados.current = true;
    setTemRascunhoInsumos(true);
    const id = crypto.randomUUID();
    const principal = origem ?? VARIANTE_INICIAL;
    const clone = structuredClone(principal);
    try {
      const imageId =
        origem && !principal.imagemRemovida
          ? (principal.imagemAnexoId ??
            (!principal.imagemUrl && !peca.imagemCroquiUrl && principal.id === variantes[0]?.id
              ? anexos.find((item) => item.categoria === 'variantes')?.id
              : undefined))
          : undefined;
      if (imageId) {
        const copy = await copiarImagemVariante(pieceKey, imageId);
        clone.imagemAnexoId = copy.id;
        clone.imagemNome = copy.nome;
        setAnexos((previous) => [...previous, copy]);
        setAnexosRevision((previous) => previous + 1);
      } else {
        clone.imagemUrl =
          !origem || principal.imagemRemovida
            ? undefined
            : (principal.imagemUrl ??
              (principal.id === variantes[0]?.id ? peca.imagemCroquiUrl : undefined));
      }
      setVariantes((previous) => [
        ...previous,
        {
          ...clone,
          id,
          nome: `Variante ${previous.length + 1}`,
          corProdutoLinx: undefined,
          corBasicaLinx: undefined,
          tecidos: clone.tecidos.map(clonarInsumoSemConfirmacoes),
          aviamentos: clone.aviamentos.map(clonarInsumoSemConfirmacoes),
        },
      ]);
      setActiveVarianteId(id);
    } catch (cause) {
      setVarianteError(
        cause instanceof Error ? cause.message : 'Não foi possível criar a variante.'
      );
    } finally {
      setCopiandoVariante(false);
    }
  };
  const removeVariante = (id: string) => {
    insumosEditados.current = true;
    setTemRascunhoInsumos(true);
    if (id === variantes[0]?.id) return;
    setVariantes((previous) => previous.filter((item) => item.id !== id));
    setTerceirosItems((previous) =>
      previous.map((item) => ({
        ...item,
        variantes: item.variantes.filter((variantId) => variantId !== id),
      }))
    );
    if (activeVarianteId === id) setActiveVarianteId(variantes[0]?.id ?? VARIANTE_INICIAL.id);
  };

  const variantePhoto = (item: FichaVariante, index: number) =>
    item.imagemRemovida
      ? undefined
      : (item.imagemUrl ??
        anexoUrls[item.imagemAnexoId ?? ''] ??
        (index === 0
          ? (peca.imagemCroquiUrl ??
            anexoUrls[anexos.find((anexo) => anexo.categoria === 'variantes')?.id ?? ''])
          : undefined));

  // Handlers para Seleção de Tamanhos
  const atualizarTamanhos = (proximos: string[]) => {
    tamanhosEditados.current = true;
    setConferencia((previous) => ({ ...previous, gradeCompleta: false }));
    setTamanhos(proximos);
    const proximoCorte = corte
      ? sincronizarTabelaCorte(corte, proximos, selectedMostruario)
      : undefined;
    setCorte(proximoCorte);
    salvarSelecoesLocais(proximos, selectedMostruario, proximoCorte, true);
  };

  const atualizarMostruario = (cores: TecidoCorItem[]) => {
    setSelectedMostruario(cores);
    const proximoCorte = corte ? sincronizarTabelaCorte(corte, tamanhos, cores) : undefined;
    setCorte(proximoCorte);
    salvarSelecoesLocais(tamanhos, cores, proximoCorte);
  };

  const atualizarCorte = (proximo: FichaCorte) => {
    setCorte(proximo);
    salvarSelecoesLocais(tamanhos, selectedMostruario, proximo);
  };

  // Salva apenas os dados compartilhados da grade, sem confirmar os demais campos em edição.
  const salvarSelecoesLocais = async (
    proximosTamanhos: string[],
    proximasCores: TecidoCorItem[],
    proximoCorte: FichaCorte | undefined,
    mudouGrade = false
  ) => {
    try {
      if (!onUpdatePeca) throw new Error('Salvamento indisponível nesta tela.');
      const anterior = savedPecaRef.current;
      const campos = {
        tamanhos: proximosTamanhos,
        coresMostruario: proximasCores,
        corMostruario: proximasCores[0]?.nome ?? '',
        corte: proximoCorte,
        ...(mudouGrade
          ? { conferencia: { ...anterior.fichaTecnica?.conferencia, gradeCompleta: false } }
          : {}),
      };
      const candidata = { ...anterior, fichaTecnica: { ...anterior.fichaTecnica, ...campos } };
      const updated = registrarAlteracoesFicha(
        anterior,
        atualizarRevisao(anterior, candidata),
        autor,
        anexos
      );
      setSaveStatus('Salvando…');
      const result = onUpdatePeca(updated);
      if (result instanceof Promise) await result;
      savedPecaRef.current = updated;
      auditBaselineRef.current = {
        ...auditBaselineRef.current,
        historicoAlteracoes: updated.historicoAlteracoes,
        fichaTecnica: {
          ...auditBaselineRef.current.fichaTecnica,
          ...structuredClone(campos),
          processo: updated.fichaTecnica?.processo,
        },
      };
      setProcesso(updated.fichaTecnica?.processo);
      setConteudoSalvo(conteudoFicha(updated));
      setHistoricoAlteracoes(updated.historicoAlteracoes ?? []);
      setSaveStatus(
        shared
          ? 'Salvo no servidor.'
          : 'Tamanhos, cores e corte salvos automaticamente neste navegador.'
      );
    } catch (error) {
      setSaveStatus(
        shared
          ? error instanceof Error
            ? error.message
            : 'Erro ao salvar.'
          : 'Não foi possível salvar automaticamente no navegador. As alterações continuam abertas.',
        true
      );
    }
  };

  const persistirFicha = (
    candidata: PecaItem,
    preservarRevisao = false
  ): PecaItem | Promise<PecaItem> => {
    if (!onUpdatePeca) throw new Error('Salvamento indisponível nesta tela.');
    const versionada = preservarRevisao
      ? candidata
      : atualizarRevisao(auditBaselineRef.current, candidata);
    const updated = registrarAlteracoesFicha(auditBaselineRef.current, versionada, autor, anexos);
    setSaveStatus('Salvando…');
    const result = onUpdatePeca(updated);
    const confirm = () => {
      savedPecaRef.current = updated;
      auditBaselineRef.current = structuredClone(updated);
      setMovimentacao({
        etapaAtual: updated.etapaAtual,
        fluxo: updated.fluxo,
        responsavel: updated.responsavel,
        previsaoEntrega: updated.previsaoEntrega,
        observacaoEtapa: updated.observacaoEtapa,
      });
      setProcesso(updated.fichaTecnica?.processo);
      setConteudoSalvo(conteudoFicha(updated));
      setHistoricoAlteracoes(updated.historicoAlteracoes ?? []);
      setCorte(updated.fichaTecnica?.corte);
      return updated;
    };
    return result instanceof Promise ? result.then(confirm) : confirm();
  };
  const handleSave = (): boolean | Promise<boolean> => {
    if (loadingFichaLinx || copiandoVariante) {
      setSaveStatus('Aguarde o carregamento da ficha atual antes de salvar.');
      return false;
    }
    if (onUpdatePeca) {
      const success = () => {
        setSaveStatus(
          shared ? 'Salvo no servidor.' : 'Alterações salvas automaticamente neste navegador.'
        );
        return true;
      };
      const failure = (error: unknown) => {
        setSaveStatus(
          shared
            ? error instanceof Error
              ? error.message
              : 'Erro ao salvar.'
            : 'Não foi possível salvar no navegador. As alterações continuam abertas.',
          true
        );
        return false;
      };
      try {
        const result = persistirFicha(draft);
        return result instanceof Promise ? result.then(success, failure) : success();
      } catch (error) {
        return failure(error);
      }
    }
    return false;
  };

  const avancarEtapa = async () => {
    if (!proximaEtapa) return;
    if (shared && exigeConferencia(draft.etapaAtual, proximaEtapa)) {
      setEtapaDestino(proximaEtapa);
      setMovimentando(true);
      return;
    }
    try {
      const result = persistirFicha({ ...draft, etapaAtual: proximaEtapa });
      if (result instanceof Promise) await result;
      setSaveStatus(`Etapa avançada para ${proximaEtapa}. Nada foi enviado ao Linx.`);
    } catch {
      setSaveStatus('Não foi possível salvar o avanço. A peça permanece na etapa anterior.', true);
    }
  };

  const concluirFicha = async () => {
    const candidata = draft;
    setValidandoProcesso(true);
    setMostrarConferencia(true);
    try {
      if (!autor?.id) throw new Error('Entre com um usuário para concluir a ficha.');
      await validarConferenciaServidor(candidata, marca.id);
      const anexosAtuais = await listFichaAnexos(pieceKey);
      if (!mountedRef.current) return;
      if (conteudoFicha(latestDraftRef.current) !== conteudoFicha(candidata))
        throw new Error('A ficha mudou durante a conferência. Confira novamente.');
      const versionada = atualizarRevisao(auditBaselineRef.current, candidata);
      const revisao = versionada.fichaTecnica!.processo!.revisao;
      await persistirFicha(
        {
          ...versionada,
          fichaTecnica: {
            ...versionada.fichaTecnica,
            processo: {
              ...versionada.fichaTecnica!.processo!,
              concluida: {
                revisao,
                registradoEm: new Date().toISOString(),
                responsavel: { id: autor.id, nome: autor.nome },
                anexosAssinatura: assinaturaAnexos(anexosAtuais),
              },
            },
          },
        },
        true
      );
      setSaveStatus(
        'Ficha concluída no portal. Você pode preparar a integração agora ou depois; nada foi enviado ao Linx.'
      );
    } catch (error) {
      if (mountedRef.current)
        setSaveStatus(
          error instanceof Error ? error.message : 'Não foi possível concluir a ficha.',
          true
        );
    } finally {
      if (mountedRef.current) setValidandoProcesso(false);
    }
  };
  const prepararIntegracao = async () => {
    const candidata = draft;
    setValidandoProcesso(true);
    try {
      if (conteudoFicha(auditBaselineRef.current) !== conteudoFicha(candidata))
        throw new Error(
          'Salve as alterações e conclua novamente a ficha antes de preparar a integração.'
        );
      await validarConferenciaServidor(candidata, marca.id, true);
      if (conteudoFicha(latestDraftRef.current) !== conteudoFicha(candidata))
        throw new Error('A ficha mudou durante a conferência. Confira novamente.');
      prepararContratoLinx(candidata, colecao);
      const anexosAtuais = await listFichaAnexos(pieceKey);
      if (!mountedRef.current) return;
      if (conteudoFicha(latestDraftRef.current) !== conteudoFicha(candidata))
        throw new Error('A ficha mudou durante a conferência. Confira novamente.');
      if (
        candidata.fichaTecnica?.processo?.concluida?.anexosAssinatura !==
        assinaturaAnexos(anexosAtuais)
      )
        throw new Error('Os anexos mudaram após a conclusão. Conclua novamente a ficha.');
      await persistirFicha(
        {
          ...candidata,
          fichaTecnica: {
            ...candidata.fichaTecnica,
            processo: {
              ...candidata.fichaTecnica!.processo!,
              integracaoPreparada: {
                revisao: candidata.fichaTecnica!.processo!.revisao,
                registradoEm: new Date().toISOString(),
                status: 'PENDENTE_MAPEAMENTO',
              },
            },
          },
        },
        true
      );
      setSaveStatus(
        'Integração preparada — pendente de mapeamento/API de gravação e confirmação. Não enviada ao Linx e nenhuma versão integrada criada.'
      );
    } catch (error) {
      if (mountedRef.current) {
        setMostrarConferencia(true);
        setSaveStatus(
          error instanceof Error ? error.message : 'Não foi possível preparar a integração.',
          true
        );
      }
    } finally {
      if (mountedRef.current) setValidandoProcesso(false);
    }
  };
  const baixarContrato = async () => {
    try {
      if (conteudoFicha(auditBaselineRef.current) !== conteudoFicha(draft))
        throw new Error('Salve e conclua novamente a ficha antes de baixar o contrato.');
      const contrato = prepararContratoLinx(draft, colecao);
      const anexosAtuais = await listFichaAnexos(pieceKey);
      if (!mountedRef.current) return;
      if (conteudoFicha(latestDraftRef.current) !== conteudoFicha(draft))
        throw new Error('A ficha mudou enquanto o contrato era preparado. Confira novamente.');
      if (
        draft.fichaTecnica?.processo?.concluida?.anexosAssinatura !== assinaturaAnexos(anexosAtuais)
      )
        throw new Error('Os anexos mudaram após a conclusão. Conclua novamente a ficha.');
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(contrato, null, 2)], { type: 'application/json' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modaflow-ficha-pendente-integracao.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : 'Contrato indisponível.', true);
    }
  };
  const fichaConcluida =
    !!processo?.concluida &&
    processo.concluida.revisao === processo.revisao &&
    conteudoSalvo === conteudoFicha(draft) &&
    processo.concluida.anexosAssinatura === assinaturaAnexos(anexos);
  const etapaFinal = etapaPermiteConclusao(draft.etapaAtual);

  const handleAnexosMutation = async (antes: FichaAnexo[], depois: FichaAnexo[]) => {
    if (!onUpdatePeca) return;
    const registrado = registrarAlteracoesAnexos(savedPecaRef.current, antes, depois, autor);
    const updated: PecaItem = {
      ...registrado,
      fichaTecnica: {
        ...registrado.fichaTecnica,
        processo: {
          ...registrado.fichaTecnica?.processo,
          revisao: crypto.randomUUID(),
        },
      },
    };
    await onUpdatePeca(updated);
    savedPecaRef.current = updated;
    auditBaselineRef.current = {
      ...auditBaselineRef.current,
      fichaTecnica: {
        ...auditBaselineRef.current.fichaTecnica,
        processo: updated.fichaTecnica?.processo,
      },
      historicoAlteracoes: updated.historicoAlteracoes,
    };
    setHistoricoAlteracoes(updated.historicoAlteracoes ?? []);
    setProcesso(updated.fichaTecnica?.processo);
  };

  const anexosController = useFichaAnexos({
    pieceKey,
    onItemsChange: setAnexos,
    onMutation: handleAnexosMutation,
    disabled: validandoProcesso,
    revision: anexosRevision,
  });
  const alteracoesLinx = useFichaLinxAlteracoes({
    peca: draft,
    referencia: linxReferencia,
    anexos,
    chave: JSON.stringify([marca.id, colecao.id, peca.id]),
    carregando: anexosController.loading || loadingFichaLinx,
  });
  const autosave = useFichaAutosave({
    conteudo: conteudoFicha(draft),
    salvo: conteudoSalvo,
    bloqueado: loadingFichaLinx || copiandoVariante || validandoProcesso || !onUpdatePeca,
    onSave: handleSave,
  });

  return (
    <div
      role="group"
      aria-label="Ficha técnica"
      onBlurCapture={() => autosave.flush()}
      className="ficha-tecnica w-full min-w-0 space-y-4 font-sans pb-12 animate-in fade-in duration-200 bg-bg text-primary"
    >
      <div className="ficha-sticky rounded-card bg-surface/95 shadow-card backdrop-blur-md">
        <header className="border border-border bg-surface/95">
          <div className="flex flex-wrap items-center gap-3 p-3 sm:px-4">
            <Button
              variant="ghost"
              aria-label="Voltar"
              onClick={() => {
                const result = autosave.flush();
                if (result instanceof Promise)
                  void result.then((success) => {
                    if (success) onBack();
                  });
                else if (result) onBack();
              }}
              disabled={validandoProcesso}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-muted">
              {variantePhoto(variantes[0] ?? VARIANTE_INICIAL, 0) ? (
                <img
                  src={variantePhoto(variantes[0] ?? VARIANTE_INICIAL, 0)}
                  alt="Capa da peça"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon aria-hidden="true" className="h-6 w-6 text-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">
                {marca.nome} › {colecao.nome} › {peca.tema || 'Base'}
              </p>
              <h1 className="font-editorial text-xl font-semibold tracking-tight sm:text-2xl">
                {nomeProduto || peca.nome || peca.tipo}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{draft.codigo || 'Código do produto a definir'}</span>
                <span>· Ficha técnica</span>
                {linxVersaoImportada && <span>· Versão {linxVersaoImportada}</span>}
                <StatusBadge status={fichaConcluida ? 'complete' : 'draft'} />
                <button
                  type="button"
                  aria-expanded={mostrarResumoMobile}
                  aria-controls="ficha-resumo-mobile"
                  onClick={() => setMostrarResumoMobile((value) => !value)}
                  className="min-h-8 text-xs font-semibold text-accent-camel underline sm:hidden"
                >
                  Detalhes da peça
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                aria-label="Sinal da ficha"
                title="Ver histórico da ficha"
                onClick={() => setActiveFichaTab('historico')}
              >
                <Rss aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button
                variant="primary"
                aria-label="Avançar"
                disabled={
                  !proximaEtapa ||
                  !onUpdatePeca ||
                  loadingFichaLinx ||
                  copiandoVariante ||
                  validandoProcesso
                }
                title={
                  proximaEtapa
                    ? 'Avançar para ' + proximaEtapa
                    : 'Esta ficha já chegou à etapa Final.'
                }
                onClick={avancarEtapa}
              >
                Avançar etapa
              </Button>
              <Button
                className="ficha-linx-sync"
                data-pendente={alteracoesLinx.temAlteracoes}
                aria-label={shared ? 'Situação da integração Linx' : 'Integrar no Linx'}
                aria-describedby="ficha-linx-alteracoes-status"
                disabled={
                  !alteracoesLinx.temAlteracoes ||
                  alteracoesLinx.carregando ||
                  copiandoVariante ||
                  validandoProcesso ||
                  !!anexosController.busy
                }
                title={
                  alteracoesLinx.carregando
                    ? 'Conferindo alterações…'
                    : alteracoesLinx.temAlteracoes
                      ? 'Ver alterações pendentes de integração'
                      : 'Sem alterações detectadas'
                }
                onClick={() => setMostrarIntegracaoLinx(true)}
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                {shared ? 'Integração Linx' : 'Integrar no Linx'}
              </Button>
              <details className="relative">
                <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-control border border-border px-3 py-2 text-sm font-semibold">
                  Opções <ChevronDown aria-hidden="true" className="h-4 w-4" />
                </summary>
                <div className="absolute right-0 top-full z-40 mt-2 w-64 space-y-2 rounded-card border border-border bg-surface p-3 shadow-lg">
                  <Button
                    className="w-full"
                    aria-expanded={mostrarConferencia}
                    onClick={() => setMostrarConferencia((previous) => !previous)}
                  >
                    Conferir ficha
                  </Button>
                  <Button className="w-full" onClick={() => setMostrarAnexos(true)}>
                    Gerenciar anexos
                  </Button>
                  <Button className="w-full" onClick={() => window.print()}>
                    Exportar
                  </Button>
                  {fichaConcluida && (
                    <Button
                      className="w-full"
                      disabled={validandoProcesso}
                      onClick={prepararIntegracao}
                    >
                      Integrar no Linx — preparar
                    </Button>
                  )}
                  {fichaConcluida &&
                    processo?.integracaoPreparada?.revisao === processo.revisao && (
                      <Button className="w-full" onClick={baixarContrato}>
                        Baixar contrato preparado
                      </Button>
                    )}
                </div>
              </details>
              {etapaFinal && (
                <Button
                  disabled={loadingFichaLinx || copiandoVariante || validandoProcesso}
                  onClick={concluirFicha}
                >
                  {validandoProcesso ? 'Conferindo…' : 'Concluir ficha'}
                </Button>
              )}
            </div>
          </div>
          <div
            id="ficha-resumo-mobile"
            className={`${mostrarResumoMobile ? 'flex' : 'hidden sm:flex'} flex-wrap items-center gap-2 border-t border-border-muted px-4 py-2`}
          >
            <div
              aria-label="Resumo da ficha"
              role="group"
              className="flex flex-wrap items-center gap-2 text-xs"
            >
              <button
                type="button"
                aria-label="Entregar / alterar etapa"
                aria-haspopup="dialog"
                aria-expanded={movimentando}
                disabled={
                  !onUpdatePeca || loadingFichaLinx || copiandoVariante || validandoProcesso
                }
                onClick={() => {
                  setEtapaDestino(undefined);
                  setMovimentando(true);
                }}
                className="ficha-summary-chip text-left transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent-camel disabled:opacity-50"
                title="Entregar ou alterar a etapa desta ficha"
              >
                <span className="text-muted">Etapa</span>
                <strong>
                  {draft.etapaAtual && draft.etapaAtual !== '—' ? draft.etapaAtual : 'Definir'}
                </strong>
                <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted" />
              </button>
              <div className="ficha-summary-chip">
                <span className="text-muted">Custo</span>
                <strong
                  className={
                    custosDoCabecalho.total === null
                      ? 'text-status-pending'
                      : 'font-mono tabular-nums'
                  }
                >
                  {custosDoCabecalho.total === null
                    ? 'Definir'
                    : shared
                      ? currency(custosDoCabecalho.total)
                      : formatarCusto(custosDoCabecalho.total)}
                </strong>
              </div>
              <div className="ficha-summary-chip">
                <span className="text-muted">
                  {shared
                    ? precificacaoDoCabecalho.value.precoAprovado.trim()
                      ? 'Preço aprovado'
                      : 'Preço sugerido'
                    : 'Preço'}
                </span>
                <strong
                  className={
                    precificacaoDoCabecalho.precoCabecalho === null
                      ? 'text-status-pending'
                      : 'font-mono tabular-nums'
                  }
                >
                  {precificacaoDoCabecalho.precoCabecalho === null
                    ? 'Definir'
                    : shared
                      ? currency(precificacaoDoCabecalho.precoCabecalho)
                      : formatarCusto(precificacaoDoCabecalho.precoCabecalho)}
                </strong>
              </div>
              {(['estilista', 'modelista'] as const).map((role) => (
                <div key={role} className="ficha-summary-chip">
                  <span className="capitalize text-muted">
                    {role === 'estilista' ? 'Estilista' : 'Modelista'}
                  </span>
                  {peca[role] && (
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-camel/10 text-accent-camel"
                    >
                      {peca[role]
                        ?.split(' ')
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                  <strong className={peca[role] ? '' : 'text-status-pending'}>
                    {peca[role] || 'Definir'}
                  </strong>
                </div>
              ))}
              {shared && (
                <>
                  <div className="ficha-summary-chip">
                    <span className="text-muted">Status PLM</span>
                    <strong>{peca.status}</strong>
                  </div>
                  <div className="ficha-summary-chip">
                    <span className="text-muted">Responsável</span>
                    <strong>{peca.responsavel || 'Definir'}</strong>
                  </div>
                  <div className="ficha-summary-chip">
                    <span className="text-muted">Prazo</span>
                    <strong>{displayDate(peca.previsaoEntrega)}</strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <FichaNavigation
          peca={draft}
          active={activeFichaTab}
          onChange={setActiveFichaTab}
          shared={shared}
        />
      </div>
      <p id="ficha-linx-alteracoes-status" className="sr-only">
        {alteracoesLinx.carregando
          ? 'Conferindo alterações para o Linx…'
          : alteracoesLinx.temAlteracoes
            ? 'Alterações pendentes de integração com o Linx.'
            : 'Sem alterações detectadas para o Linx.'}
      </p>
      {alteracoesLinx.erro && (
        <p role="alert" className="text-sm text-status-error">
          {alteracoesLinx.erro}
        </p>
      )}
      {(saveStatus || autosave.alterado) && (
        <p
          role={saveFeedback.error ? 'alert' : 'status'}
          className={saveFeedback.error ? 'text-sm text-status-error' : 'sr-only'}
        >
          {autosave.alterado && !saveFeedback.error
            ? 'Salvando alterações automaticamente…'
            : saveStatus}
        </p>
      )}
      {mostrarIntegracaoLinx && (
        <Dialog
          title="Integração Linx"
          closeLabel="Fechar integração Linx"
          className="max-w-xl"
          onClose={() => setMostrarIntegracaoLinx(false)}
        >
          <div className="space-y-4 text-sm">
            <p className="font-semibold text-status-pending">Alterações pendentes de integração</p>
            <p>
              O botão acompanha as mudanças em toda a ficha, incluindo etapa, informações,
              variantes, insumos, medidas, preços, imagens e arquivos.
            </p>
            <p>
              O salvamento automático mantém estas alterações pendentes. A pendência será limpa
              quando o Linx confirmar o envio.
            </p>
            <div className="rounded-control border border-border bg-surface-muted p-4 space-y-2">
              <h3 className="font-semibold">Próxima etapa da integração</h3>
              <p>
                {peca.linxOrigem || peca.historicoIntegracoes?.length
                  ? 'Atualizar a Principal na mesma versão vinculada, preservando os dados não alterados, e receber a confirmação do Linx.'
                  : 'Verificar o código digitado: criar cadastro somente se for novo, ou reutilizar o cadastro existente e vincular a ficha à coleção correta, sem alterar a ficha de origem.'}
              </p>
              <p>
                O envio e a criação no Linx ainda não estão disponíveis. Nesta etapa, este botão
                apenas identifica as alterações.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setMostrarIntegracaoLinx(false)}>Entendi</Button>
            </div>
          </div>
        </Dialog>
      )}
      {processo?.concluida && !fichaConcluida && (
        <p role="status" className="text-xs">
          Ficha alterada após a conclusão. Salve e conclua novamente. As versões já integradas
          permanecem preservadas.
        </p>
      )}
      {fichaConcluida && (
        <p role="status" className="text-xs">
          Conclusão do portal confirmada. Integração Linx não executada; depende do contrato de
          gravação.
        </p>
      )}

      {mostrarConferencia && (
        <FichaConferenciaPanel
          peca={draft}
          onChange={setConferencia}
          onVariantesChange={setVariantes}
          onCorrigir={(aba, varianteId, campo) => {
            setActiveFichaTab(aba);
            if (varianteId) setActiveVarianteId(varianteId);
            window.setTimeout(() => {
              const root = document.getElementById('ficha-conteudo');
              if (!root) return;
              const focus = (target: HTMLElement | null) => {
                target?.scrollIntoView?.({ block: 'center' });
                target?.focus({ preventScroll: true });
              };
              if (campo === 'gradeCompleta') {
                focus(
                  document.querySelector<HTMLInputElement>(
                    '[aria-label="Confirmei em Geral todos os tamanhos da grade, não somente o piloto"]'
                  )
                );
                return;
              }
              if (aba === 'geral') {
                focus(
                  root.querySelector<HTMLElement>('[aria-label="Tamanhos"]') ??
                    root.querySelector<HTMLElement>('[role="combobox"]')
                );
                return;
              }
              const parts = campo?.split('.') ?? [];
              if (parts[0] === 'componente') {
                const name = COMPONENTES_FICHA[parts[1] as keyof typeof COMPONENTES_FICHA];
                const variant = variantes.find((entry) => entry.id === varianteId);
                const decision = Array.from(
                  document.querySelectorAll<HTMLSelectElement>('select[aria-label]')
                ).find(
                  (node) =>
                    node.getAttribute('aria-label') ===
                    name + ' se aplica à variante ' + variant?.nome + '?'
                );
                if (decision) {
                  focus(decision);
                  return;
                }
              }
              const article = Array.from(
                root.querySelectorAll<HTMLElement>('[data-insumo-id]')
              ).find((node) => node.dataset.insumoId === parts[1]);
              let target: HTMLElement | null = null;
              if (article) {
                article.querySelectorAll('details').forEach((node) => {
                  node.open = true;
                });
                if (parts[0] === 'consumo') {
                  const button = article.querySelector<HTMLButtonElement>(
                    'button[aria-label^="Consumo por tamanho de"]'
                  );
                  if (button?.getAttribute('aria-expanded') === 'false') button.click();
                  window.setTimeout(() => {
                    const prefix = 'Consumo tamanho ' + parts.slice(2).join('.') + ' — ';
                    const label = Array.from(
                      article.querySelectorAll<HTMLLabelElement>('label[for]')
                    ).find((node) => node.textContent?.trim().startsWith(prefix));
                    focus(label ? document.getElementById(label.htmlFor) : button);
                  }, 0);
                  return;
                }
                if (parts[0] === 'finalidade')
                  target = article.querySelector('[data-field="finalidade"]');
                else if (parts[0] === 'consumoGeral')
                  target = article.querySelector(
                    article.dataset.consumoBase === 'peso'
                      ? '[data-field="peso"]'
                      : '[data-field="consumo-geral"]'
                  );
                else target = article.querySelector('[data-field="preco"]');
              }
              focus(target ?? root.querySelector<HTMLElement>('button'));
            }, 0);
          }}
        />
      )}
      {movimentando && (
        <PecaFluxoEtapasModal
          etapasDisponiveis={flowStages}
          peca={draft}
          etapaDestino={etapaDestino}
          marcaId={marca.id}
          marcaNome={marca.nome}
          usuarios={usuarios}
          usuariosCarregando={usuariosCarregando}
          erroUsuarios={erroUsuarios}
          onTentarCarregarUsuarios={onTentarCarregarUsuarios}
          onConferenciaChange={setConferencia}
          onVariantesChange={setVariantes}
          onClose={() => {
            setMovimentando(false);
            setEtapaDestino(undefined);
          }}
          onSave={async (updated) => {
            await persistirFicha(updated);
            setSaveStatus('Entrega conferida e salva no portal. Nada foi enviado ao Linx.');
          }}
          onCorrigir={(aba, varianteId) => {
            setMovimentando(false);
            setEtapaDestino(undefined);
            setMostrarConferencia(true);
            if (aba) setActiveFichaTab(aba);
            if (varianteId) setActiveVarianteId(varianteId);
          }}
        />
      )}
      {peca.linxOrigem && fichaLegada && (
        <LinxFichaPanel
          produto={peca.linxOrigem.codigoProduto}
          loading={loadingFichaLinx}
          error={fichaLinxError}
          versao={fichaLinxVersao}
          temRascunho={!!peca.fichaTecnica?.variantes}
        />
      )}
      {linxVersaoImportada && (
        <p className="text-xs text-muted">
          Insumos da ficha atual Linx {linxVersaoImportada} (coleção de origem:{' '}
          {linxColecaoOrigem ?? 'não informada'}). Alterações locais não criam outra versão.
        </p>
      )}
      {/* 4. CONTEÚDO DAS ABAS */}
      <div id="ficha-conteudo" className="ficha-submenus-compact space-y-5">
        {/* CONTEÚDO DAS ABAS */}
        <div className="space-y-3">
          {/* ===== ABA GERAL (Com Tamanhos Multi-Seleção, Cor do Linx, Observações e Simbologia Drag-and-Drop) ===== */}
          {activeFichaTab === 'geral' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* BLOCO GERAL */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <h3 className="text-sm font-bold font-editorial text-primary border-b border-border-muted pb-3">
                  Identificação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label
                      htmlFor="ficha-nome-produto"
                      className="block font-semibold mb-1 text-muted-foreground"
                    >
                      Nome do Produto
                    </label>
                    <input
                      id="ficha-nome-produto"
                      type="text"
                      value={nomeProduto}
                      onChange={(e) => setNomeProduto(e.target.value)}
                      placeholder="Digite Nome do Produto..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ficha-codigo-produto"
                      className="block font-semibold mb-1 text-muted-foreground"
                    >
                      Código do produto
                    </label>
                    <input
                      id="ficha-codigo-produto"
                      type="text"
                      value={codigoProduto}
                      maxLength={12}
                      readOnly={codigoIntegrado}
                      onChange={(event) => setCodigoProduto(event.target.value)}
                      aria-describedby="ficha-codigo-produto-ajuda"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                    <p id="ficha-codigo-produto-ajuda" className="mt-1 text-xs text-muted">
                      {codigoIntegrado
                        ? 'Código do cadastro integrado. Editar a ficha não troca essa identificação.'
                        : shared
                          ? 'Código da ficha compartilhada no PLM. A reserva no ERP depende da integração.'
                          : 'Código próprio desta peça. Salvo no navegador; a reserva no banco depende da futura integração.'}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="ficha-codigo-referencia"
                      className="block font-semibold mb-1 text-muted-foreground"
                    >
                      Código de Referência
                    </label>
                    <input
                      id="ficha-codigo-referencia"
                      type="text"
                      value={codigoRef}
                      onChange={(e) => setCodigoRef(e.target.value)}
                      placeholder="Digite o código de referência..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-muted">
                      Referência para reutilização. Não troca o código desta peça nem altera o
                      produto referenciado.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="ficha-descricao"
                      className="block font-semibold mb-1 text-muted-foreground"
                    >
                      Descrição
                    </label>
                    <input
                      id="ficha-descricao"
                      type="text"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Digite a descrição detalhada do produto..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <Card>
                <SectionHeader
                  title="Grade e tamanhos"
                  description={
                    shared
                      ? 'Salvamento automático na ficha compartilhada'
                      : 'Salvamento automático no navegador'
                  }
                />{' '}
                <div className="sm:col-span-2">
                  <FichaTamanhosPicker
                    value={tamanhos}
                    onChange={atualizarTamanhos}
                    griffe={resolveLinxGriffe(marca) ?? colecao.griffe ?? peca.linxOrigem?.griffe}
                  />
                </div>
              </Card>
              <Card>
                <SectionHeader
                  title="Cor de mostruário e estampa"
                  description={
                    shared
                      ? 'Cores de mostruário e estampa são salvas na ficha compartilhada.'
                      : 'Cores de mostruário e estampa são salvas automaticamente neste navegador.'
                  }
                />
                <p className="mb-4 text-xs text-muted">
                  A cor de mostruário será usada na integração com o Linx, ainda em preparação.
                  Escolha as cores da peça nos insumos de Tecidos e Aviamentos.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {' '}
                  <MostruarioColorsPicker
                    value={selectedMostruario}
                    onChange={atualizarMostruario}
                  />
                  {/* Estampa */}
                  <div>
                    <label
                      htmlFor="ficha-estampa"
                      className="block font-semibold mb-1 text-muted-foreground"
                    >
                      Estampa
                    </label>
                    <select
                      id="ficha-estampa"
                      ref={(element) => {
                        if (element && focusPrintOnMount.current) {
                          focusPrintOnMount.current = false;
                          element.scrollIntoView?.({ block: 'center' });
                          element.focus({ preventScroll: true });
                        }
                      }}
                      value={estampaSelecionada?.id ?? (estampa.reference ? '__saved__' : '')}
                      onChange={(event) => {
                        const selected = estampasDaColecao.find(
                          (item) => item.id === event.target.value
                        );
                        setEstampa({
                          id: selected?.id,
                          reference: selected?.reference ?? '',
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    >
                      <option value="">Selecione uma estampa</option>
                      {estampa.reference && !estampaSelecionada && (
                        <option value="__saved__">{estampa.reference} (valor salvo)</option>
                      )}
                      {estampasDaColecao.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.reference} · {item.type}
                        </option>
                      ))}
                    </select>
                    {estampasDaColecao.length === 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Cadastre estampas no submenu Estampas da coleção para selecioná-las aqui.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
              <Card>
                <SectionHeader title="Técnica" /> {/* Técnica */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="ficha-tecnica"
                    className="block font-semibold mb-1 text-muted-foreground"
                  >
                    Técnica
                  </label>
                  <input
                    id="ficha-tecnica"
                    type="text"
                    value={tecnica}
                    onChange={(e) => setTecnica(e.target.value)}
                    placeholder="Exemplo: Estamparia, Lavanderia, Bordado"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                  />
                </div>
              </Card>

              {/* BLOCO OBSERVAÇÕES */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <h3 className="text-sm font-bold font-editorial text-primary border-b border-border-muted pb-3">
                  Observações
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label
                      htmlFor="ficha-observacoes-gerais"
                      className="block font-semibold mb-1 text-muted-foreground"
                    >
                      Observações Gerais
                    </label>
                    <textarea
                      id="ficha-observacoes-gerais"
                      rows={4}
                      value={obsGerais}
                      onChange={(e) => setObsGerais(e.target.value)}
                      placeholder="Digite aqui as observações gerais da peça/produção..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none resize-y"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ficha-observacoes-corte"
                      className="block font-semibold mb-1 text-muted-foreground"
                    >
                      Observações de Corte
                    </label>
                    <textarea
                      id="ficha-observacoes-corte"
                      rows={4}
                      value={obsCorte}
                      onChange={(e) => setObsCorte(e.target.value)}
                      placeholder="Digite aqui as instruções e observações de corte..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none resize-y"
                    />
                  </div>
                </div>
              </div>
              <Card>
                {' '}
                <h4 className="text-xs font-bold text-primary border-t border-border-muted pt-4">
                  Simbologia
                </h4>
                <FichaImageUpload
                  label="Imagem da simbologia"
                  value={simbologiaImagemUrl}
                  onChange={setSimbologiaImagemUrl}
                />
                <label className="block space-y-1 text-xs font-semibold text-muted-foreground">
                  Descrição da simbologia
                  <textarea
                    rows={3}
                    value={simbologiaDescricao}
                    onChange={(e) => setSimbologiaDescricao(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-muted px-3.5 py-2.5 text-primary"
                  />
                </label>
              </Card>
            </div>
          )}

          {/* ===== ABA CORTE ===== */}
          {activeFichaTab === 'corte' && (
            <FichaCorteEditor
              value={corteAtual}
              tamanhos={tamanhos}
              cores={selectedMostruario}
              onChange={atualizarCorte}
              onSave={handleSave}
              autoSave
              savingDisabled={
                loadingFichaLinx || copiandoVariante || validandoProcesso || !onUpdatePeca
              }
            />
          )}

          {activeFichaTab === 'modelagem' && (
            <FichaModelagemEditor
              codigo={modelagemInput}
              observacoes={obsModelagem}
              tabelas={tabelasMedidas}
              tamanhos={tamanhos}
              onObservacoesChange={setObsModelagem}
              onTabelasChange={setTabelasMedidas}
              onSave={handleSave}
              autoSave
              savingDisabled={
                loadingFichaLinx || copiandoVariante || validandoProcesso || !onUpdatePeca
              }
            />
          )}

          {['tecidos', 'aviamentos', 'custos', 'precificacao'].includes(activeFichaTab) && (
            <div className="rounded-xl border border-border bg-surface p-4 mb-4">
              <label className="block text-xs font-semibold">
                {activeFichaTab === 'custos'
                  ? 'Variante dos custos'
                  : activeFichaTab === 'precificacao'
                    ? 'Variante da precificação'
                    : 'Variante em edição'}
                <select
                  value={variante.id}
                  onChange={(event) => setActiveVarianteId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-muted p-2"
                >
                  {variantes.map((item, index) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                      {index === 0 ? ' (principal)' : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {activeFichaTab === 'tecidos' && (
            <FichaInsumosEditor
              key={variante.id + '-tecidos'}
              tipo="tecido"
              produto={getPecaUsoProduct(peca)}
              tamanhos={tamanhos}
              items={variante.tecidos}
              custosLinx={custosLinx}
              loadingCustosLinx={loadingCustosLinx}
              errorCustosLinx={custosLinxError}
              onReloadCustosLinx={() => setCustosRevision((previous) => previous + 1)}
              onChange={(items) => updateInsumos('tecidos', items)}
            />
          )}
          {activeFichaTab === 'aviamentos' && (
            <FichaInsumosEditor
              key={variante.id + '-aviamentos'}
              tipo="aviamento"
              produto={getPecaUsoProduct(peca)}
              tamanhos={tamanhos}
              items={variante.aviamentos}
              custosLinx={custosLinx}
              loadingCustosLinx={loadingCustosLinx}
              errorCustosLinx={custosLinxError}
              onReloadCustosLinx={() => setCustosRevision((previous) => previous + 1)}
              onChange={(items) => updateInsumos('aviamentos', items)}
            />
          )}
          {activeFichaTab === 'terceiros' && (
            <FichaTerceirosEditor
              items={terceirosItems}
              variantes={variantes}
              produto={getPecaUsoProduct(peca)}
              onChange={setTerceirosItems}
            />
          )}
          {activeFichaTab === 'custos' && (
            <FichaCustosView
              variante={variante}
              processos={terceirosItems}
              variantes={variantes}
              onEditInsumos={setActiveFichaTab}
              onChange={(custos) =>
                setVariantes((previous) =>
                  previous.map((item) => (item.id === variante.id ? { ...item, custos } : item))
                )
              }
              linxDados={custosLinx}
              loadingLinx={loadingCustosLinx || (podeConsultarCustos && loadingFichaLinx)}
              errorLinx={custosLinxError}
              onReloadLinx={() => setCustosRevision((previous) => previous + 1)}
              temEdicoesLocais={temRascunhoInsumos}
              colecaoAtual={
                codigoColecaoLinx ? { codigo: codigoColecaoLinx, nome: colecao.nome } : undefined
              }
            />
          )}
          {activeFichaTab === 'precificacao' && (
            <FichaPrecificacaoEditor
              variante={variante}
              processos={terceirosItems}
              custosLinx={custosLinx}
              loadingLinx={loadingCustosLinx || (podeConsultarCustos && loadingFichaLinx)}
              errorLinx={custosLinxError}
              onChange={(precificacao) =>
                setVariantes((previous) =>
                  previous.map((item) =>
                    item.id === variante.id ? { ...item, precificacao } : item
                  )
                )
              }
            />
          )}
          {activeFichaTab === 'variantes' && (
            <VariantsTab
              variants={variantes}
              selected={variante}
              onSelect={setActiveVarianteId}
              getPhoto={variantePhoto}
              isPending={(id) => conferirFicha(draft).some((item) => item.varianteId === id)}
              onNameChange={(nome) =>
                setVariantes((previous) =>
                  previous.map((item) => (item.id === variante.id ? { ...item, nome } : item))
                )
              }
              onImageChange={(url, fileName) =>
                setVariantes((previous) =>
                  previous.map((item) =>
                    item.id === variante.id
                      ? {
                          ...item,
                          imagemUrl: url ?? undefined,
                          imagemNome: fileName,
                          imagemAnexoId: undefined,
                          imagemRemovida: !url,
                        }
                      : item
                  )
                )
              }
              onAdd={() => void addVariante()}
              onDuplicate={() => void addVariante(variante)}
              onRemove={() => removeVariante(variante.id)}
              disabled={copiandoVariante || loadingFichaLinx || validandoProcesso}
              loading={loadingFichaLinx}
              error={varianteError}
              unsaved={conteudoSalvo !== conteudoFicha(draft)}
              inheritedImage={
                !variante.imagemUrl &&
                !variante.imagemAnexoId &&
                variantes[0]?.id === variante.id &&
                !!peca.imagemCroquiUrl &&
                !variante.imagemRemovida
              }
              hasPrints={estampasDaColecao.length > 0}
              selectedPrint={estampaSelecionada}
              printReference={estampa.reference}
              onChoosePrint={() => {
                focusPrintOnMount.current = true;
                setActiveFichaTab('geral');
              }}
              assets={{ controller: anexosController, urls: anexoUrls }}
              materials={
                <>
                  <FichaInsumosEditor
                    key={variante.id + '-tecidos'}
                    compact
                    variantName={variante.nome}
                    tipo="tecido"
                    produto={getPecaUsoProduct(peca)}
                    tamanhos={tamanhos}
                    items={variante.tecidos}
                    custosLinx={custosLinx}
                    loadingCustosLinx={loadingCustosLinx}
                    errorCustosLinx={custosLinxError}
                    onReloadCustosLinx={() => setCustosRevision((previous) => previous + 1)}
                    onChange={(items) => updateInsumos('tecidos', items)}
                  />
                  <FichaInsumosEditor
                    key={variante.id + '-aviamentos'}
                    compact
                    variantName={variante.nome}
                    tipo="aviamento"
                    produto={getPecaUsoProduct(peca)}
                    tamanhos={tamanhos}
                    items={variante.aviamentos}
                    custosLinx={custosLinx}
                    loadingCustosLinx={loadingCustosLinx}
                    errorCustosLinx={custosLinxError}
                    onReloadCustosLinx={() => setCustosRevision((previous) => previous + 1)}
                    onChange={(items) => updateInsumos('aviamentos', items)}
                  />
                </>
              }
              thirdParties={
                terceirosItems.length > 0 && (
                  <section
                    aria-label={`Terceiros — ${variante.nome}`}
                    className="rounded-card border border-border bg-surface p-4 text-xs"
                  >
                    <h4 className="mb-2 font-semibold">Terceiros</h4>
                    <ul>
                      {terceirosItems
                        .filter((item) => item.variantes.includes(variante.id))
                        .map((item) => (
                          <li key={item.id}>
                            {item.tipo || 'Detalhe de produção'}
                            {item.fornecedor ? ` — ${item.fornecedor}` : ''}
                          </li>
                        ))}
                    </ul>
                    {!terceirosItems.some((item) => item.variantes.includes(variante.id)) && (
                      <p>Nenhum processo aplicado a esta variante.</p>
                    )}
                    <Button className="mt-2" onClick={() => setActiveFichaTab('terceiros')}>
                      Editar processos de terceiros
                    </Button>
                  </section>
                )
              }
            />
          )}

          {/* OUTRAS ABAS */}
          {activeFichaTab === 'anexos' && <FichaAnexosContent {...anexosController} />}
          {activeFichaTab === 'prova_roupa' && (
            <FichaProvaRoupaEditor value={provaRoupa} onChange={setProvaRoupa} />
          )}
          {activeFichaTab === 'historico' && (
            <>
              {sharedTimeline}
              <FichaHistoricoPanel peca={{ ...peca, historicoAlteracoes }} colecao={colecao} />
            </>
          )}
          {activeFichaTab === 'graficos' &&
            (sharedTimeline ?? (
              <FichaGraficosPanel
                peca={{ ...draft, historicoAlteracoes }}
                concluida={fichaConcluida}
              />
            ))}
        </div>
      </div>
      {mostrarAnexos && (
        <Dialog title="Gerenciar anexos" onClose={() => setMostrarAnexos(false)}>
          <FichaAnexosContent {...anexosController} />
        </Dialog>
      )}
    </div>
  );
};
