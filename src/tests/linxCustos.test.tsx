import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { LinxFichaCustosPanel } from '../pages/Home/components/LinxFichaCustosPanel';
import {
  filtrarMateriaisCustoLinx,
  numeroCustoLinx,
  posicaoCustoLinx,
  textoCustoLinx,
  valorCustoLinx,
} from '../services/linxCustos';
import type { LinxFichaCustos, LinxFichaValor } from '../types/linx';

afterEach(cleanup);

function materialTeste(
  material: string,
  corProduto: string,
  posicao: number,
  valores: Record<string, LinxFichaValor> = {}
) {
  return {
    PRODUTO: 'TESTE',
    VERSAO_FICHA: '00002',
    ITEM: '01',
    MATERIAL: material,
    DESC_MATERIAL: `Material de teste ${material}`,
    GRUPO: 'TECIDO',
    COR_PRODUTO: corProduto,
    COR_MATERIAL: 'C1',
    DESC_COR_MATERIAL: 'Cor de teste',
    POSICAO: posicao,
    TAMANHO: posicao === 1 ? 'P' : 'M',
    CONSUMO: 2,
    PRECO_COR_A_VISTA: 10,
    PRECO_COR_REPOSICAO: 11,
    PRECO_MATERIAL_A_VISTA: 0,
    PRECO_MATERIAL_REPOSICAO: null,
    FATOR_CONVERSAO: 1,
    PORCENTAGEM_CONSUMO: 100,
    UNID_FICHA_TEC: 'KG',
    UNID_ESTOQUE: 'KG',
    SEMI_ACABADO: false,
    IGNORAR_EM_FORMACAO_PRECO: false,
    CUSTO_CONSUMO_LINX: 20,
    STATUS_CALCULO: 'CALCULADO',
    FONTE_PRECO: 'MATERIAIS_CORES.CUSTO_A_VISTA',
    FONTE_CONSUMO: `PRODUTO_VERSAO_MATERIAL.C${posicao}`,
    FONTE_FORMULA: 'Expressão auditada retornada pelo backend',
    ...valores,
  };
}

function dadosTeste(): LinxFichaCustos {
  return {
    versao: {
      produto: 'TESTE',
      versao: '00002',
      descricao: 'Ficha de teste',
      dataCriacao: null,
      responsavel: null,
      status: null,
      colecaoCodigo: '025',
      colecaoNome: 'Coleção de teste',
    },
    bancoOrigem: 'BANCO_TESTE',
    tamanhos: [],
    materiais: [
      materialTeste('A', '01', 1),
      materialTeste('B', '01', 2),
      materialTeste('C', '02', 1, { CUSTO_CONSUMO_LINX: 30 }),
    ],
    fornecedores: [],
    operacoes: [],
    outrosCustos: [],
    precosProduto: [],
    diagnostico: [],
    avisos: [],
  };
}

