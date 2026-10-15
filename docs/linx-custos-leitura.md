# Custos e consulta de insumos — validação de 04/10/2026

## Entrega e escopo

Na ficha técnica, **Custos** consulta preços, consumos e custos por cor do produto e posição de tamanho. Em **Tecidos** e **Aviamentos**, os cartões mostram os preços de origem separados do preço manual; **Ver insumo Linx** abre a consulta de cadastro, propriedades, composição, cores, consumo e fornecedores.

A carga é sob demanda por peça, não uma importação indiscriminada de todas as fichas. A leitura não grava no ERP nem substitui o rascunho. Variantes locais não são associadas a cores do ERP pelo nome. Nas coleções legadas, a consulta acompanha o cabeçalho atual, enquanto uma versão anterior preservada no rascunho continua intacta. Uma nova coleção sem versão integrada não herda a ficha antiga do mesmo código.

As consultas SQL foram executadas **somente em 192.168.1.6:1433 / HOMOLOG_COBRANCA**, com conexão criptografada. Nenhum banco, objeto, dado ou configuração de conexão foi alterado. A outra instância não foi acessada. O backend do projeto não foi iniciado nesta validação: sua configuração preexistente foi preservada. Portanto, o fluxo HTTP com essa configuração e a compatibilidade do outro banco não foram validados.

## Origem comprovada

| Informação                               | Fonte                                                         | Uso nesta entrega                                                      |
| ---------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Consumo por posição/tamanho              | `PRODUTO_VERSAO_MATERIAL.C1` a `C48`                          | Dados originais; cálculo confirmado apenas C1 a C9                     |
| Cor da peça, cor do material, percentual | `PRODUTO_VERSAO_MATERIAL_COR`                                 | Identidade completa produto + versão + item + material, além das cores |
| Preço à vista por material e cor         | `MATERIAIS_CORES.CUSTO_A_VISTA`                               | Preço usado na expressão verificada                                    |
| Preço de reposição por material e cor    | `MATERIAIS_CORES.CUSTO_REPOSICAO`                             | Comparação, sem substituir preço à vista                               |
| Preços gerais do material                | `MATERIAIS.CUSTO_A_VISTA`, `CUSTO_REPOSICAO`                  | Exibição separada, não fallback do preço da cor                        |
| Fator e unidades                         | `MATERIAIS.FATOR_CONVERSAO`, `UNID_ESTOQUE`, `UNID_FICHA_TEC` | Conversão conforme expressão original                                  |
| Elegibilidade na formação de preço       | `MATERIAIS_SUBGRUPO.IGNORAR_EM_FORMACAO_PRECO`                | Exige correspondência de grupo/subgrupo e indicador 0                  |
| Custo por fornecedor                     | `MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO` + `FORNECEDORES`       | Comparação separada; nenhum fornecedor escolhido automaticamente       |
| Rótulos dos tamanhos                     | Grade atual do cadastro do produto                            | Não representam uma grade histórica confirmada da versão               |
| Operações e outros custos                | Consultas de roteiro e custos adicionais do produto           | Valores originais, sem soma presumida nem quantidade × preço inventada |
| Preços comerciais do produto             | Cadastros de produto, cor/filial e tabelas de preço           | Todas as fontes identificadas, sem escolher uma tabela como oficial    |
| Diagnóstico original                     | `W_KING_PRODUTO_CUSTO_FICHA_SINTETICO`                        | Comparação separada; não é o total oficial do portal                   |

## Expressão verificada

Detalhamento das fontes adicionais: operações são lidas de `PRODUTOS.TABELA_OPERACOES` e `PRODUTO_OPERACOES_ROTAS`, com fases, setores e recursos. Outros custos vêm de `PRODUTOS_OPE_EXTRA` e `PRODUTOS_TAB_OPERACOES_EXTRAS`. Os preços comerciais são lidos de `PRODUTOS`, `PRODUTOS_PRECOS`, `PRODUTOS_PRECO_COR`, `PRODUTOS_PRECO_FILIAL` e `TABELAS_PRECO`. Nenhuma dessas fontes substitui automaticamente o preço por cor usado na expressão abaixo.

Para insumos não semiacabados elegíveis, nas posições 1 a 9:

```text
Custo do consumo = Cn × custo à vista da cor ÷ fator de conversão × percentual de consumo ÷ 100
```

Essa expressão foi lida na definição da view do banco e validada com dados reais. O SQL mantém precisão decimal, sem arredondamento explícito por linha; a interface formata a exibição. Preço zero não é preço ausente, e custo NULL não é zero. Não foi criada regra extra para encolhimento, flags de variação ou campos de consumo fixo.

Os preços, fatores e cadastros de grade são **atuais**, não snapshots da integração. Dados salvos na ficha sem uma nova consulta compatível aparecem como origem preservada, sem certificar atualidade. A ficha sem `U_COLECAO` não comprova vínculo histórico com a coleção atual; nenhuma data foi usada para inventar esse vínculo.

## Situações e pendências

- `CALCULADO`: expressão verificada retornada pelo SQL.
- `FORA_FORMACAO_PRECO`: cadastro não habilita o cálculo pela regra analisada.
- `PENDENTE_SEMIACABADO`: ramo de serviço do semiacabado não incluído nesta entrega.
- `PENDENTE_VINCULO_ITEM`: item reutilizado entre materiais; custo não estimado.
- `SEM_TAMANHO`: posição sem tamanho identificado na grade atual.
- `PENDENTE_DADOS`: preço, percentual, consumo ou conversão insuficientes/inválidos.

