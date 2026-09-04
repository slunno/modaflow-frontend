/**
 * ============================================================================
 * MÓDULO: Aba Peças (Catálogo & Filtros com Multi-Select de Etapas, Tipos e Estações)
 * ARQUIVO: src/pages/Home/components/PecasTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Renderiza a listagem de peças com os dropdowns multi-seleção de
 *            Etapas, Tipos de Peças (incluindo Regata, Short, Sunga, Tricot),
 *            Status da Coleção, Coleções e Estações.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import type { PecaItem } from '../../../types/plm';
import { Search, Filter } from 'lucide-react';
import { MultiSelectDropdown } from '../../../components/ui/MultiSelectDropdown';

/** Lista Completa de Etapas extraída dos Prints Oficiais do PLM */
export const ETAPAS_OPTIONS = [
  '01 geração de ficha',
  '02 engenharia recebimento',
  '03 modelagem',
  '04 mini risco / consumo',
  '05 checagem de mp linx',
  '06 aguardando tecido fornecedor',
  '07 estoque de tecidos matriz',
  '08 revisão/integração + geração de op',
  '09 encaixe / risco',
  '10 corte',
  '11 estamparia',
  '12 bordado',
  '13 estoque de aviamentos',
  '14 pilotagem/costura',
  '15 cd lavanderia',
  '16 lavanderia',
  '17 acabamento',
  '18 pré-custo e sequencia operacional',
  '19 aprovação da piloto',
  'Final',
  'Inicial',
  'Integração linx',
  'Revisar ficha técnica (liberar mostruário)'
];

/** Lista Completa de Tipos de Peças (Incluindo Regata, Short, Sunga e Tricot) */
export const TIPOS_PECAS_OPTIONS = [
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
  'Tricot'
];

/** Lista Completa de Estações extraída dos Prints Oficiais */
export const ESTACOES_OPTIONS = [
  'Alto Inverno',
  'Alto Verão',
  'Atemporal',
  'Inverno',
  'Outono',
  'Outono/Inverno',
  'Permanente',
  'Preview Inverno',
  'Preview Outono',
  'Preview Primavera',
  'Preview Verão',
  'Primavera',
  'Primavera/Verão',
  'Verão'
];

/** Lista de Coleções de Exemplo */
export const COLECOES_OPTIONS = [
  'TESTES VERÃO 28 - K&J BLACK',
  'TESTES VERÃO 28 - KING&JOE',
  'TESTES VERÃO 28 - KING&JOE PLAY',
  'INVERNO 26 - KING&JOE PLAY COLLECTION',
  'INVERNO 26 - KING&JOE PLAY PERENES',
  'VERÃO 26 - King&Joe Play Collection'
];

