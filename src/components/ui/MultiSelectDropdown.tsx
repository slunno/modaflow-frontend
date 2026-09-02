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
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 flex items-center justify-between shadow-xs hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
      >
        <span className={`truncate ${selectedValues.length === 0 ? 'text-slate-400' : 'text-slate-900 font-semibold'}`}>
          {displayText}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 max-h-72 overflow-y-auto text-xs animate-fade-in">
          
          <div
            onClick={toggleSelectAll}
            className="px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-bold border-b border-slate-100 text-slate-800"
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
              isAllSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
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
                className={`px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium text-slate-700 ${
                  checked ? 'bg-slate-50/80 font-bold text-slate-950' : ''
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
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
