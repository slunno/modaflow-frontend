import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { FichaInsumosEditor } from '../pages/Home/components/FichaInsumosEditor';
import { getProductUsoKey, readProductUsos, saveProductUso } from '../services/productUsoStorage';
import type { FichaInsumo } from '../types/ficha';

const item: FichaInsumo = {
  id: 'insumo-teste',
  nome: 'Insumo de teste',
  codigo: '',
  temErp: false,
  fornecedores: '',
  custo: '',
  unidade: 'Metros',
  observacoes: 'Detalhes de teste',
  propriedades: {
    gramatura: '100',
    largura: '1.5',
    rendimento1: '10',
    rendimento2: '6.67',
    encolhimento: 'Valor de teste',
    construcao: '',
  },
};
function Editor({
  produto = 'Produto de teste',
  tipo = 'tecido',
}: {
  produto?: string;
  tipo?: 'tecido' | 'aviamento';
}) {
  const [items, setItems] = useState<FichaInsumo[]>([structuredClone(item)]);
  return <FichaInsumosEditor tipo={tipo} items={items} onChange={setItems} produto={produto} />;
}

describe('Uso compartilhado e expansão de insumos', () => {
  beforeEach(() => localStorage.clear());
  it.each(['tecido', 'aviamento'] as const)(
    'salva Uso de %s e o disponibiliza em outra peça sem preenchê-la automaticamente',
    (tipo) => {
      const first = render(<Editor tipo={tipo} />);
      expect(screen.queryByRole('option', { name: 'Área de teste' })).toBeNull();
      fireEvent.change(screen.getByLabelText(/^Uso do (tecido|aviamento)$/), {
        target: { value: ' Área de teste ' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar uso' }));
      expect(readProductUsos(getProductUsoKey('Produto de teste', tipo))).toEqual([
        'Área de teste',
      ]);
      first.unmount();
      const second = render(<Editor tipo={tipo} />);
      expect((screen.getByLabelText(/^Uso do (tecido|aviamento)$/) as HTMLInputElement).value).toBe(
        ''
      );
      fireEvent.focus(screen.getByLabelText(/^Uso do (tecido|aviamento)$/));
      fireEvent.click(screen.getByRole('option', { name: 'Área de teste' }));
      expect((screen.getByLabelText(/^Uso do (tecido|aviamento)$/) as HTMLInputElement).value).toBe(
        'Área de teste'
      );
      second.unmount();
      render(<Editor tipo={tipo} produto="Outro produto de teste" />);
      fireEvent.focus(screen.getByLabelText(/^Uso do (tecido|aviamento)$/));
      expect(screen.queryByRole('option', { name: 'Área de teste' })).toBeNull();
    }
  );

  it.each(['tecido', 'aviamento'] as const)(
    'minimiza e expande %s sem perder Uso ou Encolhimento',
    (tipo) => {
      render(<Editor tipo={tipo} />);
      const expand = screen.getByRole('button', { name: 'Expandir' });
      const details = document.getElementById(expand.getAttribute('aria-controls')!);
      expect(details?.hidden).toBe(true);
      fireEvent.change(screen.getByLabelText(/^Uso do (tecido|aviamento)$/), {
        target: { value: 'Uso temporário' },
      });
      fireEvent.change(screen.getByLabelText('Encolhimento'), { target: { value: 'Atualizado' } });
      fireEvent.click(expand);
      expect(details?.hidden).toBe(false);
      expect(screen.getByText('Detalhes de teste')).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Minimizar' }));
      expect(details?.hidden).toBe(true);
      expect((screen.getByLabelText(/^Uso do (tecido|aviamento)$/) as HTMLInputElement).value).toBe(
        'Uso temporário'
      );
      expect((screen.getByLabelText('Encolhimento') as HTMLInputElement).value).toBe('Atualizado');
    }
  );

  it('isola tipo de peça e de insumo, evita duplicatas e não confirma gravação recusada', () => {
    const key = getProductUsoKey('Produto de teste', 'tecido');
    saveProductUso(key, 'Área de teste');
    saveProductUso(key, ' área DE teste ');
    expect(readProductUsos(key)).toEqual(['Área de teste']);
    expect(readProductUsos(getProductUsoKey('Outro produto', 'tecido'))).toEqual([]);
    expect(readProductUsos(getProductUsoKey('Produto de teste', 'aviamento'))).toEqual([]);
    const view = render(<Editor />);
    fireEvent.change(screen.getByLabelText(/^Uso do (tecido|aviamento)$/), {
      target: { value: 'Novo uso de teste' },
    });
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota', 'QuotaExceededError');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar uso' }));
    expect(screen.getByRole('alert').textContent).toContain('Não foi possível salvar');
    expect(readProductUsos(key)).toEqual(['Área de teste']);
    spy.mockRestore();
    view.unmount();
  });

  it.each(['tecido', 'aviamento'] as const)(
    'recupera os usos antigos de %s de todas as marcas sem misturar peças, categorias ou apagar registros anteriores',
    (tipo) => {
      const first = `modaflow_product_usos_v1:marca-a:overshirt:${tipo}`;
      const second = `modaflow_product_usos_v1:marca-b:OVERSHIRT:${tipo}`;
      localStorage.setItem(first, JSON.stringify(['Gola', 'Punho']));
      localStorage.setItem(second, JSON.stringify([' gola ', 'Vista']));
      localStorage.setItem(
        `modaflow_product_usos_v1:marca-c:blusa:${tipo}`,
        JSON.stringify(['Manga da blusa'])
      );
      const otherTipo = tipo === 'tecido' ? 'aviamento' : 'tecido';
      localStorage.setItem(
        `modaflow_product_usos_v1:marca-a:overshirt:${otherTipo}`,
        JSON.stringify(['Outro catálogo'])
      );
      const key = getProductUsoKey('OVERSHIRT', tipo);
      expect(readProductUsos(key)).toEqual(['Gola', 'Punho', 'Vista']);
      expect(localStorage.getItem(key)).toBeNull();
      saveProductUso(key, 'Forro');
      expect(readProductUsos(key)).toEqual(['Gola', 'Punho', 'Vista', 'Forro']);
      expect(JSON.parse(localStorage.getItem(first)!)).toEqual(['Gola', 'Punho']);
      expect(JSON.parse(localStorage.getItem(second)!)).toEqual([' gola ', 'Vista']);
    }
  );

  it.each(['tecido', 'aviamento'] as const)(
    'separa os catálogos de %s dos 23 tipos identificados na API e aceita novos tipos sem configuração adicional',
    (categoria) => {
      const tipos = [
        'AVENTAL',
        'BATA',
        'BERMUDA',
        'BLAZER',
        'BLUSA',
        'CALÇA',
        'CAMISA',
        'CAMISETA',
        'CASACO',
        'COLETE',
        'CONJUNTO',
        'CUECA',
        'JAQUETA',
        'MACACÃO',
        'MALHÃO',
        'MOLETOM',
        'OVERSHIRT',
        'PIJAMA',
        'POLO',
        'REGATA',
        'SHORTS',
        'SUNGA',
        'TRICOT',
        'Novo tipo futuro',
      ];
      for (const tipo of tipos) saveProductUso(getProductUsoKey(tipo, categoria), `Uso de ${tipo}`);
      for (const tipo of tipos)
        expect(readProductUsos(getProductUsoKey(tipo.toLowerCase(), categoria))).toEqual([
          `Uso de ${tipo}`,
        ]);
      expect(readProductUsos(getProductUsoKey('  calca  ', categoria))).toEqual(['Uso de CALÇA']);
    }
  );

  it('abre as opções somente ao clicar, permite pesquisar e escolher pelo teclado e fecha com Escape', () => {
    const key = getProductUsoKey('Produto de teste', 'tecido');
    saveProductUso(key, 'Gola');
    saveProductUso(key, 'Punho');
    render(<Editor />);
    const input = screen.getByRole('combobox', { name: 'Uso do tecido' });
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.click(input);
    expect(screen.getByRole('listbox')).toBeDefined();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect((input as HTMLInputElement).value).toBe('Punho');
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'gol' } });
    expect(screen.getByRole('option', { name: 'Gola' })).toBeDefined();
    expect(screen.queryByRole('option', { name: 'Punho' })).toBeNull();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('atualiza outros seletores abertos do mesmo tipo sem preencher automaticamente o outro insumo', () => {
    render(
      <>
        <div role="group" aria-label="Peça X1">
          <Editor />
        </div>
        <div role="group" aria-label="Peça X2">
          <Editor />
        </div>
        <div role="group" aria-label="Peça Y">
          <Editor produto="Outro tipo" />
        </div>
      </>
    );
    const first = within(screen.getByRole('group', { name: 'Peça X1' }));
    const second = within(screen.getByRole('group', { name: 'Peça X2' }));
    const other = within(screen.getByRole('group', { name: 'Peça Y' }));
    fireEvent.click(second.getByLabelText(/^Uso do (tecido|aviamento)$/));
    fireEvent.click(other.getByLabelText(/^Uso do (tecido|aviamento)$/));
    fireEvent.change(first.getByLabelText(/^Uso do (tecido|aviamento)$/), {
      target: { value: 'Gola' },
    });
    fireEvent.click(first.getByRole('button', { name: 'Salvar uso' }));
    expect(second.getByRole('option', { name: 'Gola' })).toBeDefined();
    expect((second.getByLabelText(/^Uso do (tecido|aviamento)$/) as HTMLInputElement).value).toBe(
      ''
    );
    expect(other.queryByRole('option', { name: 'Gola' })).toBeNull();
  });

  it('recebe usos salvos por outra aba do navegador', () => {
    render(<Editor />);
    fireEvent.click(screen.getByLabelText(/^Uso do (tecido|aviamento)$/));
    const key = getProductUsoKey('Produto de teste', 'tecido');
    act(() => {
      localStorage.setItem(key, JSON.stringify(['Manga']));
      window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }));
    });
    expect(screen.getByRole('option', { name: 'Manga' })).toBeDefined();
  });
});
