/**
 * ============================================================================
 * MÓDULO: Visão Detalhada da Coleção (CollectionDetailView)
 * ARQUIVO: src/pages/Home/components/CollectionDetailView.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tela detalhada da coleção selecionada com gerenciamento de peças,
 *            modal de miniatura (Print 1) e ficha técnica completa da peça (Prints 2, 3, 4, 5).
 * ============================================================================
 */

import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { AuthContext } from '../../../contexts/authContextInstance';
import { registrarCriacaoPeca, registrarAlteracoesFicha } from '../../../services/fichaAlteracoes';
import { atualizarRevisao } from '../../../services/fichaProcesso';
import { ETAPA_INICIAL_FICHA } from '../../../services/fichaFluxos';
import type { MarcaSummary } from '../../../types/auth';
import type { ColecaoItem, PecaItem } from '../../../types/plm';
import type { UserRecord } from '../../../types/gestao';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { LOCAL_PECAS_KEY, savePecaLocal } from '../../../services/localPecasStorage';
import { getCollectionThemes } from '../../../services/collectionThemes';
import type { CollectionTheme } from '../../../services/collectionThemes';
import { getUsuariosApi } from '../../../services/authService';
import { mapUsuarioDtoToRecord } from '../../../services/contractMappers';
import {
  getLinxProdutosDaColecao,
  getLinxSubgrupos,
  resolveLinxGriffe,
  getLinxFichasResumo,
} from '../../../services/linxService';
import type { LinxFichaResumo } from '../../../types/linx';
import { getPecaInsumoLabels, hasPecaInsumosConfirmados } from '../../../services/linxFichaMappers';
import { mapLinxProdutoToPeca } from '../../../services/contractMappers';
import { getPecaFichaValues } from '../../../services/pecaFichaSelectors';
import {
  ChevronRight,
  ArrowLeft,
  Search,
  Plus,
  Grid,
  Download,
  ChevronDown,
  SlidersHorizontal,
  Copy,
} from 'lucide-react';

import { Button, EmptyState, SectionHeader } from '../../../components/ui/FichaPrimitives';
import { CollectionDialog } from './CollectionPresentation';
import { CollectionSchedule } from './CollectionSchedule';
import { CollectionOverview } from './CollectionOverview';
import { MiniaturaModal } from './MiniaturaModal';
import { PecaMiniaturaFields } from './PecaMiniaturaFields';
import { PecaImagem } from './PecaImagem';
import { PecaFichaTecnicaView } from './PecaFichaTecnicaView';
import { PecaFluxoEtapasModal } from './PecaFluxoEtapasModal';
import {
  CollectionThemesTab,
  CollectionColorsTab,
  CollectionPrintsTab,
  CollectionReservationsTab,
} from './CollectionManagementTabs';

interface CollectionDetailViewProps {
  marca: MarcaSummary;
  colecao: ColecaoItem & { codigoPill?: string; temporada?: string; ano?: string };
  onBackToBrand: () => void;
  onBackToHome: () => void;
}

const GRUPOS_FILTROS = [
  {
    titulo: 'Informações Gerais',
    opcoes: [
      'Status',
      'Sessões',
      'Metas',
      'Tipo de peça',
      'Etapas',
      'Estilista',
      'Modelista',
      'Cores',
      'Estampas',
    ],
  },
  { titulo: 'Fluxos de etapas', opcoes: ['Sem fluxo', 'Direto', 'OP CM', 'Perene', 'Piloto'] },
  {
    titulo: 'Insumos',
    opcoes: [
      'Tecidos',
      'Aviamentos',
      'Fornecedor de Tecido',
      'Fornecedor de Aviamento',
      'Fornecedor de Terceiros',
      'Terceiros',
    ],
  },
  {
    titulo: 'Tags',
    opcoes: [
      'BASE',
      'COMFORT',
      'ENTREGAS',
      'FICHA TÉCNICA',
      'LINHA',
      'REGULAR',
      'SKINNY',
      'SLIM',
      'SUBCATEGORIA',
      'TECIDO',
      'TEMA',
    ],
  },
  {
    titulo: 'Campos Customizados',
    opcoes: [
      'Categoria',
      'Grade',
      'Griffe',
      'Inspetor de qualidade',
      'Lacre Referência',
      'Linha',
      'Nome do Produto',
      'Observações de Corte',
      'Observações Gerais',
      'Observações Modelagem',
      'Simbologia',
      'Sub-grupo',
      'Subcategoria',
      'Tipo de matéria-prima',
    ],
  },
  { titulo: 'Datas', opcoes: ['Data do desenho técnico', 'Data de entrega'] },
  { titulo: 'Seções Customizadas', opcoes: ['Prova de Roupa', 'Data', 'Imagens', 'Observações'] },
  {
    titulo: 'Campos customizados em terceiros',
    opcoes: ['Observações do terceiro', 'Tela', 'Tradução'],
  },
  { titulo: 'Responsáveis', opcoes: ['Responsável'] },
  { titulo: 'Buscas gerais', opcoes: ['Tecidos', 'Aviamentos', 'Estampas'] },
];

