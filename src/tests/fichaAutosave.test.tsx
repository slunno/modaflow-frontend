import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { useFichaAutosave } from '../pages/Home/components/useFichaAutosave';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { api } from '../services/api';
import { LOCAL_PECAS_KEY, savePecaLocal } from '../services/localPecasStorage';
import { marca, colecao, peca } from '../../tests/manual/precificacao/fixtures';
import type { PecaItem } from '../types/plm';

vi.mock('../services/api', () => ({
  api: { get: vi.fn().mockResolvedValue({}), post: vi.fn() },
}));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Salvamento automático da ficha', () => {
  it('serializa a persistência compartilhada e aguarda confirmação antes de liberar outra gravação', async () => {
    vi.useFakeTimers();
    let confirm!: (value: boolean) => void;
    const save = vi
      .fn<() => boolean | Promise<boolean>>()
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((resolve) => {
            confirm = resolve;
          })
      )
      .mockReturnValue(true);
    const view = renderHook(
      (conteudo: string) =>
        useFichaAutosave({ conteudo, salvo: '', bloqueado: false, onSave: save }),
      { initialProps: 'primeira edição' }
    );
    act(() => vi.advanceTimersByTime(500));
    expect(save).toHaveBeenCalledOnce();
    view.rerender('segunda edição');
    act(() => vi.advanceTimersByTime(500));
    expect(save).toHaveBeenCalledOnce();
    await act(async () => {
      confirm(true);
      await Promise.resolve();
    });
    expect(save).toHaveBeenCalledTimes(2);
  });
  it('agrupa a digitação e salva somente o último conteúdo, mesmo após renderizar outra vez', () => {
    vi.useFakeTimers();
    const save = vi.fn<(conteudo: string) => boolean>().mockReturnValue(true);
    const view = renderHook(
      (conteudo: string) =>
        useFichaAutosave({ conteudo, salvo: '', bloqueado: false, onSave: () => save(conteudo) }),
      { initialProps: '' }
    );
    act(() => vi.advanceTimersByTime(600));
    expect(save).not.toHaveBeenCalled();
    view.rerender('a');
    act(() => vi.advanceTimersByTime(300));
    view.rerender('ab');
    act(() => vi.advanceTimersByTime(400));
    view.rerender('ab');
    act(() => vi.advanceTimersByTime(100));
    expect(save).toHaveBeenCalledExactlyOnceWith('ab');
  });

  it('descarta a gravação agendada se a edição for totalmente desfeita', () => {
    vi.useFakeTimers();
    const save = vi.fn(() => true);
    const view = renderHook(
      (conteudo: string) =>
        useFichaAutosave({ conteudo, salvo: 'original', bloqueado: false, onSave: save }),
      { initialProps: 'original' }
    );
    view.rerender('editado');
    view.rerender('original');
    act(() => vi.advanceTimersByTime(600));
    expect(save).not.toHaveBeenCalled();
  });

  it('aguarda o carregamento/cópia terminar e usa a edição mais recente', () => {
    vi.useFakeTimers();
    const save = vi.fn<(conteudo: string) => boolean>().mockReturnValue(true);
    const view = renderHook(
      (props: { conteudo: string; bloqueado: boolean }) =>
        useFichaAutosave({ ...props, salvo: '', onSave: () => save(props.conteudo) }),
      { initialProps: { conteudo: 'inicial', bloqueado: true } }
    );
    act(() => vi.advanceTimersByTime(600));
    expect(save).not.toHaveBeenCalled();
    view.rerender({ conteudo: 'atual', bloqueado: false });
    act(() => vi.advanceTimersByTime(500));
    expect(save).toHaveBeenCalledExactlyOnceWith('atual');
  });

  it('guarda ao fechar a página e não repete a gravação na desmontagem', () => {
    vi.useFakeTimers();
    const save = vi.fn(() => true);
    const view = renderHook(() =>
      useFichaAutosave({ conteudo: 'alterado', salvo: '', bloqueado: false, onSave: save })
    );
    fireEvent(window, new Event('pagehide'));
    view.unmount();
    act(() => vi.advanceTimersByTime(600));
    expect(save).toHaveBeenCalledOnce();
  });

  it('guarda uma edição recente ao desmontar antes do prazo', () => {
    vi.useFakeTimers();
    const save = vi.fn(() => true);
    const view = renderHook(() =>
      useFichaAutosave({ conteudo: 'alterado', salvo: '', bloqueado: false, onSave: save })
    );
    view.unmount();
    expect(save).toHaveBeenCalledOnce();
  });

  it('mantém a edição pendente após falha e permite tentar novamente', () => {
    vi.useFakeTimers();
    const save = vi.fn<() => boolean>().mockReturnValueOnce(false).mockReturnValue(true);
    const view = renderHook(() =>
      useFichaAutosave({ conteudo: 'alterado', salvo: '', bloqueado: false, onSave: save })
    );
    act(() => vi.advanceTimersByTime(500));
    act(() => expect(view.result.current.flush()).toBe(true));
    view.unmount();
    expect(save).toHaveBeenCalledTimes(2);
  });
});

