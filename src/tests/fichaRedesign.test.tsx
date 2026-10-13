import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { FichaGraficosPanel } from '../pages/Home/components/FichaGraficosPanel';
import { FichaAlteracoesPanel } from '../pages/Home/components/FichaAlteracoesPanel';
import { CriarTecidoModal } from '../pages/Gestao/modals/CriarTecidoModal';
import { api } from '../services/api';
import { marca, colecao, peca } from '../../tests/manual/precificacao/fixtures';
import type { PecaItem } from '../types/plm';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] }),
    post: vi.fn(),
  },
}));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
}));

function item(): PecaItem {
  const result = structuredClone(peca);
  result.fichaTecnica!.variantes!.forEach((variant, index) => {
    variant.nome = index ? 'Azul' : 'Areia';
    variant.imagemUrl = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text>${variant.nome}</text></svg>`;
    variant.tecidos[0]!.nome = index ? 'Sarja azul' : 'Linho areia';
  });
  return result;
}
async function open(save = vi.fn()) {
  render(
    <PecaFichaTecnicaView
      peca={item()}
      colecao={colecao}
      marca={marca}
      onBack={() => {}}
      onUpdatePeca={save}
    />
  );
  await act(async () => {
    await Promise.resolve();
  });
  return save;
}
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
afterEach(cleanup);

describe('Redesign da ficha: comportamento preservado', () => {
  it('troca a imagem e os insumos ao clicar na miniatura, sem persistir nem gravar na API', async () => {
    const save = await open();
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    expect(screen.getByAltText('Variante Areia')).toBeDefined();
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Azul' }));
    expect(
      screen.getByRole('tab', { name: 'Selecionar variante Azul' }).getAttribute('aria-selected')
    ).toBe('true');
    expect(screen.getByAltText('Variante Azul').getAttribute('src')).toBe(
      item().fichaTecnica!.variantes![1]!.imagemUrl
    );
    expect(
      within(screen.getByRole('region', { name: 'Tecidos — Azul' })).getAllByText('Sarja azul')
        .length
    ).toBeGreaterThan(0);
    expect(screen.queryByText('Linho areia')).toBeNull();
    expect(save).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });
  it('usa as setas e Home nas miniaturas e devolve o foco após fechar a ampliação com ESC', async () => {
    await open();
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Selecionar variante Areia' }), {
      key: 'ArrowRight',
    });
    expect(document.activeElement).toBe(
      screen.getByRole('tab', { name: 'Selecionar variante Azul' })
    );
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(
      screen.getByRole('tab', { name: 'Selecionar variante Areia' }).getAttribute('aria-selected')
    ).toBe('true');
    const expand = screen.getByRole('button', { name: 'Ampliar imagem de Areia' });
    expand.focus();
    fireEvent.click(expand);
    expect(screen.getByRole('dialog', { name: 'Imagem — Areia' })).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(expand);
  });
  it('mantém o cabeçalho sem o bloco local ou a faixa de obrigatórios e salva as edições da variante', async () => {
    const save = await open();
    for (const name of [
      'Geral',
      'Variantes',
      'Modelagem',
      'Corte',
      'Tecidos',
      'Aviamentos',
      'Terceiros',
      'Custos',
      'Precificação',
      'Prova de Roupa',
      'Histórico',
      'Gráficos',
    ]) {
      fireEvent.click(screen.getByRole('button', { name }));
      expect(screen.queryByText('Rascunho local, não enviado ao Linx')).toBeNull();
      expect(screen.queryByText(/Conferência de obrigatórios/)).toBeNull();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Renomear variante' }));
    fireEvent.change(screen.getByLabelText(/Nome da variante/), {
      target: { value: 'Areia revisada' },
    });
    expect(screen.getByText('Salvando alterações da variante automaticamente…')).toBeDefined();
    expect(save).not.toHaveBeenCalled();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(screen.queryByText('Salvando alterações da variante automaticamente…')).toBeNull();
    expect((save.mock.calls[0]![0] as PecaItem).fichaTecnica!.variantes![0]!.nome).toBe(
      'Areia revisada'
    );
    expect(api.post).not.toHaveBeenCalled();
  });
  it('duplica a variante selecionada sem compartilhar IDs dos insumos', async () => {
    const save = await open();
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Azul' }));
    expect(screen.queryByLabelText('Variante em edição')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Duplicar variante' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '+ Nova variante' }));
    const choice = screen.getByRole('dialog', { name: 'Criar variante' });
    expect(within(choice).getByText('Azul', { exact: true })).toBeDefined();
    expect(screen.getAllByRole('tab', { name: /Selecionar variante/ })).toHaveLength(2);
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(within(choice).getByRole('button', { name: 'Duplicar variante' }));
    await waitFor(() =>
      expect(screen.getAllByRole('tab', { name: /Selecionar variante/ })).toHaveLength(3)
    );
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const variants = (save.mock.calls[0]![0] as PecaItem).fichaTecnica!.variantes!;
    expect(variants[2]!.imagemUrl).toBe(variants[1]!.imagemUrl);
    expect(variants[2]!.tecidos[0]!.nome).toBe('Sarja azul');
    expect(variants[2]!.tecidos[0]!.id).not.toBe(variants[1]!.tecidos[0]!.id);
  });
  it('cria uma variante vazia somente após escolher Nova variante e a recupera no rascunho', async () => {
    const record = item();
    record.fichaTecnica!.tamanhos = ['P', 'M', 'G'];
    record.imagemCroquiUrl = record.fichaTecnica!.variantes![0]!.imagemUrl;
    const save = vi.fn();
    const view = render(
      <PecaFichaTecnicaView
        peca={record}
        colecao={colecao}
        marca={marca}
        onBack={() => {}}
        onUpdatePeca={save}
      />
    );
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Azul' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Nova variante' }));
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Criar variante' })).getByRole('button', {
        name: 'Nova variante',
      })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Esta variante ainda não tem imagem')).toBeDefined();
    expect(screen.getByRole('region', { name: 'Tecidos — Variante 3' }).textContent).toContain(
      'Nenhum tecido nesta variante'
    );
    expect(screen.getByRole('region', { name: 'Aviamentos — Variante 3' }).textContent).toContain(
      'Nenhum aviamento nesta variante'
    );
    expect(screen.getByText('Salvando alterações da variante automaticamente…')).toBeDefined();
    expect(save).not.toHaveBeenCalled();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = save.mock.calls[0]![0] as PecaItem;
    const created = saved.fichaTecnica!.variantes![2]!;
    expect(created).toMatchObject({ nome: 'Variante 3', tecidos: [], aviamentos: [] });
    expect(created.id).not.toBe(record.fichaTecnica!.variantes![0]!.id);
    for (const field of [
      'imagemUrl',
      'imagemAnexoId',
      'imagemNome',
      'corProdutoLinx',
      'corBasicaLinx',
      'custos',
      'precificacao',
    ])
      expect(created[field as keyof typeof created]).toBeUndefined();
    expect(saved.fichaTecnica!.variantes!.slice(0, 2)).toEqual(record.fichaTecnica!.variantes!);
    expect(saved.fichaTecnica!.tamanhos).toEqual(record.fichaTecnica!.tamanhos);
    expect(api.post).not.toHaveBeenCalled();
    view.unmount();
    render(
      <PecaFichaTecnicaView
        peca={saved}
        colecao={colecao}
        marca={marca}
        onBack={() => {}}
        onUpdatePeca={save}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Variante 3' }));
    expect(screen.getByText('Esta variante ainda não tem imagem')).toBeDefined();
    expect(screen.getByRole('region', { name: 'Tecidos — Variante 3' }).textContent).toContain(
      'Nenhum tecido nesta variante'
    );
  });
  it('cancelar ou fechar a escolha com ESC não cria variante e restaura o foco', async () => {
    const save = await open();
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    const add = screen.getByRole('button', { name: '+ Nova variante' });
    add.focus();
    fireEvent.click(add);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(add);
    fireEvent.click(add);
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Criar variante' })).getByRole('button', {
        name: 'Cancelar',
      })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getAllByRole('tab', { name: /Selecionar variante/ })).toHaveLength(2);
    expect(screen.queryByText('Salvando alterações da variante automaticamente…')).toBeNull();
    expect(save).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });
  it('abre e foca os campos pendentes, inclusive consumo por tamanho recolhido', async () => {
    const record = item();
    record.fichaTecnica!.tamanhos = ['P'];
    record.fichaTecnica!.variantes![0]!.aviamentos[0]!.componente = 'elastico';
    record.fichaTecnica!.variantes![0]!.tecidos[0]!.custo = 'inválido';
    render(
      <PecaFichaTecnicaView
        peca={record}
        colecao={colecao}
        marca={marca}
        onBack={() => {}}
        onUpdatePeca={vi.fn()}
      />
    );
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByText('Opções'));
    fireEvent.click(screen.getByRole('button', { name: 'Conferir ficha' }));
    const consumption = screen
      .getByText(/Areia.*Botão de demonstração: preencha o consumo do elástico no tamanho P/)
      .closest('li')!;
    fireEvent.click(within(consumption).getByRole('button', { name: 'Abrir aviamentos' }));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByLabelText('Consumo tamanho P — Botão de demonstração')
      )
    );
    expect(
      screen
        .getByRole('button', { name: 'Consumo por tamanho de Botão de demonstração' })
        .getAttribute('aria-expanded')
    ).toBe('true');
    const price = screen
      .getByText(/Areia.*Linho areia: informe preço manual válido/)
      .closest('li')!;
    fireEvent.click(within(price).getByRole('button', { name: 'Abrir tecidos' }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText('Preço por Metros (R$)'))
    );
    const grade = screen
      .getByText('Confirme que a grade contém todos os tamanhos da peça, não somente o piloto.')
      .closest('li')!;
    fireEvent.click(within(grade).getByRole('button', { name: 'Abrir geral' }));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('checkbox', {
          name: 'Confirmei em Geral todos os tamanhos da grade, não somente o piloto',
        })
      )
    );
  });
  it('mostra resumo ao vivo, valida o nome e mantém detalhes técnicos disponíveis no modal', () => {
    const save = vi.fn();
    const close = vi.fn();
    render(<CriarTecidoModal isOpen editingTecido={null} onSave={save} onClose={close} />);
    fireEvent.click(screen.getByRole('button', { name: 'Criar insumo' }));
    expect(screen.getByRole('alert')).toBeDefined();
    fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: 'Linho natural' } });
    fireEvent.change(screen.getByLabelText('Preço do insumo'), { target: { value: '42,50' } });
    expect(
      within(screen.getByRole('complementary', { name: 'Resumo do insumo' })).getByText(
        'Linho natural'
      )
    ).toBeDefined();
    expect(screen.getByText('Detalhes técnicos · opcional')).toBeDefined();
    expect(screen.getByLabelText('Gramatura (g/m²)')).toBeDefined();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
  });
  it('apresenta legenda e datas de movimentação reais no cronograma e permite filtrar o antes/depois', () => {
    const record: PecaItem = {
      ...item(),
      etapaAtual: '03 modelagem',
      historicoAlteracoes: [
        {
          id: 'a',
          tipo: 'alteracao',
          secao: 'Etapas',
          titulo: 'Etapas atualizadas',
          nomePeca: 'Peça',
          registradoEm: '2026-10-02T15:00:00Z',
          responsavel: { id: 'u1', nome: 'Ana' },
          campos: [
            { campo: 'Etapa', antes: '01 geração de ficha', depois: '02 engenharia recebimento' },
          ],
        },
        {
          id: 'b',
          tipo: 'alteracao',
          secao: 'Etapas',
          titulo: 'Modelagem recebida',
          nomePeca: 'Peça',
          registradoEm: '2026-10-05T15:00:00Z',
          responsavel: { id: 'u2', nome: 'Bia' },
          campos: [
            { campo: 'Etapa', antes: '02 engenharia recebimento', depois: '03 modelagem' },
            { campo: 'Descrição', antes: 'A', depois: 'B' },
          ],
        },
      ],
    };
    const view = render(<FichaGraficosPanel peca={record} />);
    expect(screen.getByText('Hoje')).toBeDefined();
    expect(
      within(screen.getByLabelText('Legenda do cronograma')).getByText('Concluído')
    ).toBeDefined();
    expect(screen.getAllByText('02 engenharia recebimento').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/02\/10\/2026/).length).toBeGreaterThan(0);
    view.unmount();
    render(<FichaAlteracoesPanel peca={record} />);
    fireEvent.change(screen.getByLabelText('Filtrar por responsável'), {
      target: { value: 'Bia' },
    });
    fireEvent.change(screen.getByLabelText('Filtrar por campo'), {
      target: { value: 'Descrição' },
    });
    expect(screen.queryByText('Etapas atualizadas')).toBeNull();
    expect(screen.getByText('Modelagem recebida')).toBeDefined();
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
  });
});