O homolog apresentou 151 grupos produto/versão/item contendo mais de um material. A view original relaciona consumo e cor sem incluir MATERIAL em uma das associações e produz 670 cruzamentos entre materiais distintos. O portal mantém a chave completa e deixa esses custos pendentes. Em BM01001J, 108 linhas ficaram com custo NULL e seus dados originais preservados.

O diagnóstico original inclui serviços, embalagens e outros grupos, pode agregar mais de uma versão e repetir totais por material principal. **Não somar suas linhas nem tratá-lo como total do portal.** O diagnóstico só é consultado quando a análise recursiva de dependências comprova referências locais; referência externa, synonym, módulo opaco ou dependência não resolvida bloqueia essa consulta. Terceiros ficam fora do cálculo do portal.

## Três peças para conferência

Todas as amostras abaixo usaram versão **00001**, percentual **100%** e fator **1** no tecido principal. O cabeçalho não possui U_COLECAO; as coleções abaixo são do cadastro atual validado do produto, não uma associação histórica presumida.

| Peça / griffe            | Coleção atual                     | Cor / tamanho C1 | Tecido principal                         | Preço da cor por metro | Consumo C1 | Custo do tecido principal |
| ------------------------ | --------------------------------- | ---------------- | ---------------------------------------- | ---------------------: | ---------: | ------------------------: |
| BM28007 / KING&JOE       | 028 — 28 - INVERNO 2027           | 00094 BLACK / 38 | 01010365 — LOPEZ STRETCH BLACKBLACK PLUS |             R$ 20,4800 |     0,89 m |                R$ 18,2272 |
| BM14118K / KING&JOE PLAY | 214 — 14 - INVERNO 2027 PLAY      | 00022 OCRE / 02  | 01050700 — TECIDO ANDORRA SOFT           |             R$ 17,9000 |     0,39 m |                 R$ 6,9810 |
| BM04008J / K&J BLACK     | 404 — 04 - INVERNO 2027 K&J BLACK | 00101 KAKI / 38  | 01050656 — TECIDO LINA STRECH3           |             R$ 20,4000 |     0,92 m |                R$ 18,7680 |

Conferência adicional de aviamentos na mesma cor/tamanho da peça:

| Peça     | Aviamento / cor do material                      |     Preço | Consumo C1 |  Custo C1 |
| -------- | ------------------------------------------------ | --------: | ---------: | --------: |
| BM28007  | 02060201 — ETIQUETA CÓS EXT KING&JOE / PRETO     | R$ 1,1400 |       1 un | R$ 1,1400 |
| BM14118K | 02090202 — CORDAO CRU PON EMB MARROM / CRU       | R$ 1,3250 |       1 un | R$ 1,3250 |
| BM04008J | 02010043 — BT K&J BLACK MASSA24 / PRETO MANCHADO | R$ 0,3441 |       3 un | R$ 1,0323 |

Somatórios de conferência dos insumos C1, sem serviços/embalagens (não exibidos como total oficial):

| Peça     |         Tecidos |     Aviamentos | Total da view original, somente diagnóstico |
| -------- | --------------: | -------------: | ------------------------------------------: |
| BM28007  | R$ 19,598409700 | R$ 4,797742819 |                                    R$ 47,39 |
| BM14118K |  R$ 7,960435500 | R$ 2,739030917 |                                    R$ 26,43 |
| BM04008J | R$ 22,715680700 | R$ 4,184641808 |                                    R$ 52,05 |

Os três casos não apresentam item ambíguo nem mistura de múltiplas versões. O diagnóstico foi lido diretamente; não foi reconstruído somando os componentes exibidos.

## Contrato e verificação

```text
GET /linx/produtos/{produto}/fichas/{versao}/custos
    ?griffe=...&colecao=...&descColecao=...&legado=false
```

Retorna cabeçalho da versão, banco de origem, tamanhos, materiais, fornecedores, operações, outros custos, preços comerciais, diagnóstico e avisos. O cliente valida a estrutura e a identidade produto/versão, mostra falhas e permite recarregar. Não grava nem substitui dados manuais.

Os SELECTs literais Java foram executados em memória no `.6`, e os testes de backend usam Mockito, sem Spring nem conexão de banco. A verificação de navegador utiliza uma prévia isolada fora do repositório com recorte real de BM28007, APIs bloqueadas, mesmos componentes e tema do projeto. Não equivale a um teste HTTP com o backend configurado na outra instância.

Para conferir no portal, atualize/reinicie o backend com os novos arquivos no seu ambiente autorizado, abra as coleções indicadas, entre na ficha da peça e selecione **Custos**, cor e tamanho C1. Em **Tecidos/Aviamentos**, use **Ver insumo Linx** para comparar os campos originais.

### Evidências finais de verificação

| Verificação                            | Resultado                                                                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend: testes                       | 104 testes, 20 arquivos, aprovados                                                                                                                     |
| Frontend: compilação                   | TypeScript + build Vite aprovados                                                                                                                      |
| Frontend: lint dos arquivos alterados  | Aprovado após correções de tipagem e estado React                                                                                                      |
| Backend: testes unitários selecionados | 38 testes Mockito aprovados, sem Spring/conexão SQL                                                                                                    |
| SQL literal do backend                 | Consultas validadas no `.6` com as três peças e caso de item ambíguo                                                                                   |
| Navegador isolado                      | Custos, cartão e tela de insumo em desktop/celular, temas claro/escuro; sem erro final de renderização, overlay, requisição de API ou overflow externo |
| HTTP no backend configurado do projeto | Não executado, para preservar a restrição de acesso à outra instância                                                                                  |
