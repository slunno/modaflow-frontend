import { useState } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductTerceiroField } from '../pages/Home/components/ProductTerceiroField';
import { getProductTerceiroKey } from '../services/productTerceiroStorage';
import { readProductUsos } from '../services/productUsoStorage';

function Campo({
  produto = 'CALÇA',
  campo = 'tela',
}: {
  produto?: string;
  campo?: 'tela' | 'tecnica';
}) {
  const [value, setValue] = useState('');
  return <ProductTerceiroField produto={produto} campo={campo} value={value} onChange={setValue} />;
}

describe('Catálogos de Terceiros', () => {
  beforeEach(() => localStorage.clear());

  it('compartilha entre peças do mesmo tipo em todas as marcas, atualiza seletores abertos e isola Tela, Técnicas e outro tipo', () => {
    render(
      <>
        <div role="group" aria-label="Marca A">
          <Campo />
        </div>
        <div role="group" aria-label="Marca B">
          <Campo produto="  calca  " />
        </div>
        <div role="group" aria-label="Outro tipo">
          <Campo produto="BLUSA" />
        </div>
        <div role="group" aria-label="Técnica">
          <Campo campo="tecnica" />
        </div>
      </>
    );
    const a = within(screen.getByRole('group', { name: 'Marca A' }));
    const b = within(screen.getByRole('group', { name: 'Marca B' }));
    const outro = within(screen.getByRole('group', { name: 'Outro tipo' }));
    const tecnica = within(screen.getByRole('group', { name: 'Técnica' }));
    fireEvent.click(b.getByLabelText('Tela'));
    fireEvent.click(outro.getByLabelText('Tela'));
    fireEvent.click(tecnica.getByLabelText('Técnicas'));
    fireEvent.change(a.getByLabelText('Tela'), { target: { value: '90 fios' } });
    fireEvent.click(a.getByRole('button', { name: 'Salvar tela' }));
    expect(b.getByRole('option', { name: '90 fios' })).toBeDefined();
    expect(outro.queryByRole('option', { name: '90 fios' })).toBeNull();
    expect(tecnica.queryByRole('option', { name: '90 fios' })).toBeNull();
    fireEvent.keyDown(b.getByLabelText('Tela'), { key: 'Enter' });
    expect((b.getByLabelText('Tela') as HTMLInputElement).value).toBe('90 fios');
    fireEvent.change(tecnica.getByLabelText('Técnicas'), { target: { value: '90 fios' } });
    fireEvent.click(tecnica.getByRole('button', { name: 'Salvar técnica' }));
    fireEvent.click(a.getByLabelText('Tela'));
    fireEvent.click(a.getByRole('button', { name: 'Remover 90 fios do catálogo de Tela' }));
    expect(readProductUsos(getProductTerceiroKey('CALÇA', 'tela'))).toEqual([]);
    expect(readProductUsos(getProductTerceiroKey('CALÇA', 'tecnica'))).toEqual(['90 fios']);
    expect((b.getByLabelText('Tela') as HTMLInputElement).value).toBe('90 fios');
    fireEvent.click(b.getByLabelText('Tela'));
    expect(b.queryByRole('option', { name: '90 fios' })).toBeNull();
    fireEvent.click(b.getByRole('button', { name: 'Limpar seleção' }));
    expect((b.getByLabelText('Tela') as HTMLInputElement).value).toBe('');
  });

  it('recebe uma técnica salva em outra aba do navegador e não duplica diferenças de maiúsculas e acentos', () => {
    render(<Campo campo="tecnica" />);
    fireEvent.click(screen.getByLabelText('Técnicas'));
    const key = getProductTerceiroKey('CALÇA', 'tecnica');
    act(() => {
      localStorage.setItem(key, JSON.stringify(['Sublimação']));
      window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }));
    });
    expect(screen.getByRole('option', { name: 'Sublimação' })).toBeDefined();
    fireEvent.change(screen.getByLabelText('Técnicas'), { target: { value: '  SUBLIMACAO  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar técnica' }));
    expect(readProductUsos(key)).toEqual(['Sublimação']);
  });

  it('mostra falha de armazenamento sem anunciar que a opção foi salva', () => {
    render(<Campo />);
    const failure = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota');
    });
    try {
      fireEvent.change(screen.getByLabelText('Tela'), { target: { value: '90 fios' } });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar tela' }));
      expect(screen.getByRole('alert').textContent).toContain('Não foi possível salvar');
      expect(screen.queryByRole('status')).toBeNull();
      expect(localStorage.getItem(getProductTerceiroKey('CALÇA', 'tela'))).toBeNull();
    } finally {
      failure.mockRestore();
    }
  });
});
