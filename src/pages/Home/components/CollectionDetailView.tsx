/**
 * ============================================================================
 * MÓDULO: Visão Detalhada da Coleção (CollectionDetailView)
 * ARQUIVO: src/pages/Home/components/CollectionDetailView.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tela detalhada da coleção selecionada com gerenciamento de peças,
 *            modal de miniatura (Print 1) e ficha técnica completa da peça (Prints 2, 3, 4, 5).
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import type { MarcaSummary } from '../../../types/auth';
import type { ColecaoItem, PecaItem } from '../../../types/plm';
import type { UserRecord } from '../../../types/gestao';
import { usePersistedState } from '../../../hooks/usePersistedState';
import {
  ChevronRight,
  ArrowLeft,
  Search,
  Calendar,
  CheckCircle2,
  Plus,
  Sun,
  Filter,
  Grid,
  Download,
  ChevronDown,
  Pencil,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { MiniaturaModal } from './MiniaturaModal';
import { PecaFichaTecnicaView } from './PecaFichaTecnicaView';
import { PecaFluxoEtapasModal } from './PecaFluxoEtapasModal';

interface CollectionDetailViewProps {
  marca: MarcaSummary;
  colecao: ColecaoItem & { codigoPill?: string; temporada?: string; ano?: string };
  onBackToBrand: () => void;
  onBackToHome: () => void;
}

// Opções de Nomes de Peças conforme o Print 4
const OPCOES_NOME_PECA = [
  'Acessórios',
  'Bata',
  'Bermuda',
  'Blazer',
  'Blusa',
  'Calça',
  'Camisa',
  'Camiseta',
  'Casaco',
  'Conjunto',
  'Cueca',
  'Jaqueta',
  'Macacão',
  'Malhão',
  'Meia',
  'Moletom',
  'Overshirt',
  'Polo',
  'Regata',
  'Short',
  'Sunga',
  'Tricot',
];

// Opções de Temas
const OPCOES_TEMA = ['Base', 'Verão', 'Inverno', 'Cápsula Nobre', 'Sport', 'Casual'];

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

type FilterKey =
  | 'tema'
  | 'status'
  | 'tipo'
  | 'etapa'
  | 'estilista'
  | 'modelista'
  | 'tecido'
  | 'responsavel'
  | 'fluxo';

const FILTRO_POR_NOME: Record<string, FilterKey> = {
  Status: 'status',
  'Tipo de peça': 'tipo',
  Etapas: 'etapa',
  Estilista: 'estilista',
  Modelista: 'modelista',
  Tecidos: 'tecido',
  TEMA: 'tema',
  Responsável: 'responsavel',
  'Sem fluxo': 'fluxo',
  Direto: 'fluxo',
  'OP CM': 'fluxo',
  Perene: 'fluxo',
  Piloto: 'fluxo',
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
  // Lista de Peças persistida no LocalStorage
  const [allPecas, setAllPecas] = usePersistedState<PecaItem[]>('modaflow_collection_pecas', []);

  // Campos selecionados no Modal de Miniaturas (Print 1)
  const [miniaturaFields, setMiniaturaFields] = usePersistedState<string[]>(
    'modaflow_miniatura_fields',
    ['Status', 'Etapas', 'Previsão', 'Estilista', 'Tecidos']
  );

  // Estado para abrir a Ficha Técnica de uma peça específica (Prints 2, 3, 4, 5)
  const [selectedFichaPeca, setSelectedFichaPeca] = useState<PecaItem | null>(null);
  const [pecaEmMovimentacao, setPecaEmMovimentacao] = useState<PecaItem | null>(null);

  // Usuários internos: só usuários ativos, liberados e com cargo na marca podem ser responsáveis.
  const [usuarios] = usePersistedState<UserRecord[]>('modaflow_users_data', []);

  // Modal Miniatura (Print 1)
  const [isMiniaturaModalOpen, setIsMiniaturaModalOpen] = useState(false);

  // Modal "Adicionar peças" (Print 4)
  const [isAdicionarPecasOpen, setIsAdicionarPecasOpen] = useState(false);
  const [formQuantidade, setFormQuantidade] = useState<number>(1);
  const [formNomePeca, setFormNomePeca] = useState('Camisa');
  const [formTema, setFormTema] = useState('Base');
  const [formEstilista, setFormEstilista] = useState('Ivonete Barbosa');
  const [formTecido, setFormTecido] = useState('CAMBRAIA VISCO LINEN P11LN0077 (01030198)');

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

  // Os filtros são montados com valores das peças locais, nunca com opções do Linx.
  const [isFiltrosMenuOpen, setIsFiltrosMenuOpen] = useState(false);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState<FilterKey[]>(FILTROS_PADRAO);
  const [filtrosSelecionados, setFiltrosSelecionados] = useState<
    Partial<Record<FilterKey, string>>
  >({});

  // Filtra as peças da coleção atual
  const pecasDaColecao = allPecas.filter(
    (p) => p.colecaoId === colecao.id || p.colecaoNome === colecao.nome
  );

  const opcoesDeFiltro = useMemo(() => {
    const unique = (values: (string | undefined)[]) =>
      Array.from(
        new Set(values.filter((value): value is string => Boolean(value && value !== '—')))
      ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return {
      tema: unique(pecasDaColecao.map((peca) => peca.tema)),
      status: unique(pecasDaColecao.map((peca) => peca.status)),
      tipo: unique(pecasDaColecao.map((peca) => peca.tipo)),
      etapa: unique(pecasDaColecao.map((peca) => peca.etapaAtual)),
      estilista: unique(pecasDaColecao.map((peca) => peca.estilista)),
      modelista: unique(pecasDaColecao.map((peca) => peca.modelista)),
      tecido: unique(pecasDaColecao.flatMap((peca) => peca.tecidos)),
      responsavel: unique(pecasDaColecao.map((peca) => peca.responsavel)),
      fluxo: unique(pecasDaColecao.map((peca) => peca.fluxo)),
    } satisfies Record<FilterKey, string[]>;
  }, [pecasDaColecao]);

  const rotuloDeFiltro: Record<FilterKey, string> = {
    tema: 'Tema',
    status: 'Status',
    tipo: 'Tipo de peça',
    etapa: 'Etapas',
    estilista: 'Estilista',
    modelista: 'Modelista',
    tecido: 'Tecidos',
    responsavel: 'Responsável',
    fluxo: 'Fluxo',
  };

  const valorDoFiltro = (peca: PecaItem, filtro: FilterKey) => {
    if (filtro === 'tecido') return peca.tecidos;
    if (filtro === 'etapa') return peca.etapaAtual;
    return peca[filtro];
  };

  // Filtros diferentes se cruzam (AND); cada linha compara com o valor local da peça.
  const pecasFiltradas = pecasDaColecao.filter((p) => {
    const matchesSearch =
      searchPeca === '' ||
      p.nome.toLowerCase().includes(searchPeca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchPeca.toLowerCase());

    const matchesFiltros = Object.entries(filtrosSelecionados).every(([key, value]) => {
      if (!value) return true;
      const valorDaPeca = valorDoFiltro(p, key as FilterKey);
      return Array.isArray(valorDaPeca) ? valorDaPeca.includes(value) : valorDaPeca === value;
    });

    return matchesSearch && matchesFiltros;
  });

  // Handler para criar peças (suporta quantidade informada no modal)
  const handleAdicionarPecasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.max(1, formQuantidade);
    const novasPecas: PecaItem[] = [];

    const prefix =
      formNomePeca.substring(0, 2).toUpperCase() +
      Math.floor(1000 + Math.random() * 9000).toString();

    for (let i = 0; i < qty; i++) {
      const codeSuffix = qty > 1 ? `J.${i + 1}` : 'J.2';
      novasPecas.push({
        id: `peca-${Date.now()}-${i}`,
        colecaoId: colecao.id,
        codigo: `${prefix}${codeSuffix}`,
        nome: `${formNomePeca} ${prefix}${codeSuffix}`,
        tipo: formNomePeca,
        status: 'Em andamento',
        etapaAtual: '—',
        tema: formTema || 'Base',
        colecaoNome: colecao.nome,
        marcaNome: marca.nome,
        estilista: formEstilista || 'Ivonete Barbosa',
        tecidos: formTecido ? [formTecido] : [],
        custo: 120,
        preco: 349.9,
        previsaoEntrega: '—',
      });
    }

    setAllPecas((prev) => [...novasPecas, ...prev]);
    setIsAdicionarPecasOpen(false);
  };

  // Atualizar peça editada na ficha técnica
  const handleUpdatePecaInFicha = (updatedPeca: PecaItem) => {
    setAllPecas((prev) => prev.map((p) => (p.id === updatedPeca.id ? updatedPeca : p)));
    setSelectedFichaPeca(updatedPeca);
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
        peca={selectedFichaPeca}
        colecao={colecao}
        marca={marca}
        onBack={() => setSelectedFichaPeca(null)}
        onUpdatePeca={handleUpdatePecaInFicha}
      />
    );
  }

  const temporadaExtraida = colecao.temporada || 'Verão';
  const anoExtraido = colecao.ano || '2026-27';
  const dataEntregaFormatada = colecao.dataEntrega || '26/02/2027';

  return (
    <div className="space-y-6 font-sans pb-16 animate-in fade-in duration-200">
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
          className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-muted transition-all duration-200 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Voltar para {marca.nome}</span>
        </button>
      </div>

      {/* 2. HEADER DA COLEÇÃO */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-5 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h1 className="text-xl sm:text-2xl font-bold font-editorial text-primary tracking-wide">
            Coleção {colecao.nome}
          </h1>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-semibold text-muted-foreground flex items-center gap-1.5 cursor-pointer transition-all duration-200 shadow-2xs"
          >
            <span>Opções</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          </button>
        </div>

        {/* PAINEL DE METADADOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs pt-1">
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider flex items-center gap-1 mb-1">
              <Sun className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} /> Temporada
            </span>
            <strong className="text-xs font-semibold text-muted-foreground block">
              {temporadaExtraida}
            </strong>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} /> Ano
            </span>
            <strong className="text-xs font-semibold text-muted-foreground block">
              {anoExtraido}
            </strong>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} /> Data de
              Entrega
            </span>
            <strong className="text-xs font-semibold text-muted-foreground block">
              {dataEntregaFormatada}
            </strong>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block mb-1">
              Total de Peças
            </span>
            <span className="text-xs font-bold text-accent-camel bg-accent-camel/10 px-2.5 py-0.5 rounded-md border border-accent-camel/30 inline-block">
              {pecasDaColecao.length} Peças
            </span>
          </div>
        </div>
      </div>

      {/* 3. AS SUB-ABAS HORIZONTAIS */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 rounded-xl shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-6 text-xs font-bold whitespace-nowrap min-w-max">
          {(
            [
              { id: 'pecas', label: 'Peças' },
              { id: 'temas', label: 'Temas' },
              { id: 'cores', label: 'Cores' },
              { id: 'paineis', label: 'Painéis' },
              { id: 'estampas', label: 'Estampas' },
              { id: 'reserva_tecidos', label: 'Reserva de Tecidos' },
              { id: 'reserva_aviamentos', label: 'Reserva de Aviamentos' },
              { id: 'mix', label: 'Mix' },
              { id: 'metas', label: 'Metas' },
              { id: 'cronograma', label: 'Cronograma' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-accent-camel text-accent-camel font-bold'
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CONTEÚDO DAS SUB-ABAS */}
      {activeTab === 'pecas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* SEÇÃO "FILTROS DE PEÇAS" */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 font-sans transition-all duration-300">
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Filtros de peças
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-muted-foreground shadow-2xs transition-all duration-200 cursor-pointer"
                >
                  Canceladas
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
                          ? 'bg-accent-camel text-white font-bold shadow-2xs'
                          : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
                      }`}
                    >
                      Todos
                    </button>
                    {opcoesDeFiltro[filtro].map((opcao) => (
                      <button
                        key={opcao}
                        type="button"
                        onClick={() =>
                          setFiltrosSelecionados((atuais) => ({ ...atuais, [filtro]: opcao }))
                        }
                        className={`px-3 py-0.5 rounded-md text-xs transition-all duration-200 cursor-pointer ${
                          filtrosSelecionados[filtro] === opcao
                            ? 'bg-accent-camel text-white font-bold shadow-2xs'
                            : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
                        }`}
                      >
                        {opcao}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

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

              <button className="px-3.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-muted-foreground flex items-center gap-1 shadow-2xs transition-all duration-200 cursor-pointer">
                <Download className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Exportar
              </button>

              {/* BOTÃO "+ PEÇAS" COM A COR CORRETA DO DESIGN SYSTEM (ACCENT CAMEL / GOLD) */}
              <button
                type="button"
                onClick={() => setIsAdicionarPecasOpen(true)}
                className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Peças +</span>
              </button>
            </div>
          </div>

          {/* GRID DE CARDS DAS PEÇAS (EXIBE OS CAMPOS SELECIONADOS NO MODAL DE MINIATURA - PRINT 1 & 5) */}
          {pecasFiltradas.length === 0 ? (
            <div className="bg-surface p-12 rounded-xl border border-border text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-muted border border-border-muted flex items-center justify-center mx-auto text-muted">
                <CabideIcon />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary font-editorial">
                  Nenhuma peça criada nesta coleção
                </h4>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Clique no botão &quot;Peças +&quot; acima para adicionar novas peças.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdicionarPecasOpen(true)}
                className="px-5 py-2.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-2xs transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Peça</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                    className="absolute right-3 top-3 z-10 flex translate-y-1 items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
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
                  <div className="w-full h-40 bg-surface-muted rounded-lg flex items-center justify-center border border-border-muted group-hover:border-accent-camel/40 transition">
                    <CabideIcon />
                  </div>

                  {/* Informações da peça exibidas conforme a seleção do Modal de Miniatura (Print 1 & 5) */}
                  <div className="space-y-1.5 text-xs text-primary pt-1">
                    {miniaturaFields.includes('Status') && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Status</span>
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          {peca.status || 'Em andamento'}
                          <button
                            type="button"
                            title="Editar status na ficha técnica"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedFichaPeca(peca);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-accent-camel"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    )}

                    {miniaturaFields.includes('Código') && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Código</span>
                        <span className="font-semibold text-primary">{peca.codigo}</span>
                      </div>
                    )}

                    {miniaturaFields.includes('Etapas') && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Etapas</span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          {peca.etapaAtual || '—'}
                          <button
                            type="button"
                            title="Mover etapa"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPecaEmMovimentacao(peca);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-accent-camel"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    )}

                    {miniaturaFields.includes('Previsão') && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Previsão</span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          {peca.previsaoEntrega || '—'}
                          <button
                            type="button"
                            title="Editar previsão na ficha técnica"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedFichaPeca(peca);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-accent-camel"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    )}

                    {miniaturaFields.includes('Estilista') && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Estilista</span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          {peca.estilista || '—'}
                          <button
                            type="button"
                            title="Editar estilista na ficha técnica"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedFichaPeca(peca);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-accent-camel"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    )}

                    {miniaturaFields.includes('Custo') && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Custo</span>
                        <span className="text-accent-camel font-bold">
                          R$ {peca.custo ? peca.custo.toFixed(2) : '120.00'}
                        </span>
                      </div>
                    )}

                    {miniaturaFields.includes('Preço') && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Preço</span>
                        <span className="text-emerald-600 font-bold">
                          R$ {peca.preco ? peca.preco.toFixed(2) : '349.90'}
                        </span>
                      </div>
                    )}

                    {miniaturaFields.includes('Tecidos') && (
                      <div className="pt-1 border-t border-border-muted">
                        <span className="flex items-center gap-1 text-muted-foreground font-medium">
                          Tecidos
                          <button
                            type="button"
                            title="Editar tecidos na ficha técnica"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedFichaPeca(peca);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-accent-camel"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </span>
                        <span className="text-primary font-medium text-[11px] block leading-tight mt-0.5">
                          {peca.tecidos && peca.tecidos.length > 0 ? peca.tecidos.join(', ') : '—'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isFiltrosMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-950/50 p-4 pt-10 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-primary">Opções de filtros</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Os valores são extraídos das peças desta coleção, sem consulta ao Linx.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFiltrosMenuOpen(false)}
                className="text-muted hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
                              ? 'border-accent-camel bg-accent-camel text-white'
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
          </div>
        </div>
      )}

      {pecaEmMovimentacao && (
        <PecaFluxoEtapasModal
          peca={pecaEmMovimentacao}
          marcaId={marca.id}
          marcaNome={marca.nome}
          usuarios={usuarios}
          onClose={() => setPecaEmMovimentacao(null)}
          onSave={handleUpdatePecaInFicha}
        />
      )}

      {/* MODAL MINIATURA (PRINT 1) */}
      <MiniaturaModal
        isOpen={isMiniaturaModalOpen}
        onClose={() => setIsMiniaturaModalOpen(false)}
        selectedFields={miniaturaFields}
        onSave={(fields) => setMiniaturaFields(fields)}
      />

      {/* MODAL: "ADICIONAR PEÇAS" (PRINT 4) */}
      {isAdicionarPecasOpen && (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
            {/* Header do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-primary">Adicionar peças</h3>
              <button
                type="button"
                onClick={() => setIsAdicionarPecasOpen(false)}
                className="text-muted hover:text-primary cursor-pointer transition-colors duration-200"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form de Adicionar Peças */}
            <form onSubmit={handleAdicionarPecasSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Quantidade */}
                <div>
                  <label className="block font-semibold mb-1 text-muted-foreground">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formQuantidade}
                    onChange={(e) => setFormQuantidade(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    required
                  />
                </div>

                {/* Nome da Peça (Dropdown Select) */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-muted-foreground">
                    Nome da Peça
                  </label>
                  <select
                    value={formNomePeca}
                    onChange={(e) => setFormNomePeca(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none cursor-pointer"
                  >
                    {OPCOES_NOME_PECA.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tema */}
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Tema</label>
                <select
                  value={formTema}
                  onChange={(e) => setFormTema(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none cursor-pointer"
                >
                  {OPCOES_TEMA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estilista */}
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Estilista</label>
                <input
                  type="text"
                  value={formEstilista}
                  onChange={(e) => setFormEstilista(e.target.value)}
                  placeholder="Nome da estilista"
                  className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                />
              </div>

              {/* Tecidos */}
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Tecidos</label>
                <input
                  type="text"
                  value={formTecido}
                  onChange={(e) => setFormTecido(e.target.value)}
                  placeholder="Ex: CAMBRAIA VISCO LINEN P11LN0077 (01030198)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => setIsAdicionarPecasOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-muted-foreground font-semibold hover:bg-surface-muted cursor-pointer transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold cursor-pointer shadow-2xs transition-all duration-200"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
