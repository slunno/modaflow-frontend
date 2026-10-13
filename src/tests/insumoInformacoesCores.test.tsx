import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CriarTecidoModal } from '../pages/Gestao/modals/CriarTecidoModal';
import { FichaInsumoCard } from '../pages/Home/components/FichaInsumoCard';
import { getLinxMaterialCadastro } from '../services/linxService';
import { precoAutomaticoDoFornecedor } from '../services/insumoLinxVinculos';
import {
  camposDaCor,
  completarInformacoesCores,
  coresComDadosLegados,
  mesclarCamposDaCor,
  escolherFornecedorDaCor,
} from '../services/insumoInformacoesCores';
import { custoConsumo } from '../services/fichaProcesso';
import type { LinxMaterialCadastro } from '../types/linx';
import type { TecidoCorItem, TecidoInsumoItem } from '../types/gestao';
import type { FichaInsumo } from '../types/ficha';

vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxMaterialCadastro: vi.fn(),
  getLinxCoresBasicas: vi.fn().mockResolvedValue([]),
}));
const fornecedores = [
  { id: 's1', codigo: 'S1', fornecedor: 'Fornecedor A', materialLinxCodigo: 'MAT' },
  { id: 's2', codigo: 'S2', fornecedor: 'Fornecedor B', materialLinxCodigo: 'MAT' },
];
function material(): LinxMaterialCadastro {
  return {
    codigo: 'MAT',
    nome: 'Tecido teste',
    grupo: 'TECIDOS',
    unidadeEstoque: 'MT',
    unidadeFichaTecnica: 'MT',
    largura: 1.5,
    comprimento: null,
    altura: null,
    rendimento: null,
    cores: ['Azul', 'Verde', 'Branco'].map((nome, indice) => ({
      MATERIAL: 'MAT',
      CODIGO_COR: `C${indice + 1}`,
      NOME_COR: nome,
      GRAMATURA: 200,
      TEC_ENCOLHIMENTO_CORTE_X: null,
      TEC_ENCOLHIMENTO_CORTE_Y: null,
      TEC_ENCOLHIMENTO_ACABAMENTO_X: null,
      TEC_ENCOLHIMENTO_ACABAMENTO_Y: null,
      TEC_ENCOLHIMENTO_LAVAGEM_X: null,
      TEC_ENCOLHIMENTO_LAVAGEM_Y: null,
      CUSTO_A_VISTA: 999,
      CUSTO_REPOSICAO: 888,
    })),
    fornecedores: [
      {
        CODIGO_COR: 'C1',
        NOME_COR: 'Azul',
        CODIGO_FORNECEDOR: 'S1',
        FORNECEDOR: 'Fornecedor A',
        UNIDADE: 'MT',
        FATOR_CONVERSAO_FORNECEDOR: 1,
        CUSTO_REPOSICAO: '10.12345',
        FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      },
      {
        CODIGO_COR: 'C2',
        NOME_COR: 'Verde',
        CODIGO_FORNECEDOR: 'S1',
        FORNECEDOR: 'Fornecedor A',
        UNIDADE: 'MT',
        FATOR_CONVERSAO_FORNECEDOR: 1,
        CUSTO_REPOSICAO: '20.54321',
        FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      },
      {
        CODIGO_COR: 'C3',
        NOME_COR: 'Branco',
        CODIGO_FORNECEDOR: 'S2',
        FORNECEDOR: 'Fornecedor B',
        UNIDADE: 'MT',
        FATOR_CONVERSAO_FORNECEDOR: 1,
        CUSTO_REPOSICAO: '30',
        FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      },
    ],
  };
}
function cores(): TecidoCorItem[] {
  return ['Azul', 'Verde'].map((nome, indice) => ({
    id: `c${indice + 1}`,
    nome,
    codigo: `C${indice + 1}`,
    hex: '',
    origemLinx: { materialCodigo: 'MAT', corCodigo: `C${indice + 1}`, corNome: nome },
  }));
}
function insumo(): FichaInsumo {
  const lista = completarInformacoesCores(cores(), material(), [fornecedores[0]!], 'Metros');
  return {
    id: 'i',
    nome: 'Tecido teste',
    codigo: 'MAT',
    custo: '10.12345',
    unidade: 'Metros',
    temErp: false,
    fornecedores: 'Fornecedor A',
    fornecedoresList: [fornecedores[0]!],
    coresList: lista,
    corEmEdicaoId: 'c1',
  };
}
beforeEach(() => {
  localStorage.clear();
  vi.mocked(getLinxMaterialCadastro).mockReset().mockResolvedValue(material());
});
afterEach(cleanup);
const input = (nome: string) => screen.getByLabelText(nome) as HTMLInputElement;
const selecionarAbaCor = (nome: string, codigo: string) =>
  fireEvent.click(screen.getByRole('tab', { name: `Editar dados da cor ${nome} (${codigo})` }));

