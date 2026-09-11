/**
 * ============================================================================
 * COMPONENTE: Ficha Técnica da Peça (PecaFichaTecnicaView)
 * ARQUIVO: src/pages/Home/components/PecaFichaTecnicaView.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Visão detalhada da ficha técnica do produto com abas de Geral,
 *            Corte, Modelagem, Tecidos, Aviamentos, Variantes, etc.
 *            Conforme os Prints 2, 3, 4 e 5.
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
} from 'lucide-react';

interface PecaFichaTecnicaViewProps {
  peca: PecaItem;
  colecao: ColecaoItem;
  marca: MarcaSummary;
  onBack: () => void;
  onUpdatePeca?: (updatedPeca: PecaItem) => void;
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

  // Estado dos formulários da Ficha Técnica
  const [nomeProduto, setNomeProduto] = useState(peca.nome || '');
  const [codigoRef, setCodigoRef] = useState(peca.codigo || '');
  const [descricao, setDescricao] = useState(
    `CAMISA ${peca.tipo.toUpperCase()} POLIAMIDA ULTRAFLEX TRAVEL`
  );
  const [tecnica, setTecnica] = useState('Lavanderia, Estamparia, Bordado');
  const [corMostruario, setCorMostruario] = useState('');
  const [estampa, setEstampa] = useState('');
  const [obsGerais, setObsGerais] = useState(
    'PRODUÇÃO :\n- Manter boa qualidade na construção das peças.\n- Regular bem as máquinas, Trocar agulhas, tecido leve perigoso furar e danificar.\n- Para as variantes chumbo e cinza cl - Botões tinto na cor tecido'
  );
  const [obsCorte, setObsCorte] = useState(
    'ETIQUETAR TECIDO LADO AVESSO PARA NÃO DANIFICAR A PEÇA\n- SEPARAR PALA PARA SILKAR///\n- SEPARAR FRENTE P BORDAR'
  );
  const [subgrupo, setSubgrupo] = useState(peca.tipo.toUpperCase());
  const [linha, setLinha] = useState('INDEFINIDO');
  const [grade, setGrade] = useState('P-XG');
  const [griffe, setGriffe] = useState(marca.nome.toUpperCase());
  const [tipoMateriaPrima, setTipoMateriaPrima] = useState('MALHA DE FIBRA SINTÉTICA');

  // Tamanhos selecionados
  const [tamanhos, setTamanhos] = useState<string[]>(['P', 'M', 'G', 'GG', 'XG']);

  // Modelagem state
  const [modelagemInput, setModelagemInput] = useState('');
  const [caracteristicaInput, setCaracteristicaInput] = useState('');
  const [obsModelagem, setObsModelagem] = useState('RENOMEAMOS A REF:CS.25.301 PARA CS01006J');

  const toggleTamanho = (t: string) => {
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
      {/* 1. BREADCRUMBS FLUTUANTES (Prints 2, 3, 4, 5) */}
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

      {/* 2. CABEÇALHO DA FICHA TÉCNICA (Prints 2 & 4) */}
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
              title="RSS Feed"
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

      {/* 3. BARRA DE NAVEGAÇÃO DE ABAS DA FICHA TÉCNICA (Prints 2, 4, 5) */}
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

      {/* 4. CONTEÚDO DA ABA SELECIONADA + COLUNA DIREITA DE IMAGENS DAS VARIANTES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUNA ESQUERDA (2/3): FORMULÁRIOS DA ABA */}
        <div className="lg:col-span-2 space-y-6">
          {/* ===== ABA GERAL (Prints 2 & 3) ===== */}
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
                            onClick={() => toggleTamanho(t)}
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
                    <span className="text-[10px] text-muted block mt-1">
                      Escolha quais tamanhos serão produzidos nessa peça
                    </span>
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
                    <span className="text-[10px] text-muted block mt-1">
                      Tipo de técnica utilizada. Exemplo: Lavanderia, Estamparia, Bordado
                    </span>
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

              {/* BLOCO OBSERVAÇÕES */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <h3 className="text-sm font-bold font-editorial text-primary border-b border-border-muted pb-3">
                  Observações
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Observações Gerais
                    </label>
                    <textarea
                      rows={4}
                      value={obsGerais}
                      onChange={(e) => setObsGerais(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">
                      Observações de Corte
                    </label>
                    <textarea
                      rows={3}
                      value={obsCorte}
                      onChange={(e) => setObsCorte(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCO SIMBOLOGIA */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <h3 className="text-sm font-bold font-editorial text-primary border-b border-border-muted pb-3">
                  Simbologia
                </h3>

                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted bg-surface-muted">
                    <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-surface-muted text-xs font-semibold text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <span>🧼 🧺 🚫 🧼 👔 🪡</span>
                    </div>
                    <span className="text-[10px] text-muted block">Simbologia de lavagem</span>
                  </div>
                </div>
              </div>

              {/* BLOCO INTEGRAÇÃO LINX */}
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
                </div>
              </div>
            </div>
          )}

          {/* ===== ABA CORTE (Print 4) ===== */}
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

          {/* ===== ABA MODELAGEM (Print 5) ===== */}
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

              {/* TABELAS DE TAMANHOS E MEDIDAS */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border-muted pb-3">
                  <h3 className="text-sm font-bold font-editorial text-primary">
                    Tabelas de tamanhos e medidas
                  </h3>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs shadow-2xs transition"
                  >
                    + Nova tabela
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-border bg-surface-muted/30 space-y-3 text-xs">
                  <div className="font-bold text-primary">Tabela - 1</div>
                  <div>
                    <label className="block font-semibold mb-1 text-muted-foreground">Nome</label>
                    <input
                      type="text"
                      defaultValue="Tabela - 1"
                      className="w-full px-3.5 py-2 rounded-lg bg-surface-muted border border-border text-primary font-medium"
                    />
                  </div>

                  {/* Medidas Table Preview */}
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-center text-xs font-semibold">
                      <thead>
                        <tr className="bg-surface-muted border-b border-border text-muted-foreground">
                          <th className="py-2 px-3">P</th>
                          <th className="py-2 px-3">M</th>
                          <th className="py-2 px-3">G</th>
                          <th className="py-2 px-3">GG</th>
                          <th className="py-2 px-3">XG</th>
                          <th className="py-2 px-3">Tol.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border-muted text-muted">
                          <td className="py-2 px-3">—</td>
                          <td className="py-2 px-3">—</td>
                          <td className="py-2 px-3">—</td>
                          <td className="py-2 px-3">—</td>
                          <td className="py-2 px-3">—</td>
                          <td className="py-2 px-3">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OUTRAS ABAS (FALLBACK AMIGÁVEL) */}
          {!['geral', 'corte', 'modelagem'].includes(activeFichaTab) && (
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

        {/* COLUNA DIREITA (1/3): STACK DE IMAGENS E VARIANTES (Prints 2, 3, 4, 5) */}
        <div className="space-y-4">
          {/* Lista de Imagens das Variantes */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((vNum) => (
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

          {/* BOX: Adicionar imagens de Variantes */}
          <div className="bg-surface border-2 border-dashed border-border hover:border-accent-camel rounded-xl p-6 text-center space-y-2 cursor-pointer transition-all duration-200 text-muted hover:text-accent-camel">
            <Upload className="w-6 h-6 mx-auto" strokeWidth={1.5} />
            <span className="text-xs font-bold block text-primary">
              Adicionar imagens de Variantes
            </span>
          </div>

          {/* BOX: Adicionar imagens de Referência */}
          <div className="bg-surface border-2 border-dashed border-border hover:border-accent-camel rounded-xl p-6 text-center space-y-2 cursor-pointer transition-all duration-200 text-muted hover:text-accent-camel">
            <Upload className="w-6 h-6 mx-auto" strokeWidth={1.5} />
            <span className="text-xs font-bold block text-primary">
              Adicionar imagens de Referência
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
