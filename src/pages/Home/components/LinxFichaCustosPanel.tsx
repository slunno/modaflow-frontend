import { Fragment, useId, useMemo, useState } from 'react';
import type { LinxFichaCustos } from '../../../types/linx';
import {
  chaveCustoLinx,
  filtrarMateriaisCustoLinx,
  posicaoCustoLinx,
  situacaoCustoLinx,
  textoCustoLinx,
  valorCustoLinx,
  type LinxCustoRegistro,
} from '../../../services/linxCustos';

interface Props {
  dados: LinxFichaCustos | null;
  loading: boolean;
  error: string;
  onReload: () => void;
  temEdicoesLocais?: boolean;
  colecaoAtual?: { codigo: string; nome: string };
  compact?: boolean;
}

interface Coluna {
  campo: string;
  titulo: string;
  moeda?: boolean;
}

const colunasFornecedores: Coluna[] = [
  { campo: 'MATERIAL', titulo: 'Material' },
  { campo: 'COR_MATERIAL', titulo: 'Cor do material' },
  { campo: 'FORNECEDOR', titulo: 'Fornecedor' },
  { campo: 'COD_FORNECEDOR', titulo: 'Código' },
  { campo: 'CUSTO_FORNECEDOR', titulo: 'Custo de reposição do fornecedor', moeda: true },
  { campo: 'UNIDADE', titulo: 'Unidade do fornecedor' },
  { campo: 'FATOR_CONVERSAO_FORNECEDOR', titulo: 'Fator do fornecedor' },
];
const colunasOperacoes: Coluna[] = [
  { campo: 'TABELA_OPERACOES', titulo: 'Tabela de operações atual' },
  { campo: 'DESC_FASE_PRODUCAO', titulo: 'Fase' },
  { campo: 'DESC_SETOR_PRODUCAO', titulo: 'Setor' },
  { campo: 'RECURSO_PRODUTIVO', titulo: 'Recurso produtivo' },
  { campo: 'TEMPO_OPERACAO', titulo: 'Tempo cadastrado' },
  { campo: 'CUSTO_SUGERIDO', titulo: 'Custo sugerido', moeda: true },
];
const colunasOutros: Coluna[] = [
  { campo: 'OPERACAO_EXTRA', titulo: 'Operação extra' },
  { campo: 'CUSTO_OPERACAO', titulo: 'Custo da operação', moeda: true },
  { campo: 'QTDADE', titulo: 'Quantidade cadastrada' },
  { campo: 'CUSTO_TOTAL', titulo: 'Total cadastrado', moeda: true },
];
const colunasPrecos: Coluna[] = [
  { campo: 'FONTE', titulo: 'Fonte do cadastro atual' },
  { campo: 'CODIGO_TAB_PRECO', titulo: 'Código da tabela' },
  { campo: 'TABELA', titulo: 'Tabela comercial' },
  { campo: 'COR_PRODUTO', titulo: 'Cor do produto' },
  { campo: 'FILIAL', titulo: 'Filial' },
  { campo: 'PRECO1', titulo: 'Preço 1', moeda: true },
  { campo: 'CUSTO_REPOSICAO1', titulo: 'Reposição 1 do produto', moeda: true },
  { campo: 'U_PRECO_CUSTO', titulo: 'Custo registrado na tabela', moeda: true },
  { campo: 'MARK_UP_PREVISTO', titulo: 'Markup previsto cadastrado' },
];

