import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CollectionDetailView } from '../pages/Home/components/CollectionDetailView';
import { CollectionReservationsTab } from '../pages/Home/components/CollectionManagementTabs';
import type { MarcaSummary } from '../types/auth';
import type { ColecaoItem } from '../types/plm';

vi.mock('../services/linxService', () => ({
  resolveLinxGriffe: vi.fn().mockReturnValue(null),
  getLinxProdutosDaColecao: vi.fn().mockResolvedValue([]),
  getLinxFichasResumo: vi.fn().mockResolvedValue([]),
  getLinxSubgrupos: vi.fn().mockResolvedValue(['Camisa']),
  getLinxCoresCatalogo: vi.fn().mockResolvedValue([]),
  getLinxCoresBasicas: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/authService', () => ({ getUsuariosApi: vi.fn().mockResolvedValue([]) }));
vi.mock('../services/plmService', () => ({
  getInsumos: vi.fn().mockResolvedValue([
    {
      id: 'material-1',
      nome: 'Linho',
      codigo: 'LIN-01',
      unidade: 'Metros',
      custo: '10',
      fornecedores: 'Fornecedor',
      temErp: false,
      coresList: [{ id: 'cor-1', nome: 'Areia', hex: '#c8b99c' }],
    },
  ]),
  createInsumo: vi.fn(),
}));
const marca: MarcaSummary = {
  id: '1',
  nome: 'Marca',
  code: 'KJ',
  initials: 'KJ',
  colecoesCount: 0,
  pecasCount: 0,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const colecao: ColecaoItem = {
  id: 'collection-1',
  nome: 'Teste',
  marcaNome: 'Marca',
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
};

describe('Fluxos do redesign da coleção', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/?marca=1&colecao=collection-1');
  });
  it('troca as dez abas por clique e teclado mantendo os parâmetros da coleção', async () => {
    render(
      <CollectionDetailView
        marca={marca}
        colecao={colecao}
        onBackToBrand={() => {}}
        onBackToHome={() => {}}
      />
    );
    const nav = within(screen.getByRole('navigation', { name: 'Áreas da coleção' }));
    expect(nav.getAllByRole('button')).toHaveLength(10);
    for (const name of [
      'Temas',
      'Cores',
      'Painéis',
      'Estampas',
      'Reserva de Tecidos',
      'Reserva de Aviamentos',
      'Mix',
      'Metas',
      'Cronograma',
      'Peças',
    ]) {
      const button = nav.getByRole('button', { name });
      fireEvent.click(button);
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(window.location.search).toBe('?marca=1&colecao=collection-1');
    }
    const pieces = nav.getByRole('button', { name: 'Peças' });
    pieces.focus();
    fireEvent.keyDown(pieces, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(nav.getByRole('button', { name: 'Temas' }));
    expect(nav.getByRole('button', { name: 'Temas' }).getAttribute('aria-pressed')).toBe('true');
  });

  it.each(['TECIDO', 'AVIAMENTO'] as const)(
    'cria uma reserva de %s pelo estado vazio sem mudar o formato salvo',
    async (type) => {
      render(<CollectionReservationsTab collectionId="collection-1" type={type} pieces={[]} />);
      expect(screen.queryByText('Filtros de reservas')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Criar primeira reserva' }));
      const picker = within(
        screen.getByRole('dialog', {
          name: type === 'TECIDO' ? 'Selecionar tecido' : 'Selecionar aviamento',
        })
      );
      fireEvent.click(await picker.findByRole('radio', { name: 'Selecionar Linho' }));
      fireEvent.click(picker.getByRole('button', { name: 'Confirmar seleção' }));
      const form = within(
        screen.getByRole('dialog', {
          name: type === 'TECIDO' ? 'Criar reserva de tecido' : 'Criar reserva de aviamento',
        })
      );
      fireEvent.change(form.getByRole('combobox', { name: 'Cor' }), { target: { value: 'Areia' } });
      fireEvent.change(form.getByRole('spinbutton', { name: 'Reservado' }), {
        target: { value: '10' },
      });
      fireEvent.change(form.getByRole('spinbutton', { name: 'Utilizado' }), {
        target: { value: '4' },
      });
      fireEvent.change(form.getByRole('spinbutton', { name: 'Completos' }), {
        target: { value: '2' },
      });
      fireEvent.change(form.getByLabelText('Responsável pela reserva'), {
        target: { value: 'Ana' },
      });
      fireEvent.click(form.getByRole('button', { name: 'Salvar reserva' }));
      expect(screen.getByText('40% utilizado')).toBeDefined();
      const saved = JSON.parse(localStorage.getItem('modaflow_collection_reservations') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0]).toEqual({
        id: expect.any(String),
        collectionId: 'collection-1',
        type,
        materialId: 'material-1',
        materialName: 'Linho',
        color: 'Areia',
        reserved: '10',
        used: '4',
        completed: '2',
        notes: '',
        stylist: '',
        responsible: 'Ana',
        createdAt: expect.any(String),
      });
    }
  );
});
