import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { LinxInsumoSources, LinxInsumoDialog } from '../pages/Home/components/LinxInsumoSources';
import { FichaInsumoCard } from '../pages/Home/components/FichaInsumoCard';
import type { LinxFichaCustos, LinxFichaMaterial } from '../types/linx';

const material: LinxFichaMaterial = {
  codigo: 'MAT-TESTE',
  nome: 'Material de teste',
  grupo: 'TECIDO',
  item: '0001',
  dados: {
    PRODUTO: 'TESTE',
    VERSAO_FICHA: '00001',
    CUSTO_A_VISTA: 999,
    CUSTO_REPOSICAO: 555,
    UNID_FICHA_TEC: 'MT',
    UNID_ESTOQUE: 'CN',
    FATOR_CONVERSAO: 100,
    C1: 2,
    TAMANHO_1: 'P',
  },
  cores: [
    {
      COR_PRODUTO: 'A',
      COR_MATERIAL: '01',
      DESC_COR_MATERIAL: 'Cor de teste',
      CUSTO_A_VISTA: 0,
      CUSTO_REPOSICAO: null,
    },
    {
      COR_PRODUTO: 'B',
      COR_MATERIAL: '02',
      DESC_COR_MATERIAL: 'Outra cor',
      CUSTO_A_VISTA: 1.25,
      CUSTO_REPOSICAO: 2,
    },
  ],
};
const custo: LinxFichaCustos = {
  versao: {
    produto: 'TESTE',
    versao: '00001',
    descricao: null,
    dataCriacao: null,
    responsavel: null,
    status: null,
    colecaoCodigo: null,
    colecaoNome: null,
  },
  bancoOrigem: 'Banco de teste',
  tamanhos: [],
  materiais: [
    {
      MATERIAL: 'MAT-TESTE',
      ITEM: '0001',
      COR_PRODUTO: 'A',
      COR_MATERIAL: '01',
      DESC_COR_MATERIAL: 'Cor de teste',
      PRECO_COR_A_VISTA: 7.12345,
      PRECO_COR_REPOSICAO: null,
      PRECO_MATERIAL_A_VISTA: 999,
      PRECO_MATERIAL_REPOSICAO: 555,
      FATOR_CONVERSAO: 100,
      UNID_FICHA_TEC: 'MT',
      UNID_ESTOQUE: 'CN',
    },
  ],
  fornecedores: [],
  operacoes: [],
  outrosCustos: [],
  precosProduto: [],
  diagnostico: [],
  avisos: [],
};

describe('Tela de consulta do insumo Linx', () => {
  it('distingue preço geral, preço da cor zero e preço nulo sem substituição', () => {
    render(<LinxInsumoSources material={material} />);
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[1]?.textContent).toContain('0,00000');
    expect(rows[1]?.textContent).toContain('Não informado');
    expect(rows[1]?.textContent).not.toContain('999');
    expect(screen.getByText(/Estoque: CN · Ficha: MT/)).toBeDefined();
    expect(screen.getByText(/Fator: 100/)).toBeDefined();
  });
  it('abre dados de consulta sem editar, fecha por Escape e devolve o foco', () => {
    const close = vi.fn();
    render(<LinxInsumoDialog material={material} onClose={close} />);
    const dialog = screen.getByRole('dialog', { name: 'Insumo Linx — Material de teste' });
    expect(within(dialog).getByRole('button', { name: 'Fechar consulta do insumo' })).toBe(
      document.activeElement
    );
    expect(within(dialog).queryByRole('textbox')).toBeNull();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });
  it('atualiza somente preços de origem da mesma ficha sem trocar o valor manual do portal', () => {
    const update = vi.fn();
    render(
      <FichaInsumoCard
        item={{
          id: 'linx-00001-0001-MAT-TESTE',
          nome: 'Nome local',
          codigo: 'Código local',
          fornecedores: '',
          custo: '77',
          unidade: 'MT',
          temErp: true,
          linxDados: material,
        }}
        tipo="tecido"
        usoKey="uso-teste"
        produto="Produto teste"
        onUpdate={update}
        onEdit={() => {}}
        onRemove={() => {}}
        custosLinx={custo}
      />
    );
    expect(screen.getByText('R$ 77 / MT', { exact: false })).toBeDefined();
    fireEvent.click(screen.getByText('Detalhes dos preços Linx'));
    expect(screen.getByRole('table').textContent).toContain('7,12345');
    expect(update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Ver insumo Linx' }));
    expect(screen.getByRole('dialog').textContent).toContain('MAT-TESTE');
    expect(screen.getByRole('dialog').textContent).not.toContain('Código local');
  });
  it('não aplica valores consultados para uma versão diferente', () => {
    render(
      <FichaInsumoCard
        item={{
          id: 'linx-00001-0001-MAT-TESTE',
          nome: 'Nome local',
          codigo: 'MAT-TESTE',
          fornecedores: '',
          custo: '',
          unidade: 'MT',
          temErp: true,
          linxDados: material,
        }}
        tipo="tecido"
        usoKey="uso-teste"
        produto="Produto teste"
        onUpdate={() => {}}
        onEdit={() => {}}
        onRemove={() => {}}
        custosLinx={{ ...custo, versao: { ...custo.versao, versao: '00002' } }}
      />
    );
    expect(screen.getByRole('table').textContent).not.toContain('7,12345');
    expect(screen.getByRole('table').textContent).toContain('0,00000');
  });
  it('não substitui fator e unidades nulos atuais pelos valores antigos preservados', () => {
    render(
      <LinxInsumoSources
        material={material}
        linhas={[
          {
            ...custo.materiais[0],
            FATOR_CONVERSAO: null,
            UNID_ESTOQUE: null,
            UNID_FICHA_TEC: null,
          },
        ]}
      />
    );
    expect(screen.getByText('Fator: Não informado')).toBeDefined();
    expect(screen.getByText('Estoque: Não informado · Ficha: Não informado')).toBeDefined();
    expect(screen.queryByText('Fator: 100')).toBeNull();
  });
  it('não certifica atualidade de preços de uma origem salva sem nova consulta', () => {
    render(<LinxInsumoSources material={material} />);
    expect(screen.getByText(/a atualização dos preços ainda não foi confirmada/)).toBeDefined();
  });
});