describe('Preço de fornecedor e armazenamento independente por cor', () => {
  it('uma cor personalizada mantém o preço manual ao selecionar fornecedor', () => {
    const personalizada: TecidoCorItem = {
      id: 'local',
      nome: 'Cor exclusiva',
      hex: '#123456',
      dadosInsumo: { custo: '17,5555', unidade: 'Metros', precoManual: true },
    };
    expect(
      escolherFornecedorDaCor(personalizada, material(), fornecedores[0], 'Metros').dadosInsumo
    ).toMatchObject({
      custo: '17,5555',
      precoManual: true,
      fornecedorCodigo: 'S1',
      precoLinx: undefined,
    });
  });
  it('usa o fornecedor e a cor exatos, não custo geral/da cor nem fornecedor diferente', () => {
    expect(precoAutomaticoDoFornecedor(material(), 'C1', 'S1', 'Metros')).toMatchObject({
      valor: '10.12345',
      fonte: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      fornecedorCodigo: 'S1',
      corCodigo: 'C1',
    });
    expect(precoAutomaticoDoFornecedor(material(), 'C1', 'S2', 'Metros')).toBeNull();
    expect(precoAutomaticoDoFornecedor(material(), 'C1', 'S1', 'Kg')).toBeNull();
  });
  it('nulo/vazio não vira zero; zero legítimo é preservado; conflito não escolhe primeira linha', () => {
    const cadastro = material();
    for (const valor of [null, '']) {
      cadastro.fornecedores![0]!.CUSTO_REPOSICAO = valor;
      expect(precoAutomaticoDoFornecedor(cadastro, 'C1', 'S1', 'MT')).toBeNull();
    }
    cadastro.fornecedores![0]!.CUSTO_REPOSICAO = '0.00000';
    expect(precoAutomaticoDoFornecedor(cadastro, 'C1', 'S1', 'MT')?.valor).toBe('0.00000');
    cadastro.fornecedores!.push({ ...cadastro.fornecedores![0]!, CUSTO_REPOSICAO: '7' });
    expect(precoAutomaticoDoFornecedor(cadastro, 'C1', 'S1', 'MT')).toBeNull();
  });
  it('cada cor recebe seu próprio valor; manual e quantidades sobrevivem à reconsulta', () => {
    const preenchidas = completarInformacoesCores(
      cores(),
      material(),
      [fornecedores[0]!],
      'Metros'
    );
    expect(preenchidas.map((cor) => cor.dadosInsumo?.custo)).toEqual(['10.12345', '20.54321']);
    preenchidas[0]!.dadosInsumo = {
      ...preenchidas[0]!.dadosInsumo!,
      custo: '17,1111',
      consumo: '1,2',
      precoManual: true,
      precoLinx: undefined,
    };
    expect(
      completarInformacoesCores(preenchidas, material(), [fornecedores[0]!], 'Metros')[0]!
        .dadosInsumo
    ).toMatchObject({ custo: '17,1111', consumo: '1,2', precoManual: true });
  });
  it('migra só o contexto antigo e não copia seu preço/consumo para as demais cores', () => {
    const antigo = { ...insumo(), custo: '7', consumo: '2', coresList: cores() };
    const migradas = coresComDadosLegados(antigo);
    expect(migradas[0]!.dadosInsumo).toMatchObject({ custo: '7', consumo: '2' });
    expect(migradas[1]!.dadosInsumo).toBeUndefined();
  });
  it('cálculo usa só a cor em foco, sem somar nem tirar média; peso e metros continuam separados', () => {
    const item = insumo();
    item.coresList![0]!.dadosInsumo!.custo = '10';
    item.coresList![0]!.dadosInsumo!.consumo = '2';
    item.coresList![1]!.dadosInsumo!.custo = '20';
    item.coresList![1]!.dadosInsumo!.consumo = '3';
    expect(custoConsumo(item, 'tecidos')).toBe(20);
    expect(custoConsumo({ ...item, ...camposDaCor(item.coresList!, 'c2') }, 'tecidos')).toBe(60);
    expect(
      custoConsumo({ ...item, corEmEdicaoId: undefined, corLinx: undefined }, 'tecidos')
    ).toBeNull();
    item.coresList![0]!.dadosInsumo!.unidade = 'Kg';
    item.coresList![0]!.dadosInsumo!.peso = '0,5';
    expect(custoConsumo(item, 'tecidos')).toBe(5);
  });
});

