import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { api } from '../services/api';
import { proximaEtapaNumerica } from '../services/fichaFluxos';
import { formatarCusto } from '../services/fichaProcesso';
import { LOCAL_PECAS_KEY, savePecaLocal } from '../services/localPecasStorage';
import { confirmarAusentesTeste } from './fixtures/conferencia';
import { marca, colecao, peca } from '../../tests/manual/precificacao/fixtures';
import type { PecaItem } from '../types/plm';
import type { UserRecord } from '../types/gestao';

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

const usuarios: UserRecord[] = [
  {
    id: 'operador',
    nome: 'Responsável teste',
    email: 'teste@example.invalid',
    marcas: [marca.id],
    status: 'Ativo',
    acesso: 'Permitido',
    brandRoles: [{ marcaId: marca.id, marcaNome: marca.nome, cargo: 'Estilista', times: [] }],
  },
];
const resumo = () => within(screen.getByRole('group', { name: 'Resumo da ficha' }));
const dinheiro = (valor: number) => formatarCusto(valor).replace(/\u00a0/g, ' ');
const valorResumo = (campo: string) =>
  resumo()
    .getByText(campo, { exact: true })
    .parentElement!.querySelector('strong')!
    .textContent!.replace(/\u00a0/g, ' ');

async function abrir(item = peca, save = vi.fn()) {
  const view = render(
    <PecaFichaTecnicaView
      peca={item}
      marca={marca}
      colecao={colecao}
      usuarios={usuarios}
      onBack={() => {}}
      onUpdatePeca={save}
    />
  );
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}
function fichaConferida(etapaAtual = '01 geração de ficha') {
  const item = structuredClone(peca);
  item.etapaAtual = etapaAtual;
  item.fichaTecnica!.tamanhos = ['P', 'M'];
  item.fichaTecnica!.conferencia = { gradeCompleta: true };
  return confirmarAusentesTeste(item);
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(api.post).mockResolvedValue({ valida: true, pendencias: [] });
});
afterEach(cleanup);

