import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  atualizarConsumoPorTamanho,
  listarConsumosPorTamanho,
  type ConsumosPorTamanho,
} from '../services/fichaConsumoTamanhos';
import { FichaConsumoTamanhosEditor } from '../pages/Home/components/FichaConsumoTamanhosEditor';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import type { ColecaoItem, PecaItem } from '../types/plm';
import type { MarcaSummary } from '../types/auth';
import type { FichaInsumo } from '../types/ficha';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] }),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock('../services/linxService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
}));
vi.mock('../pages/Home/components/MostruarioColorsPicker', () => ({
  MostruarioColorsPicker: () => null,
}));

afterEach(cleanup);

const entrada = (tamanho: string, item = 'Insumo teste') =>
  screen.getByLabelText(`Consumo tamanho ${tamanho} — ${item}`) as HTMLInputElement;
const dispensa = (tamanho: string, item = 'Insumo teste') =>
  screen.getByLabelText(`Não se aplica ao tamanho ${tamanho} — ${item}`) as HTMLInputElement;
const expandir = (item = 'Insumo teste') =>
  fireEvent.click(screen.getByRole('button', { name: `Consumo por tamanho de ${item}` }));

describe('Grade local de consumo por tamanho', () => {
  it('usa nomes exatos da grade, remove duplicados de exibição e não cria entradas em branco', () => {
    const tamanhos = ['M', 'P', 'M', '', '  '];
    expect(listarConsumosPorTamanho(tamanhos)).toEqual([
      { tamanho: 'M', foraGrade: false, consumo: undefined },
      { tamanho: 'P', foraGrade: false, consumo: undefined },
    ]);
    expect(tamanhos).toEqual(['M', 'P', 'M', '', '  ']);
  });

  it('preserva tamanhos fora da grade e a ordem não é interpretada como posição Cn', () => {
    const value = { P: { valor: '0' }, M: { valor: '1,2' }, G: { valor: '2' } };
    expect(listarConsumosPorTamanho(['M', 'P'], value)).toEqual([
      { tamanho: 'M', foraGrade: false, consumo: value.M },
      { tamanho: 'P', foraGrade: false, consumo: value.P },
      { tamanho: 'G', foraGrade: true, consumo: value.G },
    ]);
    expect(listarConsumosPorTamanho([], value).every((linha) => linha.foraGrade)).toBe(true);
  });

  it('edita apenas o tamanho solicitado, sem mutar os dados ou eliminar entradas fora da grade', () => {
    const value = Object.freeze({
      P: Object.freeze({ valor: '0' }),
      G: Object.freeze({ valor: '3', naoSeAplica: true }),
    });
    const updated = atualizarConsumoPorTamanho(value, 'M', { valor: '1,45' });
    expect(updated).toEqual({ ...value, M: { valor: '1,45' } });
    expect(updated).not.toBe(value);
    expect(updated.G).toBe(value.G);
    expect(Object.keys(value)).toEqual(['P', 'G']);
  });

  it('somente uma decisão explícita marca Não se aplica e mantém o valor ao desfazer', () => {
    const zero = atualizarConsumoPorTamanho(undefined, 'P', { valor: '0' });
    const vazio = atualizarConsumoPorTamanho(zero, 'M', { valor: '' });
    expect(zero.P).toEqual({ valor: '0' });
    expect(vazio.M).toEqual({ valor: '' });
    const marked = atualizarConsumoPorTamanho(vazio, 'P', { naoSeAplica: true });
    expect(marked.P).toEqual({ valor: '0', naoSeAplica: true });
    expect(atualizarConsumoPorTamanho(marked, 'P', { naoSeAplica: false }).P).toEqual({
      valor: '0',
      naoSeAplica: false,
    });
  });
});

function Editor({ tamanhos, initial = {} }: { tamanhos: string[]; initial?: ConsumosPorTamanho }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <FichaConsumoTamanhosEditor
        tamanhos={tamanhos}
        nomeInsumo="Insumo teste"
        unidade="KG"
        value={value}
        onChange={setValue}
      />
      <output aria-label="Consumos salvos">{JSON.stringify(value)}</output>
    </>
  );
}

