import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PecaFichaTecnicaView } from '../../../src/pages/Home/components/PecaFichaTecnicaView';
import { AuthContext } from '../../../src/contexts/authContextInstance';
import type { MarcaSummary } from '../../../src/types/auth';
import type { ColecaoItem, PecaItem } from '../../../src/types/plm';
import type { LinxGriffe } from '../../../src/types/linx';
import { LOCAL_PECAS_KEY, savePecaLocal } from '../../../src/services/localPecasStorage';
import { getLocalStateSnapshot, parseLocalState } from '../../../src/services/localStateStorage';
import { confirmarAusentesTeste } from '../../../src/tests/fixtures/conferencia';
import '../../../src/index.css';
import { applyTheme } from '../../../src/lib/theme';
applyTheme(new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light');

// Somente fixture: nenhuma credencial, sessão real, coleção ou catálogo de produção.
const fetchLocal = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const endereco = new URL(input instanceof Request ? input.url : String(input), location.origin);
  if (endereco.origin !== location.origin || endereco.pathname.startsWith('/api')) {
    throw new Error('Rede externa/API real bloqueada no teste isolado.');
  }
  // Vite precisa acessar os próprios módulos para a atualização durante o desenvolvimento.
  return fetchLocal(input, init);
};
const marcaTeste = new URLSearchParams(location.search).get('marca');
const marcasTeste: Record<string, { nome: string; code: string; griffe: LinxGriffe }> = {
  black: { nome: 'K&J Black (teste)', code: 'KJB', griffe: 'K&J BLACK' },
  kingjoe: { nome: 'King & Joe (teste)', code: 'KJ', griffe: 'KING&JOE' },
  play: { nome: 'King & Joe Play (teste)', code: 'KJP', griffe: 'KING&JOE PLAY' },
};
const marcaPreview = marcasTeste[marcaTeste ?? ''];
const marca: MarcaSummary = {
  id: marcaPreview ? `fixture-marca-${marcaTeste}` : 'fixture-marca',
  nome: marcaPreview?.nome ?? 'Marca de teste isolado',
  code: marcaPreview?.code ?? 'TESTE',
  initials: 'T',
  colecoesCount: 1,
  pecasCount: 1,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const user = {
  id: 'fixture-usuario',
  nome: 'Usuário de teste isolado',
  email: 'fixture@example.invalid',
  empresa: 'Teste',
  cargo: 'Estilista',
  marcas: [marca],
};
const colecao: ColecaoItem = {
  id: marcaPreview ? `fixture-colecao-${marcaTeste}` : 'fixture-colecao',
  marcaId: marca.id,
  griffe: marcaPreview?.griffe ?? 'KING&JOE',
  nome: 'Coleção de teste isolado',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'integracao-colecao-v1',
};
const inicial: PecaItem = {
  id: marcaPreview ? `fixture-peca-${marcaTeste}` : 'fixture-peca',
  marcaId: marca.id,
  colecaoId: colecao.id,
  nome: 'Peça de teste isolado',
  tipo: 'Peça de teste',
  codigo: 'FIXTURE-01',
  tema: '',
  marcaNome: marca.nome,
  colecaoNome: colecao.nome,
  status: 'Em andamento',
  etapaAtual: '20 Final',
  estilista: user.nome,
  tecidos: [],
  previsaoEntrega: '',
  fichaTecnica: {
    tamanhos: marcaPreview?.griffe === 'KING&JOE PLAY' ? ['14', '16'] : ['P', 'M'],
    variantes: [
      {
        id: 'principal',
        nome: 'Principal',
        tecidos: [
          {
            id: 'fixture-tecido',
            nome: 'Tecido de teste isolado',
            codigo: 'FIXTURE-T1',
            temErp: false,
            custo: '10,50',
            unidade: 'Metros',
            consumo: '1,2',
            fornecedores: '',
            componente: 'outro',
          },
        ],
        aviamentos: [],
      },
    ],
  },
};
const fichaDeTeste =
  new URLSearchParams(location.search).get('cenario') === 'avanco'
    ? confirmarAusentesTeste({
        ...structuredClone(inicial),
        id: 'fixture-peca-avanco',
        etapaAtual: '01 geração de ficha',
        fichaTecnica: {
          ...structuredClone(inicial.fichaTecnica),
          conferencia: { gradeCompleta: true },
        },
      })
    : inicial;
function Preview() {
  const [peca, setPeca] = useState(
    () =>
      parseLocalState<PecaItem[]>(getLocalStateSnapshot(LOCAL_PECAS_KEY), []).find(
        (item) => item.id === fichaDeTeste.id && item.colecaoId === fichaDeTeste.colecaoId
      ) ?? fichaDeTeste
  );
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        activeMarca: marca,
        login: async () => {},
        logout: () => {},
        setActiveMarca: () => {},
      }}
    >
      <div className="bg-bg text-primary min-h-screen p-6">
        <p className="bg-surface-muted border border-border rounded-lg p-3 mb-5 text-sm">
          TESTE ISOLADO — API substituída por fixture. Sem conexão ao CM, SQL, 8080 ou Linx. Não
          representa dados reais.
        </p>
        <PecaFichaTecnicaView
          peca={peca}
          marca={marca}
          colecao={colecao}
          onBack={() => {}}
          onUpdatePeca={(updated) => {
            savePecaLocal(updated);
            setPeca(updated);
          }}
          usuarios={[
            {
              id: user.id,
              nome: user.nome,
              email: user.email,
              marcas: [marca.id],
              status: 'Ativo',
              acesso: 'Permitido',
              brandRoles: [
                { marcaId: marca.id, marcaNome: marca.nome, cargo: 'Estilista', times: [] },
              ],
            },
          ]}
        />
      </div>
    </AuthContext.Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