describe('Cabeçalho ligado à ficha', () => {
  it('acompanha custos, preço aprovado e variante sem usar os valores antigos da peça', async () => {
    const save = vi.fn(savePecaLocal);
    const view = await abrir({ ...peca, custo: 999, preco: 900 }, save);
    expect(valorResumo('Custo')).toBe(dinheiro(110));
    expect(valorResumo('Preço')).toBe(dinheiro(313.5));
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    fireEvent.change(screen.getByLabelText('Consumo (Metros)'), { target: { value: '3' } });
    expect(valorResumo('Custo')).toBe(dinheiro(160));
    expect(valorResumo('Preço')).toBe(dinheiro(456));
    fireEvent.click(screen.getByRole('button', { name: 'Precificação' }));
    fireEvent.change(screen.getByLabelText('Preço aprovado'), { target: { value: '300' } });
    expect(valorResumo('Preço')).toBe(dinheiro(300));
    fireEvent.change(screen.getByLabelText('Variante da precificação'), {
      target: { value: 'outra' },
    });
    expect(valorResumo('Custo')).toBe(dinheiro(50));
    expect(valorResumo('Preço')).toBe(dinheiro(142.5));
    fireEvent.change(screen.getByLabelText('Preço aprovado'), { target: { value: '0' } });
    expect(valorResumo('Preço')).toBe(dinheiro(0));
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = JSON.parse(localStorage.getItem(LOCAL_PECAS_KEY)!) as PecaItem[];
    expect(saved[0]).toMatchObject({ custo: 999, preco: 900 });
    view.unmount();
    await abrir(saved[0]!);
    expect(valorResumo('Custo')).toBe(dinheiro(160));
    expect(valorResumo('Preço')).toBe(dinheiro(300));
  });

  it('mostra custo e preço zero, e deixa sem valor quando o consumo está ausente', async () => {
    const item = structuredClone(peca);
    item.fichaTecnica!.variantes![0]!.tecidos[0]!.custo = '0';
    item.fichaTecnica!.variantes![0]!.aviamentos[0]!.quantidade = '0';
    await abrir(item);
    expect(valorResumo('Custo')).toBe(dinheiro(0));
    expect(valorResumo('Preço')).toBe(dinheiro(0));
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    fireEvent.change(screen.getByLabelText('Consumo (Metros)'), { target: { value: '' } });
    expect(valorResumo('Custo')).toBe('Definir');
    expect(valorResumo('Preço')).toBe('Definir');
  });

  it('avança diretamente, salva localmente e reabre sem perder o rascunho', async () => {
    const save = vi.fn(savePecaLocal);
    const view = await abrir({ ...fichaConferida(), responsavel: usuarios[0]!.nome }, save);
    expect(screen.queryByRole('button', { name: 'Comentar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Salvar rascunho' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Avançar' }).previousElementSibling).toBe(
      screen.getByRole('button', { name: 'Sinal da ficha' })
    );
    expect(screen.getByRole('button', { name: 'Avançar' }).nextElementSibling).toBe(
      screen.getByRole('button', { name: 'Integrar no Linx' })
    );
    fireEvent.change(screen.getByPlaceholderText('Digite a descrição detalhada do produto...'), {
      target: { value: 'Rascunho preservado no avanço' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.queryByLabelText('Nova Etapa')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(valorResumo('Etapa')).toBe('02 engenharia recebimento');
    expect(api.post).not.toHaveBeenCalled();
    const saved = JSON.parse(localStorage.getItem(LOCAL_PECAS_KEY)!) as PecaItem[];
    expect(saved[0]).toMatchObject({
      etapaAtual: '02 engenharia recebimento',
      responsavel: usuarios[0]!.nome,
      fichaTecnica: { descricao: 'Rascunho preservado no avanço' },
    });
    view.unmount();
    await abrir(saved[0]!, save);
    expect(valorResumo('Etapa')).toBe('02 engenharia recebimento');
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(valorResumo('Etapa')).toBe('03 modelagem');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.post).not.toHaveBeenCalled();
    const avancada = JSON.parse(localStorage.getItem(LOCAL_PECAS_KEY)!) as PecaItem[];
    expect(avancada[0]!.etapaAtual).toBe('03 modelagem');
  });

  it('avança de 01 para 02 sem depender do serviço de conferência', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Conferência indisponível'));
    const save = vi.fn(savePecaLocal);
    await abrir(fichaConferida(), save);
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(valorResumo('Etapa')).toBe('02 engenharia recebimento');
    expect(save).toHaveBeenCalledOnce();
    expect(api.post).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('mantém a etapa atual quando falha o armazenamento', async () => {
    const save = vi.fn(() => {
      throw new Error('Armazenamento indisponível');
    });
    await abrir(fichaConferida(), save);
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(
      screen.getByText('Não foi possível salvar o avanço. A peça permanece na etapa anterior.')
    ).toBeDefined();
    expect(valorResumo('Etapa')).toBe('01 geração de ficha');
    expect(localStorage.getItem(LOCAL_PECAS_KEY)).toBeNull();
    expect(api.post).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('avança de 19 para Final e impede reiniciar o fluxo após salvar', async () => {
    await abrir(fichaConferida('19 aprovação da piloto'), vi.fn(savePecaLocal));
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    await waitFor(() => expect(valorResumo('Etapa')).toBe('20 Final'));
    expect((screen.getByRole('button', { name: 'Avançar' }) as HTMLButtonElement).disabled).toBe(
      true
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('inicia uma peça legada em 01 diretamente e mantém a movimentação manual', async () => {
    const save = vi.fn();
    await abrir(peca, save);
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(valorResumo('Etapa')).toBe('01 geração de ficha');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(save).toHaveBeenCalledOnce();
    expect(api.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Entregar / alterar etapa' }));
    expect((screen.getByLabelText('Nova Etapa') as HTMLSelectElement).disabled).toBe(false);
    expect((screen.getByLabelText('Nova Etapa') as HTMLSelectElement).value).toBe(
      '01 geração de ficha'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(valorResumo('Etapa')).toBe('01 geração de ficha');
    expect(save).toHaveBeenCalledOnce();
  });

  it('cancelar a alteração manual pelo campo Etapa não movimenta nem salva a peça', async () => {
    const save = vi.fn();
    await abrir(fichaConferida(), save);
    fireEvent.click(screen.getByRole('button', { name: 'Entregar / alterar etapa' }));
    expect(screen.getByRole('dialog', { name: 'Fluxos de etapas' })).toBeDefined();
    fireEvent.change(screen.getByLabelText('Nova Etapa'), {
      target: { value: '02 engenharia recebimento' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(valorResumo('Etapa')).toBe('01 geração de ficha');
    expect(save).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });
});

describe('Sequência de etapas autorizada', () => {
  it.each([
    ['21 Inicial', '01 geração de ficha'],
    ['GERACAO FICHA', '02 engenharia recebimento'],
    ['13 estoque de aviamentos', '14 pilotagem/costura'],
    ['PILOTAGEM_COSTURA', '15 CD lavanderia'],
    ['APROVACAO_PILOTO_CM', '20 Final'],
    ['20 Final', null],
    ['Final', null],
    ['22 Integração Linx', null],
    ['CM desconhecida', null],
  ])('a partir de %s sugere %s', (atual, destino) => {
    expect(proximaEtapaNumerica(atual)).toBe(destino);
  });
});
