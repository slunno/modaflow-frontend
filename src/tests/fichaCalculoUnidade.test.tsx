import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import {
  baseConsumoInsumo,
  conferirFicha,
  contratoConferencia,
  custoConsumo,
  normalizarUnidadeInsumo,
} from '../services/fichaProcesso';
import { custoInsumosVariante } from '../services/fichaPrecificacao';
import { FichaInsumoCard } from '../pages/Home/components/FichaInsumoCard';
import { FichaCustosView } from '../pages/Home/components/FichaCustosView';
import { CriarTecidoModal } from '../pages/Gestao/modals/CriarTecidoModal';
import type { FichaInsumo, FichaVariante } from '../types/ficha';
import type { PecaItem } from '../types/plm';
import { confirmarAusentesTeste } from './fixtures/conferencia';

afterEach(cleanup);

const tecido: FichaInsumo = {
  id: 'tecido-teste',
  nome: 'Tecido de teste por kg',
  codigo: 'MATERIAL-TESTE',
  custo: '79,43',
  unidade: 'Kg',
  consumo: '1,45',
  peso: '0,406',
  quantidade: '99',
  temErp: false,
  fornecedores: '',
};
const variante: FichaVariante = {
  id: 'principal',
  nome: 'Principal',
  tecidos: [tecido],
  aviamentos: [],
};

function pecaComInsumo(item = tecido): PecaItem {
  return confirmarAusentesTeste({
    id: 'peca-teste',
    colecaoId: 'colecao-teste',
    nome: 'Peça de teste',
    codigo: 'CODIGO-TESTE',
    tipo: 'Peça',
    status: 'Em andamento',
    etapaAtual: '',
    tema: '',
    colecaoNome: 'Coleção de teste',
    marcaNome: 'Marca de teste',
    estilista: '',
    tecidos: [],
    previsaoEntrega: '',
    fichaTecnica: {
      tamanhos: ['P'],
      conferencia: { gradeCompleta: true },
      variantes: [{ ...variante, tecidos: [item] }],
    },
  });
}

describe('Base do custo manual por unidade, sem conversões', () => {
  it.each(['Kg', 'KG', ' kg ', 'quilo', 'quilos', 'quilograma', 'quilogramas'])(
    'tecido em %s utiliza somente peso, nunca metragem ou quantidade',
    (unidade) => {
      const item = { ...tecido, unidade };
      expect(normalizarUnidadeInsumo(unidade)).toBe('kg');
      expect(baseConsumoInsumo(item, 'tecidos')).toMatchObject({ campo: 'peso', valor: '0,406' });
      expect(custoConsumo(item, 'tecidos')).toBeCloseTo(32.24858, 8);
      expect(item.unidade).toBe(unidade);
    }
  );

  it.each(['M', 'MT', 'mts', 'Metro', 'Metros', ' metros '])(
    'tecido em %s utiliza consumo sem aproveitar peso',
    (unidade) => {
      const item = { ...tecido, unidade, custo: '10', consumo: '0,25', peso: '99' };
      expect(normalizarUnidadeInsumo(unidade)).toBe('metros');
      expect(baseConsumoInsumo(item, 'tecidos')).toMatchObject({ campo: 'consumo', valor: '0,25' });
      expect(custoConsumo(item, 'tecidos')).toBe(2.5);
    }
  );

  it.each(['Unidade', 'UN', 'UND', 'UNID', 'unidades', 'KG', 'MT'])(
    'aviamento em %s utiliza quantidade na unidade declarada',
    (unidade) => {
      const item = { ...tecido, unidade, custo: '0,3671', quantidade: '2' };
      expect(baseConsumoInsumo(item, 'aviamentos')).toMatchObject({
        campo: 'quantidade',
        valor: '2',
      });
      expect(custoConsumo(item, 'aviamentos')).toBeCloseTo(0.7342, 8);
    }
  );

  it.each([undefined, '', '-1', 'abc', '1.234,56', '1e2'])(
    'peso ausente ou inválido (%s) não utiliza consumo como fallback',
    (peso) => {
      expect(custoConsumo({ ...tecido, peso }, 'tecidos')).toBeNull();
    }
  );

  it.each(['', 'GR', 'CM', 'RL', 'pares', 'unidade-desconhecida'])(
    'unidade %s permanece pendente mesmo com preço e quantidades válidas',
    (unidade) => {
      expect(custoConsumo({ ...tecido, unidade }, 'tecidos')).toBeNull();
      expect(custoConsumo({ ...tecido, unidade }, 'aviamentos')).toBeNull();
    }
  );

  it('mantém zero explícito distinto de ausência, sem arredondar o custo intermediário', () => {
    expect(custoConsumo({ ...tecido, peso: '0' }, 'tecidos')).toBe(0);
    expect(custoConsumo({ ...tecido, custo: '0' }, 'tecidos')).toBe(0);
    expect(custoConsumo({ ...tecido, peso: '' }, 'tecidos')).toBeNull();
    expect(custoInsumosVariante(variante).total).toBeCloseTo(32.24858, 8);
    expect(custoInsumosVariante({ ...variante, tecidos: [{ ...tecido, peso: '' }] })).toMatchObject(
      { total: null, pendentes: 1 }
    );
  });

  it('conferência recebe e valida a quantidade na unidade do preço sem alterar a metragem', () => {
    const item = pecaComInsumo();
    expect(contratoConferencia(item).variantes[0]!.insumos[0]!.consumoGeral).toBe('0,406');
    expect(item.fichaTecnica!.variantes![0]!.tecidos[0]!.consumo).toBe('1,45');
    const invalido = pecaComInsumo({ ...tecido, peso: '-1' });
    expect(conferirFicha(invalido)).toEqual([
      expect.objectContaining({ mensagem: expect.stringContaining('peso em kg') }),
    ]);
    expect(
      contratoConferencia(pecaComInsumo({ ...tecido, peso: '' })).variantes[0]!.insumos[0]!
        .consumoGeral
    ).toBe('');
  });
});

