import type { MarcaSummary } from '../../../src/types/auth';
import type { ColecaoItem, PecaItem } from '../../../src/types/plm';
import type { FichaInsumo } from '../../../src/types/ficha';

export const marca: MarcaSummary = {
  id: 'precificacao-marca',
  nome: 'Marca de teste',
  code: 'TESTE',
  initials: 'T',
  colecoesCount: 1,
  pecasCount: 1,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
export const colecao: ColecaoItem = {
  id: 'precificacao-colecao',
  marcaId: marca.id,
  nome: 'Coleção de teste',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'integracao-colecao-v1',
};
export const tecido: FichaInsumo = {
  id: 'tecido',
  nome: 'Tecido de demonstração',
  codigo: 'T1',
  temErp: false,
  fornecedores: '',
  custo: '50',
  unidade: 'Metros',
  consumo: '2',
};
export const aviamento: FichaInsumo = {
  id: 'aviamento',
  nome: 'Botão de demonstração',
  codigo: 'A1',
  temErp: false,
  fornecedores: '',
  custo: '5',
  unidade: 'Unidade',
  quantidade: '2',
};
export const peca: PecaItem = {
  id: 'precificacao-peca',
  marcaId: marca.id,
  colecaoId: colecao.id,
  nome: 'OVERSHIRT',
  tipo: 'OVERSHIRT',
  codigo: '',
  tema: 'Base',
  status: 'Em andamento',
  etapaAtual: '—',
  marcaNome: marca.nome,
  colecaoNome: colecao.nome,
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  fichaTecnica: {
    variantes: [
      { id: 'principal', nome: 'Principal', tecidos: [tecido], aviamentos: [aviamento] },
      {
        id: 'outra',
        nome: 'Outra',
        tecidos: [{ ...tecido, id: 'tecido-outra', custo: '20' }],
        aviamentos: [{ ...aviamento, id: 'aviamento-outra' }],
      },
    ],
  },
};
