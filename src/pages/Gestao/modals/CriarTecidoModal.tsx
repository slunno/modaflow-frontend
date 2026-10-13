/**
 * ============================================================================
 * MODAL: CriarTecidoModal
 * ARQUIVO: src/pages/Gestao/modals/CriarTecidoModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal completo para criação e edição de insumos de tecido,
 *            com fornecedores e cores via Linx e composições provisórias.
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useId } from 'react';
import { LinxFornecedorPicker } from '../../Home/components/LinxFornecedorPicker';
import { MaterialColorTile } from '../../Home/components/MaterialColorTile';
import { MaterialColorPicker } from '../../Home/components/MaterialColorPicker';
import { MultiSelectDropdown } from '../../../components/ui/MultiSelectDropdown';
import { InsumoInformacoesCores } from '../../Home/components/InsumoInformacoesCores';
import { InsumoResumo } from './InsumoResumo';
import './insumoEditor.css';
import {
  camposDaCor,
  completarInformacoesCores,
  coresComDadosLegados,
} from '../../../services/insumoInformacoesCores';
import { decimalManual } from '../../../services/fichaProcesso';
import { getLinxMaterialCadastro } from '../../../services/linxService';
import type { LinxMaterialCadastro, LinxMaterialCorCadastro } from '../../../types/linx';
import {
  coresDosFornecedores,
  fornecedoresDoMaterial,
  precoAutomaticoDoFornecedor,
  precosDoMaterial,
  unidadeLinxNormalizada,
} from '../../../services/insumoLinxVinculos';
import { X, Plus, Image as ImageIcon, Trash2, ChevronDown } from 'lucide-react';
import type {
  TecidoInsumoItem,
  TecidoFornecedorItem,
  TecidoComposicaoItem,
  TecidoCorItem,
  InsumoCorLinx,
  InsumoPrecoLinx,
} from '../../../types/gestao';

function gramaturaDaCor(cor: LinxMaterialCorCadastro): string {
  const valor = decimalManual(cor.GRAMATURA == null ? '' : String(cor.GRAMATURA));
  return valor === null ? '' : String(valor);
}

function encolhimentoDaCor(cor: LinxMaterialCorCadastro): string {
  const etapas = [
    { nome: 'Corte', x: cor.TEC_ENCOLHIMENTO_CORTE_X, y: cor.TEC_ENCOLHIMENTO_CORTE_Y },
    {
      nome: 'Acabamento',
      x: cor.TEC_ENCOLHIMENTO_ACABAMENTO_X,
      y: cor.TEC_ENCOLHIMENTO_ACABAMENTO_Y,
    },
    { nome: 'Lavagem', x: cor.TEC_ENCOLHIMENTO_LAVAGEM_X, y: cor.TEC_ENCOLHIMENTO_LAVAGEM_Y },
  ];
  return etapas
    .flatMap(({ nome, x, y }) => {
      const eixos = [
        x == null || String(x).trim() === '' ? '' : `X: ${x}`,
        y == null || String(y).trim() === '' ? '' : `Y: ${y}`,
      ].filter(Boolean);
      return eixos.length ? [`${nome} ${eixos.join(', ')}`] : [];
    })
    .join(' | ');
}

interface CriarTecidoModalProps {
  isOpen: boolean;
  editingTecido: TecidoInsumoItem | null;
  tipo?: 'tecido' | 'aviamento';
  composicoesOptions?: string[];
  onClose: () => void;
  onSave: (tecido: TecidoInsumoItem) => void;
}

export const CriarTecidoModal: React.FC<CriarTecidoModalProps> = ({
  isOpen,
  editingTecido,
  tipo = 'tecido',
  composicoesOptions,
  onClose,
  onSave,
}) => {
  const formId = useId();
  // Campos básicos
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [custo, setCusto] = useState('');
  const [unidade, setUnidade] = useState<string>(tipo === 'tecido' ? 'Metros' : 'Unidade');
  const [observacoes, setObservacoes] = useState('');

  // 1° Fornecedores
  const [fornecedoresList, setFornecedoresList] = useState<TecidoFornecedorItem[]>([]);
  const [formError, setFormError] = useState('');
  const [linxLookupError, setLinxLookupError] = useState('');
  const [linxLookupInfo, setLinxLookupInfo] = useState('');
  const [isLinxLookupLoading, setIsLinxLookupLoading] = useState(false);
  const [materialLinx, setMaterialLinx] = useState<LinxMaterialCadastro | null>(null);
  const [corLinx, setCorLinx] = useState<InsumoCorLinx | null>(null);
  const [precoLinx, setPrecoLinx] = useState<InsumoPrecoLinx | null>(null);
  const precoRevision = useRef(0);
  const linxLookupRequest = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const infoCoresTriggerRef = useRef<HTMLButtonElement>(null);
  const infoCoresPanelRef = useRef<HTMLElement>(null);

  // 2° Imagens (Explorer + Drag&Drop)
  const [imagensList, setImagensList] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3° Composição
  const [composicoesList, setComposicoesList] = useState<TecidoComposicaoItem[]>([]);
  const [openComposicaoDropdownId, setOpenComposicaoDropdownId] = useState<string | null>(null);

  // 4° Cores
  const [coresList, setCoresList] = useState<TecidoCorItem[]>([]);
  const [mostrarInfoCores, setMostrarInfoCores] = useState(false);
  const [corPersonalizada, setCorPersonalizada] = useState(false);
  const [corEmEdicaoId, setCorEmEdicaoId] = useState<string | null>(null);
  const corRevision = useRef(0);
  const [showColorPickerModal, setShowColorPickerModal] = useState(false);
  const colorTriggerRef = useRef<HTMLButtonElement>(null);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 12, left: 12 });
  const compositionOptions =
    composicoesOptions ??
    (tipo === 'aviamento'
      ? ['Algodão', 'Elastano', 'Elastodieno', 'Indefinido', 'Poliamida', 'Poliester']
      : [
          'Abacá',
          'Acetato',
          'Acrílico',
          'Algodão',
          'Algodão Orgânico',
          'Algodão Pima',
          'Algodão Reciclado',
          'Algodão Supima',
          'Alpaca',
          'Aramidas',
          'Elastano',
          'Elastodieno',
          'Elastomultiéster',
          'Fibra de Amianto',
          'Fibra de Basalto',
          'Fio Metalizado',
          'Juta',
          'Lã',
          'Lã Merino',
          'Lã Virgem',
          'Linho',
          'Lycra',
          'Lyocell',
          'Modal',
          'Nylon',
          'Outras fibras',
          'Poliamida',
          'Poliéster',
          'Poliéster Reciclado',
          'Polietileno',
          'Polipropileno',
          'Poliuretano',
          'Rami',
          'Rayon',
          'Seda',
          'Sintético PU',
          'Sintético PVC',
          'Spandex',
          'Tencel',
          'Viscose',
          'Viscose Reciclado',
        ]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => previous?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && mostrarInfoCores) {
      infoCoresPanelRef.current
        ?.querySelector<HTMLElement>('button[aria-label="Fechar informações por cor"]')
        ?.focus();
    }
  }, [isOpen, mostrarInfoCores]);

  useEffect(
    () => () => {
      linxLookupRequest.current += 1;
    },
    [isOpen, editingTecido, tipo]
  );

  // 5° Propriedades
  const [gramatura, setGramatura] = useState('');
  const [largura, setLargura] = useState('');
  const [encolhimento, setEncolhimento] = useState('');
  const [construcao, setConstrucao] = useState('');

  // Reset/preenche dados ao abrir ou alterar tecido (sincronização de props sem useEffect)
  const [prevEditingTecido, setPrevEditingTecido] = useState<TecidoInsumoItem | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevTipo, setPrevTipo] = useState(tipo);

  if (editingTecido !== prevEditingTecido || isOpen !== prevIsOpen || tipo !== prevTipo) {
    setPrevEditingTecido(editingTecido);
    setPrevIsOpen(isOpen);
    setPrevTipo(tipo);
    setFormError('');
    setLinxLookupError('');
    setLinxLookupInfo('');
    setIsLinxLookupLoading(false);
    setMaterialLinx(null);
    const origemCor = editingTecido?.corLinx ?? editingTecido?.propriedades?.origemLinx;
    setCorLinx(origemCor ?? null);
    setCorPersonalizada(
      !origemCor && Boolean(editingTecido?.corEmEdicaoId || editingTecido?.coresList?.length === 1)
    );
    setShowColorPickerModal(false);
    setMostrarInfoCores(false);
    setPrecoLinx(editingTecido?.precoLinx ?? null);
    if (editingTecido) {
      setNome(editingTecido.nome || '');
      setCodigo(editingTecido.codigo || '');
      setCusto(editingTecido.custo || '');
      // Abrir e salvar não pode trocar M por Metros e invalidar os consumos existentes.
      setUnidade(editingTecido.unidade);
      setObservacoes(editingTecido.observacoes || '');

      setFornecedoresList(editingTecido.fornecedoresList || []);
      setImagensList(
        editingTecido.imagensList || (editingTecido.imagemUrl ? [editingTecido.imagemUrl] : [])
      );
      setComposicoesList(editingTecido.composicoesList || []);
      const coresSalvas = coresComDadosLegados(editingTecido);
      if (origemCor && !coresSalvas.some((cor) => cor.codigo === origemCor.corCodigo))
        coresSalvas.push({
          id: `linx-material-cor-${origemCor.materialCodigo}-${origemCor.corCodigo}`,
          codigo: origemCor.corCodigo,
          nome: origemCor.corNome || origemCor.corCodigo,
          hex: '',
          origemLinx: origemCor,
        });
      setCoresList(
        coresSalvas.map((cor) =>
          origemCor && cor.codigo === origemCor.corCodigo ? { ...cor, origemLinx: origemCor } : cor
        )
      );
      setCorEmEdicaoId(
        editingTecido.corEmEdicaoId &&
          coresSalvas.some((cor) => cor.id === editingTecido.corEmEdicaoId)
          ? editingTecido.corEmEdicaoId
          : origemCor
            ? (coresSalvas.find((cor) => cor.codigo === origemCor.corCodigo)?.id ?? null)
            : coresSalvas.length === 1
              ? coresSalvas[0]!.id
              : null
      );
      const ativa =
        editingTecido.corEmEdicaoId ??
        coresSalvas.find((cor) => cor.codigo === origemCor?.corCodigo)?.id ??
        (coresSalvas.length === 1 ? coresSalvas[0]?.id : undefined);
      const contexto = camposDaCor(coresSalvas, ativa);
      if (contexto.unidade) setUnidade(contexto.unidade);
      if (contexto.custo !== undefined) setCusto(contexto.custo);
      if (contexto.precoLinx) setPrecoLinx(contexto.precoLinx);
      setGramatura(editingTecido.propriedades?.gramatura ?? '');
      setLargura(editingTecido.propriedades?.largura ?? '');
      setEncolhimento(editingTecido.propriedades?.encolhimento ?? '');
      setConstrucao(editingTecido.propriedades?.construcao ?? '');
    } else {
      setNome('');
      setCodigo('');
      setCusto('');
      setUnidade(tipo === 'tecido' ? 'Metros' : 'Unidade');
      setObservacoes('');
      setFornecedoresList([]);
      setImagensList([]);
      setComposicoesList([]);
      setCoresList([]);
      setCorEmEdicaoId(null);
      setGramatura('');
      setLargura('');
      setEncolhimento('');
      setConstrucao('');
    }
  }

  if (!isOpen) return null;

  // Rendimento usado na ficha: área por quilo e metros lineares por quilo.
  const numGramatura = parseFloat(gramatura) || 0;
  const numLargura = parseFloat(largura) || 0;

  const calculatedRendimento1 = numGramatura > 0 ? (1000 / numGramatura).toFixed(2) : '';

  const calculatedRendimento2 =
    numGramatura > 0 && numLargura > 0 ? (1000 / (numGramatura * numLargura)).toFixed(2) : '';

  const isUnidadeKg = ['kg', 'kgs', 'quilograma', 'quilogramas'].includes(
    unidade.trim().toLocaleLowerCase('pt-BR')
  );

  const origemDaCor = (cor: TecidoCorItem): InsumoCorLinx | undefined =>
    cor.origemLinx ??
    (cor.codigo && cor.id === `linx-material-cor-${codigo.trim()}-${cor.codigo}`
      ? { materialCodigo: codigo.trim(), corCodigo: cor.codigo, corNome: cor.nome }
      : undefined);
  const codigosCoresSelecionadas = coresList.flatMap((cor) => {
    const origem = origemDaCor(cor);
    return origem?.materialCodigo === codigo.trim() ? [origem.corCodigo] : [];
  });
  const corEmEdicao = coresList.find((cor) => cor.id === corEmEdicaoId);
  const fornecedoresDisponiveis = materialLinx
    ? fornecedoresDoMaterial(materialLinx, codigosCoresSelecionadas)
    : undefined;
  const coresDisponiveis = materialLinx ? coresDosFornecedores(materialLinx, fornecedoresList) : [];
  const fornecedoresSemVinculo = materialLinx
    ? fornecedoresList.filter(
        (item) =>
          item.codigo &&
          !fornecedoresDisponiveis?.some((disponivel) => disponivel.codigo === item.codigo)
      )
    : [];

  const limparPrecoSelecionado = () => {
    precoRevision.current += 1;
    if (precoLinx) setCusto('');
    setPrecoLinx(null);
  };

  const aplicarCorLinx = (
    materialCodigo: string,
    cor?: LinxMaterialCorCadastro,
    revisarPreco = true
  ) => {
    if (revisarPreco && precoLinx?.corCodigo && precoLinx.corCodigo !== cor?.CODIGO_COR) {
      limparPrecoSelecionado();
    }
    if (!cor) {
      setCorLinx(null);
      setGramatura('');
      setEncolhimento('');
      return;
    }
    setCorPersonalizada(false);
    setCorLinx({ materialCodigo, corCodigo: cor.CODIGO_COR, corNome: cor.NOME_COR ?? '' });
    if (tipo === 'tecido') {
      setGramatura(gramaturaDaCor(cor));
      setEncolhimento(encolhimentoDaCor(cor));
    }
  };

  const editarCor = (cor?: TecidoCorItem) => {
    if (cor && cor.id === corEmEdicaoId) return;
    corRevision.current += 1;
    precoRevision.current += 1;
    const origem = cor ? origemDaCor(cor) : undefined;
    setCorPersonalizada(Boolean(cor && !origem));
    setCorEmEdicaoId(cor?.id ?? null);
    setShowColorPickerModal(false);
    setCusto(cor?.dadosInsumo?.custo ?? '');
    setPrecoLinx(cor?.dadosInsumo?.precoLinx ?? null);
    if (cor?.dadosInsumo?.unidade) setUnidade(cor.dadosInsumo.unidade);
    setFormError('');
    if (!materialLinx || !origem) {
      setCorLinx(null);
      setGramatura('');
      setEncolhimento('');
      return;
    }
    aplicarCorLinx(
      materialLinx.codigo,
      materialLinx.cores.find((item) => item.CODIGO_COR === origem.corCodigo),
      false
    );
  };

  const atualizarCoresInfo = (proximas: TecidoCorItem[]) => {
    corRevision.current += 1;
    precoRevision.current += 1;
    setCoresList(proximas);
    const campos = camposDaCor(proximas, corEmEdicaoId);
    if (campos.custo !== undefined) {
      setCusto(campos.custo);
      setPrecoLinx(campos.precoLinx ?? null);
      setUnidade(campos.unidade!);
    }
  };

  const fecharInfoCores = () => {
    setMostrarInfoCores(false);
    const trigger = coresList.length ? infoCoresTriggerRef.current : colorTriggerRef.current;
    trigger?.focus();
    // No layout em duas etapas o botão só volta a ser visível após o commit.
    requestAnimationFrame(() => {
      if (document.activeElement !== trigger) trigger?.focus();
    });
  };

  const selecionarCoresLinx = (codigos: string[]) => {
    corRevision.current += 1;
    const manter = coresList.filter((cor) => {
      const origem = origemDaCor(cor);
      return !origem || codigos.includes(origem.corCodigo);
    });
    const adicionadas: TecidoCorItem[] = [];
    for (const corCodigo of codigos) {
      if (manter.some((cor) => origemDaCor(cor)?.corCodigo === corCodigo)) continue;
      const cor = materialLinx?.cores.find((item) => item.CODIGO_COR === corCodigo);
      if (!cor || !materialLinx) continue;
      adicionadas.push({
        id: `linx-material-cor-${materialLinx.codigo}-${cor.CODIGO_COR}`,
        codigo: cor.CODIGO_COR,
        nome: cor.NOME_COR || cor.CODIGO_COR,
        hex: '',
        origemLinx: {
          materialCodigo: materialLinx.codigo,
          corCodigo: cor.CODIGO_COR,
          corNome: cor.NOME_COR ?? '',
        },
      });
    }
    const proximas = completarInformacoesCores(
      [...manter, ...adicionadas],
      materialLinx,
      fornecedoresList,
      unidade
    );
    atualizarCoresInfo(proximas);
    setFormError('');
    if (adicionadas.length === 1) editarCor(proximas.find((cor) => cor.id === adicionadas[0]!.id));
    else if (corEmEdicaoId && !manter.some((cor) => cor.id === corEmEdicaoId)) editarCor();
  };

  const handleMaterialCodeChange = (value: string) => {
    if (value.trim() !== codigo.trim()) {
      linxLookupRequest.current += 1;
      setIsLinxLookupLoading(false);
      if (materialLinx || corLinx) {
        setNome('');
        setLargura('');
        setUnidade('');
      }
      setMaterialLinx(null);
      limparPrecoSelecionado();
      setFornecedoresList((previous) => previous.filter((item) => !item.materialLinxCodigo));
      aplicarCorLinx(value.trim());
      setCorEmEdicaoId(null);
      setCorPersonalizada(false);
      setCoresList((previous) => previous.filter((item) => !origemDaCor(item)));
    }
    setCodigo(value);
    setLinxLookupError('');
    setLinxLookupInfo('');
  };

  const handleSearchLinxMaterial = async () => {
    const materialCode = codigo.trim();
    if (!materialCode) {
      setLinxLookupError(`Digite o código do ${tipo} para pesquisar no Linx.`);
      setLinxLookupInfo('');
      return;
    }
    const requestId = ++linxLookupRequest.current;
    const priceRevisionAtRequest = precoRevision.current;
    const colorRevisionAtRequest = corRevision.current;
    setIsLinxLookupLoading(true);
    setMaterialLinx(null);
    setLinxLookupError('');
    setLinxLookupInfo('');
    try {
      const material = await getLinxMaterialCadastro(materialCode);
      if (requestId !== linxLookupRequest.current) return;
      setMaterialLinx(material);
      setCodigo(material.codigo || materialCode);
      setNome(material.nome ?? '');

      const linxUnit = (material.unidadeFichaTecnica || material.unidadeEstoque || '').trim();
      if (!linxUnit) setUnidade('');
      if (linxUnit) {
        setUnidade(unidadeLinxNormalizada(linxUnit));
      }
      if (tipo === 'tecido') {
        const larguraNumerica = decimalManual(
          material.largura == null ? '' : String(material.largura)
        );
        setLargura(larguraNumerica === null ? '' : String(larguraNumerica));
      }
      if (corRevision.current === colorRevisionAtRequest)
        aplicarCorLinx(
          material.codigo,
          corLinx?.materialCodigo === material.codigo
            ? material.cores.find((cor) => cor.CODIGO_COR === corLinx.corCodigo)
            : undefined,
          false
        );
      if (
        corRevision.current === colorRevisionAtRequest &&
        precoRevision.current === priceRevisionAtRequest
      ) {
        const novas = completarInformacoesCores(
          coresList,
          material,
          fornecedoresList,
          linxUnit ? unidadeLinxNormalizada(linxUnit) : unidade
        );
        atualizarCoresInfo(novas);
      }
      if (
        precoLinx &&
        precoRevision.current === priceRevisionAtRequest &&
        !precosDoMaterial(material, corLinx?.corCodigo ?? '', fornecedoresList).some(
          (preco) =>
            preco.fonte === precoLinx.fonte &&
            preco.corCodigo === precoLinx.corCodigo &&
            preco.fornecedorCodigo === precoLinx.fornecedorCodigo &&
            decimalManual(preco.valor) === decimalManual(precoLinx.valor) &&
            unidadeLinxNormalizada(preco.unidade) === unidadeLinxNormalizada(linxUnit)
        )
      )
        limparPrecoSelecionado();
      const colorCount = material.cores?.length ?? 0;
      setLinxLookupInfo(
        tipo === 'tecido'
          ? colorCount
            ? `Material encontrado. Escolha uma das ${colorCount} cores para preencher as propriedades do tecido.`
            : 'Material encontrado, mas não há cores cadastradas para preencher as propriedades do tecido.'
          : colorCount
            ? `Material encontrado. Escolha uma das ${colorCount} cores disponíveis para o aviamento.`
            : 'Material encontrado. Não há cores cadastradas para este aviamento.'
      );
    } catch (error) {
      if (requestId !== linxLookupRequest.current) return;
      setLinxLookupError(
        error instanceof Error ? error.message : 'Não foi possível consultar o material no Linx.'
      );
    } finally {
      if (requestId === linxLookupRequest.current) setIsLinxLookupLoading(false);
    }
  };

  // --- HANDLERS FORNECEDORES ---
  const handleAddFornecedorRow = () => {
    setFornecedoresList((prev) => [
      ...prev,
      { id: `forn-${Date.now()}-${Math.random()}`, fornecedor: '', codigo: '' },
    ]);
  };

  const handleRemoveFornecedorRow = (id: string) => {
    const removido = fornecedoresList.find((item) => item.id === id);
    if (
      precoLinx?.fornecedorCodigo === removido?.codigo &&
      !fornecedoresList.some((item) => item.id !== id && item.codigo === removido?.codigo)
    )
      limparPrecoSelecionado();
    const novos = fornecedoresList.filter((item) => item.id !== id);
    setFornecedoresList(novos);
    atualizarCoresInfo(completarInformacoesCores(coresList, materialLinx, novos, unidade));
  };

  const handleFornecedorChange = (id: string, supplier: { fornecedor: string; codigo: string }) => {
    const novos = fornecedoresList.map((item) =>
      item.id === id ? { ...item, ...supplier, materialLinxCodigo: materialLinx?.codigo } : item
    );
    if (
      precoLinx?.fornecedorCodigo &&
      !novos.some((item) => item.codigo === precoLinx.fornecedorCodigo)
    )
      limparPrecoSelecionado();
    setFornecedoresList(novos);
    atualizarCoresInfo(completarInformacoesCores(coresList, materialLinx, novos, unidade));
  };

  // Imagens em data URL para manter o rascunho local após reabrir a ficha.
  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    if (selected.some((file) => !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024)) {
      setFormError('Selecione imagens de até 2 MB cada.');
      return;
    }
    try {
      const images = await Promise.all(
        selected.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      setImagensList((previous) => [...previous, ...images]);
      setFormError('');
    } catch {
      setFormError('Não foi possível ler a imagem.');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    void handleFileSelect(event.dataTransfer.files);
  };
  const handleRemoveImage = (index: number) =>
    setImagensList((previous) => previous.filter((_, i) => i !== index));

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
    corRevision.current += 1;
    if (id === corEmEdicaoId) editarCor();
    setCoresList((prev) => prev.filter((c) => c.id !== id));
  };

  const openColorPicker = () => {
    const anchor = colorTriggerRef.current?.getBoundingClientRect();
    if (anchor) {
      setColorPickerPosition({
        top: Math.max(8, Math.min(anchor.top - 12, window.innerHeight - 378)),
        left: Math.max(8, Math.min(anchor.left, window.innerWidth - 234)),
      });
    }
    setFormError('');
    setShowColorPickerModal(true);
  };

  // --- SUBMIT DA MODAL ---
  const handleSubmit = () => {
    if (fornecedoresSemVinculo.length) {
      setFormError(
        'Revise os fornecedores: há uma seleção sem vínculo ativo com este material/cor.'
      );
      return;
    }
    if (custo.trim() && decimalManual(custo) === null) {
      setFormError('Informe preço válido, sem separador de milhar. Use vírgula ou ponto decimal.');
      return;
    }
    if (!nome.trim()) {
      setFormError('Por favor, informe o nome do insumo.');
      return;
    }

    if (
      composicoesList.some(
        (row) => !row.composicao || Number(row.porcentagem) < 0 || Number(row.porcentagem) > 100
      )
    ) {
      setFormError('Selecione a composição e um percentual entre 0 e 100.');
      return;
    }
    const fornecedoresString =
      fornecedoresList
        .map((f) => f.fornecedor)
        .filter(Boolean)
        .join(', ') || '';

    const resultTecido: TecidoInsumoItem = {
      ...editingTecido,
      ...camposDaCor(coresList, corEmEdicaoId),
      id: editingTecido?.id ?? crypto.randomUUID(),
      nome: nome.trim(),
      codigo: codigo.trim() || '',
      temErp: false,
      imagemUrl: imagensList[0] || undefined,
      fornecedores: fornecedoresString,
      custo,
      unidade,
      fornecedoresList,
      imagensList,
      composicoesList,
      corEmEdicaoId: corEmEdicaoId ?? undefined,
      coresList: coresList.map((cor) =>
        materialLinx && origemDaCor(cor)
          ? {
              ...cor,
              fornecedoresList: fornecedoresList.filter((fornecedor) =>
                materialLinx.fornecedores?.some(
                  (vinculo) =>
                    vinculo.CODIGO_COR === cor.codigo &&
                    vinculo.CODIGO_FORNECEDOR === fornecedor.codigo
                )
              ),
            }
          : cor
      ),
      corLinx: corLinx ?? undefined,
      precoLinx: precoLinx ?? undefined,
      propriedades:
        tipo === 'tecido'
          ? {
              gramatura,
              largura,
              rendimento1: isUnidadeKg ? calculatedRendimento1 : '',
              rendimento2: isUnidadeKg ? calculatedRendimento2 : '',
              encolhimento,
              construcao,
              origemLinx: corLinx ?? undefined,
            }
          : undefined,
      observacoes,
    };

    onSave(resultTecido);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={tipo === 'tecido' ? 'Cadastro de tecido' : 'Cadastro de aviamento'}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            if (showColorPickerModal) setShowColorPickerModal(false);
            else if (mostrarInfoCores) fecharInfoCores();
            else onClose();
          }
          if (event.key === 'Tab') {
            const focusable = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
              )
            ).filter((element) => {
              // O passo de cores oculta o formulário em telas estreitas, sem desmontar dados.
              for (
                let node: HTMLElement | null = element;
                node && node !== event.currentTarget;
                node = node.parentElement
              ) {
                if (node.hidden || getComputedStyle(node).display === 'none') return false;
              }
              return element.tabIndex >= 0;
            });
            const first = focusable[0],
              last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            }
            if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
        data-cores-abertas={mostrarInfoCores}
        className="insumo-dialog text-primary"
      >
        <section className="insumo-main rounded-card border border-border bg-surface shadow-xl">
          {/* MODAL HEADER */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3 border-b border-border bg-surface">
            <h3 className="text-base font-bold font-editorial text-primary">
              {editingTecido ? 'Editar' : 'Adicionar'} {tipo === 'tecido' ? 'tecido' : 'aviamento'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="text-muted hover:text-primary transition cursor-pointer p-1 rounded-lg hover:bg-surface-muted"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <section aria-label="Formulário do insumo" className="min-w-0">
              {/* MODAL BODY */}
              <div className="p-4 text-sm">
                <div className="flex flex-col gap-4">
                  <InsumoResumo
                    nome={nome}
                    codigo={codigo}
                    custo={custo}
                    unidade={unidade}
                    fornecedores={fornecedoresList.map((item) => item.fornecedor)}
                    cores={coresList.length}
                    imagens={imagensList}
                    fonte={precoLinx?.fonte}
                    compacto
                  />
                  <div className="space-y-3">
                    {/* 1. IDENTIFICAÇÃO */}
                    <div className="space-y-3 rounded-card border border-border bg-surface p-4">
                      <div>
                        <h4 className="font-bold text-primary text-sm">Identificação</h4>
                        <p className="text-[11px] text-muted leading-tight mt-0.5">
                          Nome do insumo e código de referência
                        </p>
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label
                            className="font-semibold text-muted-foreground block"
                            htmlFor={`${formId}-campo-0`}
                          >
                            Nome <span className="text-accent-bordo">*</span>
                          </label>
                          <input
                            id={`${formId}-campo-0`}
                            type="text"
                            value={nome}
                            readOnly={materialLinx !== null}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Carmuça"
                            className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            className="font-semibold text-muted-foreground block"
                            htmlFor={`${formId}-campo-1`}
                          >
                            Código
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id={`${formId}-campo-1`}
                              type="text"
                              value={codigo}
                              onChange={(e) => handleMaterialCodeChange(e.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  void handleSearchLinxMaterial();
                                }
                              }}
                              placeholder="Ex: 3141592"
                              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                            />
                            <button
                              type="button"
                              aria-label="Pesquisar código no Linx"
                              title="Pesquisar código no Linx"
                              onClick={() => void handleSearchLinxMaterial()}
                              disabled={isLinxLookupLoading}
                              className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-surface-muted disabled:cursor-wait disabled:opacity-60"
                            >
                              {isLinxLookupLoading ? 'Consultando Linx…' : 'Pesquisar'}
                            </button>
                          </div>
                          {linxLookupError && (
                            <p role="alert" className="mt-1 text-xs text-red-600">
                              {linxLookupError}
                            </p>
                          )}
                          {linxLookupInfo && (
                            <p role="status" className="mt-1 text-xs text-muted">
                              {linxLookupInfo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* 5. CORES */}
                    <div className="grid gap-3 rounded-card border border-border bg-surface p-4 xl:grid-cols-2">
                      <div className="min-w-0">
                        <h4 className="mb-2 font-bold text-primary text-sm">Cores</h4>
                        <div className="mb-3 space-y-1">
                          <MultiSelectDropdown
                            label={`Cores do ${tipo} no Linx`}
                            placeholder="Selecione uma ou mais cores"
                            options={
                              materialLinx
                                ? coresDisponiveis.map((cor) => ({
                                    value: cor.CODIGO_COR,
                                    label: `${cor.NOME_COR || cor.CODIGO_COR} (${cor.CODIGO_COR})`,
                                  }))
                                : coresList.flatMap((cor) => {
                                    const origem = origemDaCor(cor);
                                    return origem
                                      ? [
                                          {
                                            value: origem.corCodigo,
                                            label: `${cor.nome} (${origem.corCodigo})`,
                                          },
                                        ]
                                      : [];
                                  })
                            }
                            selectedValues={codigosCoresSelecionadas}
                            onChange={selecionarCoresLinx}
                          />
                          <details className="text-[11px] text-muted">
                            <summary className="cursor-pointer py-1">
                              Como cores e fornecedores são vinculados
                            </summary>
                            <p className="pt-1">
                              {corPersonalizada
                                ? 'Defina uma cor personalizada abaixo e informe o preço manualmente. Ela fica somente no portal.'
                                : materialLinx || corLinx
                                  ? tipo === 'tecido'
                                    ? 'Gramatura e encolhimento seguem a cor selecionada. Composição e construção são manuais.'
                                    : 'A cor selecionada fica vinculada ao aviamento. A composição é manual.'
                                  : `Pesquise o código do ${tipo} para consultar suas cores${tipo === 'tecido' ? ' e propriedades' : ''}.`}
                            </p>
                            {materialLinx && (
                              <p className="pt-1">
                                Marque quantas cores quiser. Clique novamente para desmarcar. As
                                cores selecionadas filtram os fornecedores; os fornecedores também
                                filtram as opções.
                              </p>
                            )}
                          </details>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                          {/* BOTÃO MAIS + PARA ABRIR O SELETOR DE CORES */}
                          <button
                            type="button"
                            ref={colorTriggerRef}
                            onClick={openColorPicker}
                            aria-label="Adicionar cor personalizada"
                            title="Adicionar cor personalizada"
                            className="inline-flex gap-1 items-center rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-xs text-primary transition hover:border-accent-camel"
                          >
                            <Plus className="w-5 h-5" strokeWidth={1.5} />
                            Cor personalizada
                          </button>

                          {/* TILE DE CORES CADASTRADAS */}
                          {coresList.map((cor) => (
                            <MaterialColorTile
                              key={cor.id}
                              color={cor}
                              onRemove={() => handleRemoveCorTile(cor.id)}
                              onSelect={() => {
                                editarCor(cor);
                                setMostrarInfoCores(true);
                              }}
                              selected={cor.id === corEmEdicaoId}
                            />
                          ))}
                        </div>
                        <p role="status" className="mt-3 text-[11px] text-muted">
                          {corEmEdicao
                            ? `Preço e propriedades em edição: ${corEmEdicao.nome}${corEmEdicao.codigo ? ` (${corEmEdicao.codigo})` : ''}.`
                            : coresList.length
                              ? 'Clique em uma cor selecionada para consultar seu preço e suas propriedades.'
                              : 'Nenhuma cor selecionada.'}
                        </p>
                        {(!!coresList.length || mostrarInfoCores) && (
                          <button
                            type="button"
                            ref={infoCoresTriggerRef}
                            aria-expanded={mostrarInfoCores}
                            aria-controls={`${formId}-info-cores`}
                            onClick={() => {
                              if (mostrarInfoCores) fecharInfoCores();
                              else setMostrarInfoCores(true);
                            }}
                            className="mt-2 rounded border border-border px-3 py-2 text-xs font-semibold"
                          >
                            Editar informação das cores
                          </button>
                        )}
                      </div>
                      <div className="min-w-0 space-y-2 border-t border-border pt-3 xl:border-t-0 xl:border-l xl:pl-3 xl:pt-0">
                        <h5 className="text-sm font-semibold text-primary">Fornecedores</h5>
                        <p className="text-[11px] text-muted">
                          {materialLinx
                            ? 'Somente fornecedores ativos vinculados a este material/cor.'
                            : 'Pesquise pelo nome ou código de um fornecedor ativo.'}
                        </p>
                        {materialLinx && fornecedoresDisponiveis?.length === 0 && (
                          <p role="status" className="text-xs text-muted">
                            Não há fornecedores ativos vinculados a esta seleção.
                          </p>
                        )}
                        {fornecedoresSemVinculo.length > 0 && (
                          <p role="alert" className="text-xs text-red-600">
                            Sem vínculo ativo com este material/cor:{' '}
                            {fornecedoresSemVinculo.map((item) => item.fornecedor).join(', ')}.
                            Revise ou remova essas seleções antes de salvar. Nenhum dado existente
                            foi apagado.
                          </p>
                        )}
                        {fornecedoresList.map((row) => (
                          <div key={row.id} className="flex items-end gap-2">
                            <LinxFornecedorPicker
                              value={row}
                              options={fornecedoresDisponiveis?.filter(
                                (supplier) =>
                                  !fornecedoresList.some(
                                    (item) => item.id !== row.id && item.codigo === supplier.codigo
                                  )
                              )}
                              onChange={(supplier) => handleFornecedorChange(row.id, supplier)}
                            />
                            <button
                              type="button"
                              title="Remover fornecedor"
                              aria-label={`Remover fornecedor ${row.fornecedor || 'vazio'}`}
                              onClick={() => handleRemoveFornecedorRow(row.id)}
                              className="p-2 text-red-600 dark:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddFornecedorRow}
                          className="flex items-center gap-1 rounded-lg border border-border bg-surface-muted/50 px-3 py-1.5 text-xs font-bold text-primary hover:bg-surface-muted"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          Adicionar fornecedor
                        </button>
                      </div>
                    </div>
                    {/* OBSERVAÇÕES */}
                    <div className="space-y-3 rounded-card border border-border bg-surface p-4">
                      <div>
                        <h4 className="font-bold text-primary text-sm">Preço e unidade</h4>
                        <p className="text-[11px] text-muted leading-tight mt-0.5">
                          Valor vinculado a este insumo na ficha.
                        </p>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label
                              className="font-semibold text-muted-foreground block"
                              htmlFor={`${formId}-campo-2`}
                            >
                              Preço
                            </label>
                            <input
                              id={`${formId}-campo-2`}
                              aria-label="Preço do insumo"
                              inputMode="decimal"
                              value={custo}
                              onChange={(e) => {
                                const valor = e.target.value;
                                precoRevision.current += 1;
                                corRevision.current += 1;
                                setCusto(valor);
                                setPrecoLinx(null);
                                setCoresList((previous) =>
                                  previous.map((cor) =>
                                    cor.id === corEmEdicaoId
                                      ? {
                                          ...cor,
                                          dadosInsumo: {
                                            unidade,
                                            ...cor.dadosInsumo,
                                            precoLinx: undefined,
                                            precoManual: true,
                                            custo: valor,
                                          },
                                        }
                                      : cor
                                  )
                                );
                              }}
                              placeholder="0,00"
                              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              className="font-semibold text-muted-foreground block"
                              htmlFor={`${formId}-campo-3`}
                            >
                              Unidade
                            </label>
                            <select
                              id={`${formId}-campo-3`}
                              value={unidade}
                              disabled={isLinxLookupLoading}
                              onChange={(e) => {
                                if (
                                  precoLinx &&
                                  unidadeLinxNormalizada(e.target.value) !==
                                    unidadeLinxNormalizada(precoLinx.unidade)
                                )
                                  limparPrecoSelecionado();
                                setUnidade(e.target.value);
                                const novas = coresList.map((cor) =>
                                  cor.id === corEmEdicaoId
                                    ? {
                                        ...cor,
                                        dadosInsumo: {
                                          custo,
                                          ...cor.dadosInsumo,
                                          unidade: e.target.value,
                                          ...(cor.dadosInsumo?.precoLinx &&
                                          unidadeLinxNormalizada(e.target.value) !==
                                            unidadeLinxNormalizada(
                                              cor.dadosInsumo.precoLinx.unidade
                                            )
                                            ? { custo: '', precoLinx: undefined }
                                            : {}),
                                        },
                                      }
                                    : cor
                                );
                                atualizarCoresInfo(
                                  completarInformacoesCores(
                                    novas,
                                    materialLinx,
                                    fornecedoresList,
                                    e.target.value
                                  )
                                );
                              }}
                              className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
                            >
                              <option value="Metros">Metros</option>
                              <option value="Kg">Kg</option>
                              <option value="Unidade">Unidade</option>
                              {!['Metros', 'Kg', 'Unidade'].includes(unidade) && (
                                <option value={unidade}>
                                  {unidade || 'Unidade não informada no Linx'}
                                </option>
                              )}
                            </select>
                          </div>
                        </div>
                        <details className="text-[11px] text-muted">
                          <summary className="cursor-pointer py-1">
                            Origem e edição do preço
                          </summary>
                          <p className="pt-1">
                            {precoLinx
                              ? `Valor do Linx. Fonte: ${precoLinx.fonte}${precoLinx.corCodigo ? ` · cor ${precoLinx.corCodigo}` : ''}${precoLinx.fornecedorCodigo ? ` · fornecedor ${precoLinx.fornecedorCodigo}` : ''}.`
                              : corPersonalizada
                                ? 'Cor personalizada: informe o preço manualmente.'
                                : 'Preço manual vinculado a este insumo da ficha.'}{' '}
                            Este cadastro não atualiza o catálogo Linx.
                          </p>
                          {precoLinx?.fonte === 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO' && (
                            <p className="text-xs text-muted">
                              Preço do fornecedor escolhido para esta cor. Você pode corrigir o
                              valor manualmente; o catálogo Linx não será alterado.
                            </p>
                          )}
                        </details>
                        {materialLinx &&
                          corLinx &&
                          !precoAutomaticoDoFornecedor(
                            materialLinx,
                            corLinx.corCodigo,
                            corEmEdicao?.dadosInsumo?.fornecedorCodigo ?? '',
                            unidade
                          ) && (
                            <p role="status" className="text-xs text-muted">
                              Selecione o fornecedor desta cor. Se o preço estiver ausente ou a
                              unidade não coincidir, informe manualmente; não há conversão nem uso
                              de outra fonte.
                            </p>
                          )}
                        {editingTecido && editingTecido.unidade !== unidade && (
                          <p role="status" className="text-xs">
                            A unidade foi alterada. Os consumos desta ficha precisarão ser
                            preenchidos novamente; não haverá conversão automática.
                          </p>
                        )}
                      </div>
                    </div>
                    {/* 3. IMAGENS (Explorer + Drag&Drop) */}
                    <div className="space-y-3 rounded-card border border-border bg-surface p-4">
                      <div>
                        <h4 className="font-bold text-primary text-sm">Imagens</h4>
                        <p className="text-[11px] text-muted leading-tight mt-0.5">
                          Imagens de referência
                        </p>
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
                            role="button"
                            tabIndex={0}
                            aria-label="Adicionar imagens do insumo"
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                fileInputRef.current?.click();
                              }
                            }}
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
                                aria-label={`Remover imagem ${idx + 1}`}
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
                    <details className="space-y-1 rounded-card border border-border p-card">
                      <summary className="cursor-pointer font-medium text-muted">
                        Observações
                      </summary>
                      <label
                        className="font-semibold text-muted-foreground block"
                        htmlFor={`${formId}-campo-4`}
                      >
                        <span className="sr-only">Observações</span>
                      </label>
                      <textarea
                        id={`${formId}-campo-4`}
                        rows={3}
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                      />
                    </details>
                    <details className="rounded-card border border-border p-4">
                      <summary className="cursor-pointer text-sm font-semibold">
                        Detalhes técnicos · opcional
                      </summary>
                      <div className="mt-4 space-y-4">
                        {' '}
                        {/* 4. COMPOSIÇÃO */}
                        <div className="space-y-3 rounded-card border border-border bg-surface p-4">
                          <div>
                            <h4 className="font-bold text-primary text-sm">Composição</h4>
                            <p className="text-[11px] text-muted leading-tight mt-0.5">
                              Ex.: 97% Poliéster, 3% Elastano
                            </p>
                          </div>
                          <div className="md:col-span-2 space-y-3">
                            {composicoesList.map((row, index) => {
                              const matchingComposicoes = compositionOptions.filter((c) =>
                                c.toLowerCase().includes(row.composicao.toLowerCase())
                              );

                              return (
                                <div key={row.id} className="flex items-center gap-2">
                                  <div className="w-24">
                                    <input
                                      type="number"
                                      aria-label={`Percentual da composição ${index + 1}`}
                                      value={row.porcentagem}
                                      onChange={(e) =>
                                        handleUpdateComposicaoRow(
                                          row.id,
                                          'porcentagem',
                                          e.target.value
                                        )
                                      }
                                      placeholder="0"
                                      className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs text-center focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                                    />
                                  </div>
                                  <div className="flex-1 relative">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        aria-label={`Material da composição ${index + 1}`}
                                        value={row.composicao}
                                        onChange={(e) => {
                                          handleUpdateComposicaoRow(
                                            row.id,
                                            'composicao',
                                            e.target.value
                                          );
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
                                    {openComposicaoDropdownId === row.id &&
                                      matchingComposicoes.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto p-1">
                                          {matchingComposicoes.map((cName) => (
                                            <button
                                              key={cName}
                                              type="button"
                                              onClick={() => {
                                                handleUpdateComposicaoRow(
                                                  row.id,
                                                  'composicao',
                                                  cName
                                                );
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
                        {/* Propriedades exclusivas de tecidos. */}
                        {tipo === 'tecido' && (
                          <div className="space-y-3 rounded-card border border-border bg-surface p-4">
                            <div>
                              <h4 className="font-bold text-primary text-sm">Propriedades</h4>
                              <p className="text-[11px] text-muted leading-tight mt-0.5">
                                Definição das propriedades do tecido para cálculo de custos
                              </p>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label
                                    className="font-semibold text-muted-foreground block"
                                    htmlFor={`${formId}-campo-5`}
                                  >
                                    Gramatura (g/m²)
                                  </label>
                                  <input
                                    id={`${formId}-campo-5`}
                                    type="number"
                                    value={gramatura}
                                    readOnly
                                    aria-describedby={`${formId}-gramatura-status`}
                                    placeholder="Não informado"
                                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                                  />
                                  <p
                                    id={`${formId}-gramatura-status`}
                                    role="status"
                                    className="text-[11px] text-muted"
                                  >
                                    {corLinx
                                      ? gramatura
                                        ? `Gramatura da cor ${corLinx.corNome || corLinx.corCodigo} (${corLinx.corCodigo}).`
                                        : 'Gramatura não informada no Linx para esta cor.'
                                      : 'Selecione uma cor do tecido no Linx para preencher a gramatura.'}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <label
                                    className="font-semibold text-muted-foreground block"
                                    htmlFor={`${formId}-campo-6`}
                                  >
                                    Largura (em metros)
                                  </label>
                                  <input
                                    id={`${formId}-campo-6`}
                                    type="number"
                                    value={largura}
                                    readOnly={materialLinx !== null}
                                    onChange={(e) => setLargura(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                                  />
                                </div>
                              </div>

                              {/* Rendimento por quilo só se aplica quando a unidade Linx é kg. */}
                              {isUnidadeKg && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label
                                      className="font-semibold text-muted-foreground block"
                                      htmlFor={`${formId}-campo-7`}
                                    >
                                      Rendimento (m²/kg)
                                    </label>
                                    <input
                                      id={`${formId}-campo-7`}
                                      type="text"
                                      readOnly
                                      value={calculatedRendimento1}
                                      placeholder="Não informado"
                                      className="w-full bg-surface-muted/60 border border-border/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-semibold select-none outline-none cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label
                                      className="font-semibold text-muted-foreground block"
                                      htmlFor={`${formId}-campo-8`}
                                    >
                                      Rendimento (m/kg)
                                    </label>
                                    <input
                                      id={`${formId}-campo-8`}
                                      type="text"
                                      readOnly
                                      value={calculatedRendimento2}
                                      placeholder="Não informado"
                                      className="w-full bg-surface-muted/60 border border-border/80 text-muted-foreground rounded-lg px-3 py-2 text-xs font-semibold select-none outline-none cursor-not-allowed"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label
                                    className="font-semibold text-muted-foreground block"
                                    htmlFor={`${formId}-campo-9`}
                                  >
                                    Encolhimento
                                  </label>
                                  <input
                                    id={`${formId}-campo-9`}
                                    type="text"
                                    value={encolhimento}
                                    readOnly={materialLinx !== null || corLinx !== null}
                                    onChange={(e) => setEncolhimento(e.target.value)}
                                    placeholder="Ex.: Urdume 2 Trama 9"
                                    className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label
                                    className="font-semibold text-muted-foreground block"
                                    htmlFor={`${formId}-campo-10`}
                                  >
                                    Construção
                                  </label>
                                  <input
                                    id={`${formId}-campo-10`}
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
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {formError && (
            <p
              role="alert"
              className="shrink-0 border-t border-border px-4 py-2 text-xs text-status-error"
            >
              {formError}
            </p>
          )}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3">
            <p className="text-[11px] text-muted">
              Dados vinculados à ficha. O catálogo Linx não é alterado.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="shrink-0 rounded-lg bg-action px-4 py-2 text-xs font-semibold text-action-foreground transition hover:bg-action-hover"
            >
              {editingTecido ? 'Salvar alterações' : 'Criar insumo'}
            </button>
          </div>
        </section>
        {mostrarInfoCores && (
          <aside
            id={`${formId}-info-cores`}
            ref={infoCoresPanelRef}
            aria-label="Editor lateral de cores"
            className="insumo-side rounded-card border border-border bg-surface shadow-xl"
          >
            <InsumoInformacoesCores
              layout="panel"
              cores={coresList}
              fornecedores={fornecedoresList}
              material={materialLinx}
              unidade={unidade}
              tipo={tipo}
              activeId={corEmEdicaoId}
              onChange={atualizarCoresInfo}
              onSelect={editarCor}
              onClose={fecharInfoCores}
            />
          </aside>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL / POPOVER DE SELEÇÃO DE CORES (Idêntico ao Print Referência)    */}
      {/* ========================================================================= */}
      {showColorPickerModal && (
        <MaterialColorPicker
          position={colorPickerPosition}
          onClose={() => setShowColorPickerModal(false)}
          onSelect={(color) => {
            corRevision.current += 1;
            setCoresList((previous) => [...previous.filter((item) => item.id !== color.id), color]);
            editarCor(color);
          }}
        />
      )}
    </div>
  );
};
