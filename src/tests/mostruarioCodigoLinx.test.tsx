import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MostruarioColorsPicker } from '../pages/Home/components/MostruarioColorsPicker';
import { normalizarCatalogoMostruario } from '../services/mostruarioCatalog';
import { getLinxCoresMostruario } from '../services/linxService';
import { coresMostruarioLinx } from '../services/fichaPrincipalLinx';
import { api } from '../services/api';
import type { TecidoCorItem } from '../types/gestao';
import type { PecaItem } from '../types/plm';

vi.mock('../services/api', () => ({ api: { get: vi.fn() } }));
beforeEach(() => {
  localStorage.clear();
  vi.mocked(api.get).mockReset();
});
afterEach(cleanup);
function Harness({ initial = [] }: { initial?: TecidoCorItem[] }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <MostruarioColorsPicker value={value} onChange={setValue} />
      <output data-testid="selection">{JSON.stringify(value)}</output>
    </>
  );
}
describe('Mostruário com identidade real do catálogo', () => {
  it('consulta GET próprio e não limita ou agrupa cores com descrições iguais', async () => {
    const colors = [
      { codigo: '00003', descricao: 'PRETO' },
      { codigo: '00999', descricao: 'PRETO' },
    ];
    vi.mocked(api.get).mockResolvedValue(colors);
    expect(await getLinxCoresMostruario()).toEqual(colors);
    expect(api.get).toHaveBeenCalledWith('/linx/cores-mostruario/codigos');
    render(<Harness />);
    fireEvent.focus(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    fireEvent.click(await screen.findByRole('option', { name: 'PRETO (00003)' }));
    fireEvent.click(screen.getByRole('option', { name: 'PRETO (00999)' }));
    const value = JSON.parse(screen.getByTestId('selection').textContent!) as TecidoCorItem[];
    expect(value.map((color) => color.codigo)).toEqual(['00003', '00999']);
    expect(coresMostruarioLinx({ fichaTecnica: { coresMostruario: value } } as PecaItem)).toEqual([
      { nome: 'PRETO', codigo: '00003' },
      { nome: 'PRETO', codigo: '00999' },
    ]);
  });
  it('não atribui código ao mostruário antigo só porque encontrou o mesmo nome', async () => {
    vi.mocked(api.get).mockResolvedValue([{ codigo: '00003', descricao: 'PRETO' }]);
    const old = { id: 'linx-cor-PRETO', nome: 'PRETO', hex: '' };
    render(<Harness initial={[old]} />);
    fireEvent.focus(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    await screen.findByRole('option', { name: 'PRETO (00003)' });
    expect(JSON.parse(screen.getByTestId('selection').textContent!)).toEqual([old]);
    expect(screen.getByRole('option', { name: 'PRETO' }).getAttribute('aria-selected')).toBe(
      'true'
    );
  });
  it('mantém cor personalizada separada mesmo quando nome e código coincidem com o catálogo', async () => {
    vi.mocked(api.get).mockResolvedValue([{ codigo: '00003', descricao: 'PRETO' }]);
    const custom: TecidoCorItem = {
      id: 'custom',
      nome: 'PRETO',
      codigo: '00003',
      hex: '#111111',
      origemMostruario: 'portal',
    };
    render(<Harness initial={[custom]} />);
    fireEvent.focus(screen.getByRole('combobox', { name: 'Cor de mostruário' }));
    await waitFor(() =>
      expect(screen.getAllByRole('option', { name: 'PRETO (00003)' })).toHaveLength(2)
    );
    const options = screen.getAllByRole('option', { name: 'PRETO (00003)' });
    expect(options).toHaveLength(2);
    fireEvent.click(options.find((option) => option.getAttribute('aria-selected') === 'false')!);
    const value = JSON.parse(screen.getByTestId('selection').textContent!) as TecidoCorItem[];
    expect(value).toHaveLength(2);
    expect(coresMostruarioLinx({ fichaTecnica: { coresMostruario: value } } as PecaItem)).toEqual([
      { nome: 'PRETO', codigo: '00003' },
    ]);
  });
  it('lê nomes legados sem inventar chave e rejeita referências inválidas', () => {
    expect(normalizarCatalogoMostruario(['BRANCO'])[0]).not.toHaveProperty('codigo');
    expect(
      normalizarCatalogoMostruario([{ codigo: '00003 ', descricao: ' PRETO ' }])[0]
    ).toMatchObject({ codigo: '00003', nome: 'PRETO', origemMostruario: 'linx' });
    expect(
      normalizarCatalogoMostruario([
        null,
        { codigo: '12345678901', descricao: 'INVÁLIDA' },
        { codigo: '', descricao: 'VAZIA' },
      ])
    ).toEqual([]);
    expect(() => normalizarCatalogoMostruario({})).toThrow(/Resposta inválida/);
  });
});