function TabelaFonte({
  titulo,
  registros,
  colunas,
}: {
  titulo: string;
  registros: LinxCustoRegistro[];
  colunas: Coluna[];
}) {
  if (!registros.length)
    return <p className="text-muted">Nenhum registro retornado nessa fonte.</p>;
  return (
    <div className="overflow-x-auto">
      <table aria-label={titulo} className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border">
            {colunas.map((coluna) => (
              <th key={coluna.campo} scope="col" className="p-2 align-top font-medium">
                {coluna.titulo}
                <code className="mt-1 block text-[10px] text-muted">{coluna.campo}</code>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {registros.map((registro, indice) => (
            <tr key={indice} className="border-b border-border last:border-0">
              {colunas.map((coluna) => (
                <td key={coluna.campo} className="p-2 align-top">
                  {valorCustoLinx(registro[coluna.campo], coluna.moeda)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FontesMaterial({ registro }: { registro: LinxCustoRegistro }) {
  return (
    <details className="mt-2 text-[11px]">
      <summary className="cursor-pointer text-primary">Fontes e condições deste insumo</summary>
      <dl className="mt-2 space-y-1 text-muted">
        <div>
          <dt className="inline font-medium">Preço da cor usado na expressão: </dt>
          <dd className="inline">
            MATERIAIS_CORES.CUSTO_A_VISTA = {valorCustoLinx(registro.PRECO_COR_A_VISTA, true)}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Reposição da cor (comparação): </dt>
          <dd className="inline">
            MATERIAIS_CORES.CUSTO_REPOSICAO = {valorCustoLinx(registro.PRECO_COR_REPOSICAO, true)}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Preço geral à vista (não substitui preço da cor): </dt>
          <dd className="inline">
            MATERIAIS.CUSTO_A_VISTA = {valorCustoLinx(registro.PRECO_MATERIAL_A_VISTA, true)}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Reposição geral do material (comparação): </dt>
          <dd className="inline">
            MATERIAIS.CUSTO_REPOSICAO = {valorCustoLinx(registro.PRECO_MATERIAL_REPOSICAO, true)}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Subgrupo: </dt>
          <dd className="inline">{textoCustoLinx(registro.SUBGRUPO)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Item reutilizado entre materiais: </dt>
          <dd className="inline">{textoCustoLinx(registro.ITEM_REUTILIZADO)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Variação de custo por cor no cadastro: </dt>
          <dd className="inline">{textoCustoLinx(registro.VARIA_CUSTO_COR)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Semiacabado: </dt>
          <dd className="inline">{textoCustoLinx(registro.SEMI_ACABADO)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Ignorar na formação do preço: </dt>
          <dd className="inline">{textoCustoLinx(registro.IGNORAR_EM_FORMACAO_PRECO)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Consumo original: </dt>
          <dd className="inline">{textoCustoLinx(registro.FONTE_CONSUMO)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Preço original: </dt>
          <dd className="inline">{textoCustoLinx(registro.FONTE_PRECO)}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Memória de cálculo retornada: </dt>
          <dd className="inline">{textoCustoLinx(registro.FONTE_FORMULA)}</dd>
        </div>
      </dl>
    </details>
  );
}

/** Consulta recebida do backend: não vincula variantes locais, não recalcula e não soma totais. */
export function LinxFichaCustosPanel({
  dados,
  loading,
  error,
  onReload,
  temEdicoesLocais = false,
  colecaoAtual,
  compact = false,
}: Props) {
  const identificador = useId();
  const [corEscolhida, setCorEscolhida] = useState<string | null>(null);
  const [posicaoEscolhida, setPosicaoEscolhida] = useState<number | null>(null);
  const cores = useMemo(() => {
    const porCodigo = new Map<string, string>();
    for (const material of dados?.materiais ?? []) {
      const codigo = chaveCustoLinx(material.COR_PRODUTO);
      if (!porCodigo.has(codigo)) porCodigo.set(codigo, codigo || 'Cor não informada');
    }
    return Array.from(porCodigo, ([codigo, nome]) => ({ codigo, nome }));
  }, [dados]);
  const corSelecionada = cores.some((cor) => cor.codigo === corEscolhida)
    ? corEscolhida!
    : (cores[0]?.codigo ?? '');
  const posicoes = useMemo(() => {
    const porPosicao = new Map<number, string>();
    for (const material of dados?.materiais ?? []) {
      if (chaveCustoLinx(material.COR_PRODUTO) !== corSelecionada) continue;
      const posicao = posicaoCustoLinx(material);
      if (posicao !== null && !porPosicao.has(posicao)) {
        const tamanho = chaveCustoLinx(material.TAMANHO);
        porPosicao.set(posicao, `Posição ${posicao} — ${tamanho || 'tamanho não informado'}`);
      }
    }
    return Array.from(porPosicao, ([posicao, nome]) => ({ posicao, nome })).sort(
      (a, b) => a.posicao - b.posicao
    );
  }, [dados, corSelecionada]);
  const posicaoSelecionada = posicoes.some((item) => item.posicao === posicaoEscolhida)
    ? posicaoEscolhida
    : (posicoes[0]?.posicao ?? null);
  const materiais = useMemo(
    () => filtrarMateriaisCustoLinx(dados?.materiais ?? [], corSelecionada, posicaoSelecionada),
    [dados, corSelecionada, posicaoSelecionada]
  );
  const diagnostico = useMemo(
    () =>
      (dados?.diagnostico ?? []).filter(
        (linha) => chaveCustoLinx(linha.COR_PRODUTO) === corSelecionada
      ),
    [dados, corSelecionada]
  );

  const gruposMateriais = compact
    ? [
        {
          nome: 'Tecidos',
          itens: materiais.filter((item) => chaveCustoLinx(item.GRUPO) === 'TECIDO'),
        },
        {
          nome: 'Aviamentos',
          itens: materiais.filter((item) => chaveCustoLinx(item.GRUPO) === 'AVIAMENTOS'),
        },
        {
          nome: 'Outros insumos',
          itens: materiais.filter(
            (item) => !['TECIDO', 'AVIAMENTOS'].includes(chaveCustoLinx(item.GRUPO))
          ),
        },
      ].filter((grupo) => grupo.itens.length)
    : [{ nome: '', itens: materiais }];

  const informacoesConsulta = dados ? (
    <>
      {compact && temEdicoesLocais && (
        <p className="text-muted">
          Rascunho local preservado: a consulta do Linx não altera os custos das variantes no
          portal.
        </p>
      )}
      <dl className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-muted">Produto</dt>
          <dd>{dados.versao.produto}</dd>
        </div>
        <div>
          <dt className="text-muted">
            {dados.versao.colecaoCodigo
              ? 'Coleção da ficha integrada'
              : colecaoAtual
                ? 'Coleção atual da peça (validada)'
                : 'Coleção não informada na ficha'}
          </dt>
          <dd>
            {textoCustoLinx(dados.versao.colecaoCodigo || colecaoAtual?.codigo)} ·{' '}
            {textoCustoLinx(
              dados.versao.colecaoCodigo ? dados.versao.colecaoNome : colecaoAtual?.nome
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Versão integrada</dt>
          <dd>{dados.versao.versao}</dd>
        </div>
        <div>
          <dt className="text-muted">Banco consultado</dt>
          <dd>{textoCustoLinx(dados.bancoOrigem)}</dd>
        </div>
      </dl>
      <p className="text-muted">
        Materiais e consumos pertencem ao produto e à versão integrada indicada. Quando U_COLECAO
        está preenchido, o vínculo de coleção é verificado. Preços das cores, fatores e nomes dos
        tamanhos vêm dos cadastros atuais; não são snapshots históricos da versão.
      </p>
      {!dados.versao.colecaoCodigo ? (
        <p className="rounded-lg border border-border p-3 text-muted">
          A ficha atual não informa U_COLECAO. Para coleções legadas, a coleção atual da peça não
          comprova o vínculo histórico dessa ficha. Não há associação histórica presumida por data.
        </p>
      ) : null}
      {dados.avisos.length ? (
        <details className="rounded-lg border border-border p-3 text-muted">
          <summary className="cursor-pointer font-semibold">
            Regras e limitações desta consulta ({dados.avisos.length})
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-5" aria-label="Limitações da consulta">
            {dados.avisos.map((aviso, indice) => (
              <li key={indice}>{aviso}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  ) : null;
  const detalhesConsulta = dados ? (
    <>
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer font-medium text-primary">
          Como o Linx calcula o custo do consumo de material — regra verificada
        </summary>
        <div className="mt-3 space-y-2 text-muted">
          <p>
            Expressão encontrada na view W_KING_PRODUTO_CUSTO_FICHA_SINTETICO, para cada posição n
            de 1 a {dados?.versaoIntegracao === 'custos-v2' ? 48 : 9}:
          </p>
          <code className="block overflow-x-auto rounded border border-border p-2">
            Cn × MATERIAIS_CORES.CUSTO_A_VISTA ÷ MATERIAIS.FATOR_CONVERSAO × PORCENTAGEM_CONSUMO ÷
            100
          </code>
          <p>
            O backend retorna a expressão por linha de material/cor da versão explicitamente
            selecionada. O frontend apenas mostra o resultado; não recalcula, não soma insumos e não
            aplica esse valor a variantes locais.
          </p>
          <p>
            O preço vem da cor do material, não de uma escolha de fornecedor nem de uma substituição
            pelo preço geral do material. O fator e o percentual também são exibidos para
            conferência.
          </p>
          <p>
            Essa expressão usa CUSTO_A_VISTA da cor independentemente do sinalizador VARIA_CUSTO_COR
            do cadastro; não foi criada uma regra de troca de fonte a partir desse sinalizador.
          </p>
          <p>
            A expressão é comprovada, mas a view original relaciona produto, versão e item sem
            incluir MATERIAL em um dos vínculos. Se o mesmo item foi reutilizado entre materiais,
            pode haver cruzamento de origens. Nesses casos o backend mantém os preços originais
            visíveis, mas não retorna custo calculado até o vínculo ser confirmado.
          </p>
          <p>
            Sem dados necessários ou com fator inválido, o custo fica não informado. Materiais
            ignorados na formação do preço e semiacabados não recebem uma estimativa. Os preços
            exibidos são atuais, não custos históricos garantidos.
          </p>
          <p>
            Esta consulta não consolida o custo do ERP para precificação nem associa cores ERP a
            variantes locais. A precificação do portal usa o total manual de tecidos e aviamentos da
            variante. A quantidade produzida é aplicada no resumo da aba Custos. Terceiros
            permanecem fora do cálculo do portal.
          </p>
        </div>
      </details>
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer font-medium text-primary">
          Preços por fornecedor — comparação, sem seleção automática
        </summary>
        <p className="my-3 text-muted">
          Fonte: MATERIAIS_FORNECEDOR com FORNECEDORES. O custo de reposição e a unidade do
          fornecedor são independentes do preço à vista da cor usado na expressão acima.
        </p>
        <TabelaFonte
          titulo="Custos cadastrados por fornecedor"
          registros={dados.fornecedores}
          colunas={colunasFornecedores}
        />
      </details>
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer font-medium text-primary">
          Tabelas comerciais do produto — preços e custos separados
        </summary>
        <p className="my-3 text-muted">
          Fontes atuais identificadas por linha: PRODUTOS, PRODUTOS_PRECOS, PRODUTOS_PRECO_COR ou
          PRODUTOS_PRECO_FILIAL, com TABELAS_PRECO quando aplicável. Nenhuma fonte/tabela é
          escolhida como custo oficial, nem aplicada como preço do tecido ou aviamento.
        </p>
        <TabelaFonte
          titulo="Preços comerciais cadastrados do produto"
          registros={dados.precosProduto}
          colunas={colunasPrecos}
        />
      </details>
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer font-medium text-primary">
          Operações atuais e outros custos — somente dados cadastrados
        </summary>
        <p className="my-3 text-muted">
          Operações: PRODUTO_OPERACOES_ROTAS e cadastros de fase/setor/recurso. Outros custos:
          PRODUTOS_OPE_EXTRA e PRODUTOS_TAB_OPERACOES_EXTRAS. Estes registros não são somados ao
          total do portal e não calculam Terceiros.
        </p>
        <h3 className="mb-2 font-medium">Operações atuais do produto</h3>
        <TabelaFonte
          titulo="Custos sugeridos das operações"
          registros={dados.operacoes}
          colunas={colunasOperacoes}
        />
        <h3 className="mb-2 mt-4 font-medium">Outros custos cadastrados</h3>
        <TabelaFonte
          titulo="Outros custos cadastrados no Linx"
          registros={dados.outrosCustos}
          colunas={colunasOutros}
        />
      </details>
      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer font-medium text-primary">
          Diagnóstico original do Linx — não é total do portal
        </summary>
        <div className="my-3 space-y-2 text-muted">
          <p>
            Fonte: W_KING_PRODUTO_CUSTO_FICHA_SINTETICO, consultada por produto e versão integrada.
            A view inclui operações/serviços e outros componentes; esses valores não significam que
            Terceiros foram incluídos no portal.
          </p>
          <p>
            A view usa cadastros atuais e agrega o consumo do material principal sem separar versões
            em uma parte interna. Um total retornado não é um snapshot histórico validado. Linhas
            podem repetir resultados por material principal: não somar as linhas.
          </p>
          <p>
            A view também inclui materiais de EMBALAGEM, além de tecidos e aviamentos. Seu custo de
            materiais não equivale necessariamente aos insumos listados acima. Semiacabados e
            serviços têm regras próprias na view; não há estimativa desses componentes no portal.
          </p>
          <p>
            Os resultados abaixo são valores originais do banco para a cor e posição selecionadas,
            sem correção ou estimativa no frontend.
          </p>
        </div>
        {posicaoSelecionada !== null ? (
          <TabelaFonte
            titulo="Diagnóstico original de custos do Linx"
            registros={diagnostico}
            colunas={[
              { campo: 'COR_PRODUTO', titulo: 'Cor do produto' },
              { campo: 'MATERIAL', titulo: 'Material principal' },
              {
                campo: `CUSTO_MATERIAL${posicaoSelecionada}`,
                titulo: `Custo de materiais — posição ${posicaoSelecionada}`,
                moeda: true,
              },
              {
                campo: `TOTAL_CUSTO${posicaoSelecionada}`,
                titulo: `Total original — posição ${posicaoSelecionada}`,
                moeda: true,
              },
              { campo: 'COSTURA', titulo: 'Costura na view', moeda: true },
              { campo: 'LAVANDERIA', titulo: 'Lavanderia na view', moeda: true },
              { campo: 'CUSTO_EXTRA', titulo: 'Custo extra na view', moeda: true },
            ]}
          />
        ) : (
          <p className="text-muted">Nenhuma posição disponível para comparar o diagnóstico.</p>
        )}
      </details>
    </>
  ) : null;

  return (
    <section
      aria-label="Custos do Linx — fontes e memória de cálculo"
      className="space-y-4 rounded-xl border border-border bg-surface p-4 text-xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={compact ? 'text-xs font-semibold' : 'text-sm font-bold'}>
            {compact ? 'Resumo — Linx' : 'Custos do Linx — fontes e memória de cálculo'}
          </h2>
          {!compact && (
            <p className="mt-1 text-muted">Consulta somente leitura, sem gravação no Linx.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onReload}
          disabled={loading}
          className="rounded-lg border border-border px-3 py-2 text-primary disabled:opacity-50"
        >
          {compact ? 'Atualizar' : 'Atualizar consulta de custos'}
        </button>
      </div>
      {loading ? <p role="status">Carregando custos cadastrados no Linx…</p> : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-300 p-3 text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
      {!compact && temEdicoesLocais ? (
        <p className="rounded-lg border border-border p-3 text-muted">
          Rascunho local preservado: os valores da consulta não recalculam suas edições nem
          variantes.
        </p>
      ) : null}
      {dados ? (
        <>
          {!compact && informacoesConsulta}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${identificador}-cor`} className="mb-1 block font-medium">
                {compact ? 'Cor' : 'Cor do produto no Linx'}
              </label>
              <select
                id={`${identificador}-cor`}
                value={corSelecionada}
                disabled={!cores.length}
                onChange={(evento) => {
                  setCorEscolhida(evento.target.value);
                  setPosicaoEscolhida(null);
                }}
                className="w-full rounded-lg border border-border bg-surface p-2"
              >
                {cores.length ? (
                  cores.map((cor) => (
                    <option key={cor.codigo} value={cor.codigo}>
                      {cor.nome}
                    </option>
                  ))
                ) : (
                  <option value="">Nenhuma cor retornada</option>
                )}
              </select>
              {!compact && (
                <p className="mt-1 text-muted">
                  COR_PRODUTO não é associado automaticamente às variantes locais.
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`${identificador}-tamanho`} className="mb-1 block font-medium">
                {compact ? 'Tamanho' : 'Tamanho / posição de consumo'}
              </label>
              <select
                id={`${identificador}-tamanho`}
                value={posicaoSelecionada ?? ''}
                disabled={!posicoes.length}
                onChange={(evento) => setPosicaoEscolhida(Number(evento.target.value))}
                className="w-full rounded-lg border border-border bg-surface p-2"
              >
                {posicoes.length ? (
                  posicoes.map((item) => (
                    <option key={item.posicao} value={item.posicao}>
                      {item.nome}
                    </option>
                  ))
                ) : (
                  <option value="">Nenhuma posição retornada</option>
                )}
              </select>
              {!compact && (
                <p className="mt-1 text-muted">
                  Posições físicas da ficha. Tamanhos ausentes não são presumidos.
                </p>
              )}
            </div>
          </div>
          <div>
            {!compact && (
              <h3 className="mb-2 font-bold">Insumos da ficha — cor e posição selecionadas</h3>
            )}
            {materiais.length ? (
              <div className="overflow-x-auto">
                <table
                  aria-label="Custos dos insumos por cor e tamanho"
                  className={`w-full text-left ${compact ? 'text-[11px]' : 'text-xs'}`}
                >
                  <thead>
                    <tr className="border-b border-border">
                      {(compact
                        ? ['Insumo', 'Consumo', 'Custo un.', 'Total']
                        : [
                            'Insumo / cor do material',
                            'Consumo da ficha',
                            'Preço à vista da cor',
                            'Fator de conversão',
                            'Percentual do consumo',
                            'Custo do consumo retornado pelo SQL',
                            'Situação',
                          ]
                      ).map((titulo, indice) => (
                        <th
                          key={titulo}
                          scope="col"
                          className={`p-2 align-top font-medium ${compact && indice >= 2 ? 'text-right' : ''}`}
                        >
                          {titulo}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gruposMateriais.map((grupo) => (
                      <Fragment key={grupo.nome}>
                        {compact && (
                          <tr>
                            <th
                              colSpan={4}
                              className="border-b-2 border-border pb-1 pt-3 text-left font-semibold"
                            >
                              {grupo.nome}
                            </th>
                          </tr>
                        )}
                        {grupo.itens.map((material, indice) => (
                          <tr
                            key={`${chaveCustoLinx(material.ITEM)}-${chaveCustoLinx(material.MATERIAL)}-${chaveCustoLinx(material.COR_MATERIAL)}-${indice}`}
                            className="border-b border-border last:border-0"
                          >
                            <td
                              className={compact ? 'p-2 align-top' : 'min-w-60 p-2 align-top'}
                              title={compact ? textoCustoLinx(material.MATERIAL) : undefined}
                            >
                              <span className="font-medium">
                                {textoCustoLinx(material.DESC_MATERIAL)}
                              </span>
                              {compact && chaveCustoLinx(material.DESC_COR_MATERIAL) && (
                                <span className="ml-1 text-muted">
                                  · {textoCustoLinx(material.DESC_COR_MATERIAL)}
                                </span>
                              )}
                              {!compact && (
                                <>
                                  <span className="mt-1 block text-muted">
                                    {textoCustoLinx(material.MATERIAL)} · Item{' '}
                                    {textoCustoLinx(material.ITEM)} ·{' '}
                                    {textoCustoLinx(material.GRUPO)}
                                  </span>
                                  <span className="block text-muted">
                                    Cor do material: {textoCustoLinx(material.COR_MATERIAL)} ·{' '}
                                    {textoCustoLinx(material.DESC_COR_MATERIAL)}
                                  </span>
                                  <FontesMaterial registro={material} />
                                </>
                              )}
                            </td>
                            <td className="p-2 align-top">
                              {valorCustoLinx(material.CONSUMO)}
                              <span
                                className={compact ? 'ml-1 text-muted' : 'mt-1 block text-muted'}
                              >
                                {!compact && 'Unidade da ficha: '}
                                {textoCustoLinx(material.UNID_FICHA_TEC)}
                              </span>
                            </td>
                            <td
                              className={`p-2 align-top ${compact ? 'text-right whitespace-nowrap' : ''}`}
                            >
                              {valorCustoLinx(material.PRECO_COR_A_VISTA, true)}
                              <span
                                className={compact ? 'ml-1 text-muted' : 'mt-1 block text-muted'}
                              >
                                {compact ? '/ ' : 'Unidade de estoque: '}
                                {textoCustoLinx(material.UNID_ESTOQUE)}
                              </span>
                              {!compact && (
                                <code className="mt-1 block text-[10px] text-muted">
                                  MATERIAIS_CORES.CUSTO_A_VISTA
                                </code>
                              )}
                            </td>
                            {!compact && (
                              <>
                                <td className="p-2 align-top">
                                  {valorCustoLinx(material.FATOR_CONVERSAO)}
                                  <code className="mt-1 block text-[10px] text-muted">
                                    MATERIAIS.FATOR_CONVERSAO
                                  </code>
                                </td>
                                <td className="p-2 align-top">
                                  {valorCustoLinx(material.PORCENTAGEM_CONSUMO)}
                                  <code className="mt-1 block text-[10px] text-muted">
                                    PORCENTAGEM_CONSUMO
                                  </code>
                                </td>
                              </>
                            )}
                            <td
                              className={`p-2 align-top ${compact ? 'text-right whitespace-nowrap' : ''}`}
                              title={
                                compact ? situacaoCustoLinx(material.STATUS_CALCULO) : undefined
                              }
                            >
                              {valorCustoLinx(material.CUSTO_CONSUMO_LINX, true)}
                            </td>
                            {!compact && (
                              <td className="p-2 align-top">
                                {situacaoCustoLinx(material.STATUS_CALCULO)}
                                <code className="mt-1 block text-[10px] text-muted">
                                  {textoCustoLinx(material.STATUS_CALCULO)}
                                </code>
                              </td>
                            )}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">
                Nenhum insumo retornado para essa cor e posição. Nenhum custo foi estimado.
              </p>
            )}
          </div>
          {compact ? (
            <details className="rounded-md border border-border p-3">
              <summary className="cursor-pointer font-medium">Detalhes da consulta</summary>
              <div className="mt-3 space-y-3">
                {informacoesConsulta}
                {detalhesConsulta}
              </div>
            </details>
          ) : (
            detalhesConsulta
          )}
        </>
      ) : !loading && !error ? (
        <p className="text-muted">
          Nenhuma ficha de custos carregada. Valores locais não são substituídos por estimativas.
        </p>
      ) : null}
    </section>
  );
}