describe('Apresentação da base utilizada no custo', () => {
  it('cartão identifica peso/kg e mantém os campos independentes', () => {
    const onUpdate = vi.fn();
    render(
      <FichaInsumoCard
        item={tecido}
        tipo="tecido"
        produto="Peça de teste"
        usoKey="uso-teste-unidade"
        onUpdate={onUpdate}
        onEdit={() => {}}
        onRemove={() => {}}
      />
    );
    expect(screen.getByText(/^Custo do consumo:/).textContent).toContain('32,2486');
    expect((screen.getByLabelText('Peso (Kg)') as HTMLInputElement).value).toBe('0,406');
    expect(
      (
        screen.getByLabelText(
          'Metragem de referência (opcional, sem conversão)'
        ) as HTMLInputElement
      ).value
    ).toBe('1,45');
    fireEvent.change(screen.getByLabelText('Peso (Kg)'), { target: { value: '0,5' } });
    expect(onUpdate).toHaveBeenLastCalledWith({ peso: '0,5' });
  });

  it('Custos mostra o peso multiplicado e o mesmo total da Precificação', () => {
    render(<FichaCustosView variante={variante} variantes={[variante]} onEditInsumos={() => {}} />);
    const linha = screen.getByRole('rowheader', { name: /Tecido de teste por kg/ }).closest('tr')!;
    expect(within(linha).getByText('Peso: 0,406 Kg')).toBeDefined();
    expect(within(linha).getByText(/32,2486/)).toBeDefined();
    const total = screen.getByRole('rowheader', { name: 'Total' }).closest('tr')!;
    expect(within(total).getByText(/32,2486/)).toBeDefined();
    const porVariante = screen.getByRole('table', { name: 'Custo por variante' });
    expect(within(porVariante).getAllByText(/32,2486/)).toHaveLength(2);
    expect(within(porVariante).getAllByRole('cell').at(-1)?.textContent).toBe('Não informado');
    expect(screen.queryByText('1,45 Kg')).toBeNull();
  });

  it('abrir e salvar um insumo M não troca a unidade nem descarta sua metragem', () => {
    const onSave = vi.fn();
    render(
      <CriarTecidoModal
        isOpen
        editingTecido={{ ...tecido, unidade: 'M' }}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave.mock.calls[0]![0]).toMatchObject({
      unidade: 'M',
      consumo: '1,45',
      peso: '0,406',
    });
  });

  it('o resumo mantém subtotal e total pendentes até todos os insumos terem custo válido', () => {
    const pendente: FichaVariante = {
      ...variante,
      tecidos: [tecido, { ...tecido, id: 'pendente', nome: 'Insumo pendente', custo: '' }],
    };
    const { rerender } = render(
      <FichaCustosView variante={pendente} variantes={[pendente]} onEditInsumos={() => {}} />
    );
    const subtotal = screen.getByRole('rowheader', { name: 'Subtotal de tecidos' }).closest('tr')!;
    const total = screen.getByRole('rowheader', { name: 'Total' }).closest('tr')!;
    expect(within(subtotal).getByText('Não informado')).toBeDefined();
    expect(within(total).getByText('Não informado')).toBeDefined();
    const completa = {
      ...pendente,
      tecidos: pendente.tecidos.map((item) => ({ ...item, custo: '79,43' })),
    };
    rerender(
      <FichaCustosView variante={completa} variantes={[completa]} onEditInsumos={() => {}} />
    );
    expect(within(subtotal).getByText(/64,4972/)).toBeDefined();
    expect(within(total).getByText(/64,4972/)).toBeDefined();
  });
});
