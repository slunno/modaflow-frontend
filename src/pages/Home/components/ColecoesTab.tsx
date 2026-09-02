/**
 * ============================================================================
 * MÓDULO: Aba Coleções (Listagem & Status de Cronograma por Marca)
 * ARQUIVO: src/pages/Home/components/ColecoesTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe as coleções da marca ativa divididas em sub-abas (Em andamento,
 *            Completas, Arquivadas), com barra de progresso %, contagem de peças
 *            concluídas, prazos de entrega e badges de atraso ou entrega.
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - Quando novas coleções forem finalizadas ou lançadas via Linx ERP, os cards
 *   atualizam a quantidade de peças e a flag de atraso automaticamente.
 * ============================================================================
 */

import React, { useState } from 'react';
import type { ColecaoItem } from '../../../types/plm';
import { ArrowUpDown } from 'lucide-react';

const MOCK_COLECOES: ColecaoItem[] = [
  {
    id: 'c1',
    nome: 'INVERNO 26 - KING&JOE PLAY COLLECTION',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 30,
    pecasConcluidas: 64,
    pecasTotal: 214,
    concluidoEmDate: '22/07/2025',
    dataEntrega: '23/07/2025',
    diasAtraso: -406
  },
  {
    id: 'c2',
    nome: 'INVERNO 26 - KING&JOE PLAY PERENES',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 86,
    pecasConcluidas: 24,
    pecasTotal: 28,
    concluidoEmDate: '18/07/2025',
    dataEntrega: '18/07/2025',
    diasAtraso: -411
  },
  {
    id: 'c3',
    nome: 'INVERNO 27 - KING&JOE PLAY',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 12,
    pecasConcluidas: 30,
    pecasTotal: 259,
    concluidoEmDate: '26/08/2026',
    dataEntrega: '26/08/2026',
    diasAtraso: 0
  },
  {
    id: 'c4',
    nome: 'VERÃO 26 - King&Joe Play Collection',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 100,
    pecasConcluidas: 151,
    pecasTotal: 151,
    concluidoEmDate: '07/07/2025',
    dataEntrega: '10/01/2025',
    diasAtraso: 0 // Entregue
  },
  {
    id: 'c5',
    nome: 'VERÃO 26 - King&Joe Play Perenes',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 0,
    pecasConcluidas: 0,
    pecasTotal: 34,
    concluidoEmDate: '07/07/2025',
    dataEntrega: '10/01/2025',
    diasAtraso: -600
  },
  {
    id: 'c6',
    nome: 'VERÃO 27 - KING & JOE PLAY',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 0,
    pecasConcluidas: 1,
    pecasTotal: 228,
    concluidoEmDate: '26/08/2026',
    dataEntrega: '26/08/2026',
    diasAtraso: 0
  }
];

export const ColecoesTab: React.FC = () => {
  const [statusFiltro, setStatusFiltro] = useState<'Em andamento' | 'Completas' | 'Arquivadas'>('Completas');

  const colecoesFiltradas = MOCK_COLECOES.filter(c => c.status === statusFiltro);

  return (
    <div className="space-y-4 font-sans">
      
      {/* 1. NAVEGAÇÃO DE SUB-STATUS (Em andamento | Completas | Arquivadas) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-6 text-xs font-bold">
          <button
            onClick={() => setStatusFiltro('Em andamento')}
            className={`pb-2 border-b-2 transition cursor-pointer ${
              statusFiltro === 'Em andamento'
                ? 'border-slate-900 text-slate-900 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Em andamento
          </button>

          <button
            onClick={() => setStatusFiltro('Completas')}
            className={`pb-2 border-b-2 transition cursor-pointer ${
              statusFiltro === 'Completas'
                ? 'border-slate-900 text-slate-900 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Completas
          </button>

          <button
            onClick={() => setStatusFiltro('Arquivadas')}
            className={`pb-2 border-b-2 transition cursor-pointer ${
              statusFiltro === 'Arquivadas'
                ? 'border-slate-900 text-slate-900 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Arquivadas
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">
            {colecoesFiltradas.length}/{MOCK_COLECOES.length}
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 text-blue-700 bg-blue-50 text-xs font-bold">
            <ArrowUpDown className="w-3.5 h-3.5" /> Ordenação
          </button>
        </div>
      </div>

      {/* 2. GRID DE CARDS DAS COLEÇÕES (FIEL AO PRINT 5 ENVIADO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {colecoesFiltradas.map((c) => {
          const isEntregue = c.progressoPercent === 100;
          return (
            <div
              key={c.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition space-y-4"
            >
              {/* Título da Coleção */}
              <h4 className="text-xs font-extrabold text-slate-900 leading-snug uppercase tracking-wide min-h-[32px]">
                {c.nome}
              </h4>

              {/* Detalhes de Progresso e Peças */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Progresso da coleção</span>
                  <strong className="text-slate-900 font-bold">{c.progressoPercent} %</strong>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Peças concluídas</span>
                  <strong className="text-slate-900 font-bold">{c.pecasConcluidas} de {c.pecasTotal}</strong>
                </div>

                {c.concluidoEmDate && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Concluído em</span>
                    <strong className="text-slate-900 font-bold">{c.concluidoEmDate}</strong>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span>Entrega em</span>
                  {isEntregue ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      Entregue ✓
                    </span>
                  ) : c.diasAtraso < 0 ? (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                      {c.diasAtraso} dias
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Em dia
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Data de Entrega</span>
                  <strong className="text-slate-900 font-bold">{c.dataEntrega}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