describe('Menu opcional na criação e no insumo criado', () => {
  it('bloqueia a rolagem da página atrás do cadastro e a restaura ao fechar', () => {
    const anterior = document.body.style.overflow;
    const view = render(
      <CriarTecidoModal isOpen editingTecido={null} onSave={vi.fn()} onClose={vi.fn()} />
    );
    expect(document.body.style.overflow).toBe('hidden');
    view.unmount();
    expect(document.body.style.overflow).toBe(anterior);
  });
  it.each(['tecido', 'aviamento'] as const)(
    'filtra pelo fornecedor e permite fechar/salvar/reabrir preços independentes de %s',
    async (tipo) => {
      const save = vi.fn();
      const original: TecidoInsumoItem = {
        id: 'i',
        nome: 'Tecido',
        codigo: 'MAT',
        custo: '',
        unidade: 'Metros',
        fornecedores: '',
        temErp: false,
      };
      const view = render(
        <CriarTecidoModal
          isOpen
          tipo={tipo}
          editingTecido={original}
          onSave={save}
          onClose={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
      await screen.findByText(/^Material encontrado/);
      fireEvent.click(screen.getByRole('button', { name: 'Adicionar fornecedor' }));
      fireEvent.focus(screen.getByRole('combobox', { name: 'Fornecedor' }));
      fireEvent.click(screen.getByRole('option', { name: 'Fornecedor A — S1' }));
      const seletor = screen.getByRole('combobox', { name: `Cores do ${tipo} no Linx` });
      fireEvent.click(seletor);
      expect(screen.queryByRole('option', { name: 'Branco (C3)' })).toBeNull();
      fireEvent.click(screen.getByRole('option', { name: 'Azul (C1)' }));
      fireEvent.click(screen.getByRole('option', { name: 'Verde (C2)' }));
      expect(screen.queryByRole('region', { name: 'Informações por cor' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Editar informação das cores' }));
      expect(screen.getByRole('region', { name: 'Informações por cor' })).toBeDefined();
      expect(
        within(screen.getByRole('region', { name: 'Formulário do insumo' })).queryByRole('region', {
          name: 'Informações por cor',
        })
      ).toBeNull();
      expect(
        within(screen.getByRole('complementary', { name: 'Editor lateral de cores' })).getByRole(
          'region',
          { name: 'Informações por cor' }
        )
      ).toBeDefined();
      expect(input('Preço da cor Verde').value).toBe('20.54321');
      expect(screen.queryByLabelText('Preço da cor Azul')).toBeNull();
      selecionarAbaCor('Azul', 'C1');
      expect(input('Preço da cor Azul').value).toBe('10.12345');
      fireEvent.change(input('Preço da cor Azul'), { target: { value: '17,2222' } });
      fireEvent.change(
        input(tipo === 'tecido' ? 'Consumo da cor Azul' : 'Quantidade da cor Azul'),
        { target: { value: '1,5' } }
      );
      fireEvent.click(screen.getByRole('button', { name: 'Fechar informações por cor' }));
      expect(screen.queryByRole('region', { name: 'Informações por cor' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
      const salvo = save.mock.calls[0]![0] as TecidoInsumoItem;
      expect(salvo.coresList![0]!.dadosInsumo).toMatchObject({
        custo: '17,2222',
        precoManual: true,
      });
      expect(salvo.coresList![1]!.dadosInsumo?.custo).toBe('20.54321');
      view.unmount();
      render(
        <CriarTecidoModal
          isOpen
          tipo={tipo}
          editingTecido={salvo}
          onSave={vi.fn()}
          onClose={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Editar informação das cores' }));
      expect(input('Preço da cor Azul').value).toBe('17,2222');
      expect(
        input(tipo === 'tecido' ? 'Consumo da cor Azul' : 'Quantidade da cor Azul').value
      ).toBe('1,5');
      selecionarAbaCor('Verde', 'C2');
      expect(input('Preço da cor Verde').value).toBe('20.54321');
    }
  );
  it.each(['tecido', 'aviamento'] as const)(
    'sincroniza inclusão/remoção no painel lateral de %s sem apagar as cores mantidas',
    async (tipo) => {
      const save = vi.fn();
      render(
        <CriarTecidoModal isOpen tipo={tipo} editingTecido={null} onSave={save} onClose={vi.fn()} />
      );
      fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'MAT' } });
      fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
      await screen.findByText(/^Material encontrado/);
      const seletor = screen.getByRole('combobox', { name: `Cores do ${tipo} no Linx` });
      fireEvent.click(seletor);
      fireEvent.click(screen.getByRole('option', { name: 'Azul (C1)' }));
      const botao = screen.getByRole('button', { name: 'Editar informação das cores' });
      expect(botao.getAttribute('aria-expanded')).toBe('false');
      fireEvent.click(botao);
      expect(botao.getAttribute('aria-expanded')).toBe('true');
      fireEvent.change(input('Preço da cor Azul'), { target: { value: '17,2222' } });
      const campoQuantidade = tipo === 'tecido' ? 'Consumo' : 'Quantidade';
      fireEvent.change(input(`${campoQuantidade} da cor Azul`), { target: { value: '1,5' } });

      fireEvent.click(screen.getByRole('option', { name: 'Verde (C2)' }));
      expect(input('Preço da cor Verde')).toBeDefined();
      selecionarAbaCor('Azul', 'C1');
      expect(input('Preço da cor Azul').value).toBe('17,2222');
      fireEvent.click(screen.getByRole('option', { name: 'Azul (C1)' }));
      expect(screen.queryByLabelText('Preço da cor Azul')).toBeNull();
      expect(screen.queryByRole('tab', { name: 'Editar dados da cor Azul (C1)' })).toBeNull();
      selecionarAbaCor('Verde', 'C2');
      fireEvent.change(input('Preço da cor Verde'), { target: { value: '29,3333' } });
      fireEvent.change(input(`${campoQuantidade} da cor Verde`), { target: { value: '2,5' } });

      fireEvent.click(screen.getByRole('option', { name: 'Branco (C3)' }));
      expect(input('Preço da cor Branco')).toBeDefined();
      selecionarAbaCor('Verde', 'C2');
      expect(input('Preço da cor Verde').value).toBe('29,3333');
      fireEvent.click(screen.getByRole('button', { name: 'Remover cor Branco' }));
      expect(screen.queryByLabelText('Preço da cor Branco')).toBeNull();
      expect(screen.queryByRole('tab', { name: 'Editar dados da cor Branco (C3)' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Fechar informações por cor' }));
      expect(screen.queryByRole('complementary', { name: 'Editor lateral de cores' })).toBeNull();
      expect(botao.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(botao);
      fireEvent.click(botao);
      expect(input('Preço da cor Verde').value).toBe('29,3333');
      expect(input(`${campoQuantidade} da cor Verde`).value).toBe('2,5');
      expect(save).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Criar insumo' }));
      expect(save).toHaveBeenCalledOnce();
      const salvo = save.mock.calls[0]![0] as TecidoInsumoItem;
      expect(salvo.coresList).toHaveLength(1);
      expect(salvo.coresList![0]!.dadosInsumo).toMatchObject({
        custo: '29,3333',
        [tipo === 'tecido' ? 'consumo' : 'quantidade']: '2,5',
      });
    }
  );
  it('mantém o painel vazio aberto, inclui novas cores e limita Escape ao painel antes do cadastro', () => {
    const close = vi.fn();
    render(<CriarTecidoModal isOpen editingTecido={insumo()} onSave={vi.fn()} onClose={close} />);
    const botao = screen.getByRole('button', { name: 'Editar informação das cores' });
    fireEvent.click(botao);
    const fechar = screen.getByRole('button', { name: 'Fechar informações por cor' });
    expect(document.activeElement).toBe(fechar);
    const salvar = screen.getByRole('button', { name: 'Salvar alterações' });
    fireEvent.keyDown(fechar, { key: 'Tab', shiftKey: true });
    // O editor faz parte do mesmo diálogo e compartilha sua navegação de teclado.
    const concluir = screen.getByRole('button', { name: 'Concluir' });
    concluir.focus();
    fireEvent.keyDown(concluir, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Fechar' }));
    salvar.focus();
    fireEvent.click(screen.getByRole('button', { name: 'Remover cor Azul' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover cor Verde' }));
    expect(
      screen.getByText('Nenhuma cor selecionada. Adicione uma cor no formulário do insumo.')
    ).toBeDefined();
    expect(screen.getByRole('complementary', { name: 'Editor lateral de cores' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar cor personalizada' }));
    fireEvent.change(screen.getByLabelText('Nome da cor'), {
      target: { value: 'Cor personalizada de teste' },
    });
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Selecionar ou criar cor' })).getByRole('button', {
        name: /^Adicionar$/,
      })
    );
    expect(input('Preço da cor Cor personalizada de teste').value).toBe('');
    fireEvent.change(input('Preço da cor Cor personalizada de teste'), {
      target: { value: '11,5' },
    });
    expect(input('Preço do insumo').value).toBe('11,5');
    fireEvent.click(screen.getByRole('button', { name: 'Remover cor Cor personalizada de teste' }));
    expect(screen.queryByLabelText('Preço da cor Cor personalizada de teste')).toBeNull();
    fireEvent.keyDown(fechar, { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    expect(screen.queryByRole('complementary', { name: 'Editor lateral de cores' })).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Adicionar cor personalizada' })
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });
  it('navega entre cores pelo teclado, edita uma por vez e mantém seus valores', () => {
    render(<CriarTecidoModal isOpen editingTecido={insumo()} onSave={vi.fn()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar informação das cores' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    const azul = screen.getByRole('tab', { name: 'Editar dados da cor Azul (C1)' });
    expect(azul.getAttribute('aria-selected')).toBe('true');
    fireEvent.change(input('Preço da cor Azul'), { target: { value: '42,5' } });
    fireEvent.keyDown(azul, { key: 'ArrowRight' });
    const verde = screen.getByRole('tab', { name: 'Editar dados da cor Verde (C2)' });
    expect(verde.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(verde);
    expect(screen.queryByLabelText('Preço da cor Azul')).toBeNull();
    expect(input('Preço da cor Verde').value).toBe('20.54321');
    fireEvent.change(input('Observações da cor Verde'), { target: { value: 'Teste por cor' } });
    fireEvent.keyDown(verde, { key: 'Home' });
    expect(input('Preço da cor Azul').value).toBe('42,5');
    fireEvent.keyDown(azul, { key: 'End' });
    expect(input('Observações da cor Verde').value).toBe('Teste por cor');
  });
  it.each(['tecido', 'aviamento'] as const)(
    'abre pelo chip, conclui e reabre sem perder os dados de %s',
    (tipo) => {
      const save = vi.fn();
      render(
        <CriarTecidoModal
          isOpen
          tipo={tipo}
          editingTecido={insumo()}
          onSave={save}
          onClose={vi.fn()}
        />
      );
      expect(screen.queryByRole('complementary', { name: 'Editor lateral de cores' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Editar cor Azul (C1)' }));
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Fechar informações por cor' })
      );
      fireEvent.change(input('Preço da cor Azul'), { target: { value: '42,50' } });
      fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
      expect(screen.queryByRole('complementary', { name: 'Editor lateral de cores' })).toBeNull();
      expect(input('Preço do insumo').value).toBe('42,50');
      expect(save).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Editar cor Azul (C1)' }));
      expect(input('Preço da cor Azul').value).toBe('42,50');
    }
  );
  function Card() {
    const [item, setItem] = useState(insumo());
    return (
      <FichaInsumoCard
        item={item}
        tipo="tecido"
        produto="Teste"
        usoKey="teste"
        onUpdate={(changes) => setItem((antes) => mesclarCamposDaCor(antes, changes))}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );
  }
  it('botão do card reabre após criação e preserva uma correção manual em consultas seguintes', async () => {
    render(<Card />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar informações por cor' }));
    await waitFor(() => expect(getLinxMaterialCadastro).toHaveBeenCalledOnce());
    fireEvent.change(input('Preço da cor Azul'), { target: { value: '25,6789' } });
    fireEvent.change(input('Consumo da cor Azul'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Fechar informações por cor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar informações por cor' }));
    await waitFor(() => expect(getLinxMaterialCadastro).toHaveBeenCalledTimes(2));
    expect(input('Preço da cor Azul').value).toBe('25,6789');
    expect(input('Consumo da cor Azul').value).toBe('2');
    expect(input('Preço da cor Verde').value).toBe('20.54321');
  });
  it('resposta atrasada não substitui o valor digitado com a consulta em andamento', async () => {
    let resolve!: (value: LinxMaterialCadastro) => void;
    vi.mocked(getLinxMaterialCadastro).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    render(<Card />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar informações por cor' }));
    fireEvent.change(input('Preço da cor Azul'), { target: { value: '47,12345' } });
    resolve(material());
    await waitFor(() =>
      expect(screen.queryByText('Consultando preços por fornecedor e cor…')).toBeNull()
    );
    expect(input('Preço da cor Azul').value).toBe('47,12345');
  });
  it('dois fornecedores para a mesma cor exigem uma escolha explícita, sem menor preço automático', () => {
    const cadastro = material();
    cadastro.fornecedores!.push({
      ...cadastro.fornecedores![0]!,
      CODIGO_FORNECEDOR: 'S2',
      FORNECEDOR: 'Fornecedor B',
      CUSTO_REPOSICAO: '1',
    });
    const dados = completarInformacoesCores(cores(), cadastro, fornecedores, 'Metros');
    expect(dados[0]!.dadosInsumo?.custo).toBe('');
    expect(dados[1]!.dadosInsumo?.custo).toBe('20.54321');
  });
});
