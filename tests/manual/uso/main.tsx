import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PecaFichaTecnicaView } from '../../../src/pages/Home/components/PecaFichaTecnicaView';
import type { MarcaSummary } from '../../../src/types/auth';
import type { ColecaoItem, PecaItem } from '../../../src/types/plm';
import { usePersistedState } from '../../../src/hooks/usePersistedState';
import { saveLocalState } from '../../../src/services/localStateStorage';
import '../../../src/index.css';

// Servir com tests/manual/ficha/vite.config.ts para usar a API isolada.
const originalFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
  if (url.origin !== location.origin || url.pathname.startsWith('/api'))
    throw new Error('Gravações externas desativadas no preview.');
  return originalFetch(input, init);
};
const marca: MarcaSummary = {
  id: 'marca-a',
  nome: 'Marca A',
  code: 'A',
  initials: 'A',
  colecoesCount: 1,
  pecasCount: 2,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const initial: PecaItem[] = ['OVERSHIRT', 'OVERSHIRT', 'BLUSA'].map((tipo, index) => ({
  id: `preview-uso-${index}`,
  marcaId: index ? 'marca-b' : marca.id,
  marcaNome: index ? 'Marca B' : marca.nome,
  colecaoId: `colecao-${index}`,
  colecaoNome: `Coleção ${index + 1}`,
  nome: `${tipo} ${index + 1}`,
  tipo,
  codigo: '',
  tema: 'Base',
  status: 'Em andamento',
  etapaAtual: '—',
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  fichaTecnica: {
    variantes: [
      {
        id: 'principal',
        nome: 'Principal',
        tecidos: [
          {
            id: 'tecido-exemplo',
            nome: 'Tecido de demonstração',
            codigo: '',
            temErp: false,
            unidade: 'Metros',
            fornecedores: '',
            custo: '',
            observacoes: '',
          },
        ],
        aviamentos: [
          {
            id: 'aviamento-exemplo',
            nome: 'Botão de demonstração',
            codigo: '',
            temErp: false,
            unidade: 'Unidade',
            fornecedores: '',
            custo: '',
            observacoes: '',
          },
        ],
      },
    ],
  },
}));
export function Preview() {
  const [pieces] = usePersistedState('fixture_usos_tecidos_aviamentos', initial);
  const [selected, setSelected] = useState(0);
  const piece = pieces[selected]!;
  const brand = { ...marca, id: piece.marcaId!, nome: piece.marcaNome };
  const collection: ColecaoItem = {
    id: piece.colecaoId,
    nome: piece.colecaoNome,
    marcaNome: brand.nome,
    status: 'Em andamento',
    dataEntrega: '',
    diasAtraso: 0,
    regraFicha: 'integracao-colecao-v1',
  };
  return (
    <div className="min-h-screen bg-bg p-6 text-primary">
      <p className="mb-4 text-sm">
        Preview com dados de teste. Os usos são armazenados somente neste navegador.
      </p>
      <div className="mb-6 flex flex-wrap gap-3">
        {pieces.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm"
          >
            {item.tipo} — {item.marcaNome}
          </button>
        ))}
      </div>
      <PecaFichaTecnicaView
        key={piece.id}
        peca={piece}
        marca={brand}
        colecao={collection}
        onBack={() => {}}
        onUpdatePeca={(updated) =>
          saveLocalState(
            'fixture_usos_tecidos_aviamentos',
            pieces.map((item) => (item.id === updated.id ? updated : item))
          )
        }
      />
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
