import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { AuthContext } from '../contexts/authContextInstance';
import { registrarCriacaoPeca } from '../services/fichaAlteracoes';
import { api } from '../services/api';
import type { AuthContextType, MarcaSummary } from '../types/auth';
import type { PecaItem, ColecaoItem } from '../types/plm';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] }),
  },
}));
vi.mock('../services/linxService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
}));
vi.mock('../pages/Home/components/MostruarioColorsPicker', () => ({
  MostruarioColorsPicker: () => null,
}));

const marca: MarcaSummary = {
  id: 'm',
  nome: 'King & Joe',
  code: 'KJ',
  initials: 'KJ',
  colecoesCount: 0,
  pecasCount: 0,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const colecao: ColecaoItem = {
  id: 'c',
  marcaId: 'm',
  nome: 'Coleção teste',
  marcaNome: marca.nome,
  status: 'Em andamento',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'integracao-colecao-v1',
};
const context: AuthContextType = {
  user: {
    id: 'u',
    nome: 'Autor teste',
    email: 'teste@example.invalid',
    empresa: 'Teste',
    cargo: 'Estilista',
    marcas: [marca],
  },
  isAuthenticated: true,
  activeMarca: marca,
  login: vi.fn(),
  logout: vi.fn(),
  setActiveMarca: vi.fn(),
};
const peca = registrarCriacaoPeca(
  {
    id: 'p',
    marcaId: 'm',
    colecaoId: 'c',
    codigo: '',
    nome: 'Peça teste',
    tipo: 'Camisa',
    status: 'Em andamento',
    etapaAtual: '',
    tema: '',
    colecaoNome: colecao.nome,
    marcaNome: marca.nome,
    estilista: '',
    tecidos: [],
    previsaoEntrega: '',
    fichaTecnica: {
      descricao: '',
      tecnica: '',
      estampa: '',
      observacoesGerais: '',
      variantes: [
        {
          id: 'principal',
          nome: 'Principal',
          imagemUrl: 'data:image/png;base64,dGVzdA==',
          imagemNome: 'principal.png',
          tecidos: [
            {
              id: 't',
              nome: 'Tecido Principal',
              codigo: '01',
              temErp: false,
              fornecedores: '',
              custo: '',
              unidade: 'KG',
              uso: 'Uso principal',
            },
          ],
          aviamentos: [
            {
              id: 'a',
              nome: 'Aviamento Principal',
              codigo: '02',
              temErp: false,
              fornecedores: '',
              custo: '',
              unidade: 'UN',
            },
          ],
        },
        { id: 'outra', nome: 'Outra', tecidos: [], aviamentos: [] },
      ],
    },
  } as PecaItem,
  context.user
);
function mount(item = peca, save = vi.fn()) {
  return render(
    <AuthContext.Provider value={context}>
      <PecaFichaTecnicaView
        peca={item}
        colecao={colecao}
        marca={marca}
        onBack={() => {}}
        onUpdatePeca={save}
      />
    </AuthContext.Provider>
  );
}

describe('Salvar alterações, prova de roupa e cópia da Principal', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  it('mantém rascunho e histórico locais mesmo com a antiga flag central habilitada', () => {
    vi.stubEnv('VITE_FICHA_SERVER_DRAFT_ENABLED', 'true');
    const save = vi.fn();
    const view = mount(peca, save);
    expect(screen.queryByRole('region', { name: 'Rascunho central opcional' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Salvar rascunho no servidor' })).toBeNull();
    fireEvent.change(screen.getByPlaceholderText('Digite a descrição detalhada do produto...'), {
      target: { value: 'Alteração somente local' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = save.mock.calls[0]![0] as PecaItem;
    expect(saved.fichaTecnica?.descricao).toBe('Alteração somente local');
    expect(saved.historicoAlteracoes).toHaveLength(2);
    expect(saved.fichaTecnica?.variantes?.[0]?.imagemUrl).toBe(
      peca.fichaTecnica?.variantes?.[0]?.imagemUrl
    );
    view.unmount();
    mount(saved);
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    expect(screen.getByText('Peça criada')).toBeDefined();
    expect(screen.getByText('Alteração somente local')).toBeDefined();
    expect(
      vi.mocked(api.get).mock.calls.some(([path]) => path.includes('/fichas/rascunhos/'))
    ).toBe(false);
  });

  it('mostra criação e apenas os dois campos alterados; salvar novamente não duplica eventos', () => {
    const save = vi.fn();
    mount(peca, save);
    fireEvent.change(screen.getByPlaceholderText('Digite a descrição detalhada do produto...'), {
      target: { value: 'Descrição nova' },
    });
    fireEvent.change(screen.getByPlaceholderText('Exemplo: Estamparia, Lavanderia, Bordado'), {
      target: { value: 'Técnica nova' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect((save.mock.calls[0]![0] as PecaItem).historicoAlteracoes).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    expect(screen.getByText('Peça criada')).toBeDefined();
    expect(screen.getByText('Peça: Peça teste')).toBeDefined();
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(2);
    expect(screen.getByText('Descrição nova')).toBeDefined();
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(save).toHaveBeenCalledOnce();
    expect((save.mock.calls[0]![0] as PecaItem).historicoAlteracoes).toHaveLength(2);
  });

  it('salva e reabre data, observações e duas fotos da prova de roupa, com antes/depois', async () => {
    const save = vi.fn();
    const first = mount(peca, save);
    fireEvent.click(screen.getByRole('button', { name: 'Prova de Roupa' }));
    fireEvent.change(screen.getByLabelText('Data da prova'), { target: { value: '2026-10-02' } });
    fireEvent.change(screen.getByLabelText('Observações da prova'), {
      target: { value: 'Observação teste' },
    });
    fireEvent.change(screen.getByLabelText('Adicionar foto de experimentação'), {
      target: { files: [new File(['test'], 'prova1.png', { type: 'image/png' })] },
    });
    await screen.findByAltText('Foto de experimentação — prova1.png');
    fireEvent.drop(screen.getByLabelText('Adicionar foto de experimentação').parentElement!, {
      dataTransfer: { files: [new File(['test'], 'prova2.png', { type: 'image/png' })] },
    });
    await screen.findByAltText('Foto de experimentação — prova2.png');
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = save.mock.calls[0]![0] as PecaItem;
    expect(saved.fichaTecnica?.provaRoupa).toMatchObject({
      data: '2026-10-02',
      observacoes: 'Observação teste',
      fotos: [{ nome: 'prova1.png' }, { nome: 'prova2.png' }],
    });
    expect(saved.historicoAlteracoes?.at(-1)?.campos).toHaveLength(4);
    first.unmount();
    mount(saved);
    fireEvent.click(screen.getByRole('button', { name: 'Prova de Roupa' }));
    expect((screen.getByLabelText('Data da prova') as HTMLInputElement).value).toBe('2026-10-02');
    expect((screen.getByLabelText('Observações da prova') as HTMLTextAreaElement).value).toBe(
      'Observação teste'
    );
    expect(screen.getByAltText('Foto de experimentação — prova2.png')).toBeDefined();
  });

  it('duplica a Principal, mostra os insumos e permite edição independente', async () => {
    const save = vi.fn();
    mount(peca, save);
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('button', { name: '+ Nova variante' }));
    fireEvent.click(screen.getByRole('button', { name: 'Duplicar variante' }));
    await waitFor(() =>
      expect(screen.getAllByRole('tab', { name: /Selecionar variante/ })).toHaveLength(3)
    );
    expect(screen.getByRole('region', { name: 'Tecidos — Variante 3' }).textContent).toContain(
      'Tecido Principal'
    );
    expect(screen.getByRole('region', { name: 'Aviamentos — Variante 3' }).textContent).toContain(
      'Aviamento Principal'
    );
    expect(screen.getByAltText('Variante Variante 3').getAttribute('src')).toBe(
      peca.fichaTecnica!.variantes![0]!.imagemUrl
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Remover imagem' }).at(-1)!);
    await waitFor(() =>
      expect(
        (save.mock.lastCall?.[0] as PecaItem | undefined)?.fichaTecnica?.variantes?.[2]
          ?.imagemRemovida
      ).toBe(true)
    );
    const variants = (save.mock.lastCall![0] as PecaItem).fichaTecnica!.variantes!;
    expect(variants[0]!.imagemUrl).toBe(peca.fichaTecnica!.variantes![0]!.imagemUrl);
    expect(variants[2]!.imagemRemovida).toBe(true);
    expect(variants[2]!.tecidos[0]!.id).not.toBe(variants[0]!.tecidos[0]!.id);
    variants[2]!.tecidos[0]!.uso = 'Alterado somente na cópia';
    expect(variants[0]!.tecidos[0]!.uso).toBe('Uso principal');
  });

  it('falha de persistência não confirma nem adiciona o evento ao Histórico', () => {
    mount(
      peca,
      vi.fn(() => {
        throw new Error('Quota');
      })
    );
    fireEvent.change(screen.getByPlaceholderText('Digite a descrição detalhada do produto...'), {
      target: { value: 'Não salva' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(screen.getByText(/Não foi possível salvar no navegador/)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    expect(screen.queryByText('Geral atualizada')).toBeNull();
  });
});
