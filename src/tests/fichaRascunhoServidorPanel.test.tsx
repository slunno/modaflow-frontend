import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FichaRascunhoServidorPanel } from '../pages/Home/components/FichaRascunhoServidorPanel';
import {
  consultarHistoricoRascunhoServidor,
  consultarRascunhoServidor,
  projetarPecaSemMidias,
  salvarRascunhoServidor,
  type EventoRascunhoServidor,
  type IdentidadeRascunho,
  type SnapshotRascunhoServidor,
} from '../services/fichaRascunhoServidor';
import { ApiError } from '../services/api';
import type { PecaItem } from '../types/plm';

vi.mock('../services/fichaRascunhoServidor', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/fichaRascunhoServidor')>()),
  consultarRascunhoServidor: vi.fn(),
  salvarRascunhoServidor: vi.fn(),
  consultarHistoricoRascunhoServidor: vi.fn(),
}));

const identity: IdentidadeRascunho = {
  pecaId: 'peca-1',
  marcaId: 'marca-1',
  colecaoId: 'colecao-1',
};
const peca: PecaItem = {
  id: identity.pecaId,
  marcaId: identity.marcaId,
  colecaoId: identity.colecaoId,
  nome: 'Peça teste',
  codigo: '',
  tipo: 'Camisa',
  status: 'Em andamento',
  etapaAtual: '',
  tema: '',
  colecaoNome: 'Coleção',
  marcaNome: 'Marca',
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  imagemCroquiUrl: 'blob:http://localhost/foto-local',
  fichaTecnica: { descricao: 'Local', variantes: [] },
};
function snapshot(revisao = 'revisao-1'): SnapshotRascunhoServidor {
  return {
    identity,
    schemaVersion: 1,
    revisao,
    conteudo: { ...projetarPecaSemMidias(peca), nome: 'Nome central' },
    anexos: [],
    criadoEm: '2026-10-07T13:00:00Z',
    atualizadoEm: '2026-10-07T13:00:00Z',
    criadoPor: { usuarioId: 'usuario-1', nome: 'Autor central' },
    atualizadoPor: { usuarioId: 'usuario-1', nome: 'Autor central' },
  };
}
function paginaHistorico(inicio: number, quantidade: number): EventoRascunhoServidor[] {
  return Array.from({ length: quantidade }, (_, offset) => {
    const index = inicio + offset;
    return {
      eventoId: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
      operation: 'ATUALIZAR' as const,
      antes: snapshot(`revisao-${index - 1}`),
      depois: snapshot(`revisao-${index}`),
    };
  });
}
const consultar = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Consultar rascunho do servidor' }));
const salvarButton = () =>
  screen.getByRole('button', { name: 'Salvar rascunho no servidor' }) as HTMLButtonElement;
