import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { FichaPrecificacaoEditor } from '../pages/Home/components/FichaPrecificacaoEditor';
import { custoInsumosVariante } from '../services/fichaPrecificacao';
import { marca, colecao, peca } from '../../tests/manual/precificacao/fixtures';
import type { PecaItem } from '../types/plm';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], griffes: [], grades: [], categorias: [] }),
    post: vi.fn(),
    put: vi.fn(),
  },
}));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
}));

async function open(item = peca, save = vi.fn()) {
  const view = render(
    <PecaFichaTecnicaView
      peca={item}
      marca={marca}
      colecao={colecao}
      onBack={() => {}}
      onUpdatePeca={save}
    />
  );
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.click(screen.getByRole('button', { name: 'Precificação' }));
  return view;
}
const row = (name: string) => within(screen.getByRole('rowheader', { name }).closest('tr')!);
const reais = (valor: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })
    .format(valor)
    .replace(/\u00a0/g, ' ');

describe('Precificação na ficha técnica', () => {
  beforeEach(() => localStorage.clear());

  it('reproduz o print e alterna para margem de lucro sem perder o preço aprovado', async () => {
    await open();
    expect((screen.getByLabelText('Defina o markup') as HTMLInputElement).value).toBe('2.85');
    expect(row('Custo').getByText(reais(110))).toBeDefined();
    expect(row('Custo').getByText(/35,09/)).toBeDefined();
    expect(row('Preço final').getByText(reais(313.5))).toBeDefined();
    fireEvent.change(screen.getByLabelText('Preço aprovado'), { target: { value: '300' } });
    expect(row('Final vs. Aprovado').getByText(reais(-13.5))).toBeDefined();
    expect(row('Final vs. Aprovado').getByText(/-4,31/)).toBeDefined();
    fireEvent.click(screen.getByLabelText('Com base na margem de lucro'));
    fireEvent.change(screen.getByLabelText('Defina a margem de lucro (%)'), {
      target: { value: '60' },
    });
    expect(row('Preço final').getByText(reais(275))).toBeDefined();
    expect(row('Final vs. Aprovado').getByText(reais(25))).toBeDefined();
    expect((screen.getByLabelText('Preço aprovado') as HTMLInputElement).value).toBe('300');
    fireEvent.change(screen.getByLabelText('Defina a margem de lucro (%)'), {
      target: { value: '100' },
    });
    expect(
      within(screen.getByRole('region', { name: 'Precificação — Principal' })).getByRole('alert')
        .textContent
    ).toContain('menos de 100%');
    expect(row('Preço final').getAllByRole('cell').at(-1)?.textContent).toBe('—');
    fireEvent.click(screen.getByLabelText('Com base no markup'));
    expect(row('Preço final').getByText(reais(313.5))).toBeDefined();
    expect(screen.queryByText('Aba precificacao')).toBeNull();
  });

  it('salva e reabre os parâmetros de cada variante e registra o histórico sem substituir preço/custo de origem', async () => {
    const save = vi.fn();
    const source = { ...peca, custo: 999, preco: 900 };
    const first = await open(source, save);
    fireEvent.change(screen.getByLabelText('Preço aprovado'), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText('Variante da precificação'), {
      target: { value: 'outra' },
    });
    expect(row('Custo').getByText(reais(50))).toBeDefined();
    expect((screen.getByLabelText('Preço aprovado') as HTMLInputElement).value).toBe('');
    fireEvent.click(screen.getByLabelText('Com base na margem de lucro'));
    fireEvent.change(screen.getByLabelText('Defina a margem de lucro (%)'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText('Preço aprovado'), { target: { value: '120' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = save.mock.calls[0]![0] as PecaItem;
    expect(saved.custo).toBe(999);
    expect(saved.preco).toBe(900);
    expect(saved.fichaTecnica!.variantes![0]!.precificacao).toMatchObject({
      modo: 'markup',
      markup: '2.85',
      precoAprovado: '300',
    });
    expect(saved.fichaTecnica!.variantes![1]!.precificacao).toMatchObject({
      modo: 'margem',
      margemLucro: '50',
      precoAprovado: '120',
    });
    expect(
      saved.historicoAlteracoes?.find((evento) => evento.secao === 'Precificação')?.campos
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ campo: 'Outra — Margem de lucro (%)', depois: '50' }),
      ])
    );
    first.unmount();
    await open(saved);
    expect((screen.getByLabelText('Preço aprovado') as HTMLInputElement).value).toBe('300');
    fireEvent.change(screen.getByLabelText('Variante da precificação'), {
      target: { value: 'outra' },
    });
    expect((screen.getByLabelText('Defina a margem de lucro (%)') as HTMLInputElement).value).toBe(
      '50'
    );
    expect(row('Preço final').getByText(reais(100))).toBeDefined();
  });

  it('recalcula ao alterar consumo de tecido e quantidade de aviamento e usa o mesmo total na aba Custos', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    fireEvent.change(screen.getByLabelText('Consumo (Metros)'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aviamentos' }));
    fireEvent.change(screen.getByLabelText('Quantidade (Unidade)'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Precificação' }));
    expect(row('Custo').getByText(reais(170))).toBeDefined();
    expect(row('Preço final').getByText(reais(484.5))).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Custos' }));
    const resumo = screen.getByRole('table', { name: 'Resumo dos custos — Principal' });
    expect(within(resumo).getByText(reais(170))).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Editar tecidos' }));
    fireEvent.change(screen.getByLabelText('Consumo (Metros)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Precificação' }));
    expect(screen.getByText(/insumos pendentes \(1\)/).textContent).toContain(
      'insumos pendentes (1)'
    );
    expect(row('Custo').getAllByRole('cell').at(-1)?.textContent).toBe('—');
  });

  it('distingue variante vazia, preenchimento inválido e custo explicitamente zero', () => {
    const variante = structuredClone(peca.fichaTecnica!.variantes![0]!);
    expect(custoInsumosVariante({ ...variante, tecidos: [], aviamentos: [] }).total).toBeNull();
    variante.tecidos[0]!.custo = '0';
    variante.aviamentos[0]!.quantidade = '0';
    expect(custoInsumosVariante(variante).total).toBe(0);
    variante.tecidos[0]!.unidade = '';
    expect(custoInsumosVariante(variante).total).toBeNull();
    render(<FichaPrecificacaoEditor variante={variante} onChange={() => {}} />);
    expect(row('Preço final').getAllByRole('cell').at(-1)?.textContent).toBe('—');
  });
});
