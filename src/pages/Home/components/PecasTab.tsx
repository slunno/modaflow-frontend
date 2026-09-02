/**
 * ============================================================================
 * MÓDULO: Aba Peças (Catálogo & Filtros com Multi-Select de Etapas e Tipos)
 * ARQUIVO: src/pages/Home/components/PecasTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Renderiza a listagem de peças com os dropdowns multi-seleção de
 *            Etapas (24 etapas do fluxo) e Tipos de Peças (Acessórios, Blazer,
 *            Calça, Camisa, Jaqueta, etc.) fiéis às telas enviadas.
 * ----------------------------------------------------------------------------
 * PADRÃO DE INTEGRABILIDADE COM O BACKEND JAVA SPRING BOOT:
 * - A lista de etapas e tipos selecionados é mantida em arrays React State e
 *   pode ser enviada como array de IDs para o backend em Java (`GET /api/v1/pecas?etapas=1,3,5`).
 * ============================================================================
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { PecaItem } from '../../../types/plm';
import { Search, Filter, Check, ChevronDown } from 'lucide-react';

/** Lista Completa de Etapas extraída dos Prints Oficiais do PLM */
const ETAPAS_OPTIONS = [
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

/** Lista Completa de Tipos de Peças extraída dos Prints Oficiais do PLM */
const TIPOS_PECAS_OPTIONS = [
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
  'Polo'
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

/** Componente Genérico de Dropdown Multi-Select (Com Selos Circulares de Checkmark ✓) */
interface MultiSelectDropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const toggleItem = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(item => item !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  // Texto exibido no campo
  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.length === 1 
      ? selectedValues[0] 
      : `${selectedValues.length} selecionados`;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      
      {/* CAMPO DE SELEÇÃO */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 flex items-center justify-between shadow-xs hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <span className={`truncate ${selectedValues.length === 0 ? 'text-slate-400' : 'text-slate-900 font-semibold'}`}>
          {displayText}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
      </button>

      {/* DROPDOWN FLUTUANTE (IGUAL AO PRINT DO PLM) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 max-h-72 overflow-y-auto text-xs animate-fade-in">
          
          {/* Opção Selecionar Todos */}
          <div
            onClick={toggleSelectAll}
            className="px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-bold border-b border-slate-100 text-slate-800"
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
              isAllSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
            }`}>
              {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>Selecionar todos</span>
          </div>

          {/* Lista de Opções */}
          {options.map((opt) => {
            const checked = selectedValues.includes(opt);
            return (
              <div
                key={opt}
                onClick={() => toggleItem(opt)}
                className={`px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium text-slate-700 ${
                  checked ? 'bg-slate-50/80 font-bold text-slate-950' : ''
                }`}
              >
                {/* Circulo de Check (✓) Fiel aos Prints */}
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {checked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate">{opt}</span>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

export const PecasTab: React.FC = () => {
  // ESTADOS DOS FILTROS (MULTI-SELECT E SIMPLES)
  const [filterMarca, setFilterMarca] = useState('');
  const [selectedEtapas, setSelectedEtapas] = useState<string[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTecido, setFilterTecido] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // FILTRAGEM REATIVA DE PEÇAS
  const filteredPecas = useMemo(() => {
    return MOCK_PECAS.filter((peca) => {
      const matchSearch = searchTerm === '' || 
        peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        peca.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchMarca = filterMarca === '' || peca.marcaNome === filterMarca;
      
      // Validação Multi-Select de Etapas
      const matchEtapa = selectedEtapas.length === 0 || 
        selectedEtapas.some(e => e.toLowerCase() === peca.etapaAtual.toLowerCase());

      // Validação Multi-Select de Tipos de Peças
      const matchTipo = selectedTipos.length === 0 || 
        selectedTipos.some(t => t.toLowerCase() === peca.tipo.toLowerCase());

      const matchStatus = filterStatus === '' || peca.status === filterStatus;
      const matchTecido = filterTecido === '' || peca.tecidos.some(t => t.toLowerCase().includes(filterTecido.toLowerCase()));

      return matchSearch && matchMarca && matchEtapa && matchTipo && matchStatus && matchTecido;
    });
  }, [searchTerm, filterMarca, selectedEtapas, selectedTipos, filterStatus, filterTecido]);

  return (
    <div className="space-y-6">
      
      {/* 1. PAINEL DE FILTROS AVANÇADOS COM MULTI-SELECT DE ETAPAS E TIPOS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" /> Filtros
          </h4>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Opções de Filtro
          </span>
        </div>

        {/* LINHA 1 DE FILTROS: Marcas, Etapas (Multi-select), Tipos de Peças (Multi-select), Status da Peça */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Marcas</label>
            <select
              value={filterMarca}
              onChange={(e) => setFilterMarca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="">Selecionar marcas</option>
              <option value="King & Joe">King & Joe</option>
              <option value="K&J Black">K&J Black</option>
              <option value="King & Joe Play">King & Joe Play</option>
            </select>
          </div>

          {/* DROPDOWN MULTI-SELECT DE ETAPAS (24 ETAPAS DO PLM FIÉIS AOS PRINTS!) */}
          <MultiSelectDropdown
            label="Etapas"
            placeholder="Selecionar etapas"
            options={ETAPAS_OPTIONS}
            selectedValues={selectedEtapas}
            onChange={setSelectedEtapas}
          />

          {/* DROPDOWN MULTI-SELECT DE TIPOS DE PEÇAS (Acessórios, Blazer, Calça, Camisa, etc.) */}
          <MultiSelectDropdown
            label="Tipos de Peças"
            placeholder="Selecionar tipos"
            options={TIPOS_PECAS_OPTIONS}
            selectedValues={selectedTipos}
            onChange={setSelectedTipos}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status da Peça</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="">Selecionar status</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Completa">Completa</option>
              <option value="A desenhar">A desenhar</option>
            </select>
          </div>
        </div>

        {/* LINHA 2 DE FILTROS: Tecido, Aviamento, Terceiro, Busca por Produto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tecido</label>
            <input
              type="text"
              placeholder="Buscar Tecido"
              value={filterTecido}
              onChange={(e) => setFilterTecido(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Aviamento</label>
            <input
              type="text"
              placeholder="Buscar Aviamento"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Terceiro</label>
            <input
              type="text"
              placeholder="Buscar Terceiro"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Buscar Peças</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produto ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

      </div>

      {/* 2. GRID DE EXIBIÇÃO DE PEÇAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Peças ({filteredPecas.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Exibindo catálogo da coleção</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredPecas.map((peca) => (
            <div
              key={peca.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-blue-500/50 hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold text-slate-900 truncate">
                  {peca.nome}
                </h4>
              </div>

              <div className="w-full h-44 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-3 relative flex items-center justify-center">
                <img
                  src={peca.imagemCroquiUrl}
                  alt={peca.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              <div className="space-y-1 text-[11px] text-slate-600">
                <p>Status: <strong className="text-slate-900">{peca.status}</strong></p>
                <p>Tema: <strong className="text-slate-900">{peca.tema}</strong></p>
                <p className="truncate">Coleção: <strong className="text-slate-900">{peca.colecaoNome}</strong></p>
                <p>Marca: <strong className="text-blue-600">{peca.marcaNome}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
