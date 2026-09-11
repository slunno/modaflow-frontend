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

import React, { useState } from 'react';
import type { MarcaSummary } from '../../../types/auth';
import type { ColecaoItem, PecaItem } from '../../../types/plm';
import {
  ChevronRight,
  ArrowLeft,
  Rss,
  MessageSquare,
  ChevronDown,
  Upload,
  MoreVertical,
  ImageIcon,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';

interface PecaFichaTecnicaViewProps {
  peca: PecaItem;
  colecao: ColecaoItem;
  marca: MarcaSummary;
  onBack: () => void;
  onUpdatePeca?: (updatedPeca: PecaItem) => void;
}

// Interfaces para os itens interativos
interface TabelaMedidaItem {
  id: string;
  nome: string;
  imagemUrl?: string;
  medidasSelecionadas: string[];
  valoresMedidas: Record<string, Record<string, string>>;
}

interface InsumoItem {
  id: string;
  nome: string;
  preco: string;
  custoConsumo: string;
  precoAtual?: string;
  largura?: string;
  peso?: string;
  consumo?: string;
  quantidade?: string;
  uso: string;
  encolhimento?: string;
  unidade: 'Metro' | 'Quantidade' | 'Kg';
}

interface TerceiroDetailItem {
  id: string;
  numero: number;
  tipo: string;
  fornecedor: string;
  obsTerceiro: string;
  tela: string;
  traducao: string;
  variantesUsadas: Record<string, boolean>;
  tecnicas: string[];
  observacoes: { id: string; titulo: string; descricao: string; imagemUrl?: string }[];
}

export const PecaFichaTecnicaView: React.FC<PecaFichaTecnicaViewProps> = ({
  peca,
  colecao,
  marca,
  onBack,
  onUpdatePeca,
}) => {
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
    | 'prova_roupa'
    | 'historico'
    | 'graficos'
  >('geral');

  // ===== ESTADOS DA ABA GERAL =====
  const [nomeProduto, setNomeProduto] = useState(peca.nome || '');
  const [codigoRef, setCodigoRef] = useState(peca.codigo || '');
  const [descricao, setDescricao] = useState(
    `CAMISA ${peca.tipo.toUpperCase()} POLIAMIDA ULTRAFLEX TRAVEL`
  );
  const [tecnica, setTecnica] = useState('Lavanderia, Estamparia, Bordado');
  const [corMostruario, setCorMostruario] = useState('');
  const [estampa, setEstampa] = useState('');

  const [subgrupo, setSubgrupo] = useState(peca.tipo.toUpperCase());
  const [linha, setLinha] = useState('INDEFINIDO');
  const [grade, setGrade] = useState('P-XG');
  const [griffe, setGriffe] = useState(marca.nome.toUpperCase());
  const [tipoMateriaPrima, setTipoMateriaPrima] = useState('MALHA DE FIBRA SINTÉTICA');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [tamanhos, setTamanhos] = useState<string[]>(['P', 'M', 'G', 'GG', 'XG']);

  // ===== ESTADOS DA ABA MODELAGEM =====
  const [modelagemInput, setModelagemInput] = useState('');
  const [caracteristicaInput, setCaracteristicaInput] = useState('');
  const [obsModelagem, setObsModelagem] = useState('RENOMEAMOS A REF:CS.25.301 PARA CS01006J');

  const [tabelasMedidas, setTabelasMedidas] = useState<TabelaMedidaItem[]>([
    {
      id: 'tab-1',
      nome: 'Tabela - 1',
      medidasSelecionadas: ['BARRA', 'CINTURA', 'OMBRO A OMBRO', 'QUADRIL', 'TORAX'],
      valoresMedidas: {
        BARRA: { P: '42', M: '44', G: '46', GG: '48', XG: '50', 'Tol.': '1.0' },
        CINTURA: { P: '40', M: '42', G: '44', GG: '46', XG: '48', 'Tol.': '1.0' },
        'OMBRO A OMBRO': { P: '44', M: '46', G: '48', GG: '50', XG: '52', 'Tol.': '0.5' },
        QUADRIL: { P: '48', M: '50', G: '52', GG: '54', XG: '56', 'Tol.': '1.0' },
        TORAX: { P: '50', M: '52', G: '54', GG: '56', XG: '58', 'Tol.': '1.0' },
      },
    },
  ]);

  // ===== ESTADOS DA ABA TECIDOS (Print 1) =====
  const [tecidosItems, setTecidosItems] = useState<InsumoItem[]>([
    {
      id: 'tec-1',
      nome: 'TECIDO URBAN HI FLEX P11TC0227 - 01050426 (EXCIM)',
      preco: '22,8441',
      custoConsumo: 'R$ 34,9515',
      precoAtual: 'R$ 19,0565 (Metro)',
      largura: '1,5',
      peso: '0,259',
      consumo: '0,3',
      uso: 'TECIDO 1 | CORPO',
      encolhimento: '',
      unidade: 'Metro',
    },
    {
      id: 'tec-2',
      nome: 'ENTRETELA ROLO 3200M HDPE - 01040029 (CABERAF)',
      preco: '25,35',
      custoConsumo: 'R$ 7,6050',
      precoAtual: 'R$ 18,5000 (Metro)',
      consumo: '0,3',
      uso: 'GOLA | PDG | PUNHOS',
      encolhimento: '',
      unidade: 'Metro',
    },
    {
      id: 'tec-3',
      nome: 'ENTRETELA EM ROLO 8045 V.LO/TSI 4321 - 01040001 (V.L.O ENTRETELAS)',
      preco: '4,7400',
      custoConsumo: '—',
      precoAtual: 'R$ 4,7400 (Metro)',
      consumo: '1,2',
      uso: 'CARCELAS',
      encolhimento: '',
      unidade: 'Metro',
    },
  ]);

  // ===== ESTADOS DA ABA AVIAMENTOS (Print 2) =====
  const [aviamentosItems, setAviamentosItems] = useState<InsumoItem[]>([
    {
      id: 'avi-1',
      nome: 'ENTRETELA DE VISTA 3,0CM - 02270164 (GRUPO TSI)',
      preco: '0,2533',
      custoConsumo: '—',
      consumo: '0,2',
      uso: 'VISTA SUPERIOR',
      unidade: 'Metro',
    },
    {
      id: 'avi-2',
      nome: 'ETQ FITILHO K&J BLACK VIST MAI M0142149 PRETO-PRETO - 02060182 (A M BORDADEOS ETIQUETA)',
      preco: '0,1',
      custoConsumo: 'R$ 0,1000',
      precoAtual: 'R$ 0,1100 (Quantidade)',
      quantidade: '1',
      uso: 'PRESA NOS 4 LADOS, NA VISTA Á 2,0CM DA BARRA',
      unidade: 'Quantidade',
    },
    {
      id: 'avi-3',
      nome: 'BARBATANA POLLY 5 X1,0 X 25 BRANCO-BRANCO - 02140003 (ALEXANDRE GUIRAO)',
      preco: '0,0440',
      custoConsumo: 'R$ 0,0800',
      precoAtual: 'R$ 0,0440 (Quantidade)',
      quantidade: '2',
      uso: 'GOLA | COSTURA',
      unidade: 'Quantidade',
    },
  ]);

  // ===== ESTADOS DA ABA TERCEIROS (Prints 3, 4, 5) =====
  const [terceirosItems, setTerceirosItems] = useState<TerceiroDetailItem[]>([
    {
      id: 'terc-1',
      numero: 1,
      tipo: 'Silk interno',
      fornecedor: 'KING&JOE',
      obsTerceiro: '',
      tela: '',
      traducao: '',
      variantesUsadas: {
        'Variante: 1 (1)': true,
        'Variante: 2 (2)': true,
        'Variante: 3 (3)': true,
        'Variante: 4 (4)': true,
      },
      tecnicas: ['Silk interno'],
      observacoes: [
        {
          id: 'obs-1',
          titulo: 'VARIANTE PRETO',
          descricao: 'CINZA CLARO 44 MIX',
          imagemUrl:
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop',
        },
      ],
    },
    {
      id: 'terc-2',
      numero: 2,
      tipo: 'Bordado',
      fornecedor: 'KIWAY',
      obsTerceiro: '',
      tela: '',
      traducao: '',
      variantesUsadas: {
        'Variante: 1 (1)': true,
        'Variante: 2 (2)': true,
        'Variante: 3 (3)': true,
        'Variante: 4 (4)': true,
      },
      tecnicas: ['Bordado'],
      observacoes: [
        {
          id: 'obs-2',
          titulo: 'vermelho para todas as variantes 32mm seguir gabarito',
          descricao: 'Ex.: Tricô conforme referência',
          imagemUrl:
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=400&auto=format&fit=crop',
        },
      ],
    },
  ]);

  // Handlers para Modelagem
  const handleAddTabela = () => {
    const nextNum = tabelasMedidas.length + 1;
    const newTab: TabelaMedidaItem = {
      id: `tab-${Date.now()}`,
      nome: `Tabela - ${nextNum}`,
      medidasSelecionadas: ['BARRA', 'CINTURA', 'OMBRO A OMBRO', 'QUADRIL', 'TORAX'],
      valoresMedidas: {
        BARRA: { P: '', M: '', G: '', GG: '', XG: '', 'Tol.': '1.0' },
        CINTURA: { P: '', M: '', G: '', GG: '', XG: '', 'Tol.': '1.0' },
        'OMBRO A OMBRO': { P: '', M: '', G: '', GG: '', XG: '', 'Tol.': '0.5' },
        QUADRIL: { P: '', M: '', G: '', GG: '', XG: '', 'Tol.': '1.0' },
        TORAX: { P: '', M: '', G: '', GG: '', XG: '', 'Tol.': '1.0' },
      },
    };
    setTabelasMedidas([...tabelasMedidas, newTab]);
  };

  const handleUpdateMedidaValue = (tabId: string, medida: string, tamanho: string, val: string) => {
    setTabelasMedidas((prev) =>
      prev.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          valoresMedidas: {
            ...tab.valoresMedidas,
            [medida]: {
              ...(tab.valoresMedidas[medida] || {}),
              [tamanho]: val,
            },
          },
        };
      })
    );
  };

  const handleToggleMedidaInTabela = (tabId: string, medida: string) => {
    setTabelasMedidas((prev) =>
      prev.map((tab) => {
        if (tab.id !== tabId) return tab;
        const exists = tab.medidasSelecionadas.includes(medida);
        const updatedMedidas = exists
          ? tab.medidasSelecionadas.filter((m) => m !== medida)
          : [...tab.medidasSelecionadas, medida];
        return { ...tab, medidasSelecionadas: updatedMedidas };
      })
    );
  };

  // Handlers para Tecidos (Print 1)
  const handleAddTecido = () => {
    const nextNum = tecidosItems.length + 1;
    const newInsumo: InsumoItem = {
      id: `tec-${Date.now()}`,
      nome: `NOVO TECIDO ${nextNum} - CÓDIGO DE REFERÊNCIA`,
      preco: '0,00',
      custoConsumo: 'R$ 0,0000',
      uso: 'CORPO / GOLA',
      unidade: 'Metro',
    };
    setTecidosItems([...tecidosItems, newInsumo]);
  };

  // Handlers para Aviamentos (Print 2)
  const handleAddAviamento = () => {
    const nextNum = aviamentosItems.length + 1;
    const newAviamento: InsumoItem = {
      id: `avi-${Date.now()}`,
      nome: `NOVO AVIAMENTO ${nextNum} - CÓDIGO DE REFERÊNCIA`,
      preco: '0,00',
      custoConsumo: 'R$ 0,0000',
      uso: 'BORDADO / ETIQUETA',
      unidade: 'Quantidade',
    };
    setAviamentosItems([...aviamentosItems, newAviamento]);
  };

  // Handlers para Terceiros (Prints 3, 4, 5)
  const handleAddTerceiroDetalhe = () => {
    const nextNum = terceirosItems.length + 1;
    const newDetail: TerceiroDetailItem = {
      id: `terc-${Date.now()}`,
      numero: nextNum,
      tipo: 'Silk interno',
      fornecedor: marca.nome.toUpperCase(),
      obsTerceiro: '',
      tela: '',
      traducao: '',
      variantesUsadas: {
        'Variante: 1 (1)': true,
        'Variante: 2 (2)': true,
        'Variante: 3 (3)': true,
        'Variante: 4 (4)': true,
      },
      tecnicas: ['Silk interno'],
      observacoes: [],
    };
    setTerceirosItems([...terceirosItems, newDetail]);
  };

  const handleRemoveTerceiroDetalhe = (id: string) => {
    setTerceirosItems(terceirosItems.filter((item) => item.id !== id));
  };

  const handleAddTerceiroObs = (terceiroId: string) => {
    setTerceirosItems((prev) =>
      prev.map((item) => {
        if (item.id !== terceiroId) return item;
        const newObs = {
          id: `obs-${Date.now()}`,
          titulo: 'Nova Observação',
          descricao: 'Descrição detalhada...',
        };
        return { ...item, observacoes: [...item.observacoes, newObs] };
      })
    );
  };

  const toggleTamanhoGeral = (t: string) => {
    if (tamanhos.includes(t)) {
      setTamanhos(tamanhos.filter((item) => item !== t));
    } else {
      setTamanhos([...tamanhos, t]);
    }
  };

  const handleSave = () => {
    if (onUpdatePeca) {
      onUpdatePeca({
        ...peca,
        nome: nomeProduto || peca.nome,
        codigo: codigoRef || peca.codigo,
      });
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16 animate-in fade-in duration-200 bg-bg text-primary">
      {/* 1. BREADCRUMBS FLUTUANTES */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 hover:text-accent-camel transition-colors duration-200 cursor-pointer font-bold text-primary bg-surface px-3 py-1.5 rounded-lg border border-border shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Voltar</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <span className="text-muted-foreground font-medium">{marca.nome}</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <span className="text-muted-foreground font-medium">{colecao.nome}</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <span className="text-muted-foreground font-medium">{peca.tema || 'Base'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <span className="text-primary font-bold px-2.5 py-1 bg-surface-muted rounded-lg border border-border-muted">
            {peca.tipo}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs shadow-2xs transition-all duration-200 cursor-pointer"
        >
          Exportar ▾
        </button>
      </div>

      {/* 2. CABEÇALHO DA FICHA TÉCNICA */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-muted pb-4">
          <div>
            <h1 className="text-xl font-bold font-editorial text-primary tracking-wide">
              {peca.tipo} - {codigoRef}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-muted hover:text-primary transition cursor-pointer"
            >
              <Rss className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-semibold text-muted-foreground flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              <span>Comentar</span>
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-semibold text-muted-foreground flex items-center gap-1 cursor-pointer transition shadow-2xs"
            >
              <span>Opções</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition"
            >
              <span>Exportar</span>
              <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* PILLS DE TAGS DA PEÇA */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="text-muted uppercase tracking-wider">TAGS</span>
          <span className="text-muted uppercase tracking-wider">SUBCATEGORIA</span>
          <span className="px-2.5 py-0.5 rounded bg-accent-camel/10 text-accent-camel border border-accent-camel/30 uppercase">
            OFFICE
          </span>
          <span className="text-muted uppercase tracking-wider">LINHA</span>
          <span className="px-2.5 py-0.5 rounded bg-accent-camel/10 text-accent-camel border border-accent-camel/30 uppercase">
            BLACK
          </span>
          <span className="text-muted uppercase tracking-wider">TECIDO</span>
          <span className="px-2.5 py-0.5 rounded bg-accent-camel/10 text-accent-camel border border-accent-camel/30 uppercase">
            {peca.tecidos[0] || 'URBAN HI FLEX'}
          </span>
          <span className="text-muted uppercase tracking-wider">FICHA TÉCNICA</span>
          <span className="px-2.5 py-0.5 rounded bg-accent-camel/10 text-accent-camel border border-accent-camel/30 uppercase">
            PRODUÇÃO
          </span>
        </div>

        {/* PAINEL DE MÉTRICAS RESUMIDAS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs pt-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block mb-0.5">
              Etapa
            </span>
            <strong className="text-xs font-semibold text-primary block">
              {peca.etapaAtual || '—'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block mb-0.5">
              Custo
            </span>
            <strong className="text-xs font-bold text-accent-camel block">
              R$ {peca.custo ? peca.custo.toFixed(4) : '70,5246'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block mb-0.5">
              Preço
            </span>
            <strong className="text-xs font-bold text-emerald-600 block">
              R$ {peca.preco ? peca.preco.toFixed(3) : '200,995'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block mb-0.5">
              Estilista
            </span>
            <strong className="text-xs font-semibold text-primary block">
              {peca.estilista || 'Ninguém'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block mb-0.5">
              Modelista
            </span>
            <strong className="text-xs font-semibold text-primary block">
              {peca.modelista || 'Ninguém'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. BARRA DE NAVEGAÇÃO DE ABAS DA FICHA TÉCNICA */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 rounded-xl shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-6 text-xs font-bold whitespace-nowrap min-w-max">
          {(
            [
              { id: 'geral', label: 'Geral' },
              { id: 'corte', label: 'Corte' },
              { id: 'modelagem', label: 'Modelagem' },
              { id: 'tecidos', label: 'Tecidos' },
              { id: 'aviamentos', label: 'Aviamentos' },
              { id: 'terceiros', label: 'Terceiros' },
              { id: 'custos', label: 'Custos' },
              { id: 'precificacao', label: 'Precificação' },
              { id: 'variantes', label: 'Variantes' },
              { id: 'prova_roupa', label: 'Prova de Roupa' },
              { id: 'historico', label: 'Histórico' },
              { id: 'graficos', label: 'Gráficos' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFichaTab(tab.id)}
              className={`py-3.5 border-b-2 transition-all duration-200 cursor-pointer ${
                activeFichaTab === tab.id
                  ? 'border-accent-camel text-accent-camel font-bold'
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CONTEÚDO DAS ABAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUNA ESQUERDA (2/3): CONTEÚDO DAS ABAS */}
        <div className="lg:col-span-2 space-y-6">
          {/* ===== ABA GERAL (Com Categoria e Subcategoria adicionadas) ===== */}
          {activeFichaTab === 'geral' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* BLOCO GERAL */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <h3 className="text-sm font-bold font-editorial text-primary border-b border-border-muted pb-3">
                  Geral
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      value={nomeProduto}
                      onChange={(e) => setNomeProduto(e.target.value)}
                      placeholder="Digite Nome do Produto..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Código de Referência
                    </label>
                    <input
                      type="text"
                      value={codigoRef}
                      onChange={(e) => setCodigoRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  {/* Seleção de Tamanhos */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Tamanhos
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['P', 'M', 'G', 'GG', 'XG'].map((t) => {
                        const isSelected = tamanhos.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTamanhoGeral(t)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? 'bg-accent-camel text-white shadow-2xs'
                                : 'bg-surface-muted text-muted-foreground border border-border hover:bg-border-muted'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Técnica */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Técnica
                    </label>
                    <input
                      type="text"
                      value={tecnica}
                      onChange={(e) => setTecnica(e.target.value)}
                      placeholder="Exemplo: Estamparia"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Cor de mostruário
                    </label>
                    <input
                      type="text"
                      value={corMostruario}
                      onChange={(e) => setCorMostruario(e.target.value)}
                      placeholder="Clique aqui para selecionar ou remover"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Estampa
                    </label>
                    <input
                      type="text"
                      value={estampa}
                      onChange={(e) => setEstampa(e.target.value)}
                      placeholder="Nenhum valor disponível"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCO INTEGRAÇÃO LINX (CATEGORIA E SUBCATEGORIA ADICIONADAS) */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <h3 className="text-sm font-bold font-editorial text-primary border-b border-border-muted pb-3">
                  Integração Linx
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Sub-grupo
                    </label>
                    <input
                      type="text"
                      value={subgrupo}
                      onChange={(e) => setSubgrupo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">Linha</label>
                    <input
                      type="text"
                      value={linha}
                      onChange={(e) => setLinha(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">Grade</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">Griffe</label>
                    <input
                      type="text"
                      value={griffe}
                      onChange={(e) => setGriffe(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Tipo de matéria-prima
                    </label>
                    <input
                      type="text"
                      value={tipoMateriaPrima}
                      onChange={(e) => setTipoMateriaPrima(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      placeholder="Clique aqui para criar, remover ou selecionar"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  {/* Subcategoria */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Subcategoria
                    </label>
                    <input
                      type="text"
                      value={subcategoria}
                      onChange={(e) => setSubcategoria(e.target.value)}
                      placeholder="Clique aqui para criar, remover ou selecionar"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== ABA CORTE ===== */}
          {activeFichaTab === 'corte' && (
            <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border-muted pb-3">
                <h3 className="text-sm font-bold font-editorial text-primary">Corte</h3>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-bold text-primary transition"
                >
                  Atualizar
                </button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface-muted/50 flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase">
                  TABELA DE QUANTIDADE DE PEÇAS
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs shadow-2xs transition"
                  >
                    Iniciar
                  </button>
                  <button
                    type="button"
                    className="p-1.5 text-muted hover:text-primary rounded-lg transition"
                  >
                    <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== ABA MODELAGEM (GERAÇÃO DE NOVAS TABELAS COM IMAGENS, MEDIDAS E VALORES INTERATIVOS) ===== */}
          {activeFichaTab === 'modelagem' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* BLOCO MODELAGEM */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <h3 className="text-sm font-bold font-editorial text-primary border-b border-border-muted pb-3">
                  Modelagem
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Modelagem
                    </label>
                    <input
                      type="text"
                      value={modelagemInput}
                      onChange={(e) => setModelagemInput(e.target.value)}
                      placeholder="Clique aqui para criar, remover ou selecionar"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Característica
                    </label>
                    <input
                      type="text"
                      value={caracteristicaInput}
                      onChange={(e) => setCaracteristicaInput(e.target.value)}
                      placeholder="Selecione a característica desta peça"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* OBSERVAÇÕES DE MODELAGEM */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border-muted pb-3">
                  <h3 className="text-sm font-bold font-editorial text-primary">
                    Observações de Modelagem
                  </h3>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-bold text-primary transition"
                  >
                    Atualizar
                  </button>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={obsModelagem}
                    onChange={(e) => setObsModelagem(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium text-xs focus:bg-surface focus:border-accent-camel focus:outline-none"
                  />
                </div>
              </div>

              {/* TABELAS DE TAMANHOS E MEDIDAS COM BOTÃO "+ NOVA TABELA" */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border-muted pb-3">
                  <h3 className="text-sm font-bold font-editorial text-primary">
                    Tabelas de tamanhos e medidas
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddTabela}
                    className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova tabela</span>
                  </button>
                </div>

                {/* LISTA DAS TABELAS GERADAS */}
                <div className="space-y-6">
                  {tabelasMedidas.map((tab) => (
                    <div
                      key={tab.id}
                      className="p-5 rounded-xl border border-border bg-surface-muted/30 space-y-4 text-xs font-sans"
                    >
                      <div className="flex items-center justify-between border-b border-border-muted pb-2">
                        <span className="font-bold text-primary text-sm">{tab.nome}</span>
                        {tabelasMedidas.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setTabelasMedidas(tabelasMedidas.filter((t) => t.id !== tab.id))
                            }
                            className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                            title="Remover Tabela"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Nome da Tabela */}
                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={tab.nome}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setTabelasMedidas((prev) =>
                              prev.map((t) => (t.id === tab.id ? { ...t, nome: newName } : t))
                            );
                          }}
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>

                      {/* Arrastar / Upload de Imagens da Tabela */}
                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Imagens da Tabela
                        </label>
                        <div className="w-full h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-surface hover:border-accent-camel transition cursor-pointer text-muted">
                          <Upload className="w-6 h-6 mb-1" strokeWidth={1.5} />
                          <span className="text-[11px] font-semibold">
                            Arraste ou clique para enviar a imagem técnica da tabela
                          </span>
                        </div>
                      </div>

                      {/* Seletor de Medidas: BARRA, CINTURA, OMBRO A OMBRO, QUADRIL, TORAX */}
                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Medidas Selecionadas
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {['BARRA', 'CINTURA', 'OMBRO A OMBRO', 'QUADRIL', 'TORAX'].map((m) => {
                            const isSelected = tab.medidasSelecionadas.includes(m);
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => handleToggleMedidaInTabela(tab.id, m)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-accent-camel text-white shadow-2xs'
                                    : 'bg-surface text-muted-foreground border border-border hover:bg-border-muted'
                                }`}
                              >
                                {m}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-muted block mt-1">
                          Escolha quais medidas serão usadas nesta tabela (Ex.: Busto, Gola, Barra)
                        </span>
                      </div>

                      {/* GRID INTERATIVO DE VALORES DAS MEDIDAS (P M G GG XG Tol.) */}
                      <div className="pt-2">
                        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
                          <table className="w-full text-center text-xs font-semibold">
                            <thead>
                              <tr className="bg-surface-muted border-b border-border text-muted-foreground font-bold">
                                <th className="py-2.5 px-3 text-left">Medida</th>
                                <th className="py-2.5 px-3 w-16">P</th>
                                <th className="py-2.5 px-3 w-16">M</th>
                                <th className="py-2.5 px-3 w-16">G</th>
                                <th className="py-2.5 px-3 w-16">GG</th>
                                <th className="py-2.5 px-3 w-16">XG</th>
                                <th className="py-2.5 px-3 w-16">Tol.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-muted">
                              {tab.medidasSelecionadas.map((medida) => (
                                <tr key={medida} className="hover:bg-surface-muted/30">
                                  <td className="py-2 px-3 text-left font-bold text-primary">
                                    {medida}
                                  </td>
                                  {['P', 'M', 'G', 'GG', 'XG', 'Tol.'].map((tam) => {
                                    const val = tab.valoresMedidas[medida]?.[tam] || '';
                                    return (
                                      <td key={tam} className="py-1 px-1">
                                        <input
                                          type="text"
                                          value={val}
                                          onChange={(e) =>
                                            handleUpdateMedidaValue(
                                              tab.id,
                                              medida,
                                              tam,
                                              e.target.value
                                            )
                                          }
                                          placeholder="—"
                                          className="w-14 text-center px-1 py-1 rounded bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== ABA TECIDOS (Print 1 - Interativo com + Adicionar) ===== */}
          {activeFichaTab === 'tecidos' && (
            <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border-muted pb-3">
                <h3 className="text-sm font-bold font-editorial text-primary">
                  {tecidosItems.length} Itens
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface-muted text-xs font-semibold text-muted-foreground hover:bg-border-muted transition"
                  >
                    ⚙ Ordenar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTecido}
                    className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* LISTA DOS TECIDOS CADASTRADOS (PRINT 1) */}
              <div className="space-y-5">
                {tecidosItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl border border-border bg-surface-muted/30 space-y-4 text-xs font-sans"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-muted pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm">{item.nome}</span>
                        <span className="px-2 py-0.5 rounded bg-surface-muted text-muted font-bold text-[10px] border border-border">
                          ERP
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-bold text-primary"
                        >
                          Atualizar
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-bold text-muted-foreground"
                        >
                          Opções ▾
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Preço ({item.unidade})
                        </label>
                        <input
                          type="text"
                          defaultValue={item.preco}
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Custo do consumo
                        </label>
                        <input
                          type="text"
                          defaultValue={item.custoConsumo}
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>

                      {item.largura && (
                        <div>
                          <label className="block font-semibold mb-1 text-muted-foreground">
                            Largura
                          </label>
                          <input
                            type="text"
                            defaultValue={item.largura}
                            className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                          />
                        </div>
                      )}

                      {item.peso && (
                        <div>
                          <label className="block font-semibold mb-1 text-muted-foreground">
                            Peso (Kg)
                          </label>
                          <input
                            type="text"
                            defaultValue={item.peso}
                            className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                          />
                        </div>
                      )}

                      {item.consumo && (
                        <div>
                          <label className="block font-semibold mb-1 text-muted-foreground">
                            Consumo ({item.unidade})
                          </label>
                          <input
                            type="text"
                            defaultValue={item.consumo}
                            className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                          />
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Uso
                        </label>
                        <input
                          type="text"
                          defaultValue={item.uso}
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== ABA AVIAMENTOS (Print 2 - Interativo com + Adicionar) ===== */}
          {activeFichaTab === 'aviamentos' && (
            <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border-muted pb-3">
                <h3 className="text-sm font-bold font-editorial text-primary">
                  {aviamentosItems.length} Itens
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-border bg-surface-muted text-xs font-semibold text-muted-foreground hover:bg-border-muted transition"
                  >
                    ⚙ Ordenar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAviamento}
                    className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* LISTA DOS AVIAMENTOS CADASTRADOS (PRINT 2) */}
              <div className="space-y-5">
                {aviamentosItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl border border-border bg-surface-muted/30 space-y-4 text-xs font-sans"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-muted pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm">{item.nome}</span>
                        <span className="px-2 py-0.5 rounded bg-surface-muted text-muted font-bold text-[10px] border border-border">
                          ERP
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-bold text-primary"
                        >
                          Atualizar
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-bold text-muted-foreground"
                        >
                          Opções ▾
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Preço ({item.unidade})
                        </label>
                        <input
                          type="text"
                          defaultValue={item.preco}
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Custo do consumo
                        </label>
                        <input
                          type="text"
                          defaultValue={item.custoConsumo}
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Consumo / Quantidade
                        </label>
                        <input
                          type="text"
                          defaultValue={item.consumo || item.quantidade || '1'}
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Uso
                        </label>
                        <input
                          type="text"
                          defaultValue={item.uso}
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== ABA TERCEIROS (Prints 3, 4, 5) ===== */}
          {activeFichaTab === 'terceiros' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs flex items-center justify-between border-b border-border-muted pb-4">
                <h3 className="text-base font-bold font-editorial text-primary">
                  Detalhes de produção
                </h3>

                <button
                  type="button"
                  onClick={handleAddTerceiroDetalhe}
                  className="px-4 py-2 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Detalhe</span>
                </button>
              </div>

              {/* LISTA DOS DETALHES DE TERCEIROS (PRINTS 3, 4, 5) */}
              <div className="space-y-6">
                {terceirosItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-6 text-xs font-sans"
                  >
                    <div className="flex items-center justify-between border-b border-border-muted pb-3">
                      <span className="font-bold text-primary text-sm">{item.numero}. Detalhe</span>
                      {terceirosItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTerceiroDetalhe(item.id)}
                          className="px-3 py-1 rounded-lg border border-border bg-surface text-rose-600 font-bold hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    {/* Bloco Geral */}
                    <div className="space-y-4 p-4 rounded-xl border border-border-muted bg-surface-muted/30">
                      <div className="font-bold text-primary uppercase text-[11px] tracking-wider">
                        Geral
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-1 text-muted-foreground">
                            Tipo
                          </label>
                          <input
                            type="text"
                            defaultValue={item.tipo}
                            className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                          />
                          <span className="text-[10px] text-muted block mt-1">
                            Informe o tipo deste detalhe de produção. Ex.: Design, Estamparia
                          </span>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1 text-muted-foreground">
                            Fornecedor
                          </label>
                          <input
                            type="text"
                            defaultValue={item.fornecedor}
                            className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                          />
                          <span className="text-[10px] text-muted block mt-1">
                            Informe o fornecedor deste detalhe de produção. Ex.: Lavanderia
                            Coleção.Moda
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Observações para Ficha Técnica */}
                    <div className="space-y-3 p-4 rounded-xl border border-border-muted bg-surface-muted/30">
                      <div className="font-bold text-primary uppercase text-[11px] tracking-wider">
                        Observações para Ficha Técnica
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-muted-foreground">
                          Observações do terceiro
                        </label>
                        <input
                          type="text"
                          defaultValue={item.obsTerceiro}
                          placeholder="Digite aqui..."
                          className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                        />
                      </div>
                    </div>

                    {/* Complementos - Estampa */}
                    <div className="space-y-3 p-4 rounded-xl border border-border-muted bg-surface-muted/30">
                      <div className="font-bold text-primary uppercase text-[11px] tracking-wider">
                        Complementos - Estampa
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-1 text-muted-foreground">
                            Tela
                          </label>
                          <input
                            type="text"
                            defaultValue={item.tela}
                            placeholder="Clique aqui para criar, remover ou selecionar"
                            className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1 text-muted-foreground">
                            Tradução
                          </label>
                          <input
                            type="text"
                            defaultValue={item.traducao}
                            placeholder="Digite aqui..."
                            className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Uso em Variantes (Checkboxes) */}
                    <div className="space-y-3 p-4 rounded-xl border border-border-muted bg-surface-muted/30">
                      <div className="font-bold text-primary uppercase text-[11px] tracking-wider">
                        Uso em Variantes
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          'Variante: 1 (1)',
                          'Variante: 2 (2)',
                          'Variante: 3 (3)',
                          'Variante: 4 (4)',
                        ].map((v) => (
                          <label
                            key={v}
                            className="flex items-center gap-2 cursor-pointer font-semibold text-primary"
                          >
                            <input
                              type="checkbox"
                              defaultChecked={item.variantesUsadas[v] !== false}
                              className="rounded border-border text-accent-camel focus:ring-accent-camel"
                            />
                            <span>{v}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Técnicas (Pills) */}
                    <div className="space-y-3 p-4 rounded-xl border border-border-muted bg-surface-muted/30">
                      <div className="font-bold text-primary uppercase text-[11px] tracking-wider">
                        Técnicas
                      </div>
                      <div className="flex items-center gap-2">
                        {item.tecnicas.map((tec) => (
                          <span
                            key={tec}
                            className="px-3 py-1 rounded-lg bg-surface border border-border font-bold text-primary text-xs flex items-center gap-1.5"
                          >
                            <span>{tec}</span>
                            <span className="text-muted text-xs hover:text-rose-600 cursor-pointer">
                              ✕
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Observações da Ficha Técnica com Botão "Observação +" e Imagens */}
                    <div className="space-y-4 p-4 rounded-xl border border-border-muted bg-surface-muted/30">
                      <div className="flex items-center justify-between border-b border-border-muted pb-2">
                        <div className="font-bold text-primary uppercase text-[11px] tracking-wider">
                          Observações
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddTerceiroObs(item.id)}
                          className="px-3 py-1 rounded-lg bg-accent-camel text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                        >
                          Observação +
                        </button>
                      </div>

                      {item.observacoes.map((obs) => (
                        <div key={obs.id} className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold mb-1 text-muted-foreground">
                                Título
                              </label>
                              <input
                                type="text"
                                defaultValue={obs.titulo}
                                className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1 text-muted-foreground">
                                Descrição
                              </label>
                              <input
                                type="text"
                                defaultValue={obs.descricao}
                                className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-primary font-medium"
                              />
                            </div>
                          </div>

                          {/* Imagens anexadas à observação */}
                          <div>
                            <div className="block font-semibold mb-1 text-muted-foreground">
                              Imagens
                            </div>
                            <div className="flex items-center gap-4">
                              {obs.imagemUrl ? (
                                <div className="w-24 h-24 rounded-xl border border-border bg-surface overflow-hidden relative group">
                                  <img
                                    src={obs.imagemUrl}
                                    alt="Obs preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute bottom-1 left-1 right-1 text-center bg-neutral-950/70 text-white text-[9px] font-bold rounded py-0.5">
                                    Principal
                                  </span>
                                </div>
                              ) : null}
                              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface hover:border-accent-camel transition cursor-pointer text-muted">
                                <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OUTRAS ABAS */}
          {!['geral', 'corte', 'modelagem', 'tecidos', 'aviamentos', 'terceiros'].includes(
            activeFichaTab
          ) && (
            <div className="bg-surface p-8 rounded-xl border border-border shadow-2xs text-center space-y-3">
              <h3 className="text-sm font-bold font-editorial text-primary uppercase">
                Aba {activeFichaTab}
              </h3>
              <p className="text-xs text-muted">
                Informações e configurações de {activeFichaTab} da peça {peca.codigo}.
              </p>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA (1/3): STACK DE IMAGENS E VARIANTES */}
        <div className="space-y-4">
          <div className="space-y-4">
            {[1, 2, 3].map((vNum) => (
              <div
                key={`variant-${vNum}`}
                className="bg-surface border border-border rounded-xl p-3 shadow-2xs relative group hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="w-full h-72 bg-surface-muted rounded-lg overflow-hidden relative flex items-center justify-center border border-border-muted">
                  <img
                    src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop"
                    alt={`Variante ${vNum}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-neutral-950/80 text-white text-[10px] font-bold backdrop-blur-xs shadow-2xs">
                    Variante {vNum}
                  </span>
                  {vNum === 1 && (
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-accent-camel text-white text-[10px] font-bold shadow-2xs">
                      Foto de capa
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface border-2 border-dashed border-border hover:border-accent-camel rounded-xl p-6 text-center space-y-2 cursor-pointer transition-all duration-200 text-muted hover:text-accent-camel">
            <Upload className="w-6 h-6 mx-auto" strokeWidth={1.5} />
            <span className="text-xs font-bold block text-primary">
              Adicionar imagens de Variantes
            </span>
          </div>

          <div className="bg-surface border-2 border-dashed border-border hover:border-accent-camel rounded-xl p-6 text-center space-y-2 cursor-pointer transition-all duration-200 text-muted hover:text-accent-camel">
            <Upload className="w-6 h-6 mx-auto" strokeWidth={1.5} />
            <span className="text-xs font-bold block text-primary">
              Adicionar imagens de Desenho Técnico
            </span>
          </div>

          {/* Arquivos do projeto (Corel, Illustrator, Photoshop, PDF) */}
          <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs space-y-3 text-xs">
            <div className="font-bold text-primary">Arquivos do projeto</div>
            <p className="text-[11px] text-muted leading-tight">
              Adicione aqui seu projeto do Corel, Illustrator, Photoshop ou PDF
            </p>
            <div className="p-2.5 rounded-lg border border-border bg-surface-muted flex items-center justify-between cursor-pointer hover:bg-border-muted transition">
              <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                <FileText className="w-4 h-4 text-accent-camel" /> Enviar arquivo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