/** Mock Data de Peças inspiradas no sistema Coleção Moda */
const MOCK_PECAS: PecaItem[] = [
  {
    id: 'p1',
    codigo: 'TE05003J',
    nome: 'Calça TE05003J',
    tipo: 'Calça',
    status: 'Em andamento',
    etapaAtual: '05 checagem de mp linx',
    tema: 'Base',
    colecaoNome: 'TESTES VERÃO 28 - K&J BLACK',
    marcaNome: 'K&J Black',
    estilista: 'Mariana Barbosa',
    tecidos: ['Linho Misto Fios Nobres'],
    custo: 42.50,
    preco: 149.90,
    previsaoEntrega: '23/07/2026',
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p2',
    codigo: 'TE05017J',
    nome: 'Camisa TE05017J',
    tipo: 'Camisa',
    status: 'Em andamento',
    etapaAtual: '03 modelagem',
    tema: 'Base',
    colecaoNome: 'TESTES VERÃO 28 - K&J BLACK',
    marcaNome: 'K&J Black',
    estilista: 'Mariana Barbosa',
    tecidos: ['Algodão Egípcio 80 fios'],
    custo: 38.00,
    preco: 129.90,
    previsaoEntrega: '18/07/2026',
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p3',
    codigo: 'TE05016J',
    nome: 'Camisa TE05016J',
    tipo: 'Camisa',
    status: 'Em andamento',
    etapaAtual: '01 geração de ficha',
    tema: 'Base',
    colecaoNome: 'TESTES VERÃO 28 - K&J BLACK',
    marcaNome: 'K&J Black',
    estilista: 'Juliano',
    tecidos: ['Tricoline Premium'],
    custo: 35.00,
    preco: 119.90,
    previsaoEntrega: '26/08/2026',
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p4',
    codigo: 'TE29029',
    nome: 'Calça TE29029',
    tipo: 'Calça',
    status: 'Em andamento',
    etapaAtual: '10 corte',
    tema: 'Base',
    colecaoNome: 'TESTES VERÃO 28 - KING&JOE',
    marcaNome: 'King & Joe',
    estilista: 'Mariana Barbosa',
    tecidos: ['Sarja com Elastano'],
    custo: 48.00,
    preco: 169.90,
    previsaoEntrega: '10/01/2026',
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p5',
    codigo: 'TE15003K',
    nome: 'Calça TE15003K',
    tipo: 'Calça',
    status: 'Em andamento',
    etapaAtual: '14 pilotagem/costura',
    tema: 'Base',
    colecaoNome: 'TESTES VERÃO 28 - KING&JOE PLAY',
    marcaNome: 'King & Joe Play',
    estilista: 'Juliano',
    tecidos: ['Moletom Fleece Light'],
    custo: 40.00,
    preco: 139.90,
    previsaoEntrega: '10/01/2026',
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=600&auto=format&fit=crop'
  }
];