describe('Editor acessível de consumo manual por tamanho', () => {
  it('abre sem escrever dados nem alterar unidade e orienta sobre grade vazia e ERP pendente', () => {
    const onChange = vi.fn();
    render(
      <FichaConsumoTamanhosEditor
        tamanhos={[]}
        nomeInsumo="Insumo teste"
        unidade="M"
        onChange={onChange}
      />
    );
    expect(
      screen
        .getByRole('button', { name: 'Consumo por tamanho de Insumo teste' })
        .getAttribute('aria-expanded')
    ).toBe('false');
    expandir();
    expect(screen.getByText(/Selecione os tamanhos na aba Geral/)).toBeDefined();
    expect(screen.getByText(/mapeamento.*ainda precisa de definição/)).toBeDefined();
    expect(screen.getByText(/Unidade do insumo: M/)).toBeDefined();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('não trata zero/vazio como dispensa e preserva o valor ao marcar e desmarcar', () => {
    render(<Editor tamanhos={['P', 'M']} initial={{ P: { valor: '0' } }} />);
    expandir();
    expect(dispensa('P').checked).toBe(false);
    expect(dispensa('M').checked).toBe(false);
    fireEvent.change(entrada('M'), { target: { value: '1,45' } });
    fireEvent.click(dispensa('M'));
    expect(entrada('M').value).toBe('1,45');
    expect(entrada('M').disabled).toBe(true);
    fireEvent.click(dispensa('M'));
    expect(entrada('M').disabled).toBe(false);
    expect(entrada('M').value).toBe('1,45');
    expect(JSON.parse(screen.getByLabelText('Consumos salvos').textContent!)).toEqual({
      P: { valor: '0' },
      M: { valor: '1,45', naoSeAplica: false },
    });
  });

  it('retirar e recolocar tamanho só altera a exibição, preservando entradas existentes', () => {
    const view = render(
      <Editor tamanhos={['P', 'M']} initial={{ P: { valor: '0' }, M: { valor: '2' } }} />
    );
    expandir();
    view.rerender(<Editor tamanhos={['M']} />);
    expect(screen.getByText('Fora da grade atual')).toBeDefined();
    expect(entrada('P').value).toBe('0');
    fireEvent.change(entrada('M'), { target: { value: '3' } });
    view.rerender(<Editor tamanhos={['P', 'M']} />);
    expect(screen.queryByText('Fora da grade atual')).toBeNull();
    expect(entrada('P').value).toBe('0');
    expect(entrada('M').value).toBe('3');
  });
});

const marca: MarcaSummary = {
  id: 'marca-grade',
  nome: 'King & Joe',
  code: 'KJ',
  initials: 'KJ',
  colecoesCount: 0,
  pecasCount: 0,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const colecao: ColecaoItem = {
  id: 'colecao-grade',
  marcaId: marca.id,
  nome: 'Coleção grade teste',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'integracao-colecao-v1',
};
const tecido: FichaInsumo = {
  id: 'tecido-grade',
  nome: 'Tecido teste',
  codigo: '01',
  temErp: true,
  fornecedores: '',
  custo: '10',
  unidade: 'KG',
  consumo: '2',
  peso: '0,4',
  precoOrigem: 'manual',
  consumoPorTamanho: { P: { valor: '0,3' }, G: { valor: '0' } },
  linxDados: {
    codigo: '01',
    nome: 'Tecido teste',
    grupo: 'TECIDO',
    item: '1',
    cores: [],
    dados: {
      C1: 0.3,
      C2: 0,
      TAMANHO_1: 'P',
      TAMANHO_2: 'G',
      UNID_FICHA_TEC: 'KG',
      CONSUMO_P_TAMANHO: 1,
    },
  },
};
const aviamento: FichaInsumo = {
  id: 'aviamento-grade',
  nome: 'Aviamento teste',
  codigo: '02',
  temErp: false,
  fornecedores: '',
  custo: '2',
  unidade: 'UN',
  quantidade: '1',
  consumoPorTamanho: { P: { valor: '1' } },
};
function makePeca(): PecaItem {
  return {
    id: 'peca-grade',
    marcaId: marca.id,
    colecaoId: colecao.id,
    codigo: '',
    nome: 'Peça grade teste',
    tipo: 'Camisa',
    status: 'Em andamento',
    etapaAtual: '',
    tema: '',
    colecaoNome: colecao.nome,
    marcaNome: marca.nome,
    estilista: '',
    tecidos: [],
    previsaoEntrega: '',
    fichaTecnica: {
      tamanhos: ['P', 'M'],
      variantes: [
        {
          id: 'principal',
          nome: 'Principal',
          tecidos: [structuredClone(tecido)],
          aviamentos: [structuredClone(aviamento)],
        },
        {
          id: 'variante-2',
          nome: 'Outra',
          tecidos: [{ ...structuredClone(tecido), id: 'tecido-variante-2' }],
          aviamentos: [],
        },
      ],
    },
  };
}
function mountFicha(peca = makePeca(), onUpdatePeca = vi.fn()) {
  return render(
    <PecaFichaTecnicaView
      peca={peca}
      colecao={colecao}
      marca={marca}
      onBack={() => {}}
      onUpdatePeca={onUpdatePeca}
    />
  );
}

describe('Consumo por tamanho dentro da ficha e da variante selecionada', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('duplicar a Principal copia seus consumos e permite alteração independente', async () => {
    const save = vi.fn();
    mountFicha(makePeca(), save);
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Nova variante' }));
    fireEvent.click(screen.getByRole('button', { name: 'Duplicar variante' }));
    await waitFor(() =>
      expect(screen.getAllByRole('tab', { name: /Selecionar variante/ })).toHaveLength(3)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    expandir('Tecido teste');
    expect(entrada('P', 'Tecido teste').value).toBe('0,3');
    expect(entrada('G', 'Tecido teste').value).toBe('0');
    fireEvent.change(entrada('P', 'Tecido teste'), { target: { value: '0,6' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const variantes = (save.mock.calls[0]![0] as PecaItem).fichaTecnica!.variantes!;
    expect(variantes[0]!.tecidos[0]!.consumoPorTamanho!.P).toEqual({ valor: '0,3' });
    expect(variantes[2]!.tecidos[0]!.consumoPorTamanho!.P).toEqual({ valor: '0,6' });
    expect(variantes[2]!.tecidos[0]!.consumoPorTamanho!.G).toEqual({ valor: '0' });
    expect(variantes[2]!.aviamentos[0]!.consumoPorTamanho).toEqual({ P: { valor: '1' } });
    expect(variantes[2]!.tecidos[0]!.consumoPorTamanho).not.toBe(
      variantes[0]!.tecidos[0]!.consumoPorTamanho
    );
  });

  it('salva e reabre valores da variante editada sem alterar a Principal, preço/unidade/consumo ou raw Cn', () => {
    const original = makePeca();
    const save = vi.fn();
    const view = mountFicha(original, save);
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    fireEvent.change(screen.getByLabelText('Variante em edição'), {
      target: { value: 'variante-2' },
    });
    expandir('Tecido teste');
    expect(entrada('M', 'Tecido teste').value).toBe('');
    expect(screen.getByText('Fora da grade atual')).toBeDefined();
    fireEvent.change(entrada('M', 'Tecido teste'), { target: { value: '0,45' } });
    fireEvent.click(dispensa('P', 'Tecido teste'));
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = save.mock.calls[0]![0] as PecaItem;
    const principal = saved.fichaTecnica!.variantes![0]!.tecidos[0]!;
    const outra = saved.fichaTecnica!.variantes![1]!.tecidos[0]!;
    expect(principal).toEqual(original.fichaTecnica!.variantes![0]!.tecidos[0]!);
    expect(outra.consumoPorTamanho).toEqual({
      P: { valor: '0,3', naoSeAplica: true },
      M: { valor: '0,45' },
      G: { valor: '0' },
    });
    expect(outra).toMatchObject({ custo: '10', unidade: 'KG', consumo: '2', peso: '0,4' });
    expect(outra.linxDados).toEqual(tecido.linxDados);
    expect(original.fichaTecnica!.variantes![1]!.tecidos[0]!.consumoPorTamanho).not.toHaveProperty(
      'M'
    );
    view.unmount();
    mountFicha(saved);
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    fireEvent.change(screen.getByLabelText('Variante em edição'), {
      target: { value: 'variante-2' },
    });
    expandir('Tecido teste');
    expect(entrada('M', 'Tecido teste').value).toBe('0,45');
    expect(dispensa('P', 'Tecido teste').checked).toBe(true);
    for (const method of [api.post, api.put, api.patch, api.delete])
      expect(method).not.toHaveBeenCalled();
  });

  it('segue mudanças de Geral também em Aviamentos, mantendo valores de tamanhos removidos', () => {
    const save = vi.fn();
    mountFicha(makePeca(), save);
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    fireEvent.click(screen.getByRole('button', { name: 'P', pressed: true }));
    fireEvent.click(screen.getByRole('button', { name: 'G', pressed: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Aviamentos' }));
    expandir('Aviamento teste');
    expect(entrada('G', 'Aviamento teste').value).toBe('');
    expect(entrada('P', 'Aviamento teste').value).toBe('1');
    expect(screen.getByText('Fora da grade atual')).toBeDefined();
    fireEvent.change(entrada('G', 'Aviamento teste'), { target: { value: '2' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = save.mock.calls.at(-1)![0] as PecaItem;
    expect(saved.fichaTecnica!.tamanhos).toEqual(['M', 'G']);
    expect(saved.fichaTecnica!.variantes![0]!.aviamentos[0]!.consumoPorTamanho).toEqual({
      P: { valor: '1' },
      G: { valor: '2' },
    });
    expect(saved.fichaTecnica!.variantes![0]!.aviamentos[0]!.quantidade).toBe('1');
  });
});