function LiveFicha({ initial = peca }: { initial?: PecaItem }) {
  const [item, setItem] = useState(initial);
  return (
    <PecaFichaTecnicaView
      peca={item}
      marca={marca}
      colecao={colecao}
      onBack={() => {}}
      onUpdatePeca={(updated) => {
        savePecaLocal(updated);
        setItem(updated);
      }}
    />
  );
}
const saved = () => (JSON.parse(localStorage.getItem(LOCAL_PECAS_KEY)!) as PecaItem[])[0]!;

describe('Ficha sem botão de salvar', () => {
  it('salva com o componente em uso e reabre dados de várias abas, mantendo a pendência Linx', async () => {
    const view = render(<LiveFicha />);
    expect(screen.queryByRole('button', { name: 'Salvar rascunho' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'Descrição automática' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Modelagem' }));
    expect(screen.queryByRole('button', { name: /^Salvar$/ })).toBeNull();
    fireEvent.change(screen.getByLabelText('Observações de Modelagem'), {
      target: { value: 'Modelagem automática' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Prova de Roupa' }));
    fireEvent.change(screen.getByLabelText('Observações da prova'), {
      target: { value: 'Prova automática' },
    });
    await waitFor(() =>
      expect(saved().fichaTecnica!.provaRoupa!.observacoes).toBe('Prova automática')
    );
    const item = saved();
    expect(item.fichaTecnica).toMatchObject({
      descricao: 'Descrição automática',
      observacoesModelagem: 'Modelagem automática',
    });
    expect(
      screen.getByRole('button', { name: 'Integrar no Linx' }).getAttribute('data-pendente')
    ).toBe('true');
    expect(api.post).not.toHaveBeenCalled();
    view.unmount();
    render(<LiveFicha initial={item} />);
    expect((screen.getByLabelText('Descrição', { exact: true }) as HTMLInputElement).value).toBe(
      'Descrição automática'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Modelagem' }));
    expect((screen.getByLabelText('Observações de Modelagem') as HTMLTextAreaElement).value).toBe(
      'Modelagem automática'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Prova de Roupa' }));
    expect((screen.getByLabelText('Observações da prova') as HTMLTextAreaElement).value).toBe(
      'Prova automática'
    );
  });

  it('salva antes de Voltar, sem reabrir a ficha ao desmontar', async () => {
    const back = vi.fn();
    const save = vi.fn(savePecaLocal);
    const view = render(
      <PecaFichaTecnicaView
        peca={peca}
        marca={marca}
        colecao={colecao}
        onBack={back}
        onUpdatePeca={save}
      />
    );
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'Última letra' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(saved().fichaTecnica!.descricao).toBe('Última letra');
    await waitFor(() => expect(back).toHaveBeenCalledOnce());
    view.unmount();
    expect(save).toHaveBeenCalledOnce();
  });

  it('falha ao salvar mantém o campo aberto e impede sair pelo botão Voltar', async () => {
    const back = vi.fn();
    const save = vi.fn(() => {
      throw new Error('Sem espaço');
    });
    render(
      <PecaFichaTecnicaView
        peca={peca}
        marca={marca}
        colecao={colecao}
        onBack={back}
        onUpdatePeca={save}
      />
    );
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'Ainda aberta' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(back).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Descrição', { exact: true }) as HTMLInputElement).value).toBe(
      'Ainda aberta'
    );
    expect(await screen.findByText(/Não foi possível salvar no navegador/)).toBeDefined();
    expect(localStorage.getItem(LOCAL_PECAS_KEY)).toBeNull();
  });
});
