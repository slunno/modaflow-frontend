import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { CollectionDeliveryDateField } from '../pages/Home/components/CollectionDeliveryDateField';

function DateField({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <CollectionDeliveryDateField value={value} onChange={setValue} />
      <output data-testid="saved-date">{value}</output>
      <button type="button">Outro campo</button>
    </>
  );
}

function openCalendar() {
  const trigger = screen.getByRole('button', { name: /^Data de entrega/ });
  fireEvent.click(trigger);
  return {
    trigger,
    calendar: screen.getByRole('group', { name: 'Calendário da data de entrega' }),
  };
}

describe('Calendário da entrega da coleção', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 15, 12));
  });
  afterEach(() => vi.useRealTimers());

  it('abre pelo campo inteiro, foca hoje e salva um dia local no formato original', () => {
    render(<DateField />);
    const { trigger, calendar } = openCalendar();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.getAttribute('aria-current')).toBe('date');
    fireEvent.click(
      within(calendar).getByRole('button', { name: 'sexta-feira, 23 de outubro de 2026' })
    );
    expect(screen.getByTestId('saved-date').textContent).toBe('2026-10-23');
    expect(trigger.textContent).toBe('23/10/2026');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('navega de dezembro para janeiro e volta sem selecionar uma data', () => {
    render(<DateField initial="2026-12-31" />);
    const { calendar } = openCalendar();
    fireEvent.click(within(calendar).getByRole('button', { name: 'Próximo mês' }));
    expect(within(calendar).getByRole('grid', { name: 'janeiro de 2027' })).toBeDefined();
    fireEvent.click(within(calendar).getByRole('button', { name: 'Mês anterior' }));
    expect(within(calendar).getByRole('grid', { name: 'dezembro de 2026' })).toBeDefined();
    expect(screen.getByTestId('saved-date').textContent).toBe('2026-12-31');
  });

  it('permite escolher mês e ano e selecionar 29 de fevereiro em ano bissexto', () => {
    render(<DateField />);
    const { calendar } = openCalendar();
    fireEvent.change(within(calendar).getByRole('combobox', { name: 'Ano da entrega' }), {
      target: { value: '2028' },
    });
    fireEvent.change(within(calendar).getByRole('combobox', { name: 'Mês da entrega' }), {
      target: { value: '1' },
    });
    fireEvent.click(
      within(calendar).getByRole('button', { name: 'terça-feira, 29 de fevereiro de 2028' })
    );
    expect(screen.getByTestId('saved-date').textContent).toBe('2028-02-29');
  });

  it('seleciona também os dias adjacentes sem exigir um segundo clique', () => {
    render(<DateField />);
    const { calendar } = openCalendar();
    fireEvent.click(
      within(calendar).getByRole('button', { name: 'domingo, 1 de novembro de 2026' })
    );
    expect(screen.getByTestId('saved-date').textContent).toBe('2026-11-01');
  });

  it('usa hoje e permite deixar a entrega sem data', () => {
    render(<DateField initial="2027-03-20" />);
    fireEvent.click(within(openCalendar().calendar).getByRole('button', { name: 'Hoje' }));
    expect(screen.getByTestId('saved-date').textContent).toBe('2026-10-15');
    fireEvent.click(within(openCalendar().calendar).getByRole('button', { name: 'Limpar data' }));
    expect(screen.getByTestId('saved-date').textContent).toBe('');
    expect(screen.getByRole('button', { name: /^Data de entrega/ }).textContent).toBe(
      'Selecionar uma data'
    );
  });

  it('percorre os dias com as setas, inclusive ao atravessar um mês', () => {
    render(<DateField initial="2026-10-31" />);
    const { calendar } = openCalendar();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(within(calendar).getByRole('grid', { name: 'novembro de 2026' })).toBeDefined();
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-11-01');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-11-08');
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-11-14');
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-11-08');
    fireEvent.keyDown(document.activeElement!, { key: 'PageDown' });
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-12-08');
    expect(screen.getByTestId('saved-date').textContent).toBe('2026-10-31');
  });

  it('fecha pelo Escape sem propagar o evento ou alterar a data', () => {
    const outerKeydown = vi.fn();
    render(
      <div onKeyDown={outerKeydown}>
        <DateField initial="2026-10-20" />
      </div>
    );
    const { trigger } = openCalendar();
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(screen.queryByRole('group', { name: 'Calendário da data de entrega' })).toBeNull();
    expect(outerKeydown).not.toHaveBeenCalled();
    expect(screen.getByTestId('saved-date').textContent).toBe('2026-10-20');
    expect(document.activeElement).toBe(trigger);
  });

  it('fecha quando o usuário clica fora ou move o foco para outro campo', () => {
    render(<DateField />);
    openCalendar();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('group')).toBeNull();
    openCalendar();
    act(() => screen.getByRole('button', { name: 'Outro campo' }).focus());
    expect(screen.queryByRole('group')).toBeNull();
  });
});