const ROTULOS_FILTRO = {
  tema: 'TEMA',
  status: 'Status',
  tipo: 'Tipo de peça',
  etapa: 'Etapas',
  estilista: 'Estilista',
  modelista: 'Modelista',
  tecido: 'Tecidos',
  aviamento: 'Aviamentos',
  responsavel: 'Responsável',
  fluxo: 'Fluxo',
  cor: 'Cores',
  estampa: 'Estampas',
  fornecedorTecido: 'Fornecedor de Tecido',
  fornecedorAviamento: 'Fornecedor de Aviamento',
  fornecedorTerceiro: 'Fornecedor de Terceiros',
  terceiro: 'Terceiros',
  categoria: 'Categoria',
  grade: 'Grade',
  griffe: 'Griffe',
  linha: 'Linha',
  nomeProduto: 'Nome do Produto',
  observacaoCorte: 'Observações de Corte',
  observacaoGeral: 'Observações Gerais',
  observacaoModelagem: 'Observações Modelagem',
  simbologia: 'Simbologia',
  subgrupo: 'Sub-grupo',
  subcategoria: 'Subcategoria',
  materiaPrima: 'Tipo de matéria-prima',
  entrega: 'Data de entrega',
  observacaoTerceiro: 'Observações do terceiro',
  tela: 'Tela',
  traducao: 'Tradução',
} as const;
type FilterKey = keyof typeof ROTULOS_FILTRO;

const FILTRO_POR_NOME: Record<string, FilterKey> = {
  Status: 'status',
  'Tipo de peça': 'tipo',
  Etapas: 'etapa',
  Estilista: 'estilista',
  Modelista: 'modelista',
  Tecidos: 'tecido',
  Aviamentos: 'aviamento',
  TEMA: 'tema',
  Responsável: 'responsavel',
  'Sem fluxo': 'fluxo',
  Direto: 'fluxo',
  'OP CM': 'fluxo',
  Perene: 'fluxo',
  Piloto: 'fluxo',
  ...Object.fromEntries(
    Object.entries(ROTULOS_FILTRO).map(([key, label]) => [label, key as FilterKey])
  ),
  LINHA: 'linha',
  TECIDO: 'tecido',
  SUBCATEGORIA: 'subcategoria',
};

const FILTROS_PADRAO: FilterKey[] = ['status', 'tipo', 'etapa', 'estilista'];

// Ícone de Cabide customizado do Print 5
const CabideIcon = () => (
  <svg
    className="w-16 h-16 text-slate-300/80 stroke-[1.2]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4a2 2 0 0 0-2 2c0 .83.5 1.5 1.2 1.83L3.5 13.5A1.5 1.5 0 0 0 4.5 16h15a1.5 1.5 0 0 0 1-2.5L12.8 7.83A2.001 2.001 0 0 0 12 4z"
    />
  </svg>
);

