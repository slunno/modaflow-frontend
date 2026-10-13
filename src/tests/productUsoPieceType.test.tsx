import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem, PecaItem } from '../types/plm';
import { getPecaUsoProduct } from '../services/productUsoStorage';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], griffes: [], grades: [], categorias: [] }),
  },
}));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  resolveLinxGriffe: vi.fn().mockReturnValue(null),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
}));

const marca: MarcaSummary = {
  id: 'marca-a',
  nome: 'Marca A',
  code: 'A',
  initials: 'A',
  colecoesCount: 0,
  pecasCount: 0,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const colecao: ColecaoItem = {
  id: 'colecao-a',
  nome: 'Coleção A',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'integracao-colecao-v1',
};
const peca: PecaItem = {
  id: 'peca-a',
  marcaId: marca.id,
  colecaoId: colecao.id,
  nome: 'OVERSHIRT',
  tipo: 'OVERSHIRT',
  codigo: '',
  tema: 'Base',
  status: 'Em andamento',
  etapaAtual: '—',
  colecaoNome: colecao.nome,
  marcaNome: marca.nome,
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
            id: 'tecido-a',
            nome: 'Tecido de teste',
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
            id: 'aviamento-a',
            nome: 'Botão de teste',
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
};
function open(item: PecaItem, brand = marca, collection = colecao, aba = 'Tecidos') {
  const view = render(
    <PecaFichaTecnicaView
      peca={item}
      marca={brand}
      colecao={collection}
      onBack={() => {}}
      onUpdatePeca={() => {}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: aba }));
  return view;
}

describe('Usos vinculados ao tipo da peça na ficha completa', () => {
  beforeEach(() => localStorage.clear());

  it.each(['tecido', 'aviamento'] as const)(
    'oferece o uso de %s em outra marca e coleção do mesmo subgrupo, mesmo com nome personalizado, e o isola de BLUSA',
    (tipo) => {
      const aba = tipo === 'tecido' ? 'Tecidos' : 'Aviamentos';
      const label = `Uso do ${tipo}`;
      const first = open(peca, marca, colecao, aba);
      fireEvent.change(screen.getByLabelText(label), { target: { value: 'Vista' } });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar uso' }));
      first.unmount();
      const otherBrand = { ...marca, id: 'marca-b', nome: 'Marca B' };
      const otherCollection = {
        ...colecao,
        id: 'colecao-b',
        nome: 'Coleção B',
        marcaNome: otherBrand.nome,
      };
      const imported = {
        ...peca,
        id: 'peca-b',
        nome: 'Modelo com nome personalizado',
        tipo: 'Classificação genérica',
        marcaId: otherBrand.id,
        colecaoId: otherCollection.id,
        linxCadastro: { subgrupo: 'OVERSHIRT', linha: null, grade: null },
        fichaTecnica: { ...peca.fichaTecnica, nomeProduto: 'Descrição editada' },
      };
      const second = open(imported, otherBrand, otherCollection, aba);
      fireEvent.click(screen.getByLabelText(label));
      fireEvent.click(screen.getByRole('option', { name: 'Vista' }));
      expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe('Vista');
      second.unmount();
      open({ ...peca, id: 'peca-y', tipo: 'BLUSA' }, marca, colecao, aba);
      fireEvent.click(screen.getByLabelText(label));
      expect(screen.queryByRole('option', { name: 'Vista' })).toBeNull();
      expect(screen.getByText('Nenhum uso salvo para este tipo de peça.')).toBeDefined();
    }
  );

  it('mantém os catálogos e as seleções de tecidos e aviamentos independentes ao trocar de aba', () => {
    open(peca);
    fireEvent.change(screen.getByLabelText('Uso do tecido'), { target: { value: 'Gola' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar uso' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aviamentos' }));
    const aviamento = screen.getByLabelText('Uso do aviamento') as HTMLInputElement;
    expect(aviamento.value).toBe('');
    fireEvent.click(aviamento);
    expect(screen.queryByRole('option', { name: 'Gola' })).toBeNull();
    fireEvent.change(aviamento, { target: { value: 'Abotoamento' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar uso' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    const tecido = screen.getByLabelText('Uso do tecido') as HTMLInputElement;
    expect(tecido.value).toBe('Gola');
    fireEvent.click(tecido);
    expect(screen.getByRole('option', { name: 'Gola' })).toBeDefined();
    expect(screen.queryByRole('option', { name: 'Abotoamento' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Aviamentos' }));
    expect((screen.getByLabelText('Uso do aviamento') as HTMLInputElement).value).toBe(
      'Abotoamento'
    );
    fireEvent.click(screen.getByLabelText('Uso do aviamento'));
    expect(screen.getByRole('option', { name: 'Abotoamento' })).toBeDefined();
    expect(screen.queryByRole('option', { name: 'Gola' })).toBeNull();
  });

  it('mantém o tipo escolhido na criação quando o nome manual é alterado', () => {
    expect(
      getPecaUsoProduct({ ...peca, nome: 'BLUSA', fichaTecnica: { nomeProduto: 'Outro nome' } })
    ).toBe('OVERSHIRT');
  });
});
