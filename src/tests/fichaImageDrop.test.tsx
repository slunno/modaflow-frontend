import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FichaImageUpload } from '../pages/Home/components/FichaImageUpload';

afterEach(cleanup);
const photo = () => new File(['foto'], 'peca.png', { type: 'image/png' });
function open(onFileChange = vi.fn(async (_file: File) => {}), disabled = false, value?: string) {
  render(
    <FichaImageUpload
      gallery
      label="Imagem da peça — Principal"
      value={value}
      onChange={vi.fn()}
      onFileChange={onFileChange}
      disabled={disabled}
    />
  );
  return {
    zone: screen
      .getByLabelText('Imagem da peça — Principal', { selector: 'input' })
      .closest('label')!,
    onFileChange,
  };
}

describe('Arrastar foto para a prévia', () => {
  it('mantém o destaque sobre os filhos e só confirma após armazenar, sem enviar duas vezes', async () => {
    let finish!: () => void;
    const save = vi.fn(
      (_file: File) =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { zone } = open(save);
    const file = photo();
    const drag = { dataTransfer: { types: ['Files'], files: [file] } };
    fireEvent.dragEnter(zone, drag);
    const child = screen.getByText('Arraste uma imagem ou clique para selecionar');
    fireEvent.dragEnter(child, drag);
    fireEvent.dragLeave(child, drag);
    expect(screen.getByRole('status').textContent).toBe('Solte a imagem para salvar');
    fireEvent.drop(zone, drag);
    expect(screen.getByRole('status').textContent).toBe('Salvando imagem…');
    expect(screen.getByRole('button', { name: 'Trocar imagem' }).hasAttribute('disabled')).toBe(
      true
    );
    fireEvent.drop(zone, drag);
    expect(save).toHaveBeenCalledExactlyOnceWith(file);
    await act(async () => {
      finish();
    });
    expect(screen.getByRole('status').textContent).toBe('Imagem salva.');
  });

  it('informa o motivo ao rejeitar formato, tamanho ou mais de uma imagem', () => {
    const { zone, onFileChange } = open();
    fireEvent.drop(zone, {
      dataTransfer: { files: [new File(['pdf'], 'projeto.pdf', { type: 'application/pdf' })] },
    });
    expect(screen.getByRole('alert').textContent).toBe('Selecione um arquivo de imagem.');
    const large = photo();
    Object.defineProperty(large, 'size', { value: 11 * 1024 * 1024 });
    fireEvent.drop(zone, { dataTransfer: { files: [large] } });
    expect(screen.getByRole('alert').textContent).toBe('A imagem deve ter no máximo 10 MB.');
    fireEvent.drop(zone, { dataTransfer: { files: [photo(), photo()] } });
    expect(screen.getByRole('alert').textContent).toBe('Adicione uma imagem por vez.');
    expect(onFileChange).not.toHaveBeenCalled();
  });

  it('mantém a foto anterior e apresenta a falha sem confirmar o salvamento', async () => {
    const save = vi.fn(async (_file: File) => {
      throw new Error('Falha ao armazenar a foto');
    });
    const { zone } = open(save, false, 'blob:foto-anterior');
    fireEvent.drop(zone, { dataTransfer: { files: [photo()] } });
    expect((await screen.findByRole('alert')).textContent).toBe('Falha ao armazenar a foto');
    expect(screen.getByAltText('Imagem da peça — Principal').getAttribute('src')).toBe(
      'blob:foto-anterior'
    );
    expect(screen.queryByText('Imagem salva.')).toBeNull();
  });

  it('ignora arquivos quando desabilitado e não trata links como fotos', () => {
    const first = open();
    fireEvent.dragOver(first.zone, { dataTransfer: { types: ['text/uri-list'], files: [] } });
    fireEvent.drop(first.zone, { dataTransfer: { files: [] } });
    expect(screen.queryByRole('status')).toBeNull();
    expect(first.onFileChange).not.toHaveBeenCalled();
    cleanup();
    const second = open(
      vi.fn(async (_file: File) => {}),
      true
    );
    fireEvent.dragEnter(second.zone, { dataTransfer: { types: ['Files'], files: [photo()] } });
    fireEvent.drop(second.zone, { dataTransfer: { files: [photo()] } });
    expect(screen.queryByRole('status')).toBeNull();
    expect(second.onFileChange).not.toHaveBeenCalled();
  });
});