export const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  marca,
  colecao,
  onBackToBrand,
  onBackToHome,
}) => {
  const autor = useContext(AuthContext)?.user;
  // Lista de Peças persistida no LocalStorage
  const [allPecas, setAllPecas] = usePersistedState<PecaItem[]>(LOCAL_PECAS_KEY, []);
  const [allThemes, setAllThemes] = usePersistedState<CollectionTheme[]>(
    'modaflow_collection_themes',
    []
  );
  const [linxPecas, setLinxPecas] = useState<PecaItem[]>([]);
  const [isLoadingLinxPecas, setIsLoadingLinxPecas] = useState(false);
  const [linxPecasError, setLinxPecasError] = useState('');
  const [linxResumos, setLinxResumos] = useState<LinxFichaResumo[]>([]);
  const [linxResumoError, setLinxResumoError] = useState('');

  // Campos selecionados no Modal de Miniaturas (Print 1)
  const [miniaturaFields, setMiniaturaFields] = usePersistedState<string[]>(
    'modaflow_miniatura_fields',
    ['Status', 'Etapas', 'Previsão', 'Estilista', 'Tecidos']
  );

  // Estado para abrir a Ficha Técnica de uma peça específica (Prints 2, 3, 4, 5)
  const [selectedFichaPeca, setSelectedFichaPeca] = useState<PecaItem | null>(null);
  const [pecaEmMovimentacao, setPecaEmMovimentacao] = useState<PecaItem | null>(null);

  // Carrega responsáveis e seus vínculos de marca da mesma API usada por Gestão.
  const [usuarios, setUsuarios] = useState<UserRecord[]>([]);
  const [usuariosCarregando, setUsuariosCarregando] = useState(true);
  const [erroUsuarios, setErroUsuarios] = useState('');
  const [tentativaCarregamentoUsuarios, setTentativaCarregamentoUsuarios] = useState(0);
  const tentarCarregarUsuarios = useCallback(
    () => setTentativaCarregamentoUsuarios((atual) => atual + 1),
    []
  );

  useEffect(() => {
    let ativo = true;
    setUsuariosCarregando(true);
    setErroUsuarios('');
    void getUsuariosApi()
      .then((resposta) => {
        if (!ativo) return;
        setUsuarios(Array.isArray(resposta) ? resposta.map(mapUsuarioDtoToRecord) : []);
      })
      .catch(() => {
        if (!ativo) return;
        setUsuarios([]);
        setErroUsuarios('Não foi possível carregar os responsáveis. Tente novamente.');
      })
      .finally(() => {
        if (ativo) setUsuariosCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [tentativaCarregamentoUsuarios]);

  // Modal Miniatura (Print 1)
  const [isMiniaturaModalOpen, setIsMiniaturaModalOpen] = useState(false);

  // Modal "Adicionar peças" (Print 4)
  const [isAdicionarPecasOpen, setIsAdicionarPecasOpen] = useState(false);
  const [formQuantidade, setFormQuantidade] = useState('1');
  const [formNomePeca, setFormNomePeca] = useState('');
  const [formTema, setFormTema] = useState('Base');
  const [nomesPecaLinx, setNomesPecaLinx] = useState<string[]>([]);
  const [nomesPecaError, setNomesPecaError] = useState('');

  // Sub-abas (Peças, Temas, Cores, etc.)
  const [activeTab, setActiveTab] = useState<
    | 'pecas'
    | 'temas'
    | 'cores'
    | 'paineis'
    | 'estampas'
    | 'reserva_tecidos'
    | 'reserva_aviamentos'
    | 'mix'
    | 'metas'
    | 'cronograma'
  >('pecas');

  // Busca de Peças
  const [searchPeca, setSearchPeca] = useState('');
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false);
  const [isOpcoesMenuOpen, setIsOpcoesMenuOpen] = useState(false);
  const [copiadoFeedback, setCopiadoFeedback] = useState(false);

  // Os filtros são montados com os valores reais das peças vinculadas à coleção.
  const [isFiltrosMenuOpen, setIsFiltrosMenuOpen] = useState(false);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState<FilterKey[]>(FILTROS_PADRAO);
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<
    Partial<Record<FilterKey, string>>
  >({});

  const codigoColecaoLinx = colecao.id.startsWith('linx-') ? colecao.codigoPill?.trim() : undefined;
  const griffeLinx = resolveLinxGriffe(marca);

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      setLinxResumos([]);
      setLinxResumoError('');
      if (!codigoColecaoLinx || !griffeLinx) return;
      try {
        const resumos = await getLinxFichasResumo(
          codigoColecaoLinx,
          griffeLinx,
          colecao.nome,
          colecao.regraFicha !== 'integracao-colecao-v1'
        );
        if (active) setLinxResumos(resumos);
      } catch {
        if (active)
          setLinxResumoError(
            'Não foi possível consultar as fichas vinculadas à coleção. A lista de peças foi mantida.'
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [codigoColecaoLinx, griffeLinx, colecao.nome, colecao.regraFicha]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      await Promise.resolve();
      if (!isMounted) return;

      if (!codigoColecaoLinx || !griffeLinx) {
        setLinxPecas([]);
        setLinxPecasError('');
        setIsLoadingLinxPecas(false);
        return;
      }

      setIsLoadingLinxPecas(true);
      setLinxPecasError('');

      try {
        const products = await getLinxProdutosDaColecao(codigoColecaoLinx, griffeLinx);
        if (!isMounted) return;
        setLinxPecas(
          products.map((product, index) =>
            mapLinxProdutoToPeca(product, colecao.id, colecao.nome, marca.id, marca.nome, index)
          )
        );
      } catch {
        if (!isMounted) return;
        setLinxPecas([]);
        setLinxPecasError('Não foi possível carregar as peças desta coleção no Linx.');
      } finally {
        if (isMounted) setIsLoadingLinxPecas(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [codigoColecaoLinx, colecao.id, colecao.nome, griffeLinx, marca.id, marca.nome]);

  useEffect(() => {
    if (!isAdicionarPecasOpen) return;
    let active = true;
    getLinxSubgrupos()
      .then((names) => {
        if (!active) return;
        setNomesPecaLinx(names);
        setNomesPecaError('');
      })
      .catch(() => {
        if (active) setNomesPecaError('Não foi possível consultar os nomes de peça no Linx.');
      });
    return () => {
      active = false;
    };
  }, [isAdicionarPecasOpen]);

  const pecasDaColecao = useMemo(() => {
    const pecasLocais = allPecas.filter(
      (peca) => peca.colecaoId === colecao.id && (!peca.marcaId || peca.marcaId === marca.id)
    );
    const idsLocais = new Set(pecasLocais.map((peca) => peca.id));
    const pecasLinxSemEdicaoLocal = linxPecas.filter((peca) => !idsLocais.has(peca.id));
    const resumos = new Map(linxResumos.map((item) => [item.produto, item]));
    const originais = new Map(linxPecas.map((item) => [item.id, item]));
    return [...pecasLocais, ...pecasLinxSemEdicaoLocal].map((peca) => {
      const original = originais.get(peca.id);
      const origem = peca.linxOrigem ?? original?.linxOrigem;
      const resumo = resumos.get(origem?.codigoProduto ?? peca.codigo);
      const updated = { ...peca, linxOrigem: origem, linxFichaResumo: resumo };
      return {
        ...updated,
        tecidos: getPecaInsumoLabels(updated, 'tecidos'),
        aviamentos: getPecaInsumoLabels(updated, 'aviamentos'),
      };
    });
  }, [allPecas, colecao.id, marca.id, linxPecas, linxResumos]);

  const temasDaColecao = getCollectionThemes(colecao.id, allThemes, pecasDaColecao);

  const handleSaveTheme = (theme: CollectionTheme, previousId: string | null) => {
    setAllThemes((previous) => [...previous.filter((item) => item.id !== previousId), theme]);
  };

  const handleAbrirAdicionarPecas = () => {
    setFormTema('Base');
    setIsAdicionarPecasOpen(true);
  };

  const opcoesDeFiltro = useMemo(() => {
    const unique = (values: (string | undefined)[]) =>
      Array.from(
        new Set(values.filter((value): value is string => Boolean(value && value !== '—')))
      ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return Object.fromEntries(
      Object.entries(ROTULOS_FILTRO).map(([key, label]) => [
        key,
        unique(pecasDaColecao.flatMap((peca) => getPecaFichaValues(peca, label))),
      ])
    ) as Record<FilterKey, string[]>;
  }, [pecasDaColecao]);

  const rotuloDeFiltro: Record<FilterKey, string> = { ...ROTULOS_FILTRO, tema: 'Tema' };

  const valorDoFiltro = (peca: PecaItem, filtro: FilterKey) => {
    return getPecaFichaValues(peca, ROTULOS_FILTRO[filtro]);
  };

  // Filtros diferentes se cruzam (AND); cada linha compara com o valor local da peça.
  const pecasFiltradas = pecasDaColecao.filter((p) => {
    if (!mostrarCanceladas && p.status === 'Cancelada') {
      return false;
    }

    const matchesSearch =
      searchPeca === '' ||
      p.nome.toLowerCase().includes(searchPeca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchPeca.toLowerCase());

    const matchesFiltros = Object.entries(filtrosSelecionados).every(([key, value]) => {
      if (!value) return true;
      const valorDaPeca = valorDoFiltro(p, key as FilterKey);
      if (value === '__com_insumo__' || value === '__sem_insumo__') {
        return (
          hasPecaInsumosConfirmados(p) &&
          Array.isArray(valorDaPeca) &&
          (value === '__com_insumo__' ? valorDaPeca.length > 0 : valorDaPeca.length === 0)
        );
      }
      return Array.isArray(valorDaPeca) ? valorDaPeca.includes(value) : valorDaPeca === value;
    });

    return matchesSearch && matchesFiltros;
  });

  // Handler para criar peças (suporta quantidade informada no modal)
  const handleAdicionarPecasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, Number.parseInt(formQuantidade, 10) || 1);
    if (!nomesPecaLinx.includes(formNomePeca)) return;
    if (!temasDaColecao.some((theme) => theme.name === formTema)) return;
    const novasPecas: PecaItem[] = [];

    for (let i = 0; i < qty; i++) {
      novasPecas.push(
        registrarCriacaoPeca(
          {
            id: crypto.randomUUID(),
            colecaoId: colecao.id,
            marcaId: marca.id,
            codigo: '',
            nome: formNomePeca,
            tipo: formNomePeca,
            status: 'Em andamento',
            etapaAtual: ETAPA_INICIAL_FICHA,
            tema: formTema,
            colecaoNome: colecao.nome,
            marcaNome: marca.nome,
            estilista: '',
            tecidos: [],
            custo: undefined,
            preco: undefined,
            previsaoEntrega: '—',
          },
          autor
        )
      );
    }

    setAllPecas((prev) => [...novasPecas, ...prev]);
    setIsAdicionarPecasOpen(false);
    setFormQuantidade('1');
    setFormNomePeca('');
    setFormTema('Base');
  };

  // Exportação CSV segura das peças filtradas
  const handleExportarCsv = () => {
    const headers = [
      'Código',
      'Nome',
      'Tipo',
      'Status',
      'Etapa',
      'Tema',
      'Estilista',
      'Tecidos',
      'Custo',
      'Preço',
      'Previsão Entrega',
    ];
    const rows = pecasFiltradas.map((p) => [
      p.codigo,
      p.nome,
      p.tipo,
      p.status || '',
      p.etapaAtual || '',
      p.tema || '',
      p.estilista || '',
      (p.tecidos || []).join('; '),
      p.custo !== undefined ? p.custo.toFixed(2) : '',
      p.preco !== undefined ? p.preco.toFixed(2) : '',
      p.previsaoEntrega || '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `pecas_${(colecao.nome || 'colecao').toLowerCase().replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopiarCodigo = () => {
    const code = colecao.codigoPill || colecao.id;
    void navigator.clipboard.writeText(code).then(() => {
      setCopiadoFeedback(true);
      setTimeout(() => setCopiadoFeedback(false), 2000);
      setIsOpcoesMenuOpen(false);
    });
  };

  // Atualizar peça editada na ficha técnica
  const handleUpdatePecaInFicha = (updatedPeca: PecaItem) => {
    // Informe falhas de quota ao formulário em vez de confirmar um rascunho perdido.
    savePecaLocal(updatedPeca);
    setLinxPecas((prev) =>
      prev.map((peca) =>
        peca.id === updatedPeca.id && peca.colecaoId === updatedPeca.colecaoId ? updatedPeca : peca
      )
    );
    setSelectedFichaPeca(updatedPeca);
  };

  const handleMovimentacaoPeca = (updatedPeca: PecaItem) => {
    const anterior = pecasDaColecao.find((item) => item.id === updatedPeca.id);
    handleUpdatePecaInFicha(
      anterior
        ? registrarAlteracoesFicha(anterior, atualizarRevisao(anterior, updatedPeca), autor)
        : updatedPeca
    );
  };

  const toggleFiltroVisivel = (filtro: FilterKey) => {
    setFiltrosVisiveis((atuais) =>
      atuais.includes(filtro) ? atuais.filter((item) => item !== filtro) : [...atuais, filtro]
    );
    setFiltrosSelecionados((atuais) => {
      const proximo = { ...atuais };
      delete proximo[filtro];
      return proximo;
    });
  };

  const adicionarFiltroDoMenu = (nome: string) => {
    const filtro = FILTRO_POR_NOME[nome];
    if (!filtro) return;
    if (!filtrosVisiveis.includes(filtro)) toggleFiltroVisivel(filtro);
    setIsFiltrosMenuOpen(false);
  };

  // Se a Ficha Técnica de uma peça estiver aberta, renderiza a visão de Ficha Técnica
  if (selectedFichaPeca) {
    return (
      <PecaFichaTecnicaView
        key={`${colecao.id}-${selectedFichaPeca.id}`}
        peca={selectedFichaPeca}
        colecao={colecao}
        marca={marca}
        onBack={() => setSelectedFichaPeca(null)}
        onUpdatePeca={handleUpdatePecaInFicha}
        usuarios={usuarios}
        usuariosCarregando={usuariosCarregando}
        erroUsuarios={erroUsuarios}
        onTentarCarregarUsuarios={tentarCarregarUsuarios}
      />
    );
  }

  const temporadaExtraida = colecao.temporada || 'Verão';
  const anoNoNome = colecao.nome.match(/\b(20\d{2})\b/)?.[1];
  const anoCurtoNoNome = colecao.nome.match(/\b(?:VERÃO|INVERNO)\s+(\d{2})\b/i)?.[1];
  const anoExtraido = colecao.ano || anoNoNome || (anoCurtoNoNome ? `20${anoCurtoNoNome}` : '—');
  const dataEntregaFormatada = colecao.dataEntrega || '—';

  return (
    <div className="collection-workspace space-y-6 font-sans pb-16">
      {/* 1. BREADCRUMBS FLUTUANTES */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <button
            type="button"
            onClick={onBackToHome}
            className="hover:text-accent-camel transition-colors duration-200 cursor-pointer font-medium text-muted-foreground"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <button
            type="button"
            onClick={onBackToBrand}
            className="hover:text-accent-camel transition-colors duration-200 cursor-pointer font-medium text-muted-foreground"
          >
            {marca.nome}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <span className="text-primary font-bold px-2.5 py-1 bg-surface-muted rounded-lg border border-border-muted">
            {colecao.nome}
          </span>
        </div>

        <button
          type="button"
          onClick={onBackToBrand}
          className="flex min-h-10 items-center gap-2 text-sm text-muted hover:text-accent-camel"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Voltar para {marca.nome}</span>
        </button>
      </div>

      <CollectionOverview
        collectionId={colecao.id}
        name={colecao.nome}
        brand={marca.nome}
        season={temporadaExtraida}
        year={anoExtraido}
        delivery={dataEntregaFormatada}
        pieces={pecasDaColecao}
        themeCount={temasDaColecao.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddPiece={handleAbrirAdicionarPecas}
        options={
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpcoesMenuOpen((prev) => !prev)}
              aria-expanded={isOpcoesMenuOpen}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-semibold text-muted-foreground flex items-center gap-1.5 cursor-pointer transition-all duration-200 shadow-2xs"
            >
              <span>Opções</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            </button>

            {isOpcoesMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-surface rounded-xl border border-border shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    handleExportarCsv();
                    setIsOpcoesMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-primary hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-accent-camel" />
                  <span>Exportar Peças (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopiarCodigo}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-primary hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-accent-camel" />
                  <span>{copiadoFeedback ? 'Código Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* 4. CONTEÚDO DAS SUB-ABAS */}
      {activeTab === 'pecas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SEÇÃO "FILTROS DE PEÇAS" */}
          <details
            open={pecasDaColecao.length > 0}
            className="rounded-card border border-border bg-surface p-4"
          >
            <summary className="cursor-pointer text-sm font-semibold">
              Filtros de peças{' '}
              <span className="ml-2 text-xs font-normal text-muted">
                {Object.values(filtrosSelecionados).filter(Boolean).length} ativos
              </span>
            </summary>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-end gap-3 border-b border-border-muted pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarCanceladas((prev) => !prev)}
                    aria-pressed={mostrarCanceladas}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold shadow-2xs transition-all duration-200 cursor-pointer ${
                      mostrarCanceladas
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/60 font-bold'
                        : 'bg-surface hover:bg-surface-muted text-muted-foreground border-border'
                    }`}
                  >
                    {mostrarCanceladas ? 'Ocultar canceladas' : 'Ver canceladas'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFiltrosMenuOpen(true)}
                    className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-muted-foreground shadow-2xs transition-all duration-200 cursor-pointer flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filtros</span>
                  </button>
                </div>
              </div>

              {/* Cada opção é derivada das peças já cadastradas nesta coleção. */}
              <div className="space-y-3 text-xs">
                {filtrosVisiveis.map((filtro) => (
                  <div key={filtro} className="flex flex-wrap items-center gap-3">
                    <span className="w-28 font-semibold text-muted-foreground">
                      {rotuloDeFiltro[filtro]}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFiltrosSelecionados((atuais) => ({ ...atuais, [filtro]: '' }))
                        }
                        className={`px-3 py-0.5 rounded-md text-xs transition-all duration-200 cursor-pointer ${
                          !filtrosSelecionados[filtro]
                            ? 'bg-accent-camel text-on-camel font-bold shadow-2xs'
                            : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
                        }`}
                      >
                        Todos ({pecasDaColecao.length})
                      </button>
                      {(filtro === 'tecido' || filtro === 'aviamento') &&
                        (['__com_insumo__', '__sem_insumo__'] as const).map((value) => {
                          const count = pecasDaColecao.filter(
                            (peca) =>
                              hasPecaInsumosConfirmados(peca) &&
                              (value === '__com_insumo__'
                                ? (valorDoFiltro(peca, filtro) as string[]).length > 0
                                : (valorDoFiltro(peca, filtro) as string[]).length === 0)
                          ).length;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                setFiltrosSelecionados((atuais) => ({ ...atuais, [filtro]: value }))
                              }
                              className={`px-3 py-0.5 rounded-md border border-border text-xs ${filtrosSelecionados[filtro] === value ? 'bg-accent-camel text-on-camel' : 'bg-surface-muted'}`}
                            >
                              {value === '__com_insumo__' ? 'Com' : 'Sem'} {rotuloDeFiltro[filtro]}{' '}
                              ({count})
                            </button>
                          );
                        })}
                      {opcoesDeFiltro[filtro].map((opcao) => (
                        <button
                          key={opcao}
                          type="button"
                          onClick={() =>
                            setFiltrosSelecionados((atuais) => ({ ...atuais, [filtro]: opcao }))
                          }
                          className={`px-3 py-0.5 rounded-md text-xs transition-all duration-200 cursor-pointer ${
                            filtrosSelecionados[filtro] === opcao
                              ? 'bg-accent-camel text-on-camel font-bold shadow-2xs'
                              : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
                          }`}
                        >
                          {opcao} (
                          {
                            pecasDaColecao.filter((peca) => {
                              const value = valorDoFiltro(peca, filtro);
                              return Array.isArray(value) ? value.includes(opcao) : value === opcao;
                            }).length
                          }
                          )
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {linxResumoError && (
                <p role="status" className="text-xs text-muted mt-3">
                  {linxResumoError}
                </p>
              )}
              {codigoColecaoLinx && (
                <p className="text-xs text-muted mt-3">
                  Filtros de insumos usam as fichas locais e a ficha atual do Linx das peças desta
                  coleção. Peças sem ficha consultada não são contadas como “sem insumos”.
                </p>
              )}
            </div>
          </details>

          {/* BARRA SUPERIOR DE QUANTIDADE, MINIATURAS E AÇÃO "+ PEÇAS" */}
          <div className="bg-surface p-4 sm:p-5 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold font-editorial text-primary">
                {pecasFiltradas.length} Peças
              </h3>
              <span className="text-xs font-semibold text-muted bg-surface-muted px-2.5 py-1 rounded-lg">
                Coleção {colecao.nome}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  aria-label="Buscar peças da coleção"
                  placeholder="Procurar pelo nome, código..."
                  value={searchPeca}
                  onChange={(e) => setSearchPeca(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-muted-foreground focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* BOTÃO "MINIATURAS" QUE ABRE O MODAL DO PRINT 1 */}
              <button
                type="button"
                onClick={() => setIsMiniaturaModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-muted-foreground flex items-center gap-1.5 shadow-2xs transition-all duration-200 cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} />
                <span>Miniaturas</span>
              </button>

              <button
                type="button"
                onClick={handleExportarCsv}
                className="px-3.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-muted-foreground flex items-center gap-1 shadow-2xs transition-all duration-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Exportar
              </button>

              {/* BOTÃO "+ PEÇAS" COM A COR CORRETA DO DESIGN SYSTEM (ACCENT CAMEL / GOLD) */}
              <button
                type="button"
                onClick={handleAbrirAdicionarPecas}
                className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-on-camel text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Peças +</span>
              </button>
            </div>
          </div>

          {linxPecasError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs font-medium text-red-700 dark:text-red-400"
            >
              {linxPecasError}
            </div>
          )}

          {/* GRID DE CARDS DAS PEÇAS (EXIBE OS CAMPOS SELECIONADOS NO MODAL DE MINIATURA - PRINT 1 & 5) */}
          {isLoadingLinxPecas && pecasDaColecao.length === 0 ? (
            <div
              role="status"
              className="bg-surface p-12 rounded-xl border border-border text-center text-xs font-medium text-muted-foreground"
            >
              Carregando as peças de roupa vinculadas a esta coleção no Linx...
            </div>
          ) : pecasFiltradas.length === 0 ? (
            <EmptyState
              title={
                pecasDaColecao.length
                  ? 'Nenhuma peça corresponde aos filtros.'
                  : 'Nenhuma peça de roupa vinculada a esta coleção'
              }
              description={
                pecasDaColecao.length
                  ? 'Ajuste sua busca ou limpe os filtros para ver as peças da coleção.'
                  : 'Comece adicionando uma peça para organizar o desenvolvimento da coleção.'
              }
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  {pecasDaColecao.length > 0 && (
                    <Button
                      onClick={() => {
                        setFiltrosSelecionados({});
                        setSearchPeca('');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  )}
                  <Button variant="primary" onClick={handleAbrirAdicionarPecas}>
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    Adicionar Peça
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pecasFiltradas.map((peca) => (
                <div
                  key={peca.id}
                  onClick={() => setSelectedFichaPeca(peca)}
                  className="relative bg-surface border border-border rounded-xl p-4 shadow-2xs hover:shadow-md hover:scale-[1.01] transition-all duration-200 space-y-3 font-sans cursor-pointer group"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedFichaPeca(peca);
                    }}
                    className="absolute right-3 top-3 z-10 flex translate-y-1 items-center gap-1.5 rounded-md bg-action px-2.5 py-1.5 text-[11px] font-bold text-action-foreground opacity-0 shadow-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100 max-sm:opacity-100"
                  >
                    Ficha técnica <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  {/* Topo do Card: Nome e Código (ex: Camisa CS00011J.2) */}
                  <div>
                    <div className="flex items-center justify-between gap-1 text-sm font-bold text-primary group-hover:text-accent-camel transition-colors">
                      <span>{peca.tipo}</span>
                      <span className="text-xs font-semibold text-muted">{peca.codigo}</span>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground mt-0.5">
                      {peca.tema}
                    </div>
                  </div>

                  {/* Área Central: Cabide Desenhado (Print 5) */}
                  <div className="w-full h-56 bg-surface-muted rounded-control flex items-center justify-center overflow-hidden border border-border-muted group-hover:border-accent-camel/40 transition">
                    <PecaImagem
                      peca={peca}
                      marcaId={marca.id}
                      className="h-full w-full object-contain p-2"
                      fallback={<CabideIcon />}
                    />
                  </div>

                  <PecaMiniaturaFields
                    peca={peca}
                    fields={miniaturaFields}
                    onEdit={(field) => {
                      if (field === 'Etapas') setPecaEmMovimentacao(peca);
                      else setSelectedFichaPeca(peca);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* 4.2–4.3. TEMAS E CORES */}
      {activeTab === 'temas' && (
        <CollectionThemesTab
          collectionId={colecao.id}
          collectionName={colecao.nome}
          pieces={pecasDaColecao}
          savedThemes={allThemes}
          onSaveTheme={handleSaveTheme}
        />
      )}
      {activeTab === 'cores' && <CollectionColorsTab collectionId={colecao.id} />}

      {/* 4.4. SUB-ABA: PAINÉIS */}
      {activeTab === 'paineis' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <SectionHeader
            title="Painel Conceitual & Moodboard"
            description={`Diretrizes visuais e conceituais da marca para ${colecao.nome}.`}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6 rounded-xl border border-border bg-surface-muted space-y-4">
              <h4 className="text-sm font-bold text-primary font-editorial uppercase">
                Direção Criativa & Silhueta
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Desenvolvimento de modelagens contemporâneas combinando matérias-primas nobres,
                acabamentos de alfaiataria desestruturada e cartela atemporal.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Alfaiataria Moderna', 'Fibras Naturais', 'Minimalismo Funcional'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-surface border border-border text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-surface-muted flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Metadados da Coleção
                </h4>
                <div className="space-y-1.5 text-xs text-primary font-medium">
                  <div>
                    Marca: <strong>{marca.nome}</strong>
                  </div>
                  <div>
                    Código: <strong>{colecao.codigoPill || colecao.id}</strong>
                  </div>
                  <div>
                    Temporada: <strong>{temporadaExtraida}</strong>
                  </div>
                  <div>
                    Total de Peças: <strong>{pecasDaColecao.length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 4.5–4.7. ESTAMPAS E RESERVAS */}
      {activeTab === 'estampas' && <CollectionPrintsTab collectionId={colecao.id} />}
      {activeTab === 'reserva_tecidos' && (
        <CollectionReservationsTab
          collectionId={colecao.id}
          type="TECIDO"
          pieces={pecasDaColecao}
        />
      )}
      {activeTab === 'reserva_aviamentos' && (
        <CollectionReservationsTab
          collectionId={colecao.id}
          type="AVIAMENTO"
          pieces={pecasDaColecao}
        />
      )}

      {/* 4.8. SUB-ABA: MIX */}
      {activeTab === 'mix' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <SectionHeader
            title="Mix de Produtos & Categorias"
            description="Distribuição percentual da coleção por tipo de peça."
            action={
              <span className="rounded-control border border-accent-camel/30 bg-accent-camel/10 px-3 py-2 text-xs font-semibold text-accent-camel">
                Total: {pecasDaColecao.length} Peças
              </span>
            }
          />

          {pecasDaColecao.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              <EmptyState
                title="Nenhuma peça vinculada para calcular o mix."
                description="Adicione peças para acompanhar a distribuição por categoria."
                action={<Button onClick={handleAbrirAdicionarPecas}>Adicionar peça</Button>}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {opcoesDeFiltro.tipo.map((tipo) => {
                const count = pecasDaColecao.filter((p) => p.tipo === tipo).length;
                const pct = Math.round((count / pecasDaColecao.length) * 100);
                return (
                  <div key={tipo} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-primary">{tipo}</span>
                      <span className="font-semibold text-muted-foreground">
                        {count} peças ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden border border-border/50">
                      <div
                        className="h-full bg-accent-camel rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4.9. SUB-ABA: METAS */}
      {activeTab === 'metas' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <SectionHeader
            title="Metas & Indicadores de Produção"
            description={'Acompanhamento dos indicadores de desenvolvimento e entrega.'}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-border bg-surface-muted text-center space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Total de Peças
              </span>
              <div className="text-3xl font-bold text-primary">{pecasDaColecao.length}</div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-surface-muted text-center space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Em Andamento
              </span>
              <div className="text-2xl font-bold text-accent-camel">
                {pecasDaColecao.filter((p) => p.status === 'Em andamento').length}
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-surface-muted text-center space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Canceladas
              </span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {pecasDaColecao.filter((p) => p.status === 'Cancelada').length}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted">
            Não há metas numéricas configuradas para esta coleção. Os indicadores refletem as peças
            cadastradas.
          </p>
        </div>
      )}

      {/* 4.10. SUB-ABA: CRONOGRAMA */}
      {activeTab === 'cronograma' && (
        <CollectionSchedule
          pieces={pecasDaColecao}
          collectionName={colecao.nome}
          collectionDelivery={dataEntregaFormatada}
          onOpenPiece={setSelectedFichaPeca}
          onAddPiece={handleAbrirAdicionarPecas}
        />
      )}

      {isFiltrosMenuOpen && (
        <CollectionDialog
          title="Opções de filtros"
          onClose={() => setIsFiltrosMenuOpen(false)}
          className="max-w-2xl"
        >
          <p className="mb-5 text-sm text-muted">
            Os valores vêm das fichas técnicas das peças desta coleção, incluindo tecidos e
            aviamentos de todas as variantes.
          </p>
          <div className="space-y-4">
            {GRUPOS_FILTROS.map((grupo) => (
              <section key={grupo.titulo}>
                <h3 className="mb-2 text-xs font-bold text-primary">{grupo.titulo}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {grupo.opcoes.map((opcao) => {
                    const filtro = FILTRO_POR_NOME[opcao];
                    const selecionado = filtro ? filtrosVisiveis.includes(filtro) : false;
                    return (
                      <button
                        key={opcao}
                        type="button"
                        disabled={!filtro}
                        title={
                          !filtro
                            ? 'Este campo será ativado quando houver dados internos cadastrados na peça.'
                            : undefined
                        }
                        onClick={() => adicionarFiltroDoMenu(opcao)}
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          selecionado
                            ? 'border-accent-camel bg-accent-camel text-on-camel'
                            : filtro
                              ? 'border-border bg-surface text-primary hover:border-accent-camel hover:text-accent-camel'
                              : 'cursor-not-allowed border-border-muted bg-surface-muted text-muted'
                        }`}
                      >
                        {opcao}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </CollectionDialog>
      )}

      {pecaEmMovimentacao && (
        <PecaFluxoEtapasModal
          peca={pecaEmMovimentacao}
          marcaId={marca.id}
          marcaNome={marca.nome}
          usuarios={usuarios}
          usuariosCarregando={usuariosCarregando}
          erroUsuarios={erroUsuarios}
          onTentarCarregarUsuarios={tentarCarregarUsuarios}
          onClose={() => setPecaEmMovimentacao(null)}
          onSave={handleMovimentacaoPeca}
          onCorrigir={(_aba, _varianteId, candidata) => {
            // Guarda somente o rascunho local das respostas, sem efetuar a mudança de etapa.
            handleMovimentacaoPeca(candidata ?? pecaEmMovimentacao);
            setPecaEmMovimentacao(null);
          }}
        />
      )}

      {/* MODAL MINIATURA (PRINT 1) */}
      <MiniaturaModal
        previewPeca={pecasFiltradas[0] ?? pecasDaColecao[0]}
        isOpen={isMiniaturaModalOpen}
        onClose={() => setIsMiniaturaModalOpen(false)}
        selectedFields={miniaturaFields}
        onSave={(fields) => setMiniaturaFields(fields)}
      />

      {/* MODAL: "ADICIONAR PEÇAS" (PRINT 4) */}
      {isAdicionarPecasOpen && (
        <CollectionDialog
          title="Adicionar peças"
          onClose={() => setIsAdicionarPecasOpen(false)}
          className="max-w-lg"
        >
          <form onSubmit={handleAdicionarPecasSubmit} className="space-y-4 p-6 text-xs">
            <label className="block font-semibold text-muted-foreground">
              Quantidade
              <input
                type="text"
                inputMode="numeric"
                pattern="[1-9][0-9]*"
                value={formQuantidade}
                onChange={(event) => setFormQuantidade(event.target.value.replace(/\D/g, ''))}
                className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-primary focus:border-accent-camel focus:outline-none"
                required
              />
            </label>
            <label className="block font-semibold text-muted-foreground">
              Nome da peça
              <select
                value={formNomePeca}
                onChange={(event) => setFormNomePeca(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-primary focus:border-accent-camel focus:outline-none"
                required
              >
                <option value="">Selecione uma peça</option>
                {nomesPecaLinx.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            {nomesPecaError && (
              <p role="alert" className="text-red-700 dark:text-red-400">
                {nomesPecaError}
              </p>
            )}
            <label className="block font-semibold text-muted-foreground">
              Tema
              <select
                value={formTema}
                onChange={(event) => setFormTema(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-primary focus:border-accent-camel focus:outline-none"
                required
              >
                {temasDaColecao.map((theme) => (
                  <option key={theme.id} value={theme.name}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2 border-t border-border-muted pt-4">
              <button
                type="button"
                onClick={() => setIsAdicionarPecasOpen(false)}
                className="rounded-lg border border-border px-4 py-2 font-semibold text-muted-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={nomesPecaLinx.length === 0}
                className="rounded-lg bg-accent-camel px-5 py-2 font-bold text-on-camel disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </form>
        </CollectionDialog>
      )}
    </div>
  );
};
