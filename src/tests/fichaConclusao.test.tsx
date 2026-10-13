import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { AuthContext } from '../contexts/authContextInstance';
import { api } from '../services/api';
import type { AuthContextType, MarcaSummary } from '../types/auth';
import type { ColecaoItem, PecaItem } from '../types/plm';
import { confirmarAusentesTeste } from './fixtures/conferencia';
import { assinaturaConferenciaVariante, criarConfirmacao } from '../services/fichaProcesso';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] }),
    post: vi.fn(),
  },
}));
vi.mock('../services/linxService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/fichaAnexosStorage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/fichaAnexosStorage')>()),
  listFichaAnexos: vi.fn().mockResolvedValue([]),
}));
vi.mock('../pages/Home/components/MostruarioColorsPicker', () => ({
  MostruarioColorsPicker: () => null,
}));

const marca: MarcaSummary = {
  id: 'm',
  nome: 'Marca teste',
  code: 'M',
  initials: 'M',
  heroImageUrl: '',
  description: '',
  badgeTag: '',
  colecoesCount: 0,
  pecasCount: 0,
};
const autor = {
  id: 'u',
  nome: 'Usuário teste',
  email: 'test@example.invalid',
  empresa: 'Teste',
  cargo: 'Estilista',
  marcas: [marca],
};
const context: AuthContextType = {
  user: autor,
  isAuthenticated: true,
  activeMarca: marca,
  login: vi.fn(),
  logout: vi.fn(),
  setActiveMarca: vi.fn(),
};
const colecao: ColecaoItem = {
  id: 'c',
  marcaId: 'm',
  griffe: 'KING&JOE',
  nome: 'Coleção teste',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'integracao-colecao-v1',
};
const peca: PecaItem = {
  id: 'p',
  colecaoId: 'c',
  marcaId: 'm',
  nome: 'Peça teste',
  codigo: 'P1',
  tipo: 'Peça',
  status: 'Em andamento',
  etapaAtual: '20 Final',
  tema: '',
  marcaNome: marca.nome,
  colecaoNome: colecao.nome,
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  fichaTecnica: {
    tamanhos: ['P', 'M'],
    conferencia: {
      gradeCompleta: true,
    },
    variantes: [
      {
        id: 'principal',
        nome: 'Principal',
        aviamentos: [],
        tecidos: [
          {
            id: 't',
            nome: 'Tecido teste',
            codigo: 'T1',
            custo: '10,50',
            consumo: '1,2',
            unidade: 'Metros',
            fornecedores: '',
            temErp: false,
          },
        ],
      },
    ],
  },
};
beforeEach(() => {
  confirmarAusentesTeste(peca);
  vi.mocked(api.post).mockReset().mockResolvedValue({ valida: true, pendencias: [] });
});
afterEach(cleanup);
function abrir(item: PecaItem = peca, onUpdatePeca = vi.fn()) {
  const view = render(
    <AuthContext.Provider value={context}>
      <PecaFichaTecnicaView
        peca={item}
        colecao={colecao}
        marca={marca}
        usuarios={[
          {
            ...autor,
            status: 'Ativo',
            acesso: 'Permitido',
            marcas: ['m'],
            brandRoles: [{ marcaId: 'm', marcaNome: marca.nome, cargo: 'Estilista', times: [] }],
          },
        ]}
        onBack={() => {}}
        onUpdatePeca={onUpdatePeca}
      />
    </AuthContext.Provider>
  );
  return { view, onUpdatePeca };
}
describe('Avanço sequencial da ficha', () => {
  it('avança de 02 em diante a cada clique, sem repetir a conferência', () => {
    const { onUpdatePeca } = abrir({
      ...peca,
      etapaAtual: '02 engenharia recebimento',
      fichaTecnica: {},
    });
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onUpdatePeca.mock.calls[0]![0].etapaAtual).toBe('03 modelagem');
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onUpdatePeca.mock.calls[1]![0].etapaAtual).toBe('04 mini risco / consumo');
    expect(api.post).not.toHaveBeenCalled();
  });
  it('01 para 02 avança sem confirmação e mantém os dados já presentes', () => {
    const item = {
      ...structuredClone(peca),
      etapaAtual: '01 geração de ficha',
      fluxo: 'Piloto',
      responsavel: autor.nome,
      previsaoEntrega: '20/10/2026',
      observacaoEtapa: 'Observação existente',
    };
    const { onUpdatePeca } = abrir(item);
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onUpdatePeca).toHaveBeenCalledOnce();
    const salva = onUpdatePeca.mock.calls[0]![0] as PecaItem;
    expect(salva.etapaAtual).toBe('02 engenharia recebimento');
    expect(salva.fluxo).toBe('Piloto');
    expect(salva.responsavel).toBe(autor.nome);
    expect(salva.previsaoEntrega).toBe('20/10/2026');
    expect(salva.observacaoEtapa).toBe('Observação existente');
    expect(salva.fichaTecnica!.variantes).toEqual(item.fichaTecnica!.variantes);
    expect(salva.fichaTecnica!.conferencia).toEqual(item.fichaTecnica!.conferencia);
    expect(api.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onUpdatePeca.mock.calls[1]![0].etapaAtual).toBe('03 modelagem');
    expect(api.post).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('avança de 01 para 02 com grade pendente sem confirmar automaticamente os dados', () => {
    const item = structuredClone(peca);
    item.etapaAtual = '01 geração de ficha';
    item.responsavel = undefined;
    item.fichaTecnica!.conferencia!.gradeCompleta = false;
    const { onUpdatePeca } = abrir(item);
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onUpdatePeca).toHaveBeenCalledOnce();
    const salva = onUpdatePeca.mock.calls[0]![0] as PecaItem;
    expect(salva.etapaAtual).toBe('02 engenharia recebimento');
    expect(salva.responsavel).toBeUndefined();
    expect(salva.fichaTecnica!.conferencia).toEqual(item.fichaTecnica!.conferencia);
    expect(api.post).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('conclui a sequência na etapa 20 sem iniciar integração', () => {
    const { onUpdatePeca } = abrir({ ...peca, etapaAtual: '19 aprovação da piloto' });
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onUpdatePeca.mock.calls[0]![0].etapaAtual).toBe('20 Final');
    expect((screen.getByRole('button', { name: 'Avançar' }) as HTMLButtonElement).disabled).toBe(
      true
    );
    expect(api.post).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('falha ao salvar mantém a etapa anterior', () => {
    const onUpdatePeca = vi.fn(() => {
      throw new Error('Não foi possível persistir');
    });
    abrir({ ...peca, etapaAtual: '02 engenharia recebimento' }, onUpdatePeca);
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(
      screen.getByText('Não foi possível salvar o avanço. A peça permanece na etapa anterior.')
    ).toBeDefined();
    expect(screen.getByRole('button', { name: 'Avançar' }).getAttribute('title')).toContain(
      '03 modelagem'
    );
    expect(api.post).not.toHaveBeenCalled();
  });
});
describe('Conclusão, revisão e preparação persistentes', () => {
  it('edição de insumo limpa só as confirmações da variante editada, preservando todos os valores', () => {
    const item = structuredClone(peca);
    const principal = item.fichaTecnica!.variantes![0]!;
    principal.tecidos[0]!.componente = 'elastico';
    principal.tecidos[0]!.consumoPorTamanho = { P: { valor: '0' }, M: { valor: '0,8' } };
    const outra = structuredClone(principal);
    outra.id = 'outra';
    outra.nome = 'Outra';
    outra.tecidos[0]!.id = 't-outra';
    item.fichaTecnica!.variantes!.push(outra);
    confirmarAusentesTeste(item);
    for (const variante of item.fichaTecnica!.variantes!)
      variante.tecidos[0]!.consumoPorTamanho!.P!.confirmacaoZero = criarConfirmacao(
        assinaturaConferenciaVariante(variante, ['P', 'M']),
        { id: autor.id, nome: autor.nome }
      );
    const { onUpdatePeca } = abrir(item);
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    fireEvent.change(screen.getByLabelText('Preço por Metros (R$)'), { target: { value: '12' } });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const salva = onUpdatePeca.mock.calls[0]![0] as PecaItem;
    expect(salva.fichaTecnica!.conferencia!.componentesPorVariante!.principal).toBeUndefined();
    expect(salva.fichaTecnica!.variantes![0]!.tecidos[0]!.consumoPorTamanho).toEqual({
      P: { valor: '0' },
      M: { valor: '0,8' },
    });
    expect(salva.fichaTecnica!.variantes![1]).toEqual(outra);
    expect(salva.fichaTecnica!.conferencia!.componentesPorVariante!.outra).toEqual(
      item.fichaTecnica!.conferencia!.componentesPorVariante!.outra
    );
    expect(api.post).not.toHaveBeenCalled();
  });
  it('rascunho incompleto permanece permitido sem chamar validação', async () => {
    const { onUpdatePeca } = abrir({ ...peca, fichaTecnica: {} });
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'Ficha ainda incompleta' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    await waitFor(() => expect(onUpdatePeca).toHaveBeenCalledOnce());
    expect(api.post).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Integrar no Linx — preparar' })).toBeNull();
  });
  it('conclui e prepara, mas não gera versão integrada; edição exige nova conclusão', async () => {
    const { onUpdatePeca } = abrir();
    fireEvent.click(screen.getByRole('button', { name: 'Concluir ficha' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Integrar no Linx — preparar' })).toBeDefined()
    );
    const concluida = onUpdatePeca.mock.calls[0]![0] as PecaItem;
    expect(concluida.fichaTecnica!.processo!.concluida!.responsavel.nome).toBe(autor.nome);
    expect(concluida.fichaTecnica!.processo!.concluida!.anexosAssinatura).toBe('[]');
    fireEvent.click(screen.getByRole('button', { name: 'Integrar no Linx — preparar' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Baixar contrato preparado' })).toBeDefined()
    );
    const preparada = onUpdatePeca.mock.calls[1]![0] as PecaItem;
    expect(preparada.fichaTecnica!.processo!.integracaoPreparada!.status).toBe(
      'PENDENTE_MAPEAMENTO'
    );
    expect(preparada.historicoIntegracoes).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    fireEvent.change(screen.getByLabelText('Preço por Metros (R$)'), {
      target: { value: '11,70' },
    });
    expect(screen.queryByRole('button', { name: 'Integrar no Linx — preparar' })).toBeNull();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const alterada = onUpdatePeca.mock.calls[2]![0] as PecaItem;
    expect(alterada.fichaTecnica!.processo!.revisao).not.toBe(
      preparada.fichaTecnica!.processo!.revisao
    );
    expect(alterada.fichaTecnica!.variantes![0]!.tecidos[0]!.custo).toBe('11,70');
    expect(preparada.fichaTecnica!.variantes![0]!.tecidos[0]!.custo).toBe('10,50');
  });
  it('falha ao persistir não confirma conclusão', async () => {
    const onUpdatePeca = vi.fn(() => {
      throw new Error('Quota indisponível');
    });
    abrir(peca, onUpdatePeca);
    fireEvent.click(screen.getByRole('button', { name: 'Concluir ficha' }));
    await waitFor(() => expect(screen.getByText('Quota indisponível')).toBeDefined());
    expect(screen.queryByRole('button', { name: 'Integrar no Linx — preparar' })).toBeNull();
  });
  it('resposta tardia após sair da ficha não salva a conclusão', async () => {
    let resolver!: (value: unknown) => void;
    vi.mocked(api.post).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        })
    );
    const { view, onUpdatePeca } = abrir();
    fireEvent.click(screen.getByRole('button', { name: 'Concluir ficha' }));
    view.unmount();
    resolver({ valida: true, pendencias: [] });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onUpdatePeca).not.toHaveBeenCalled();
  });
});
