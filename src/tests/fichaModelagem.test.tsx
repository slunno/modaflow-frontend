import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { FichaModelagemEditor } from '../pages/Home/components/FichaModelagemEditor';
import type { FichaTabelaMedidas } from '../types/ficha';
import type { PecaItem } from '../types/plm';
import { LOCAL_PECAS_KEY, savePecaLocal } from '../services/localPecasStorage';
import { getLocalStateSnapshot, parseLocalState } from '../services/localStateStorage';
import {
  cadastrarMedidaModelagem,
  lerMedidasModelagem,
  removerMedidaModelagem,
} from '../services/fichaModelagem';

const peca: PecaItem = {
  id: 'modelagem-peca',
  colecaoId: 'modelagem-colecao',
  marcaId: 'modelagem-marca',
  nome: 'Peça de modelagem',
  codigo: '',
  tipo: 'CAMISA',
  tema: 'Base',
  marcaNome: 'Marca teste',
  colecaoNome: 'Coleção teste',
  status: 'Em andamento',
  etapaAtual: '',
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
};

function Editor({ tamanhos = ['P', 'M'] }: { tamanhos?: string[] }) {
  const [tabelas, setTabelas] = useState<FichaTabelaMedidas[]>(
    () =>
      parseLocalState<PecaItem[]>(getLocalStateSnapshot(LOCAL_PECAS_KEY), [])[0]?.fichaTecnica
        ?.tabelasMedidas ?? []
  );
  const [observacoes, setObservacoes] = useState('');
  return (
    <FichaModelagemEditor
      observacoes={observacoes}
      tabelas={tabelas}
      tamanhos={tamanhos}
      onObservacoesChange={setObservacoes}
      onTabelasChange={setTabelas}
      savingDisabled={false}
      onSave={() =>
        savePecaLocal({
          ...peca,
          fichaTecnica: { tabelasMedidas: tabelas, observacoesModelagem: observacoes },
        })
      }
    />
  );
}

describe('Modelagem local no portal', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it('recupera tabelas independentes, valores decimais, tolerância e ordem depois de salvar e reabrir', () => {
    const view = render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: 'Nova tabela' }));
    const first = within(screen.getByRole('region', { name: 'Tabela - 1' }));
    fireEvent.click(first.getByRole('combobox', { name: 'Medidas' }));
    fireEvent.click(first.getByRole('checkbox', { name: 'CINTURA' }));
    fireEvent.click(first.getByRole('checkbox', { name: 'QUADRIL' }));
    fireEvent.keyDown(first.getByRole('dialog'), { key: 'Escape' });
    fireEvent.change(first.getByRole('textbox', { name: 'CINTURA — P' }), {
      target: { value: '42,5' },
    });
    fireEvent.change(first.getByRole('textbox', { name: 'CINTURA — Tolerância' }), {
      target: { value: '0,5' },
    });
    fireEvent.click(first.getByRole('button', { name: 'Ordenar' }));
    fireEvent.click(first.getByRole('button', { name: 'Mover QUADRIL para cima' }));

    fireEvent.click(screen.getByRole('button', { name: 'Nova tabela' }));
    const second = within(screen.getByRole('region', { name: 'Tabela - 2' }));
    fireEvent.click(second.getByRole('combobox', { name: 'Medidas' }));
    fireEvent.change(second.getByRole('textbox', { name: 'Buscar ou criar medida' }), {
      target: { value: 'Comprimento' },
    });
    fireEvent.click(second.getByRole('button', { name: 'Criar medida' }));
    fireEvent.keyDown(second.getByRole('dialog'), { key: 'Escape' });
    fireEvent.change(second.getByRole('textbox', { name: 'COMPRIMENTO — M' }), {
      target: { value: '70' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    const saved = parseLocalState<PecaItem[]>(getLocalStateSnapshot(LOCAL_PECAS_KEY), []);
    expect(saved[0]?.fichaTecnica?.tabelasMedidas?.[0]?.medidasSelecionadas).toEqual([
      'QUADRIL',
      'CINTURA',
    ]);
    expect(saved[0]?.fichaTecnica?.tabelasMedidas?.[1]?.medidasSelecionadas).toEqual([
      'COMPRIMENTO',
    ]);
    view.unmount();
    render(<Editor />);
    expect((screen.getByRole('textbox', { name: 'CINTURA — P' }) as HTMLInputElement).value).toBe(
      '42,5'
    );
    expect(
      (screen.getByRole('textbox', { name: 'CINTURA — Tolerância' }) as HTMLInputElement).value
    ).toBe('0,5');
    expect(
      (screen.getByRole('textbox', { name: 'COMPRIMENTO — M' }) as HTMLInputElement).value
    ).toBe('70');
  });

  it('acompanha os tamanhos do Geral e preserva os valores quando um tamanho ou medida é retirado e depois recolocado', () => {
    const view = render(<Editor />);
    fireEvent.click(screen.getByRole('button', { name: 'Nova tabela' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Medidas' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'CINTURA' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    fireEvent.change(screen.getByRole('textbox', { name: 'CINTURA — P' }), {
      target: { value: '40' },
    });
    view.rerender(<Editor tamanhos={['M', '44']} />);
    expect(screen.queryByRole('textbox', { name: 'CINTURA — P' })).toBeNull();
    expect(screen.getByRole('textbox', { name: 'CINTURA — 44' })).toBeDefined();
    view.rerender(<Editor tamanhos={['P', 'M']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retirar CINTURA da tabela' }));
    expect(screen.queryByRole('textbox', { name: 'CINTURA — P' })).toBeNull();
    fireEvent.click(screen.getByRole('combobox', { name: 'Medidas' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'CINTURA' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect((screen.getByRole('textbox', { name: 'CINTURA — P' }) as HTMLInputElement).value).toBe(
      '40'
    );
  });

  it('evita duplicar medidas por acento ou caixa e guarda a exclusão do catálogo local', () => {
    expect(cadastrarMedidaModelagem(' tórax ')).toBe('TORAX');
    expect(lerMedidasModelagem().filter((item) => item === 'TORAX')).toHaveLength(1);
    expect(cadastrarMedidaModelagem('comprimento  total')).toBe('COMPRIMENTO TOTAL');
    removerMedidaModelagem('comprimento total');
    expect(lerMedidasModelagem()).not.toContain('COMPRIMENTO TOTAL');
  });
});