describe('Custos do Linx — dados originais sem suposições', () => {
  it('o resumo compacto preserva o resultado original e a seleção de cor e tamanho', () => {
    const dados = dadosTeste();
    dados.materiais[0]!.CUSTO_CONSUMO_LINX = 123.456789;
    const original = structuredClone(dados);
    render(
      <LinxFichaCustosPanel compact dados={dados} loading={false} error="" onReload={vi.fn()} />
    );
    const tabela = screen.getByRole('table', { name: 'Custos dos insumos por cor e tamanho' });
    expect(within(tabela).getByText(/123,456789/)).toBeDefined();
    expect(within(tabela).queryByText(/20,0000/)).toBeNull();
    expect(within(tabela).queryByText('MATERIAIS_CORES.CUSTO_A_VISTA')).toBeNull();
    const detalhes = screen.getByText('Detalhes da consulta').closest('details')!;
    expect(detalhes.open).toBe(false);
    fireEvent.change(screen.getByLabelText('Tamanho'), { target: { value: '2' } });
    expect(within(tabela).getByText('Material de teste B')).toBeDefined();
    expect(within(tabela).queryByText('Material de teste A')).toBeNull();
    fireEvent.change(screen.getByLabelText('Cor'), { target: { value: '02' } });
    expect(within(tabela).getByText('Material de teste C')).toBeDefined();
    expect(within(tabela).getByText(/30,0000/)).toBeDefined();
    expect(dados).toEqual(original);
  });

  it('o resumo compacto mantém preço zero e total não informado separados', () => {
    const dados = dadosTeste();
    dados.materiais = [
      materialTeste('A', '01', 1, {
        PRECO_COR_A_VISTA: 0,
        PRECO_MATERIAL_A_VISTA: 999,
        CUSTO_CONSUMO_LINX: null,
        STATUS_CALCULO: 'PENDENTE_DADOS',
      }),
    ];
    render(
      <LinxFichaCustosPanel compact dados={dados} loading={false} error="" onReload={vi.fn()} />
    );
    const tabela = screen.getByRole('table', { name: 'Custos dos insumos por cor e tamanho' });
    const celulas = within(tabela).getAllByRole('cell');
    expect(celulas[2]?.textContent).toMatch(/0,0000/);
    expect(celulas[3]?.textContent).toBe('Não informado');
    expect(within(tabela).queryByText(/999,0000/)).toBeNull();
  });

  it('distingue valor zero, informação ausente e texto não numérico', () => {
    expect(valorCustoLinx(0)).toBe('0');
    expect(valorCustoLinx(0, true)).toMatch(/0,0000/);
    expect(valorCustoLinx(null, true)).toBe('Não informado');
    expect(valorCustoLinx(undefined)).toBe('Não informado');
    expect(valorCustoLinx('  ')).toBe('Não informado');
    expect(textoCustoLinx(false)).toBe('Não');
    expect(numeroCustoLinx('13.98000')).toBe(13.98);
    expect(numeroCustoLinx('13,98000')).toBeNull();
    expect(numeroCustoLinx(true)).toBeNull();
    expect(numeroCustoLinx(Number.NaN)).toBeNull();
  });

  it('filtra insumos apenas pela cor do produto e posição explícitas', () => {
    const dados = dadosTeste();
    expect(filtrarMateriaisCustoLinx(dados.materiais, '02', 1)).toHaveLength(1);
    expect(filtrarMateriaisCustoLinx(dados.materiais, '01', 2)[0]?.MATERIAL).toBe('B');
    expect(filtrarMateriaisCustoLinx(dados.materiais, '01', null)).toEqual([]);
    expect(posicaoCustoLinx({ POSICAO: 10 })).toBe(10);
    expect(posicaoCustoLinx({ POSICAO: 48 })).toBe(48);
    expect(posicaoCustoLinx({ POSICAO: 49 })).toBeNull();
    const original = structuredClone(dados);
    render(<LinxFichaCustosPanel dados={dados} loading={false} error="" onReload={vi.fn()} />);
    const tabela = screen.getByRole('table', { name: 'Custos dos insumos por cor e tamanho' });
    expect(within(tabela).getByText('Material de teste A')).toBeDefined();
    expect(within(tabela).queryByText('Material de teste B')).toBeNull();
    fireEvent.change(screen.getByLabelText('Tamanho / posição de consumo'), {
      target: { value: '2' },
    });
    expect(within(tabela).getByText('Material de teste B')).toBeDefined();
    expect(within(tabela).queryByText('Material de teste A')).toBeNull();
    fireEvent.change(screen.getByLabelText('Cor do produto no Linx'), { target: { value: '02' } });
    expect(within(tabela).getByText('Material de teste C')).toBeDefined();
    expect(within(tabela).queryByText('Material de teste B')).toBeNull();
    expect(dados).toEqual(original);
  });

  it('mostra a expressão auditada, fontes e resultado do backend sem recalcular', () => {
    const dados = dadosTeste();
    dados.materiais = [materialTeste('A', '01', 1, { CUSTO_CONSUMO_LINX: 123.456789 })];
    render(<LinxFichaCustosPanel dados={dados} loading={false} error="" onReload={vi.fn()} />);
    expect(screen.getByText('BANCO_TESTE')).toBeDefined();
    expect(screen.getByText(/Cn × MATERIAIS_CORES.CUSTO_A_VISTA/)).toBeDefined();
    const tabela = screen.getByRole('table', { name: 'Custos dos insumos por cor e tamanho' });
    expect(within(tabela).getByText(/123,456789/)).toBeDefined();
    expect(screen.getByText(/não substitui preço da cor/)).toBeDefined();
    expect(screen.getByText(/não são snapshots históricos/)).toBeDefined();
    expect(screen.getByText(/Terceiros permanecem fora do cálculo do portal/)).toBeDefined();
  });

  it('preserva preço zero e custo pendente sem preenchê-lo com preço geral ou fornecedor', () => {
    const dados = dadosTeste();
    dados.materiais = [
      materialTeste('A', '01', 1, {
        PRECO_COR_A_VISTA: 0,
        PRECO_MATERIAL_A_VISTA: 999,
        CONSUMO: null,
        FATOR_CONVERSAO: null,
        CUSTO_CONSUMO_LINX: null,
        STATUS_CALCULO: 'PENDENTE_DADOS',
        TAMANHO: null,
      }),
    ];
    render(<LinxFichaCustosPanel dados={dados} loading={false} error="" onReload={vi.fn()} />);
    const tabela = screen.getByRole('table', { name: 'Custos dos insumos por cor e tamanho' });
    const celulas = within(tabela).getAllByRole('cell');
    expect(celulas[2]?.textContent).toMatch(/0,0000/);
    expect(celulas[5]?.textContent).toBe('Não informado');
    expect(celulas[6]?.textContent).toContain('Dados necessários ausentes');
    expect(celulas[6]?.textContent).toContain('PENDENTE_DADOS');
    expect(screen.getByRole('option', { name: 'Posição 1 — tamanho não informado' })).toBeDefined();
  });

  it('não soma diagnóstico original nem confunde serviços com o total do portal', () => {
    const dados = dadosTeste();
    dados.diagnostico = [
      {
        COR_PRODUTO: '01',
        MATERIAL: 'X',
        CUSTO_MATERIAL1: 14,
        TOTAL_CUSTO1: 17,
        COSTURA: 2,
        LAVANDERIA: 1,
      },
      {
        COR_PRODUTO: '01',
        MATERIAL: 'Y',
        CUSTO_MATERIAL1: 14,
        TOTAL_CUSTO1: 17,
        COSTURA: 2,
        LAVANDERIA: 1,
      },
      { COR_PRODUTO: '02', MATERIAL: 'Z', CUSTO_MATERIAL1: 100, TOTAL_CUSTO1: 200 },
    ];
    render(<LinxFichaCustosPanel dados={dados} loading={false} error="" onReload={vi.fn()} />);
    expect(screen.getByText('Diagnóstico original do Linx — não é total do portal')).toBeDefined();
    expect(screen.getByText(/não somar as linhas/)).toBeDefined();
    expect(screen.getByText(/materiais de EMBALAGEM/)).toBeDefined();
    const tabela = screen.getByRole('table', { name: 'Diagnóstico original de custos do Linx' });
    expect(within(tabela).getAllByText(/17,0000/)).toHaveLength(2);
    expect(within(tabela).queryByText('Z')).toBeNull();
    expect(within(tabela).queryByText(/34,0000/)).toBeNull();
  });

  it('oferece atualização, loading e erro sem fabricar dados', () => {
    const atualizar = vi.fn();
    const { rerender } = render(
      <LinxFichaCustosPanel
        dados={null}
        loading={false}
        error="Falha na consulta"
        onReload={atualizar}
      />
    );
    expect(screen.getByRole('alert').textContent).toBe('Falha na consulta');
    expect(screen.queryByRole('table')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar consulta de custos' }));
    expect(atualizar).toHaveBeenCalledOnce();
    rerender(<LinxFichaCustosPanel dados={null} loading error="" onReload={atualizar} />);
    expect(screen.getByRole('status')).toBeDefined();
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('identifica o rascunho, não associa variantes locais e não infere coleção da ficha', () => {
    const dados = dadosTeste();
    dados.versao.colecaoCodigo = null;
    dados.versao.colecaoNome = null;
    render(
      <LinxFichaCustosPanel
        dados={dados}
        loading={false}
        error=""
        onReload={vi.fn()}
        temEdicoesLocais
        colecaoAtual={{ codigo: '026', nome: 'Coleção atual de teste' }}
      />
    );
    expect(screen.getByText(/Rascunho local preservado/)).toBeDefined();
    expect(screen.getByText(/não recalculam suas edições nem variantes/)).toBeDefined();
    expect(screen.getByText('Coleção atual da peça (validada)')).toBeDefined();
    expect(screen.getByText('026 · Coleção atual de teste')).toBeDefined();
    expect(
      screen.getByText(/COR_PRODUTO não é associado automaticamente às variantes locais/)
    ).toBeDefined();
    expect(screen.getByText(/Não há associação histórica presumida por data/)).toBeDefined();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });

  it('mantém custo não informado quando o item cruza materiais, sem transformar ausência em zero', () => {
    const dados = dadosTeste();
    dados.materiais = [
      materialTeste('A', '01', 1, {
        ITEM_REUTILIZADO: true,
        STATUS_CALCULO: 'PENDENTE_VINCULO_ITEM',
        CUSTO_CONSUMO_LINX: null,
        PRECO_COR_A_VISTA: 0,
      }),
    ];
    render(<LinxFichaCustosPanel dados={dados} loading={false} error="" onReload={vi.fn()} />);
    const tabela = screen.getByRole('table', { name: 'Custos dos insumos por cor e tamanho' });
    const celulas = within(tabela).getAllByRole('cell');
    expect(celulas[2]?.textContent).toMatch(/0,0000/);
    expect(celulas[5]?.textContent).toBe('Não informado');
    expect(celulas[5]?.textContent).not.toMatch(/0,0000/);
    expect(celulas[6]?.textContent).toContain('Item reutilizado entre materiais');
    expect(celulas[6]?.textContent).toContain('PENDENTE_VINCULO_ITEM');
    expect(screen.getByText(/pode haver cruzamento de origens/)).toBeDefined();
  });

  it('prioriza a coleção explícita da ficha sem substituí-la pela coleção atual da peça', () => {
    render(
      <LinxFichaCustosPanel
        dados={dadosTeste()}
        loading={false}
        error=""
        onReload={vi.fn()}
        colecaoAtual={{ codigo: '026', nome: 'Coleção atual de teste' }}
      />
    );
    expect(screen.getByText('Coleção da ficha integrada')).toBeDefined();
    expect(screen.getByText('025 · Coleção de teste')).toBeDefined();
    expect(screen.queryByText('026 · Coleção atual de teste')).toBeNull();
  });

  it('separa tabelas comerciais e fornecedores por fonte sem escolha automática', () => {
    const dados = dadosTeste();
    dados.precosProduto = [
      { FONTE: 'PRODUTOS.CUSTO_REPOSICAO1', CUSTO_REPOSICAO1: 42, PRECO1: null },
    ];
    dados.fornecedores = [
      {
        MATERIAL: 'A',
        COR_MATERIAL: 'C1',
        FORNECEDOR: 'Fornecedor de teste',
        CUSTO_FORNECEDOR: 90,
      },
    ];
    render(<LinxFichaCustosPanel dados={dados} loading={false} error="" onReload={vi.fn()} />);
    expect(screen.getByText('PRODUTOS.CUSTO_REPOSICAO1')).toBeDefined();
    expect(screen.getByText(/Nenhuma fonte\/tabela é escolhida como custo oficial/)).toBeDefined();
    expect(screen.getByText('Fornecedor de teste')).toBeDefined();
    const materiais = screen.getByRole('table', { name: 'Custos dos insumos por cor e tamanho' });
    expect(within(materiais).queryByText(/90,0000/)).toBeNull();
  });
});