const confirmar = () => fireEvent.click(screen.getByLabelText(/Confirmo salvar os dados atuais/));
beforeEach(() => {
  vi.stubEnv('VITE_FICHA_SERVER_DRAFT_ENABLED', 'true');
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('Painel central opcional, sem carregamento destrutivo', () => {
  it('desativado não mostra UI nem faz solicitações', () => {
    vi.stubEnv('VITE_FICHA_SERVER_DRAFT_ENABLED', 'false');
    render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    expect(screen.queryByRole('region', { name: 'Rascunho central opcional' })).toBeNull();
    expect(consultarRascunhoServidor).not.toHaveBeenCalled();
    expect(salvarRascunhoServidor).not.toHaveBeenCalled();
    expect(consultarHistoricoRascunhoServidor).not.toHaveBeenCalled();
  });

  it('mesmo ativado não consulta ao montar; criação exige consulta explícita e salva somente no clique', async () => {
    vi.mocked(consultarRascunhoServidor).mockResolvedValueOnce(null);
    vi.mocked(salvarRascunhoServidor).mockResolvedValueOnce(snapshot());
    render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    expect(consultarRascunhoServidor).not.toHaveBeenCalled();
    expect(salvarButton().disabled).toBe(true);
    consultar();
    await screen.findByText(/Ainda não existe rascunho central/);
    expect(salvarRascunhoServidor).not.toHaveBeenCalled();
    fireEvent.click(salvarButton());
    await screen.findByText(/dados presentes no momento do clique foram salvos/);
    expect(salvarRascunhoServidor).toHaveBeenCalledWith(identity, peca, null);
    expect(screen.getByText(/Anexos continuam somente neste navegador/)).toBeDefined();
    expect(peca.imagemCroquiUrl).toBe('blob:http://localhost/foto-local');
  });

  it('dados existentes exigem confirmação manual e não substituem o rascunho/mídias locais', async () => {
    vi.mocked(consultarRascunhoServidor).mockResolvedValueOnce(snapshot());
    vi.mocked(salvarRascunhoServidor).mockResolvedValueOnce(snapshot('revisao-2'));
    const original = structuredClone(peca);
    render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    consultar();
    await screen.findByText('revisao-1');
    expect(salvarButton().disabled).toBe(true);
    expect(peca).toEqual(original);
    confirmar();
    fireEvent.click(salvarButton());
    await screen.findByText('revisao-2');
    expect(salvarRascunhoServidor).toHaveBeenCalledWith(identity, peca, 'revisao-1');
    expect(
      (screen.getByLabelText(/Confirmo salvar os dados atuais/) as HTMLInputElement).checked
    ).toBe(false);
    expect(peca).toEqual(original);
  });

  it('409 não faz retry ou assume currentRevision: nova consulta e confirmação são necessárias', async () => {
    vi.mocked(consultarRascunhoServidor)
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot('revisao-outra'));
    vi.mocked(salvarRascunhoServidor).mockRejectedValueOnce(
      new ApiError('Conflito', 409, '', { currentRevision: 'revisao-outra' })
    );
    render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    consultar();
    await screen.findByText('revisao-1');
    confirmar();
    fireEvent.click(salvarButton());
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain('Nada foi sobrescrito');
    expect(salvarButton().disabled).toBe(true);
    expect(salvarRascunhoServidor).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('revisao-outra')).toBeNull();
    consultar();
    await screen.findByText('revisao-outra');
    expect(salvarButton().disabled).toBe(true);
    confirmar();
    expect(salvarButton().disabled).toBe(false);
  });

  it('erro/rede não vira confirmação de sucesso e não toca em preços ou imagens locais', async () => {
    vi.mocked(consultarRascunhoServidor).mockResolvedValueOnce(null);
    vi.mocked(salvarRascunhoServidor).mockRejectedValueOnce(
      new ApiError('Sem conexão', 0, 'NETWORK_ERROR', null, true)
    );
    render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    consultar();
    await screen.findByText(/Ainda não existe rascunho central/);
    fireEvent.click(salvarButton());
    expect((await screen.findByRole('alert')).textContent).toBe('Sem conexão');
    expect(screen.queryByText(/foram salvos no servidor/)).toBeNull();
    expect(peca.imagemCroquiUrl).toBe('blob:http://localhost/foto-local');
  });

  it('trocar identidade descarta a revisão CAS consultada, sem nova consulta automática', async () => {
    vi.mocked(consultarRascunhoServidor).mockResolvedValueOnce(snapshot());
    const view = render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    consultar();
    await screen.findByText('revisao-1');
    confirmar();
    view.rerender(
      <FichaRascunhoServidorPanel
        identity={{ ...identity, pecaId: 'outra-peca' }}
        peca={{ ...peca, id: 'outra-peca' }}
      />
    );
    expect(screen.queryByText('revisao-1')).toBeNull();
    expect(salvarButton().disabled).toBe(true);
    expect(consultarRascunhoServidor).toHaveBeenCalledTimes(1);
  });

  it('histórico central é somente leitura e não habilita salvar sem consultar a revisão', async () => {
    vi.mocked(consultarHistoricoRascunhoServidor).mockResolvedValueOnce([
      { eventoId: 'evento-1', operation: 'CRIAR', antes: null, depois: snapshot() },
    ]);
    render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    fireEvent.click(screen.getByRole('button', { name: 'Consultar histórico central' }));
    await screen.findByText('Rascunho central criado');
    expect(salvarButton().disabled).toBe(true);
    expect(consultarRascunhoServidor).not.toHaveBeenCalled();
    expect(salvarRascunhoServidor).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByText('Aguardando confirmação do servidor…')).toBeNull()
    );
  });

  it('carrega duas páginas apenas no clique, usa o último evento como cursor e não duplica IDs', async () => {
    const primeira = paginaHistorico(1, 50);
    const segunda = [primeira[49]!, ...paginaHistorico(51, 3)];
    vi.mocked(consultarHistoricoRascunhoServidor)
      .mockResolvedValueOnce(primeira)
      .mockResolvedValueOnce(segunda);
    render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    expect(consultarHistoricoRascunhoServidor).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Consultar histórico central' }));
    await screen.findByRole('button', { name: 'Carregar mais eventos' });
    expect(screen.getAllByText('Rascunho central atualizado')).toHaveLength(50);
    expect(consultarHistoricoRascunhoServidor).toHaveBeenCalledTimes(1);
    expect(consultarHistoricoRascunhoServidor).toHaveBeenNthCalledWith(1, identity, { limit: 50 });
    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais eventos' }));
    await waitFor(() =>
      expect(screen.getAllByText('Rascunho central atualizado')).toHaveLength(53)
    );
    expect(consultarHistoricoRascunhoServidor).toHaveBeenNthCalledWith(2, identity, {
      limit: 50,
      afterEventoId: primeira[49]!.eventoId,
    });
    expect(screen.queryByRole('button', { name: 'Carregar mais eventos' })).toBeNull();
    expect(screen.getByText('Não há mais eventos nesta consulta.')).toBeDefined();
    expect(salvarButton().disabled).toBe(true);
    expect(consultarRascunhoServidor).not.toHaveBeenCalled();
    expect(salvarRascunhoServidor).not.toHaveBeenCalled();
  });

  it('erro da próxima página mantém eventos e cursor consultados; repetir é explícito e página vazia encerra', async () => {
    const primeira = paginaHistorico(1, 50);
    vi.mocked(consultarHistoricoRascunhoServidor)
      .mockResolvedValueOnce(primeira)
      .mockRejectedValueOnce(
        new ApiError('Falha na próxima página', 0, 'NETWORK_ERROR', null, true)
      )
      .mockResolvedValueOnce([]);
    render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
    fireEvent.click(screen.getByRole('button', { name: 'Consultar histórico central' }));
    await screen.findByRole('button', { name: 'Carregar mais eventos' });
    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais eventos' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Falha na próxima página');
    expect(screen.getAllByText('Rascunho central atualizado')).toHaveLength(50);
    expect(consultarHistoricoRascunhoServidor).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: 'Carregar mais eventos' }) as HTMLButtonElement)
          .disabled
      ).toBe(false)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Carregar mais eventos' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Carregar mais eventos' })).toBeNull()
    );
    expect(consultarHistoricoRascunhoServidor).toHaveBeenNthCalledWith(3, identity, {
      limit: 50,
      afterEventoId: primeira[49]!.eventoId,
    });
    expect(screen.getAllByText('Rascunho central atualizado')).toHaveLength(50);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it.each([0, 3])(
    'página inicial com %s eventos não oferece próxima página nem busca automática',
    async (quantidade) => {
      vi.mocked(consultarHistoricoRascunhoServidor).mockResolvedValueOnce(
        paginaHistorico(1, quantidade)
      );
      render(<FichaRascunhoServidorPanel identity={identity} peca={peca} />);
      fireEvent.click(screen.getByRole('button', { name: 'Consultar histórico central' }));
      await screen.findByText('Não há mais eventos nesta consulta.');
      expect(screen.queryByRole('button', { name: 'Carregar mais eventos' })).toBeNull();
      expect(consultarHistoricoRascunhoServidor).toHaveBeenCalledTimes(1);
      expect(screen.queryAllByText('Rascunho central atualizado')).toHaveLength(quantidade);
    }
  );
});
