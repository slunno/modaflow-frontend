/**
 * ============================================================================
 * MÓDULO: Aba Peças (Catálogo & Filtros de Produtos)
 * ARQUIVO: src/pages/Home/components/PecasTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Renderiza a listagem de peças/produtos com o grid de filtros avançados
 *            fiéis ao layout do Coleção Moda (Filtros por Marca, Etapa, Tipo, Status,
 *            Tecido, Aviamento, etc.).
 * ----------------------------------------------------------------------------
 * PADRÃO DE INTEGRABILIDADE COM O BACKEND JAVA SPRING BOOT:
 * - Os estados dos filtros (`filterMarcas`, `filterEtapas`, etc.) disparam a
 *   requisição HTTP para o endpoint `@GetMapping("/api/v1/pecas")` do backend,
 *   onde a consulta SQL com filtros e paginação é executada no banco de dados.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import type { PecaItem } from '../../../types/plm';
import { Search, Filter } from 'lucide-react';

/** Mock Data de Peças inspiradas no sistema Coleção Moda */
const MOCK_PECAS: PecaItem[] = [
  {
    id: 'p1',
    codigo: 'TE05003J',
    nome: 'Calça TE05003J',
    tipo: 'Calça',
    status: 'Em andamento',
    etapaAtual: '05 Checagem MP Linx',
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
    etapaAtual: '03 Modelagem',
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
    etapaAtual: '01 Geração de Ficha',
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
    etapaAtual: '10 Corte',
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
    etapaAtual: 'Costura',
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
  // ESTADOS DOS FILTROS (REATIVOS)
  const [filterMarca, setFilterMarca] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
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
      const matchEtapa = filterEtapa === '' || peca.etapaAtual === filterEtapa;
      const matchTipo = filterTipo === '' || peca.tipo === filterTipo;
      const matchStatus = filterStatus === '' || peca.status === filterStatus;
      const matchTecido = filterTecido === '' || peca.tecidos.some(t => t.toLowerCase().includes(filterTecido.toLowerCase()));

      return matchSearch && matchMarca && matchEtapa && matchTipo && matchStatus && matchTecido;
    });
  }, [searchTerm, filterMarca, filterEtapa, filterTipo, filterStatus, filterTecido]);

  return (
    <div className="space-y-6">
      
      {/* 1. PAINEL DE FILTROS AVANÇADOS (IGUAL AO PRINT DE PEÇAS) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" /> Filtros
          </h4>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Opções de Filtro
          </span>
        </div>

        {/* LINHA 1 DE FILTROS: Marcas, Etapas, Tipos de Peças, Status da Peça */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Marcas</label>
            <select
              value={filterMarca}
              onChange={(e) => setFilterMarca(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="">Selecionar marcas</option>
              <option value="King & Joe">King & Joe</option>
              <option value="K&J Black">K&J Black</option>
              <option value="King & Joe Play">King & Joe Play</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Etapas</label>
            <select
              value={filterEtapa}
              onChange={(e) => setFilterEtapa(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="">Selecionar etapas</option>
              <option value="01 Geração de Ficha">01 Geração de Ficha</option>
              <option value="03 Modelagem">03 Modelagem</option>
              <option value="05 Checagem MP Linx">05 Checagem MP Linx</option>
              <option value="10 Corte">10 Corte</option>
              <option value="Costura">Costura</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tipos de Peças</label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="">Selecionar tipos</option>
              <option value="Calça">Calça</option>
              <option value="Camisa">Camisa</option>
              <option value="Polo">Polo</option>
              <option value="Bermuda">Bermuda</option>
              <option value="Blazer">Blazer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status da Peça</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Aviamento</label>
            <input
              type="text"
              placeholder="Buscar Aviamento"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Terceiro</label>
            <input
              type="text"
              placeholder="Buscar Terceiro"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
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
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

      </div>

      {/* 2. GRID DE EXIBIÇÃO DE PEÇAS (3787 ITENS FIÉIS AO PRINT) */}
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
              {/* Cabeçalho da Peça */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold text-slate-900 truncate">
                  {peca.nome}
                </h4>
              </div>

              {/* Imagem do Croqui Técnico */}
              <div className="w-full h-44 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-3 relative flex items-center justify-center">
                <img
                  src={peca.imagemCroquiUrl}
                  alt={peca.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Detalhes da Ficha da Peça */}
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
