/**
 * ============================================================================
 * MODAL: CriarTecidoModal
 * ARQUIVO: src/pages/Gestao/modals/CriarTecidoModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal completo para criação e edição de insumos de tecido,
 *            sem dados fictícios pré-carregados (campos vazios por padrão e
 *            opções dinâmicas via props/API).
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import { X, Plus, Image as ImageIcon, Trash2, ChevronDown } from 'lucide-react';
import type {
  TecidoInsumoItem,
  TecidoFornecedorItem,
  TecidoComposicaoItem,
  TecidoCorItem,
} from '../../../types/gestao';

// Helper functions para converter Hex <-> HSV
function hexToHsv(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (c.length !== 6) return { h: 215, s: 47, v: 50 };
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function hsvToHex(h: number, s: number, v: number): string {
  const sNorm = s / 100;
  const vNorm = v / 100;
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface CriarTecidoModalProps {
  isOpen: boolean;
  editingTecido: TecidoInsumoItem | null;
  fornecedoresOptions?: string[];
  composicoesOptions?: string[];
  coresDbOptions?: TecidoCorItem[];
  onClose: () => void;
  onSave: (tecido: TecidoInsumoItem) => void;
}

export const CriarTecidoModal: React.FC<CriarTecidoModalProps> = ({
  isOpen,
  editingTecido,
  fornecedoresOptions = [],
  composicoesOptions = [],
  coresDbOptions = [],
  onClose,
  onSave,
}) => {
  // Campos básicos
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [preco, setPreco] = useState('0');
  const [unidade, setUnidade] = useState<'Metros' | 'Kg'>('Metros');
  const [observacoes, setObservacoes] = useState('');

  // 1° Fornecedores
  const [fornecedoresList, setFornecedoresList] = useState<TecidoFornecedorItem[]>([]);
  const [openFornecedorDropdownId, setOpenFornecedorDropdownId] = useState<string | null>(null);

  // 2° Imagens (Explorer + Drag&Drop)
  const [imagensList, setImagensList] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3° Composição
  const [composicoesList, setComposicoesList] = useState<TecidoComposicaoItem[]>([]);
  const [openComposicaoDropdownId, setOpenComposicaoDropdownId] = useState<string | null>(null);

  // 4° Cores
  const [coresList, setCoresList] = useState<TecidoCorItem[]>([]);
  const [showColorPickerModal, setShowColorPickerModal] = useState(false);
  const [searchColorQuery, setSearchColorQuery] = useState('');
  const [visibleColorCount, setVisibleColorCount] = useState(10);
  const [selectedHex, setSelectedHex] = useState('#456286');
  const [customColorNome, setCustomColorNome] = useState('');
  const [customColorCodigo, setCustomColorCodigo] = useState('');

  // 5° Propriedades
  const [gramatura, setGramatura] = useState('0');
  const [largura, setLargura] = useState('0');
  const [encolhimento, setEncolhimento] = useState('');
  const [construcao, setConstrucao] = useState('');

  // Reset/preenche dados ao abrir ou alterar tecido (sincronização de props sem useEffect)
  const [prevEditingTecido, setPrevEditingTecido] = useState<TecidoInsumoItem | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (editingTecido !== prevEditingTecido || isOpen !== prevIsOpen) {
    setPrevEditingTecido(editingTecido);
    setPrevIsOpen(isOpen);
    if (editingTecido) {
      setNome(editingTecido.nome || '');
      setCodigo(editingTecido.codigo || '');
      const rawCusto = editingTecido.custo || '';
      const parsedPreco = rawCusto.split(' ')[1]?.split(',')[0] || '0';
      setPreco(parsedPreco);
      setUnidade(editingTecido.unidade === 'Kg' ? 'Kg' : 'Metros');
      setObservacoes(editingTecido.observacoes || '');

      setFornecedoresList(editingTecido.fornecedoresList || []);
      setImagensList(
        editingTecido.imagensList || (editingTecido.imagemUrl ? [editingTecido.imagemUrl] : [])
      );
      setComposicoesList(editingTecido.composicoesList || []);
      setCoresList(editingTecido.coresList || []);
      if (editingTecido.propriedades) {
        setGramatura(editingTecido.propriedades.gramatura || '0');
        setLargura(editingTecido.propriedades.largura || '0');
        setEncolhimento(editingTecido.propriedades.encolhimento || '');
        setConstrucao(editingTecido.propriedades.construcao || '');
      }
    } else {
      setNome('');
      setCodigo('');
      setPreco('0');
      setUnidade('Metros');
      setObservacoes('');
      setFornecedoresList([]);
      setImagensList([]);
      setComposicoesList([]);
      setCoresList([]);
      setGramatura('0');
      setLargura('0');
      setEncolhimento('');
      setConstrucao('');
    }
  }

  if (!isOpen) return null;

  // --- RENDIMENTO CÁLCULO AUTOMÁTICO ---
  const numGramatura = parseFloat(gramatura) || 0;
  const numLargura = parseFloat(largura) || 0;

  const calculatedRendimento1 =
    numGramatura > 0 && numLargura > 0 ? (1000 / (numGramatura * numLargura)).toFixed(2) : '0.00';

  const calculatedRendimento2 =
    numGramatura > 0 && numLargura > 0 ? ((numGramatura * numLargura) / 1000).toFixed(2) : '0.00';

  // --- HANDLERS FORNECEDORES ---
  const handleAddFornecedorRow = () => {
    setFornecedoresList((prev) => [
      ...prev,
      { id: `forn-${Date.now()}-${Math.random()}`, fornecedor: '', codigo: '' },
    ]);
  };

  const handleRemoveFornecedorRow = (id: string) => {
    setFornecedoresList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateFornecedorRow = (id: string, field: 'fornecedor' | 'codigo', value: string) => {
    setFornecedoresList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // --- HANDLERS IMAGENS ---
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newImgs: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newImgs.push(url);
      }
    });
    setImagensList((prev) => [...prev, ...newImgs]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagensList((prev) => prev.filter((_, i) => i !== index));
  };

  // --- HANDLERS COMPOSIÇÃO ---
  const handleAddComposicaoRow = () => {
    setComposicoesList((prev) => [
      ...prev,
      { id: `comp-${Date.now()}-${Math.random()}`, porcentagem: '0', composicao: '' },
    ]);
  };

  const handleRemoveComposicaoRow = (id: string) => {
    setComposicoesList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateComposicaoRow = (
    id: string,
    field: 'porcentagem' | 'composicao',
    value: string
  ) => {
    setComposicoesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // --- HANDLERS CORES ---
  const handleRemoveCorTile = (id: string) => {
    setCoresList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddPresetCor = (preset: TecidoCorItem) => {
    if (!coresList.some((c) => c.id === preset.id || c.nome === preset.nome)) {
      setCoresList((prev) => [...prev, preset]);
    }
    setShowColorPickerModal(false);
  };

  const handleAddCustomCor = () => {
    const nomeFinal = customColorNome.trim() || `Cor ${selectedHex}`;
    const newCor: TecidoCorItem = {
      id: `cor-${Date.now()}`,
      nome: nomeFinal,
      codigo: customColorCodigo.trim() || undefined,
      hex: selectedHex,
    };
    setCoresList((prev) => [...prev, newCor]);
    setCustomColorNome('');
    setCustomColorCodigo('');
    setShowColorPickerModal(false);
  };

  // --- SUBMIT DA MODAL ---
  const handleSubmit = () => {
    if (!nome.trim()) {
      alert('Por favor, informe o nome do insumo.');
      return;
    }

    const fornecedoresString =
      fornecedoresList
        .map((f) => f.fornecedor)
        .filter(Boolean)
        .join(', ') || '';

    const resultTecido: TecidoInsumoItem = {
      id: editingTecido ? editingTecido.id : `tec-${Date.now()}`,
      nome: nome.trim(),
      codigo: codigo.trim() || '',
      temErp: true,
      imagemUrl: imagensList[0] || undefined,
      fornecedores: fornecedoresString,
      custo: `R$ ${preco || '0'},0000 /${unidade === 'Metros' ? 'M' : 'KG'}`,
      unidade,
      fornecedoresList,
      imagensList,
      composicoesList,
      coresList,
      propriedades: {
        gramatura,
        largura,
        rendimento1: calculatedRendimento1,
        rendimento2: calculatedRendimento2,
        encolhimento,
        construcao,
      },
      observacoes,
    };

    onSave(resultTecido);
  };

  // Filtro de cores para a modal de cor
  const filteredCoresDb = coresDbOptions.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchColorQuery.toLowerCase()) ||
      (c.codigo && c.codigo.toLowerCase().includes(searchColorQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <h3 className="text-base font-bold font-editorial text-primary">
            {editingTecido ? 'Informações' : 'Criando insumo'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition cursor-pointer p-1 rounded-lg hover:bg-surface-muted"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
          {/* 1. IDENTIFICAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
            <div>
              <h4 className="font-bold text-primary text-sm">Identificação</h4>
              <p className="text-[11px] text-muted leading-tight mt-0.5">
                Nome do insumo e código de referência
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground block">
                  Nome <span className="text-accent-bordo">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carmuça"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground block">Código</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: 3141592"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. FORNECEDORES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
            <div>
              <h4 className="font-bold text-primary text-sm">Fornecedores</h4>
              <p className="text-[11px] text-muted leading-tight mt-0.5">
                Cadastre ou selecione quais são todos os fornecedores deste insumo.
              </p>
            </div>
            <div className="md:col-span-2 space-y-3">
              {fornecedoresList.map((row) => {
                const matchingFornecedores = fornecedoresOptions.filter((f) =>
                  f.toLowerCase().includes(row.fornecedor.toLowerCase())
                );

                return (
                  <div key={row.id} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <label className="text-[10px] font-semibold text-muted mb-0.5 block">
                        Fornecedor
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={row.fornecedor}
                          onChange={(e) => {
                            handleUpdateFornecedorRow(row.id, 'fornecedor', e.target.value);
                            setOpenFornecedorDropdownId(row.id);
                          }}
                          onFocus={() => setOpenFornecedorDropdownId(row.id)}
                          placeholder="Fornecedor"
                          className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none pr-8"
                        />
                        <ChevronDown
                          className="w-3.5 h-3.5 text-muted absolute right-2.5 top-2.5 pointer-events-none"
                          strokeWidth={1.5}
                        />
                      </div>
                      {openFornecedorDropdownId === row.id && matchingFornecedores.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto p-1">
                          {matchingFornecedores.map((fName) => (
                            <button
                              key={fName}
                              type="button"
                              onClick={() => {
                                handleUpdateFornecedorRow(row.id, 'fornecedor', fName);
                                setOpenFornecedorDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-surface-muted rounded-md text-primary font-medium transition cursor-pointer"
                            >
                              {fName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-muted mb-0.5 block">
                        Código
                      </label>
                      <input
                        type="text"
                        value={row.codigo}
                        onChange={(e) =>
                          handleUpdateFornecedorRow(row.id, 'codigo', e.target.value)
                        }
                        placeholder="Código do fornecedor"
                        className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFornecedorRow(row.id)}
                      className="self-end mb-1 text-muted hover:text-rose-500 transition cursor-pointer p-1"
                      title="Remover fornecedor"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddFornecedorRow}
                className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary bg-surface-muted/50 hover:bg-surface-muted transition cursor-pointer flex items-center gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* 3. IMAGENS (Explorer + Drag&Drop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
            <div>
              <h4 className="font-bold text-primary text-sm">Imagens</h4>
              <p className="text-[11px] text-muted leading-tight mt-0.5">Imagens de referência</p>
            </div>
            <div className="md:col-span-2 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              <div className="flex flex-wrap gap-3 items-center">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition cursor-pointer text-muted ${
                    isDraggingOver
                      ? 'border-accent-camel bg-accent-camel/10 text-accent-camel'
                      : 'border-border bg-surface-muted hover:border-accent-camel hover:bg-surface-muted/80'
                  }`}
                  title="Clique para escolher ou arraste imagens aqui"
                >
                  <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
                  <span className="text-[9px] mt-1 font-semibold text-center leading-none">
                    Upload
                  </span>
                </div>

                {imagensList.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-xl border border-border overflow-hidden relative group bg-surface-muted"
                  >
                    <img
                      src={imgUrl}
                      alt={`Referência ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5 text-rose-400" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. COMPOSIÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
            <div>
              <h4 className="font-bold text-primary text-sm">Composição</h4>
              <p className="text-[11px] text-muted leading-tight mt-0.5">
                Ex.: 97% Poliéster, 3% Elastano
              </p>
            </div>
            <div className="md:col-span-2 space-y-3">
              {composicoesList.map((row) => {
                const matchingComposicoes = composicoesOptions.filter((c) =>
                  c.toLowerCase().includes(row.composicao.toLowerCase())
                );

                return (
                  <div key={row.id} className="flex items-center gap-2">
                    <div className="w-24">
                      <input
                        type="number"
                        value={row.porcentagem}
                        onChange={(e) =>
                          handleUpdateComposicaoRow(row.id, 'porcentagem', e.target.value)
                        }
                        placeholder="0"
                        className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs text-center focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.composicao}
                          onChange={(e) => {
                            handleUpdateComposicaoRow(row.id, 'composicao', e.target.value);
                            setOpenComposicaoDropdownId(row.id);
                          }}
                          onFocus={() => setOpenComposicaoDropdownId(row.id)}
                          placeholder="Composição"
                          className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none pr-8"
                        />
                        <ChevronDown
                          className="w-3.5 h-3.5 text-muted absolute right-2.5 top-2.5 pointer-events-none"
                          strokeWidth={1.5}
                        />
                      </div>
                      {openComposicaoDropdownId === row.id && matchingComposicoes.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto p-1">
                          {matchingComposicoes.map((cName) => (
                            <button
                              key={cName}
                              type="button"
                              onClick={() => {
                                handleUpdateComposicaoRow(row.id, 'composicao', cName);
                                setOpenComposicaoDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-surface-muted rounded-md text-primary font-medium transition cursor-pointer"
                            >
                              {cName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveComposicaoRow(row.id)}
                      className="text-muted hover:text-rose-500 transition cursor-pointer p-1"
                      title="Remover composição"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddComposicaoRow}
                className="px-3 py-1.5 font-bold border border-border rounded-lg text-primary bg-surface-muted/50 hover:bg-surface-muted transition cursor-pointer flex items-center gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* 5. CORES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
            <div>
              <h4 className="font-bold text-primary text-sm">Cores</h4>
              <p className="text-[11px] text-muted leading-tight mt-0.5">Ex.: Azul 2369 C</p>
            </div>
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-3 items-center">
                {/* BOTÃO MAIS + PARA ABRIR O SELETOR DE CORES */}
                <button
                  type="button"
                  onClick={() => setShowColorPickerModal(true)}
                  className="w-14 h-14 rounded-xl border-2 border-dashed border-border bg-surface hover:border-accent-camel flex items-center justify-center text-primary transition cursor-pointer"
                >
                  <Plus className="w-5 h-5" strokeWidth={1.5} />
                </button>

                {/* TILE DE CORES CADASTRADAS */}
                {coresList.map((cor) => (
                  <div
                    key={cor.id}
                    className="w-14 h-14 rounded-xl border border-border/50 relative group flex items-end justify-center p-1 shadow-xs transition-transform hover:scale-105"
                    style={{ backgroundColor: cor.hex }}
                  >
                    <span className="text-[10px] font-bold uppercase truncate max-w-full text-white drop-shadow-md">
                      {cor.codigo || cor.nome.split(' ')[0]}
                    </span>
                    {/* BOTÃO EXCLUIR HOVER NO CANTO SUPERIOR DIREITO */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCorTile(cor.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer shadow-md"
                      title="Excluir cor"
                    >
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. PROPRIEDADES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
            <div>
              <h4 className="font-bold text-primary text-sm">Propriedades</h4>
              <p className="text-[11px] text-muted leading-tight mt-0.5">
                Definição das propriedades do tecido para cálculo de custos
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Gramatura</label>
                  <input
                    type="number"
                    value={gramatura}
                    onChange={(e) => setGramatura(e.target.value)}
                    placeholder="0"
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">
                    Largura (em metros)
                  </label>
                  <input
                    type="number"
                    value={largura}
                    onChange={(e) => setLargura(e.target.value)}
                    placeholder="0"
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
              </div>

              {/* RENDIMENTO (CAMPOS CALCULADOS E BLOQUEADOS PARA EDITAÇÃO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Rendimento</label>
                  <input
                    type="text"
                    readOnly
                    value={calculatedRendimento1}
                    className="w-full bg-surface-muted/60 border border-border/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-semibold select-none outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Rendimento</label>
                  <input
                    type="text"
                    readOnly
                    value={calculatedRendimento2}
                    className="w-full bg-surface-muted/60 border border-border/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-semibold select-none outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Encolhimento</label>
                  <input
                    type="text"
                    value={encolhimento}
                    onChange={(e) => setEncolhimento(e.target.value)}
                    placeholder="Ex.: Urdume 2 Trama 9"
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Construção</label>
                  <input
                    type="text"
                    value={construcao}
                    onChange={(e) => setConstrucao(e.target.value)}
                    placeholder="Ex.: Sarja 2x1 z"
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PREÇO E OBSERVAÇÕES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-border-muted">
            <div>
              <h4 className="font-bold text-primary text-sm">Preço e observações</h4>
              <p className="text-[11px] text-muted leading-tight mt-0.5">
                Informações de preço e observações do insumo cadastrado.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Preço</label>
                  <input
                    type="text"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground block">Unidade</label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value as 'Metros' | 'Kg')}
                    className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
                  >
                    <option value="Metros">Metros</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground block">Observações</label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-start px-6 py-4 border-t border-border bg-surface-muted/30">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
          >
            {editingTecido ? 'Salvar alterações' : 'Criar insumo'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL / POPOVER DE SELEÇÃO DE CORES (Idêntico ao Print Referência)    */}
      {/* ========================================================================= */}
      {showColorPickerModal && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-4 space-y-4 text-gray-800">
            {/* 1. BARRA DE PESQUISA */}
            <div className="relative">
              <input
                type="text"
                value={searchColorQuery}
                onChange={(e) => setSearchColorQuery(e.target.value)}
                placeholder="Procure pelo nome da cor"
                className="w-full bg-white border border-blue-500 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            {/* 2. LISTA DE CORES DO BANCO DE DADOS */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {filteredCoresDb.length === 0 ? (
                <div className="text-[11px] text-gray-400 text-center py-2 italic">
                  Nenhuma cor pré-cadastrada no banco de dados. Utilize o campo abaixo para
                  adicionar.
                </div>
              ) : (
                filteredCoresDb.slice(0, visibleColorCount).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleAddPresetCor(preset)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition cursor-pointer font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />
                    <span
                      className="w-4 h-4 rounded-xs shrink-0 border border-black/10"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="truncate uppercase text-[11px] text-gray-800">
                      {preset.nome}
                    </span>
                  </button>
                ))
              )}

              {filteredCoresDb.length > visibleColorCount && (
                <button
                  type="button"
                  onClick={() => setVisibleColorCount((prev) => prev + 10)}
                  className="w-full py-1.5 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Mostrar mais ({filteredCoresDb.length - visibleColorCount} restantes)
                </button>
              )}
            </div>

            {/* 3. SELETOR DE COR 2D + HUE SLIDER + CAMPOS BRANCOS */}
            <div className="pt-3 border-t border-gray-200 space-y-4">
              {(() => {
                const hsv = hexToHsv(selectedHex);

                const updateHsv = (h: number, s: number, v: number) => {
                  const newHex = hsvToHex(h, s, v);
                  setSelectedHex(newHex);
                };

                const handleSatValPointer = (e: React.MouseEvent<HTMLDivElement>) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                  const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                  const s = Math.round((x / rect.width) * 100);
                  const v = Math.round((1 - y / rect.height) * 100);
                  updateHsv(hsv.h, s, v);
                };

                const handleHuePointer = (e: React.MouseEvent<HTMLDivElement>) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                  const h = Math.round((x / rect.width) * 360);
                  updateHsv(h, hsv.s, hsv.v);
                };

                const pureHueHex = hsvToHex(hsv.h, 100, 100);

                return (
                  <div className="flex gap-3 items-start">
                    {/* LADO ESQUERDO: PREVIEW + QUADRADO 2D + BARRA DE HUE */}
                    <div className="w-32 flex flex-col gap-2 shrink-0">
                      {/* BLUSTOCK DE COR SELECIONADA */}
                      <div
                        className="w-full h-8 rounded-lg shadow-xs border border-gray-300 transition-colors"
                        style={{ backgroundColor: selectedHex }}
                      />

                      {/* QUADRADO 2D (SATURAÇÃO / BRILHO) */}
                      <div
                        className="relative w-full h-28 rounded-lg overflow-hidden border border-gray-300 cursor-crosshair select-none"
                        style={{ backgroundColor: pureHueHex }}
                        onClick={handleSatValPointer}
                        onMouseMove={(e) => {
                          if (e.buttons === 1) handleSatValPointer(e);
                        }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(to right, #ffffff, transparent)',
                          }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(to top, #000000, transparent)',
                          }}
                        />
                        {/* CÍRCULO INDICADOR NO QUADRADO 2D */}
                        <div
                          className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${hsv.s}%`,
                            top: `${100 - hsv.v}%`,
                          }}
                        />
                      </div>

                      {/* BARRA ARCO-ÍRIS (HUE SLIDER) */}
                      <div
                        className="relative w-full h-3 rounded-full overflow-visible border border-gray-300 cursor-pointer select-none"
                        style={{
                          background:
                            'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                        }}
                        onClick={handleHuePointer}
                        onMouseMove={(e) => {
                          if (e.buttons === 1) handleHuePointer(e);
                        }}
                      >
                        {/* CÍRCULO INDICADOR NO SLIDER DE HUE */}
                        <div
                          className="absolute top-1/2 w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2 bg-transparent"
                          style={{
                            left: `${(hsv.h / 360) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* LADO DIREITO: CAMPOS EM BRANCO + BOTÃO AZUL */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <input
                        type="text"
                        value={selectedHex}
                        onChange={(e) => setSelectedHex(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-gray-900 font-mono text-xs font-semibold rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                      />
                      <input
                        type="text"
                        value={customColorNome}
                        onChange={(e) => setCustomColorNome(e.target.value)}
                        placeholder="Nome da cor"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none placeholder:text-gray-400"
                      />
                      <input
                        type="text"
                        value={customColorCodigo}
                        onChange={(e) => setCustomColorCodigo(e.target.value)}
                        placeholder="Código da cor"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none placeholder:text-gray-400"
                      />

                      <button
                        type="button"
                        onClick={handleAddCustomCor}
                        className="w-full py-2 bg-[#4361EE] hover:bg-[#3b54ce] text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* BOTÃO FECHAR */}
              <button
                type="button"
                onClick={() => setShowColorPickerModal(false)}
                className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold rounded-lg text-xs transition cursor-pointer text-center"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
