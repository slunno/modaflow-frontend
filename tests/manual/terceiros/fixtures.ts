import type { PecaItem } from '../../../src/types/plm';
import { peca as base, marca, colecao } from '../precificacao/fixtures';
export { marca, colecao };

export const peca: PecaItem = {
  ...base,
  id: 'terceiros-peca',
  fichaTecnica: {
    ...base.fichaTecnica,
    terceiros: [
      {
        id: 'estampa',
        tipo: 'Estampa',
        fornecedor: 'Estamparia de demonstração',
        codigoFornecedor: '',
        observacoes: '',
        tela: '',
        traducao: '',
        tecnicas: '',
        variantes: ['principal'],
      },
    ],
  },
};
