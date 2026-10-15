import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { api } from '../services/api';
import { getProductTerceiroKey } from '../services/productTerceiroStorage';
import { getProductUsoKey, readProductUsos } from '../services/productUsoStorage';
import { marca, colecao, peca } from '../../tests/manual/terceiros/fixtures';
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
  fireEvent.click(screen.getByRole('button', { name: 'Terceiros' }));
  return view;
}
const pixels =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1cAAAAASUVORK5CYII=';

describe('Terceiros completo e local', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('salva complementos, custos, observações e várias imagens, preserva a imagem antiga e reabre com histórico sem escrita na API', async () => {
    const source: PecaItem = structuredClone(peca);
    source.fichaTecnica!.terceiros![0]!.imagemUrl = pixels;
    const save = vi.fn();
    const first = await open(source, save);
    fireEvent.change(screen.getByLabelText('Tela'), { target: { value: 'Tela 90 fios' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar tela' }));
    fireEvent.change(screen.getByLabelText('Tradução'), {
      target: { value: 'Silk em duas cores.' },
    });
    fireEvent.change(screen.getByLabelText('Técnicas'), { target: { value: 'Silk localizado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar técnica' }));
    expect(readProductUsos(getProductTerceiroKey('OVERSHIRT', 'tela'))).toEqual(['Tela 90 fios']);
    expect(readProductUsos(getProductTerceiroKey('OVERSHIRT', 'tecnica'))).toEqual([
      'Silk localizado',
    ]);
    expect(readProductUsos(getProductUsoKey('OVERSHIRT', 'tecido'))).toEqual([]);
    expect(readProductUsos(getProductUsoKey('OVERSHIRT', 'aviamento'))).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Custo +' }));
    fireEvent.click(screen.getByRole('button', { name: 'Custo +' }));
    const custos = screen.getAllByRole('group', { name: /^Custo \d$/ });
    fireEvent.change(within(custos[0]!).getByLabelText('Custo (R$)'), {
      target: { value: '12,50' },
    });
    fireEvent.change(within(custos[0]!).getByLabelText('Observação do custo'), {
      target: { value: 'Aplicação por peça.' },
    });
    fireEvent.change(within(custos[1]!).getByLabelText('Custo (R$)'), { target: { value: '-1' } });
    expect(within(custos[1]!).getByRole('alert').textContent).toContain('maior que zero');
    fireEvent.change(within(custos[1]!).getByLabelText('Custo (R$)'), { target: { value: '0' } });
    expect(within(custos[1]!).queryByRole('alert')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remover custo 2' }));
    expect(screen.getAllByRole('group', { name: /^Custo \d$/ })).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Observação +' }));
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Localização' } });
    fireEvent.change(screen.getByLabelText('Descrição'), {
      target: { value: 'Centralizar no peito.' },
    });
    const imagens = within(screen.getByRole('region', { name: 'Imagens do processo' }));
    const uploader = imagens.getByLabelText('Adicionar imagem do processo');
    fireEvent.change(uploader, {
      target: { files: [new File(['imagem1'], 'frente.png', { type: 'image/png' })] },
    });
    // O seletor bloqueia novas leituras até terminar o salvamento atual.
    expect((uploader as HTMLInputElement).disabled).toBe(true);
    await imagens.findByRole('img', { name: 'Imagem — frente.png' });
    await waitFor(() => expect((uploader as HTMLInputElement).disabled).toBe(false));
    fireEvent.change(uploader, {
      target: { files: [new File(['imagem2'], 'costas.png', { type: 'image/png' })] },
    });
    await imagens.findByRole('img', { name: 'Imagem — costas.png' });
    expect(imagens.getAllByRole('img')).toHaveLength(3);
    expect(imagens.getByRole('img', { name: 'Imagem do detalhe' }).getAttribute('src')).toBe(
      pixels
    );

    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    await waitFor(() =>
      expect(save.mock.calls.at(-1)?.[0].fichaTecnica?.terceiros?.[0]?.imagens).toEqual([
        expect.objectContaining({ nome: 'frente.png' }),
        expect.objectContaining({ nome: 'costas.png' }),
      ])
    );
    const saved = save.mock.calls.at(-1)![0] as PecaItem;
    expect(saved.fichaTecnica!.terceiros![0]).toMatchObject({
      tela: 'Tela 90 fios',
      traducao: 'Silk em duas cores.',
      tecnicas: 'Silk localizado',
      custosProcesso: [{ valor: '12,50', observacao: 'Aplicação por peça.' }],
      observacoesList: [{ titulo: 'Localização', descricao: 'Centralizar no peito.' }],
      variantes: ['principal'],
      imagemUrl: pixels,
      imagens: [{ nome: 'frente.png' }, { nome: 'costas.png' }],
    });
    const changes = saved.historicoAlteracoes
      ?.filter((event) => event.secao === 'Terceiros')
      .flatMap((event) => event.campos);
    expect(changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ campo: 'Estampa — Custo 1 (R$)', depois: '12,50' }),
        expect.objectContaining({
          campo: 'Estampa — Observação do custo 1',
          depois: 'Aplicação por peça.',
        }),
        expect.objectContaining({ campo: 'Estampa — Imagem', depois: 'frente.png' }),
      ])
    );
    expect(JSON.stringify(changes)).not.toContain('data:image');
    expect(api.post).not.toHaveBeenCalled();
    expect(api.put).not.toHaveBeenCalled();
    first.unmount();
    await open(saved);
    expect((screen.getByLabelText('Tela') as HTMLInputElement).value).toBe('Tela 90 fios');
    expect((screen.getByLabelText('Técnicas') as HTMLInputElement).value).toBe('Silk localizado');
    expect((screen.getByLabelText('Custo (R$)') as HTMLInputElement).value).toBe('12,50');
    expect((screen.getByLabelText('Observação do custo') as HTMLTextAreaElement).value).toBe(
      'Aplicação por peça.'
    );
    expect((screen.getByLabelText('Descrição') as HTMLTextAreaElement).value).toBe(
      'Centralizar no peito.'
    );
    const imageRegion = screen.getByRole('region', { name: 'Imagens do processo' });
    expect(within(imageRegion).getAllByRole('img')).toHaveLength(3);
    fireEvent.click(within(imageRegion).getAllByRole('button', { name: 'Remover imagem' })[1]!);
    expect(within(imageRegion).queryByRole('img', { name: 'Imagem — frente.png' })).toBeNull();
    expect(within(imageRegion).getByRole('img', { name: 'Imagem do detalhe' })).toBeDefined();
  });

  it('aplica o processo apenas às variantes marcadas e mantém a precificação com a fonte escolhida', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Custo +' }));
    fireEvent.change(screen.getByLabelText('Custo (R$)'), { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    expect(
      within(screen.getByRole('region', { name: 'Terceiros — Principal' })).getByText(
        'Estampa — Estamparia de demonstração'
      )
    ).toBeDefined();
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Outra' }));
    expect(
      within(screen.getByRole('region', { name: 'Terceiros — Outra' })).getByText(
        'Nenhum processo aplicado a esta variante.'
      )
    ).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Terceiros' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Principal' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Outra' }));
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Outra' }));
    expect(
      within(screen.getByRole('region', { name: 'Terceiros — Outra' })).getByText(
        'Estampa — Estamparia de demonstração'
      )
    ).toBeDefined();
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Principal' }));
    expect(
      within(screen.getByRole('region', { name: 'Terceiros — Principal' })).queryByText(
        'Estampa — Estamparia de demonstração'
      )
    ).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Precificação' }));
    const cost = within(screen.getByRole('rowheader', { name: 'Custo' }).closest('tr')!);
    expect(cost.getByText(/R\$\s*110,0000/)).toBeDefined();
  });

  it('cria detalhes independentes e não mistura os custos ou observações entre os processos', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: '+ Detalhe' }));
    const first = within(screen.getByRole('article', { name: 'Detalhe 1' }));
    const second = within(screen.getByRole('article', { name: 'Detalhe 2' }));
    fireEvent.change(second.getByLabelText('Tipo'), { target: { value: 'Bordado' } });
    fireEvent.click(second.getByRole('button', { name: 'Custo +' }));
    fireEvent.change(second.getByLabelText('Custo (R$)'), { target: { value: '15.25' } });
    expect(first.queryByLabelText('Custo (R$)')).toBeNull();
    fireEvent.click(second.getByRole('button', { name: 'Observação +' }));
    expect(first.queryByLabelText('Título')).toBeNull();
    fireEvent.click(first.getByRole('button', { name: 'Remover detalhe' }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect((screen.getByLabelText('Tipo') as HTMLInputElement).value).toBe('Bordado');
    expect((screen.getByLabelText('Custo (R$)') as HTMLInputElement).value).toBe('15.25');
  });
});
