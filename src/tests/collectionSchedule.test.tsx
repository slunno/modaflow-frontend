import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CollectionSchedule } from '../pages/Home/components/CollectionSchedule';
import type { PecaItem } from '../types/plm';

const piece = (id: string, date: string, status = 'Em andamento'): PecaItem => ({
  id,
  nome: id,
  codigo: id,
  tipo: 'Camisa',
  status,
  etapaAtual: '—',
  tema: 'Base',
  colecaoNome: 'Teste',
  marcaNome: 'Marca',
  estilista: '',
  tecidos: [],
  previsaoEntrega: date,
});
describe('Cronograma da coleção', () => {
  it('distingue atraso, conclusão e ausência de prazo e permite abrir a ficha pela linha do tempo ou tabela', () => {
    const open = vi.fn();
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const future = new Date();
    future.setDate(future.getDate() + 8);
    const date = (value: Date) =>
      `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    const late = piece('Peça atrasada', date(past)),
      completed = piece('Peça concluída', date(future), 'Completa'),
      undated = piece('Peça sem prazo', '31/02/2026');
    render(
      <CollectionSchedule
        collectionName="Teste"
        collectionDelivery=""
        pieces={[late, completed, undated]}
        onOpenPiece={open}
        onAddPiece={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Abrir Peça atrasada.*Atrasado/ }));
    expect(open).toHaveBeenLastCalledWith(late);
    expect(screen.getByRole('button', { name: /Abrir Peça concluída.*Concluído/ })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Definir data · Peça sem prazo' }));
    expect(open).toHaveBeenLastCalledWith(undated);
    fireEvent.click(screen.getByRole('button', { name: 'Tabela' }));
    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByText('Sem data da peça')).toBeDefined();
    expect(screen.getAllByRole('button', { name: 'Abrir ficha' })).toHaveLength(3);
  });
});