export const PecasTab: React.FC = () => {
  // ESTADOS DOS FILTROS
  const [filterMarca, setFilterMarca] = useState('');
  const [selectedEtapas, setSelectedEtapas] = useState<string[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [filterStatusPeca, setFilterStatusPeca] = useState('');
  const [filterStatusColecao, setFilterStatusColecao] = useState('');
  const [selectedColecoes, setSelectedColecoes] = useState<string[]>([]);
  const [selectedEstacoes, setSelectedEstacoes] = useState<string[]>([]);
  const [filterTecido, setFilterTecido] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // FILTRAGEM REATIVA DE PEÇAS
  const filteredPecas = useMemo(() => {
    return MOCK_PECAS.filter((peca) => {
      const matchSearch = searchTerm === '' || 
        peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        peca.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchMarca = filterMarca === '' || peca.marcaNome === filterMarca;
      
      const matchEtapa = selectedEtapas.length === 0 || 
        selectedEtapas.some(e => e.toLowerCase() === peca.etapaAtual.toLowerCase());

      const matchTipo = selectedTipos.length === 0 || 
        selectedTipos.some(t => t.toLowerCase() === peca.tipo.toLowerCase());

      const matchStatusPeca = filterStatusPeca === '' || peca.status === filterStatusPeca;
      
      const matchColecao = selectedColecoes.length === 0 || 
        selectedColecoes.includes(peca.colecaoNome);

      const matchTecido = filterTecido === '' || peca.tecidos.some(t => t.toLowerCase().includes(filterTecido.toLowerCase()));

      return matchSearch && matchMarca && matchEtapa && matchTipo && matchStatusPeca && matchColecao && matchTecido;
    });
  }, [searchTerm, filterMarca, selectedEtapas, selectedTipos, filterStatusPeca, selectedColecoes, filterTecido]);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      
      {/* 1. PAINEL DE FILTROS AVANÇADOS (CARD NÍVEL 2) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
        
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h4 className="text-sm font-bold font-editorial text-primary flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-camel" strokeWidth={1.5} /> Filtros
          </h4>
          <span className="text-xs font-semibold text-muted bg-surface-muted px-3 py-1 rounded-lg border border-border-muted">
            Opções de Filtro
          </span>
        </div>

        {/* LINHA 1 DE FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Marcas</label>
            <select
              value={filterMarca}
              onChange={(e) => setFilterMarca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            >
              <option value="">Selecionar marcas</option>
              <option value="King & Joe">King & Joe</option>
              <option value="K&J Black">K&J Black</option>
              <option value="King & Joe Play">King & Joe Play</option>
            </select>
          </div>

          <MultiSelectDropdown
            label="Etapas"
            placeholder="Selecionar etapas"
            options={ETAPAS_OPTIONS}
            selectedValues={selectedEtapas}
            onChange={setSelectedEtapas}
          />

          <MultiSelectDropdown
            label="Tipos de Peças"
            placeholder="Selecionar tipos"
            options={TIPOS_PECAS_OPTIONS}
            selectedValues={selectedTipos}
            onChange={setSelectedTipos}
          />

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Status da Peça</label>
            <select
              value={filterStatusPeca}
              onChange={(e) => setFilterStatusPeca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            >
              <option value="">Selecionar status</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Completa">Completa</option>
              <option value="A desenhar">A desenhar</option>
            </select>
          </div>
        </div>

        {/* LINHA 2 DE FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Status da Coleção</label>
            <select
              value={filterStatusColecao}
              onChange={(e) => setFilterStatusColecao(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            >
              <option value="">Selecione as coleções</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Completas">Completas</option>
              <option value="Arquivadas">Arquivadas</option>
            </select>
          </div>

          <MultiSelectDropdown
            label="Coleções"
            placeholder="Selecione as coleções"
            options={COLECOES_OPTIONS}
            selectedValues={selectedColecoes}
            onChange={setSelectedColecoes}
          />

          <MultiSelectDropdown
            label="Estações"
            placeholder="Selecionar estações"
            options={ESTACOES_OPTIONS}
            selectedValues={selectedEstacoes}
            onChange={setSelectedEstacoes}
          />
        </div>

        {/* LINHA 3 DE FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Tecido</label>
            <input
              type="text"
              placeholder="Buscar Tecido"
              value={filterTecido}
              onChange={(e) => setFilterTecido(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Aviamento</label>
            <input
              type="text"
              placeholder="Buscar Aviamento"
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Terceiro</label>
            <input
              type="text"
              placeholder="Buscar Terceiro"
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* LINHA 4 DE FILTROS */}
        <div className="max-w-xs pt-1">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Buscar Peças</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
            <Search className="w-4 h-4 text-muted absolute left-3 top-3" strokeWidth={1.5} />
          </div>
        </div>

      </div>

      {/* 2. GRID DE EXIBIÇÃO DE PEÇAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-editorial text-primary">
            Peças ({filteredPecas.length})
          </h3>
          <span className="text-xs text-muted font-medium">Exibindo catálogo da coleção</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredPecas.map((peca) => (
            <div
              key={peca.id}
              className="bg-surface border border-border rounded-xl p-4 shadow-2xs hover:border-accent-camel/50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-primary truncate">
                  {peca.nome}
                </h4>
              </div>

              <div className="w-full h-44 rounded-lg bg-surface-muted border border-border-muted overflow-hidden mb-3 relative flex items-center justify-center">
                <img
                  src={peca.imagemCroquiUrl}
                  alt={peca.nome}
                  className="w-full h-full object-cover img-brand-treated group-hover:scale-105 transition-all duration-300"
                />
              </div>

              <div className="space-y-1 text-[11px] text-muted-foreground">
                <p>Status: <strong className="text-primary font-semibold">{peca.status}</strong></p>
                <p>Tema: <strong className="text-primary font-semibold">{peca.tema}</strong></p>
                <p className="truncate">Coleção: <strong className="text-primary font-semibold">{peca.colecaoNome}</strong></p>
                <p>Marca: <strong className="text-accent-camel font-semibold">{peca.marcaNome}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
