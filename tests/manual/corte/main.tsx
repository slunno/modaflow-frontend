import { createRoot } from 'react-dom/client';
import { PecaFichaTecnicaView } from '../../../src/pages/Home/components/PecaFichaTecnicaView';
import type { MarcaSummary } from '../../../src/types/auth';
import type { ColecaoItem, PecaItem } from '../../../src/types/plm';
import { usePersistedState } from '../../../src/hooks/usePersistedState';
import { saveLocalState } from '../../../src/services/localStateStorage';
import { getPecaFichaValues } from '../../../src/services/pecaFichaSelectors';
import '../../../src/index.css';

// Este preview deve ser servido com tests/manual/ficha/vite.config.ts, que usa a API fixture.
const fetchLocal = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
  if (url.origin !== location.origin || url.pathname.startsWith('/api'))
    throw new Error('API real desativada no preview da tabela de corte.');
  return fetchLocal(input, init);
};
const marca: MarcaSummary = {
  id: 'fixture-marca',
  nome: 'Marca de teste',
  code: 'TESTE',
  initials: 'T',
  colecoesCount: 1,
  pecasCount: 1,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const colecao: ColecaoItem = {
  id: 'fixture-colecao',
  marcaId: marca.id,
  nome: 'Coleção de teste',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'integracao-colecao-v1',
};
const inicial: PecaItem = {
  id: 'fixture-corte',
  marcaId: marca.id,
  colecaoId: colecao.id,
  nome: 'Calça de teste',
  tipo: 'Calça',
  codigo: 'TESTE-CORTE',
  tema: 'Base',
  marcaNome: marca.nome,
  colecaoNome: colecao.nome,
  status: 'Em andamento',
  etapaAtual: '—',
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  fichaTecnica: {
    tamanhos: [],
    coresMostruario: [],
  },
};
if (!localStorage.getItem('modaflow_colors')) {
  saveLocalState('modaflow_colors', [
    { id: 'fixture-black', nome: '1 BLACK', hex: '#000000' },
    { id: 'fixture-white', nome: '2 BRANCO', hex: '#ffffff' },
  ]);
}
export function Preview() {
  const [peca] = usePersistedState<PecaItem>('fixture_tabela_corte_automatica', inicial);
  const [compartilhada] = usePersistedState<PecaItem>('fixture_tabela_corte_automatica', inicial);
  return (
    <div className="min-h-screen bg-bg p-6 text-primary">
      <p className="mb-5 rounded-lg border border-border bg-surface-muted p-3 text-sm">
        Preview com dados de teste. A tabela é salva somente neste navegador.
      </p>
      <output
        aria-label="Resumo compartilhado"
        className="mb-5 block rounded-lg border border-border bg-surface p-3 text-sm"
      >
        Dados recebidos por outro consumidor: tamanhos{' '}
        {getPecaFichaValues(compartilhada, 'Tamanhos').join(', ') || '—'}; cores{' '}
        {getPecaFichaValues(compartilhada, 'Cores').join(', ') || '—'}; corte{' '}
        {compartilhada.fichaTecnica?.corte ? 'iniciado' : 'não iniciado'}.
      </output>
      <PecaFichaTecnicaView
        peca={peca}
        marca={marca}
        colecao={colecao}
        onBack={() => {}}
        onUpdatePeca={(updated) => {
          saveLocalState('fixture_tabela_corte_automatica', updated);
        }}
      />
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
