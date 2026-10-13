/**
 * ============================================================================
 * MÓDULO: Componentes UI Reutilizáveis (Dropdown Multi-Select)
 * ARQUIVO: src/components/ui/MultiSelectDropdown.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Componente de seleção múltipla com suporte a acessibilidade WAI-ARIA
 *            (role="combobox", role="listbox", role="option", navegação por teclado
 *            ArrowUp/Down, Enter, Space, Escape, Home, End).
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface MultiSelectDropdownProps {
  label: string;
  placeholder: string;
  options: ReadonlyArray<string | MultiSelectOption>;
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export interface MultiSelectOption {
  value: string;
  label: string;
}

function toOption(option: string | MultiSelectOption): MultiSelectOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const listboxId = useId();
  const labelId = useId();

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = options.map(toOption);
  const optionValues = normalizedOptions.map((option) => option.value);
  const selectedLabels = normalizedOptions
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  const isAllSelected =
    optionValues.length > 0 && optionValues.every((value) => selectedValues.includes(value));

  // Total de itens na lista incluindo o "Selecionar todos" (índice 0)
  const totalItems = normalizedOptions.length + 1;

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onChange(selectedValues.filter((value) => !optionValues.includes(value)));
    } else {
      onChange([...new Set([...selectedValues, ...optionValues])]);
    }
  }, [isAllSelected, onChange, optionValues, selectedValues]);

  const toggleItem = useCallback(
    (val: string) => {
      if (selectedValues.includes(val)) {
        onChange(selectedValues.filter((item) => item !== val));
      } else {
        onChange([...selectedValues, val]);
      }
    },
    [onChange, selectedValues]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
      setActiveIndex(-1);
      buttonRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % totalItems);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(totalItems - 1);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeIndex === 0) {
        toggleSelectAll();
      } else if (activeIndex > 0 && activeIndex < totalItems) {
        const option = normalizedOptions[activeIndex - 1];
        if (option) {
          toggleItem(option.value);
        }
      }
    }
  };

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
        ? (selectedLabels[0] ?? selectedValues[0])
        : `${selectedValues.length} selecionados`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label id={labelId} className="block text-xs font-semibold text-primary mb-1">
        {label}
      </label>

      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={`${labelId}`}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-xs font-medium text-primary flex items-center justify-between shadow-2xs hover:border-accent-camel focus:outline-none focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 transition-all duration-200 cursor-pointer"
      >
        <span
          className={`truncate ${selectedValues.length === 0 ? 'text-muted' : 'text-primary font-semibold'}`}
        >
          {displayText}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted shrink-0 ml-1 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={labelId}
          tabIndex={-1}
          className="absolute top-full left-0 mt-1 w-full bg-surface border border-border rounded-xl shadow-xl z-50 py-2 max-h-72 overflow-y-auto text-xs animate-in fade-in duration-200 focus:outline-none"
        >
          {/* Opção 0: Selecionar todos */}
          <div
            id={`${listboxId}-opt-0`}
            role="option"
            aria-selected={isAllSelected}
            onClick={toggleSelectAll}
            className={`px-3.5 py-2 flex items-center gap-2.5 cursor-pointer font-bold border-b border-border-muted text-primary transition-colors duration-200 ${
              activeIndex === 0 ? 'bg-accent-camel/15 text-accent-camel' : 'hover:bg-surface-muted'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200 ${
                isAllSelected
                  ? 'bg-accent-camel border-accent-camel text-on-camel'
                  : 'border-border bg-surface'
              }`}
            >
              {isAllSelected && <Check className="w-3 h-3" strokeWidth={2} />}
            </div>
            <span>Selecionar todos</span>
          </div>

          {/* Opções de dados */}
          {normalizedOptions.map((option, idx) => {
            const itemIndex = idx + 1;
            const checked = selectedValues.includes(option.value);
            const isItemActive = activeIndex === itemIndex;

            return (
              <div
                key={option.value}
                id={`${listboxId}-opt-${itemIndex}`}
                role="option"
                aria-selected={checked}
                onClick={() => toggleItem(option.value)}
                className={`px-3.5 py-2 flex items-center gap-2.5 cursor-pointer font-medium transition-colors duration-200 ${
                  isItemActive
                    ? 'bg-accent-camel/15 text-accent-camel font-semibold'
                    : checked
                      ? 'bg-surface-muted/80 font-bold text-primary'
                      : 'text-muted-foreground hover:bg-surface-muted'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-200 ${
                    checked
                      ? 'bg-accent-camel border-accent-camel text-on-camel'
                      : 'border-border bg-surface'
                  }`}
                >
                  {checked && <Check className="w-3 h-3" strokeWidth={2} />}
                </div>
                <span className="truncate">{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default MultiSelectDropdown;
