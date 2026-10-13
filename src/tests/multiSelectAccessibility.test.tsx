import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { MultiSelectDropdown } from '../components/ui/MultiSelectDropdown';

afterEach(cleanup);

describe('MultiSelectDropdown Accessibility & Keyboard Navigation', () => {
  const options = [
    { value: 'kj', label: 'King & Joe' },
    { value: 'oriba', label: 'Oriba' },
    { value: 'all', label: 'All Brands' },
  ];

  it('selecionar todos não remove seleções anteriores que não pertencem às opções filtradas', () => {
    const change = vi.fn();
    const view = render(
      <MultiSelectDropdown
        label="Cores"
        placeholder="Escolha"
        options={options}
        selectedValues={['anterior']}
        onChange={change}
      />
    );
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Selecionar todos' }));
    expect(change).toHaveBeenLastCalledWith(['anterior', 'kj', 'oriba', 'all']);
    view.rerender(
      <MultiSelectDropdown
        label="Cores"
        placeholder="Escolha"
        options={options}
        selectedValues={['anterior', 'kj', 'oriba', 'all']}
        onChange={change}
      />
    );
    fireEvent.click(screen.getByRole('option', { name: 'Selecionar todos' }));
    expect(change).toHaveBeenLastCalledWith(['anterior']);
  });

  it('renders with accessible combobox role and closed state by default', () => {
    const handleChange = vi.fn();
    render(
      <MultiSelectDropdown
        label="Marcas"
        placeholder="Selecionar marcas"
        options={options}
        selectedValues={[]}
        onChange={handleChange}
      />
    );

    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeDefined();
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(combobox.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('opens upon pressing ArrowDown and highlights "Selecionar todos" (index 0)', () => {
    const handleChange = vi.fn();
    render(
      <MultiSelectDropdown
        label="Marcas"
        placeholder="Selecionar marcas"
        options={options}
        selectedValues={[]}
        onChange={handleChange}
      />
    );

    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });

    expect(combobox.getAttribute('aria-expanded')).toBe('true');
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeDefined();

    // Active descendant should be opt-0
    const activeDescendant = combobox.getAttribute('aria-activedescendant');
    expect(activeDescendant).toMatch(/-opt-0$/);
  });

  it('navigates with ArrowDown/ArrowUp and selects item on Enter', () => {
    const handleChange = vi.fn();
    render(
      <MultiSelectDropdown
        label="Marcas"
        placeholder="Selecionar marcas"
        options={options}
        selectedValues={[]}
        onChange={handleChange}
      />
    );

    const combobox = screen.getByRole('combobox');
    // Open
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    // Move to first option ("King & Joe", index 1)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });

    expect(combobox.getAttribute('aria-activedescendant')).toMatch(/-opt-1$/);

    // Select with Enter
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledWith(['kj']);
  });

  it('closes dropdown upon Escape key', () => {
    const handleChange = vi.fn();
    render(
      <MultiSelectDropdown
        label="Marcas"
        placeholder="Selecionar marcas"
        options={options}
        selectedValues={[]}
        onChange={handleChange}
      />
    );

    const combobox = screen.getByRole('combobox');
    // Open
    fireEvent.click(combobox);
    expect(combobox.getAttribute('aria-expanded')).toBe('true');

    // Press Escape
    fireEvent.keyDown(combobox, { key: 'Escape' });
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
