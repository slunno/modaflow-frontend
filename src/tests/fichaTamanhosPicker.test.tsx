import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FichaTamanhosPicker } from '../pages/Home/components/FichaTamanhosPicker';
import type { LinxGriffe } from '../types/linx';

function Picker({ inicial = [], griffe }: { inicial?: string[]; griffe?: LinxGriffe }) {
  const [value, setValue] = useState(inicial);
  return (
    <>
      <FichaTamanhosPicker value={value} onChange={setValue} griffe={griffe} />
      <button type="button">Outro campo</button>
    </>
  );
}

describe('Submenu de tamanhos', () => {
  it('abre ao clicar, mantém a seleção múltipla e fecha por Escape ou clique fora mostrando os tamanhos escolhidos', () => {
    render(<Picker />);
    const trigger = screen.getByRole('combobox', { name: 'Tamanhos' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: 'GG' })).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Selecionar tamanhos' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'G' }));
    fireEvent.click(screen.getByRole('button', { name: '03' }));
    fireEvent.click(screen.getByRole('button', { name: '04' }));
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(screen.getByRole('button', { name: '04' }), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.textContent).toContain('3 tamanhos selecionados');
    expect(screen.getByLabelText('Tamanhos selecionados').textContent).toBe('G0304');
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: 'G', pressed: true })).toBeDefined();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outro campo' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('seleciona grupos sem duplicar ou perder outros tamanhos, permite desmarcar um tamanho importado e limpar', () => {
    render(<Picker inicial={['03', 'XP']} />);
    const trigger = screen.getByRole('combobox', { name: 'Tamanhos' });
    expect(screen.getByLabelText('Tamanhos selecionados').textContent).toContain('XP');
    fireEvent.click(trigger);
    const grupo = within(screen.getByRole('group', { name: 'Grade Adulta' }));
    fireEvent.click(grupo.getByRole('button', { name: '+ Selecionar grupo' }));
    fireEvent.click(grupo.getByRole('button', { name: '+ Selecionar grupo' }));
    expect(trigger.textContent).toContain('17 tamanhos selecionados');
    expect(screen.getByRole('button', { name: '03', pressed: true })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'XP', pressed: true }));
    expect(trigger.textContent).toContain('16 tamanhos selecionados');
    fireEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(trigger.textContent).toContain('Clique para selecionar os tamanhos');
    expect(screen.queryByLabelText('Tamanhos selecionados')).toBeNull();
  });

  it.each(['K&J BLACK', 'KING&JOE'] as const)('mostra somente a grade adulta em %s', (griffe) => {
    render(<Picker griffe={griffe} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    expect(screen.getByRole('group', { name: 'Grade Adulta' })).toBeDefined();
    expect(screen.queryByRole('group', { name: 'Grade Infantil' })).toBeNull();
    for (const tamanho of [
      'PP',
      'P',
      'M',
      'G',
      'GG',
      'XG',
      'XXG',
      'Único',
      '38',
      '40',
      '42',
      '44',
      '46',
      '48',
      '50',
    ])
      expect(screen.getByRole('button', { name: tamanho })).toBeDefined();
    for (const tamanho of ['01', '08', '10', '14', '18'])
      expect(screen.queryByRole('button', { name: tamanho })).toBeNull();
  });

  it('mostra somente a grade infantil na Play e seleciona os dois intervalos', () => {
    render(<Picker griffe="KING&JOE PLAY" />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    expect(screen.getByRole('group', { name: 'Grade Infantil' })).toBeDefined();
    expect(screen.queryByRole('group', { name: 'Grade Adulta' })).toBeNull();
    const grade = within(screen.getByRole('group', { name: 'Grade Infantil' }));
    for (const tamanho of [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '10',
      '12',
      '14',
      '16',
      '18',
    ])
      expect(grade.getByRole('button', { name: tamanho })).toBeDefined();
    for (const tamanho of ['PP', 'P', 'GG', 'Único', '38', '50'])
      expect(screen.queryByRole('button', { name: tamanho })).toBeNull();
    for (const grupo of grade.getAllByRole('button', { name: '+ Selecionar grupo' }))
      fireEvent.click(grupo);
    expect(screen.getByRole('combobox', { name: 'Tamanhos' }).textContent).toContain(
      '13 tamanhos selecionados'
    );
  });

  it('não apaga uma seleção antiga ao filtrar a marca e permite limpar ou remover tamanhos importados', () => {
    render(<Picker griffe="K&J BLACK" inicial={['14', '38', 'XP']} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Tamanhos' }));
    expect(screen.getByLabelText('Tamanhos selecionados').textContent).toBe('1438XP');
    expect(screen.queryByRole('button', { name: '14' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'XP', pressed: true }));
    expect(screen.getByRole('combobox', { name: 'Tamanhos' }).textContent).toContain(
      '2 tamanhos selecionados'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(screen.queryByLabelText('Tamanhos selecionados')).toBeNull();
  });
});
