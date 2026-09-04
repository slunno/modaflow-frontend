/**
 * ============================================================================
 * MÓDULO: Componentes UI Reutilizáveis (Dropdown Multi-Select)
 * ARQUIVO: src/components/ui/MultiSelectDropdown.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Componente de seleção múltipla com caixa de busca opcional, opção
 *            de "Selecionar todos" e selos circulares de checkmark (✓) fiéis às
 *            telas do Coleção Moda PLM.
 * ----------------------------------------------------------------------------
 * PADRÃO DE USO:
 * - Importe em qualquer formulário de filtro (Peças, Dashboard, Relatórios).
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface MultiSelectDropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  className?: string;
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = options.length > 0 && selectedValues.length === options.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const toggleItem = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(item => item !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.length === 1 
      ? selectedValues[0] 
      : `${selectedValues.length} selecionados`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-xs font-semibold text-primary mb-1">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-xs font-medium text-primary flex items-center justify-between shadow-2xs hover:border-accent-camel focus:outline-none focus:ring-2 focus:ring-accent-camel/20 cursor-pointer"
      >
        <span className={`truncate ${selectedValues.length === 0 ? 'text-muted' : 'text-primary font-semibold'}`}>
          {displayText}
        </span>
        <ChevronDown className="w-4 h-4 text-muted shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-surface border border-border rounded-xl shadow-xl z-50 py-2 max-h-72 overflow-y-auto text-xs animate-fade-in">
          
          <div
            onClick={toggleSelectAll}
            className="px-3.5 py-2 hover:bg-surface-muted flex items-center gap-2.5 cursor-pointer font-bold border-b border-border-muted text-primary"
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
              isAllSelected ? 'bg-accent-camel border-accent-camel text-white' : 'border-border bg-surface'
            }`}>
              {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>Selecionar todos</span>
          </div>

          {options.map((opt, idx) => {
            const checked = selectedValues.includes(opt);
            return (
              <div
                key={`${opt}-${idx}`}
                onClick={() => toggleItem(opt)}
                className={`px-3.5 py-2 hover:bg-surface-muted flex items-center gap-2.5 cursor-pointer font-medium text-muted-foreground ${
                  checked ? 'bg-surface-muted/80 font-bold text-primary' : ''
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  checked ? 'bg-accent-camel border-accent-camel text-white' : 'border-border bg-surface'
                }`}>
                  {checked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate">{opt}</span>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};
