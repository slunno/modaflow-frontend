# Vínculo dos campos da Ficha Técnica com o Linx

Auditoria e implementação de planejamento em **15/10/2026**.

Atualização posterior nesta mesma data: foi implementado um primeiro gravador direto para campos mapeados de fichas atuais existentes, ainda **desabilitado e sem homologação SQL real**. Não cria produto ou versão nova e não resolve o destino do preço por item. Escopo, endpoints, proteções e roteiro de aprovação estão em [linx-gravacao-direta-homolog6.md](../../modaflow-backend/docs/linx-gravacao-direta-homolog6.md). As pendências deste inventário permanecem válidas para o cadastro/envio integral.

## 1. Ambiente e limites da evidência

Conexão efetivamente verificada: **tcp:192.168.1.6,1433**, banco **HOMOLOG_COBRANCA**, servidor **srv-sql-dev**, transporte **TCP**, criptografia **TRUE**. Não houve acesso ao .3, gravação SQL, execução de procedure, alteração de tabelas/defaults/triggers ou inicialização do backend de produção.

Foram executados SELECTs de identidade e metadados locais: colunas, tipos, tamanhos, nulabilidade, defaults (declarados e legados), PKs, FKs, propriedades de documentação e nomes/estado de triggers. Para distinguir os nomes, também houve uma consulta limitada às quatro referências já autorizadas: BM00301, BM00002, MO14205K e PO14006K. Nenhum conteúdo de default/trigger retornado foi executado.

| Tabela física               | Colunas |
| --------------------------- | ------: |
| PRODUTOS                    |     182 |
| PRODUTO_CORES               |      46 |
| PRODUTO_FICHA_VERSAO        |       9 |
| PRODUTO_VERSAO_MATERIAL     |      68 |
| PRODUTO_VERSAO_MATERIAL_COR |       8 |
| **Total principal**         | **313** |

Também foram inventariadas as referências locais CORES_BASICAS, PRODUTOS_TAMANHOS, MATERIAIS, MATERIAIS_CORES, MATERIAIS_FORNECEDOR, PRODUTOS_MODELO e COLECOES. O resultado completo de PK/FK/defaults está em C:/King-Joe-Projects/outputs/linx-ficha-colunas-20261015.json. O snapshot versionado das 313 colunas está em [linx-ficha-colunas-20261015.json](linx-ficha-colunas-20261015.json). O script reproduzível é ../../modaflow-backend/tools/Inspect-FichaColumnsHomolog6.ps1 (alvo fixo e somente SELECT).

**“Identificado” significa correspondência estrutural ou leitura existente no projeto. Não significa campo aprovado para INSERT/UPDATE.** Candidato indica coluna existente cuja semântica de gravação ainda precisa ser confirmada.

## 2. Geral, cadastro e identidade

| Campo/tela do portal     | Propriedade do projeto                                                | Coluna/referência Linx                                                                  | Evidência e tratamento                                                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Código do produto        | codigo                                                                | PRODUTOS.PRODUTO, char(12)                                                              | Identificado; chave global, não produto+griffe+coleção. Código de referência não autoriza atualizar o produto apontado.                                                  |
| Nome do Produto / título | fichaTecnica.nomeProduto; o editor também atualiza nome               | PRODUTOS.DESC_PRODUTO, varchar(100) | Destino mantido por confirmação do usuário em 15/10/2026. Não alterar U_NOME_PRODUTO nem substituir o nome pela Categoria. Gravador ainda não implementado. |
| Descrição detalhada      | fichaTecnica.descricao                                                | Candidatos PRODUTOS.OBS (text) / PRODUTO_FICHA_VERSAO.OBS_VERSAO_FICHA (varchar(250))   | Sem equivalência funcional comprovada. Não confundir com DESC_PROD_NF nem escolher armazenamento global/versionado silenciosamente.                                      |
| Código de Referência (legado) | fichaTecnica.codigoReferencia                                     | Nenhum destino aprovado nestas tabelas                                                  | Retirado da tela por solicitação do usuário; valores antigos preservados. Não é REFER_FABRICANTE, MODELAGEM ou PRODUTO automaticamente. |
| Griffe                   | colecao.griffe; linxOrigem.griffe; integracao.griffe para conferência | PRODUTOS.GRIFFE, varchar(25), FK PRODUTOS_GRIFFES                                       | Identificado; validar marca autorizada, valor ERP e coleção no servidor.                                                                                                 |
| Coleção da ficha         | linxOrigem.colecaoCodigo / recibo confirmado                          | PRODUTO_FICHA_VERSAO.U_COLECAO, char(6)                                                 | Identificado estruturalmente. UUID local, ano, codigoPill da marca e DESC_COLECAO não substituem COLECOES.COLECAO.                                                       |
| Coleção do cadastro      | identidade ERP relida                                                 | PRODUTOS.COLECAO, char(6)                                                               | FK COLECOES; compartilhada pelo cadastro. Reutilizar referência não autoriza mover esse cadastro de coleção.                                                             |
| Versão                   | linxVersaoImportada / recibo confirmado                               | PRODUTO_FICHA_VERSAO.VERSAO_FICHA e vínculos de materiais/cores                         | char(5). A PK do cabeçalho é PRODUTO+VERSAO_FICHA. Não usar maior versão nem aplicar default 00001 para ficha de outra coleção.                                          |
| Grade                    | integracao.grade; linxCadastro.grade na leitura                       | PRODUTOS.GRADE, varchar(25)                                                             | FK PRODUTOS_TAMANHOS.GRADE.                                                                                                                                              |
| Tamanhos                 | fichaTecnica.tamanhos / gradeLinx                                     | PRODUTOS_TAMANHOS.TAMANHO_1…TAMANHO_48                                                  | Grade define posições. Não criar tamanhos globais nem compactar posições vazias.                                                                                         |
| Linha                    | integracao.linha; linxCadastro.linha na leitura                       | PRODUTOS.LINHA, varchar(25)                                                             | FK PRODUTOS_LINHAS. Tema local não é automaticamente linha ERP.                                                                                                          |
| Sub-grupo / tipo da peça | integracao.subgrupo; tipo como rótulo                                 | PRODUTOS.SUBGRUPO_PRODUTO com GRUPO_PRODUTO, varchar(25)                                | FK composta PRODUTOS_SUBGRUPO. TIPO_PRODUTO é outro campo obrigatório; tipo/subgrupo não são intercambiáveis.                                                            |
| Categoria e subcategoria | integracao.categoria / subcategoria                                   | PRODUTOS.COD_CATEGORIA / COD_SUBCATEGORIA, char(6)                                      | Categoria é editável como texto em Geral; a resolução do par de códigos ERP continua pendente. Não enviar a descrição no lugar do código nem substituir DESC_PRODUTO. |
| Tipo de matéria-prima    | integracao.tipoMateriaPrima                                           | Sem equivalente comprovado nestas cinco tabelas                                         | Não converter em TIPO_PRODUTO, MATERIAL ou flag por similaridade do nome.                                                                                                |
| Estilista e modelista    | estilista / modelista                                                 | PRODUTOS.ESTILISTA / MODELISTA, varchar(25)                                             | Leitura existente. Escrita exige representar a identidade ERP corretamente, sem truncar o nome da conta do portal.                                                       |

### 2.1. Diferença comprovada entre os nomes

SELECT limitado às quatro referências já autorizadas, sem alteração:

| Produto  | DESC_PRODUTO                                   | U_NOME_PRODUTO             |
| -------- | ---------------------------------------------- | -------------------------- |
| BM00301  | BERMUDA MOLETOM SLIM                           | BERMUDA YOUNG              |
| BM00002  | BERMUDA JEANS FLEX BLACK SLIM                  | BERMUDA JEANS DETROIT SLIM |
| MO14205K | BLUSAO MOLETOM FELPA KING JOE PLAY ZIPER CAPUZ | MOLETOM GOOD TIME          |
| PO14006K | POLO PIQUET LOGO SLIM                          | PIUQET POLO FLEX           |

Os textos acima tiveram apenas espaços de preenchimento removidos para apresentação. O resultado bruto está em amostras_nomes do JSON de evidência. Na última linha, o resultado SQL possui também um espaço duplo interno antes de SLIM, reduzido aqui para legibilidade. Isso não é normalização a ser aplicada no gravador.

A importação atual do portal utiliza DESC_PRODUTO. O inventário demonstra que U_NOME_PRODUTO é outro valor, não uma cópia do primeiro. Em 15/10/2026, o usuário confirmou manter DESC_PRODUTO para Nome do Produto e pediu Categoria separada em Geral. O planejamento foi ajustado: não sobrescrever nem sincronizar automaticamente U_NOME_PRODUTO. Essa definição não habilita gravação SQL.

Categoria agora é editável em Geral, usa `fichaTecnica.integracao.categoria` e participa do salvamento automático, histórico de Geral e filtros existentes. O texto descritivo não é enviado como `COD_CATEGORIA` (char(6)); o vínculo com um código válido continua pendente. Grupo (ex.: ROUPAS), subgrupo (ex.: CAMISA/JAQUETA) e categoria descritiva são conceitos separados. Nenhum valor de exemplo foi gravado como padrão nas peças.

## 3. Cores: três identidades diferentes

| Informação                              | Origem                              | Coluna e regra                                                                                                                          |
| --------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Cor básica oferecida no mostruário      | CORES_BASICAS.COR + DESC_COR        | Referência estrutural de PRODUTO_CORES.COR, char(10). Seleção agora conserva código e descrição.                                        |
| Identidade da cor do produto acabado    | Vínculo explícito consultado no ERP | PRODUTO_CORES.COR_PRODUTO, char(10), PK junto com PRODUTO. Não deduzir pelo código da cor básica.                                       |
| Descrição da cor do produto             | Cadastro de cor do produto          | PRODUTO_CORES.DESC_COR_PRODUTO, varchar(40). Não inferir regra de geração a partir do nome de variante local.                           |
| Cor do tecido/aviamento                 | corLinx ou coresList[].origemLinx   | PRODUTO_VERSAO_MATERIAL_COR.COR_MATERIAL, char(10), validada com MATERIAL em MATERIAIS_CORES. Não é a cor de mostruário.                |
| Aplicação da cor do material ao produto | Item+material+versão+cor do produto | PRODUTO_VERSAO_MATERIAL_COR.COR_PRODUTO aponta para PRODUTO_CORES. Exige as duas identidades, não só uma cor selecionada no formulário. |

**Mudança de código realizada:** o endpoint GET /linx/cores-mostruario/codigos lê COR e DESC_COR sem TOP(50) e sem agrupar descrições iguais. O seletor conserva zeros à esquerda, distingue códigos com a mesma descrição e não mistura cor personalizada com cor ERP de mesmo nome/código. O endpoint antigo de descrições continua disponível para compatibilidade.

CORES_BASICAS não possui coluna INATIVO no inventário; os flags USO_PRODUTOS/USO_MATERIAIS não foram reinterpretados como ativo/inativo. O novo endpoint mantém o escopo completo do catálogo de mostruário anterior. A regra de inatividade de PRODUTO_CORES.U_INATIVO pertence ao vínculo de cor do produto, não ao catálogo básico.

Cores antigas salvas só pelo nome são preservadas e **não recebem um código por correspondência de descrição**, mesmo que só exista uma ocorrência naquela consulta. A definição de COR_PRODUTO para uma nova cor do produto continua pendente. Não foi encontrada coluna que sinalize “esta é a cor de mostruário” nas cinco tabelas; a associação estrutural não prova uma regra de sinalização exclusiva.

PRODUTO_CORES tem U_COLECAO, mas sua PK permanece PRODUTO+COR_PRODUTO, **sem VERSAO_FICHA**. Alterações de nome/cor desse cadastro podem afetar outras fichas que o compartilhem. Não é correto prometer isolamento de todos os atributos apenas filtrando por versão.

## 4. Tecidos e aviamentos da Principal

| Campo                                                     | Origem no portal                                               | Vínculo Linx / limite                                                                                                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Material                                                  | item.codigo; item.linxDados.codigo como origem consultada      | PRODUTO_VERSAO_MATERIAL.MATERIAL, char(11), FK MATERIAIS. Revalidar código, não confiar só em temErp.                                                                         |
| Nome do insumo                                            | item.nome                                                      | Leitura MATERIAIS.DESC_MATERIAL. Renomear no portal não autoriza mudar o catálogo global.                                                                                     |
| Item                                                      | item.linxDados.item                                            | PRODUTO_VERSAO_MATERIAL.ITEM e vínculo de cor, char(4). UUID local não é item ERP. Novos itens precisam de regra de alocação.                                                 |
| Uso                                                       | item.uso                                                       | DESC_USO_MATERIAL, varchar(80). Importação existente conserva esse campo; texto livre não define regras de aplicação/consumo.                                                 |
| Consumo por tamanho                                       | consumoPorTamanho[tamanho].valor                               | C1…C48, numeric(9,3), apenas na posição validada da grade. O editor admite mais casas: futura escrita deve conferir precisão, sem arredondar silenciosamente.                 |
| Consumo geral, quantidade e peso                          | item.consumo / quantidade / peso                               | Sem regra automática para C1 ou PRODUTOS.PESO. Esse último é do produto acabado, não o peso de um tecido aplicado.                                                            |
| Fase e setor do item                                      | linxDados.dados.FASE_PRODUCAO / SETOR_PRODUCAO                 | Ambos varchar(25), FK composta PRODUCAO_SETOR. Etapa operacional 01/02 do portal não substitui essa relação.                                                                  |
| Material principal                                        | linxDados.dados.MATERIAL_PRINCIPAL                             | Indicadores bit do item e do vínculo de cor. Primeiro tecido não é automaticamente principal.                                                                                 |
| Consumo por tamanho/fixo                                  | linxDados.dados.CONSUMO_P_TAMANHO / CONSUMO_FIXO               | Flags bit explícitas/importadas. Não inventar os flags a partir de campo vazio.                                                                                               |
| Cor do insumo                                             | coresList[].origemLinx / corLinx                               | COR_MATERIAL com chave do material; sem converter nomes personalizados em códigos.                                                                                            |
| Percentual de consumo da cor                              | linxDados.cores[].PORCENTAGEM_CONSUMO                          | numeric(9,3). Preservar valor importado; não supor 100% ao adicionar uma cor.                                                                                                 |
| Finalidade / classificação de componente                  | finalidade / componente                                        | Não vinculado automaticamente a PARTE_APLICADO_MATERIAL, que possui só varchar(10).                                                                                           |
| Dimensões aplicadas                                       | linxDados.dados.LARGURA / ALTURA                               | numeric(9,3). Não são automaticamente a largura do rolo em propriedades.largura.                                                                                              |
| Composição, gramatura, encolhimento, unidade e rendimento | propriedades / composicoesList / unidade / linxDados           | Fontes de catálogo MATERIAIS, MATERIAIS_CORES e MATERIAIS_COMPOSICAO. Não pertencem às cinco tabelas como uma cópia completa por item; edições locais não alteram o catálogo. |
| Preço e fornecedor escolhidos                             | custo / precoLinx / fornecedoresList / coresList[].dadosInsumo | Sem destino confirmado de preço/fornecedor por item nas duas tabelas de materiais versionados. Não escrever em custo global para contornar isso.                              |

A PK do item é PRODUTO+VERSAO_FICHA+MATERIAL+ITEM. A PK da cor aplicada é MATERIAL+PRODUTO+COR_PRODUTO+VERSAO_FICHA+ITEM. Trocar material ou excluir um vínculo precisa considerar a chave e seus filhos, não atualizar todos os registros do produto.

## 5. Campos sem equivalência automática ou exclusivos do portal

- **Modelagem:** PRODUTOS.MODELAGEM aponta para PRODUTOS_MODELO.MODELAGEM (char(10)), enquanto o seletor atual oferece códigos de PRODUTOS. Não são equivalentes sem uma regra aprovada.
- **Descrição, Técnica e observações:** existem PRODUTOS.OBS, OBS_VERSAO_FICHA (250 bytes) e OBS_EST/OBS_BOR/OBS_LAV/OBS_TER (150 bytes por cor de produto). São candidatos com escopos diferentes; não agrupar, distribuir nem truncar os textos silenciosamente.
- **Responsável/status:** RESPONSAVEL varchar(40) e STATUS_VERSAO_FICHA char(2) existem no cabeçalho. UUID/nome do usuário, etapa Final e status do portal não definem os valores válidos ERP.
- **Prova de roupa, anexos, histórico, variantes adicionais e cores personalizadas:** permanecem no portal conforme a regra já definida. A remoção da aba de arquivos não removeu os anexos.
- **Corte:** quantidades de produção por cor/tamanho não são consumo Cn de material por peça.
- **Simbologia, estampa, tabela de medidas local, observações de terceiros, prazo e fluxo:** não possuem destino aprovado nestas cinco tabelas. Nomes parecidos (TABELA_MEDIDAS, ETIQUETA, TIPO_LAVAGEM_TINTURARIA, TAGS, PERIODO_PCP) não são comprovação de equivalência.

## 6. O que foi vinculado no código

- src/services/fichaCamposLinx.ts registra campo, propriedade de origem, colunas físicas, situação e regra. Inclui correspondências identificadas, candidatos e campos locais sem mesclá-los.
- src/services/fichaLinxMapeamento.ts inclui **somente metadados dos campos não exclusivos do portal** em vinculosCampos do planejamento. Não gera comandos SQL, não ativa integração e mantém gravacaoHabilitada=false.
- MostruarioColorsPicker passa a preservar a chave real do catálogo, com navegação/seleção existentes. Cor personalizada e seleção antiga são preservadas, sem migração automática.
- A origem de preços e os cálculos do portal não foram alterados. Não houve ativação de cadastro, reserva de código, geração de versão, atualização ou exclusão no ERP.

A orientação de arquitetura de backend preservou Spring/SQL Server e separou inspeção, planejamento e gravador. A revisão React preservou o componente e a seleção local, mantendo tratamento de resposta tardia, teclado e distinção de identidades. Não houve troca de framework ou dependências.

## 7. Pendências objetivas antes de gravar

1. **Resolvido quanto ao destino do nome:** manter DESC_PRODUTO, sem alterar U_NOME_PRODUTO. Ainda validar a política de atualização do cadastro global quando o código estiver compartilhado por outras coleções.
2. Confirmar destino/escopo de Descrição, Técnica e observações (produto global, versão ou permanecer no portal).
3. Aprovar como gerar/resolver COR_PRODUTO para nova associação e como o processo identifica a cor de mostruário.
4. Resolver a equivalência de Modelagem, categoria/subcategoria e valores dos status/responsáveis da ficha.
5. Definir destino do preço/fornecedor por item ou mantê-los exclusivamente no portal; aprovar perfil fiscal/operacional de produto novo.
6. Auditar efeitos dos **14 triggers ativos nas cinco tabelas físicas** (dois INSTEAD OF). O inventário de nomes não é auditoria integral das definições.
7. Implementar e homologar o gravador transacional, com produto de teste e aprovação de escrita no .6. Não usar sa como credencial operacional, não acessar o .3 e não interpretar esta auditoria como aprovação para DML.

## 8. Obrigatoriedade estrutural

Abaixo estão as colunas não nulas, não identity/computed e sem default identificadas. Isso não autoriza copiar dados de uma peça arbitrária nem transforma cada coluna em um novo campo obrigatório na tela.

- **PRODUTOS:** PRODUTO, CLASSIF_FISCAL, TIPO_PRODUTO, DESC_PRODUTO, GRUPO_PRODUTO, SUBGRUPO_PRODUTO, COLECAO, GRADE, DESC_PROD_NF, LINHA, GRIFFE, UNIDADE, FABRICANTE, PONTEIRO_PRECO_TAM, TRIBUT_ICMS, TRIBUT_ORIGEM.
- **PRODUTO_CORES:** PRODUTO, COR_PRODUTO, DESC_COR_PRODUTO.
- **PRODUTO_FICHA_VERSAO:** PRODUTO, DESC_VERSAO_FICHA, RESPONSAVEL, STATUS_VERSAO_FICHA.
- **PRODUTO_VERSAO_MATERIAL:** PRODUTO, MATERIAL, ITEM, FASE_PRODUCAO, SETOR_PRODUCAO.
- **PRODUTO_VERSAO_MATERIAL_COR:** PRODUTO, MATERIAL, COR_PRODUTO, ITEM.

## 9. Verificação da implementação

- 95 testes de frontend em 12 arquivos aprovados: seleção com código, códigos com mesma descrição, cor personalizada de mesmo nome/código, preservação de seleção antiga, grade, escopo da Principal, planejamento e regressões de salvamento/arquivos.
- 29 testes de backend aprovados em LinxMapeamentoLeituraTest, LinxIntegrationControllerTest e LinxIntegrationServiceTest. Usam JDBC mockado/MockMvc isolado; não iniciam o backend nem abrem SQL.
- Teste do inventário verifica que todas as colunas referenciadas pelo catálogo de campos existem no snapshot real de 313 colunas.
- TypeScript e build de produção aprovados. Lint sem erros, com apenas o aviso preexistente de dependência de useEffect em AuthContext.tsx:144.
- Esses resultados não comprovam criação, atualização ou preço gravado no ERP. Não houve gravação, nova versão integrada ou teste de integração de escrita.

## 10. Inventário integral das cinco tabelas

Nulabilidade/default são metadados, não validação de conteúdo de negócio. “Padrão legado” também conta como default vinculado. Para text, o max_length físico de 16 bytes descreve o ponteiro, não limite de 16 caracteres. Para timestamp, o valor é rowversion binário, não data. Limites de varchar/char são em bytes; validação de texto deve respeitar a codificação da conexão, sem truncamento automático.

### PRODUTOS

| Coluna                          | Tipo                | Aceita NULL | Default          | Observação técnica |
| ------------------------------- | ------------------- | ----------- | ---------------- | ------------------ |
| PRODUTO                         | char(12 bytes)      | Não         | —                |                    |
| CODIGO_PRECO                    | char(4 bytes)       | Sim         | Legado vinculado |                    |
| MATERIAL                        | char(11 bytes)      | Sim         | —                |                    |
| PERIODO_PCP                     | varchar(25 bytes)   | Sim         | —                |                    |
| TABELA_OPERACOES                | varchar(25 bytes)   | Sim         | —                |                    |
| FATOR_OPERACOES                 | numeric(7,3)        | Sim         | Legado vinculado |                    |
| CLASSIF_FISCAL                  | char(10 bytes)      | Não         | —                |                    |
| TIPO_PRODUTO                    | varchar(25 bytes)   | Não         | —                |                    |
| TABELA_MEDIDAS                  | varchar(25 bytes)   | Sim         | —                |                    |
| DESC_PRODUTO                    | varchar(100 bytes)  | Não         | —                |                    |
| GRUPO_PRODUTO                   | varchar(25 bytes)   | Não         | —                |                    |
| SUBGRUPO_PRODUTO                | varchar(25 bytes)   | Não         | —                |                    |
| COLECAO                         | char(6 bytes)       | Não         | —                |                    |
| GRADE                           | varchar(25 bytes)   | Não         | —                |                    |
| DESC_PROD_NF                    | varchar(100 bytes)  | Não         | —                |                    |
| LINHA                           | varchar(25 bytes)   | Não         | —                |                    |
| GRIFFE                          | varchar(25 bytes)   | Não         | —                |                    |
| CARTELA                         | char(6 bytes)       | Sim         | Legado vinculado |                    |
| UNIDADE                         | char(5 bytes)       | Não         | —                |                    |
| PESO                            | numeric(14,8)       | Sim         | Legado vinculado |                    |
| REVENDA                         | bit                 | Não         | Legado vinculado |                    |
| REFER_FABRICANTE                | varchar(25 bytes)   | Sim         | Legado vinculado |                    |
| MODELAGEM                       | char(10 bytes)      | Sim         | Legado vinculado |                    |
| SORTIMENTO_COR                  | bit                 | Não         | Legado vinculado |                    |
| FABRICANTE                      | varchar(25 bytes)   | Não         | —                |                    |
| SORTIMENTO_TAMANHO              | bit                 | Não         | Legado vinculado |                    |
| VARIA_PRECO_COR                 | bit                 | Não         | Legado vinculado |                    |
| VARIA_PRECO_TAM                 | bit                 | Não         | Legado vinculado |                    |
| PONTEIRO_PRECO_TAM              | char(48 bytes)      | Não         | —                |                    |
| VARIA_CUSTO_COR                 | bit                 | Não         | Legado vinculado |                    |
| PERTENCE_A_CONJUNTO             | bit                 | Não         | Legado vinculado |                    |
| TRIBUT_ICMS                     | char(3 bytes)       | Não         | —                |                    |
| TRIBUT_ORIGEM                   | char(3 bytes)       | Não         | —                |                    |
| VARIA_CUSTO_TAM                 | bit                 | Não         | Legado vinculado |                    |
| CUSTO_REPOSICAO1                | numeric(14,2)       | Sim         | Legado vinculado |                    |
| CUSTO_REPOSICAO2                | numeric(14,2)       | Sim         | Legado vinculado |                    |
| CUSTO_REPOSICAO3                | numeric(14,2)       | Sim         | Legado vinculado |                    |
| CUSTO_REPOSICAO4                | numeric(14,2)       | Sim         | Legado vinculado |                    |
| DATA_REPOSICAO                  | datetime            | Sim         | —                |                    |
| ESTILISTA                       | varchar(25 bytes)   | Sim         | Legado vinculado |                    |
| MODELISTA                       | varchar(25 bytes)   | Sim         | Legado vinculado |                    |
| TAMANHO_BASE                    | int                 | Sim         | Legado vinculado |                    |
| GIRO_ENTREGA                    | int                 | Sim         | Legado vinculado |                    |
| TIMESTAMP                       | timestamp           | Sim         | —                | Rowversion         |
| INATIVO                         | bit                 | Não         | Legado vinculado |                    |
| ENVIA_LOJA_VAREJO               | bit                 | Não         | Legado vinculado |                    |
| ENVIA_LOJA_ATACADO              | bit                 | Não         | Legado vinculado |                    |
| ENVIA_REPRESENTANTE             | bit                 | Não         | Legado vinculado |                    |
| ENVIA_VAREJO_INTERNET           | bit                 | Não         | Legado vinculado |                    |
| ENVIA_ATACADO_INTERNET          | bit                 | Não         | Legado vinculado |                    |
| MODELO                          | char(8 bytes)       | Sim         | —                |                    |
| REDE_LOJAS                      | char(6 bytes)       | Sim         | —                |                    |
| DATA_PARA_TRANSFERENCIA         | datetime            | Sim         | Legado vinculado |                    |
| FABRICANTE_ICMS_ABATER          | numeric(8,5)        | Sim         | Legado vinculado |                    |
| FABRICANTE_PRAZO_PGTO           | int                 | Sim         | Legado vinculado |                    |
| TAXA_JUROS_DEFLACIONAR          | numeric(8,5)        | Sim         | Legado vinculado |                    |
| TAXAS_IMPOSTOS_APLICAR          | numeric(8,5)        | Sim         | Legado vinculado |                    |
| PRECO_REPOSICAO_1               | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_REPOSICAO_2               | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_REPOSICAO_3               | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_REPOSICAO_4               | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_A_VISTA_REPOSICAO_1       | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_A_VISTA_REPOSICAO_2       | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_A_VISTA_REPOSICAO_3       | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_A_VISTA_REPOSICAO_4       | numeric(14,2)       | Sim         | Legado vinculado |                    |
| FABRICANTE_FRETE                | numeric(8,5)        | Sim         | Legado vinculado |                    |
| DROP_DE_TAMANHOS                | smallint            | Sim         | Legado vinculado |                    |
| DATA_CADASTRAMENTO              | datetime            | Sim         | —                |                    |
| STATUS_PRODUTO                  | char(2 bytes)       | Sim         | Declarado        |                    |
| TIPO_STATUS_PRODUTO             | int                 | Sim         | Declarado        |                    |
| OBS                             | text                | Sim         | —                |                    |
| COMPOSICAO                      | char(6 bytes)       | Sim         | —                |                    |
| RESTRICAO_LAVAGEM               | char(6 bytes)       | Sim         | —                |                    |
| EMPRESA                         | int                 | Não         | Legado vinculado |                    |
| ORCAMENTO                       | varchar(25 bytes)   | Sim         | —                |                    |
| CLIENTE_DO_PRODUTO              | varchar(25 bytes)   | Sim         | —                |                    |
| CONTA_CONTABIL                  | varchar(20 bytes)   | Sim         | —                |                    |
| ESPESSURA                       | numeric(14,2)       | Sim         | Legado vinculado |                    |
| ALTURA                          | numeric(14,2)       | Sim         | Legado vinculado |                    |
| LARGURA                         | numeric(10,5)       | Sim         | Legado vinculado |                    |
| COMPRIMENTO                     | numeric(14,2)       | Sim         | Legado vinculado |                    |
| EMPILHAMENTO_MAXIMO             | smallint            | Sim         | Legado vinculado |                    |
| SEXO_TIPO                       | smallint            | Sim         | Legado vinculado |                    |
| PARTE_TIPO                      | smallint            | Sim         | Legado vinculado |                    |
| VERSAO_FICHA                    | char(5 bytes)       | Sim         | Legado vinculado |                    |
| COD_FLUXO_PRODUTO               | char(5 bytes)       | Sim         | —                |                    |
| DATA_INICIO_DESENVOLVIMENTO     | datetime            | Sim         | —                |                    |
| INDICADOR_CFOP                  | tinyint             | Sim         | —                |                    |
| MONTAGEM_KIT                    | tinyint             | Sim         | Legado vinculado |                    |
| MRP_AGRUPAR_NECESSIDADE_DIAS    | int                 | Sim         | Legado vinculado |                    |
| MRP_AGRUPAR_NECESSIDADE_TIPO    | int                 | Sim         | Legado vinculado |                    |
| MRP_DIAS_SEGURANCA              | int                 | Sim         | Legado vinculado |                    |
| MRP_EMISSAO_LIBERACAO_DIAS      | int                 | Sim         | Legado vinculado |                    |
| MRP_ENTREGA_GIRO_DIAS           | int                 | Sim         | Legado vinculado |                    |
| MRP_PARTICIPANTE                | int                 | Sim         | Legado vinculado |                    |
| MRP_MAIOR_GIRO_MP_DIAS          | int                 | Sim         | Legado vinculado |                    |
| OP_POR_COR                      | bit                 | Não         | Legado vinculado |                    |
| OP_QTDE_MAXIMA                  | int                 | Sim         | Legado vinculado |                    |
| OP_QTDE_MINIMA                  | int                 | Sim         | Legado vinculado |                    |
| QUALIDADE                       | tinyint             | Sim         | Legado vinculado |                    |
| SEMI_ACABADO                    | int                 | Sim         | Legado vinculado |                    |
| CONTA_CONTABIL_COMPRA           | varchar(20 bytes)   | Sim         | —                |                    |
| CONTA_CONTABIL_VENDA            | varchar(20 bytes)   | Sim         | —                |                    |
| CONTA_CONTABIL_DEV_COMPRA       | varchar(20 bytes)   | Sim         | —                |                    |
| CONTA_CONTABIL_DEV_VENDA        | varchar(20 bytes)   | Sim         | —                |                    |
| ID_EXCECAO_GRUPO                | int                 | Sim         | —                |                    |
| ID_EXCECAO_IMPOSTO              | int                 | Sim         | —                |                    |
| DIAS_COMPRA                     | varchar(50 bytes)   | Sim         | —                |                    |
| FATOR_P                         | tinyint             | Sim         | Legado vinculado |                    |
| FATOR_Q                         | tinyint             | Sim         | Legado vinculado |                    |
| FATOR_F                         | tinyint             | Sim         | Legado vinculado |                    |
| CONTINUIDADE                    | tinyint             | Sim         | Legado vinculado |                    |
| COD_CATEGORIA                   | char(6 bytes)       | Sim         | —                |                    |
| COD_SUBCATEGORIA                | char(6 bytes)       | Sim         | —                |                    |
| TIPO_ITEM_SPED                  | char(5 bytes)       | Sim         | Declarado        |                    |
| COD_PRODUTO_SOLUCAO             | int                 | Sim         | —                |                    |
| COD_PRODUTO_SEGMENTO            | int                 | Sim         | —                |                    |
| ID_PRECO                        | int                 | Sim         | —                |                    |
| PERC_COMISSAO                   | numeric(8,5)        | Não         | Legado vinculado |                    |
| ACEITA_ENCOMENDA                | tinyint             | Não         | Legado vinculado |                    |
| DIAS_GARANTIA_LOJA              | smallint            | Não         | Legado vinculado |                    |
| DIAS_GARANTIA_FABRICANTE        | smallint            | Não         | Legado vinculado |                    |
| POSSUI_MONTAGEM                 | bit                 | Não         | Legado vinculado |                    |
| POSSUI_GTIN                     | bit                 | Não         | Legado vinculado |                    |
| PERMITE_ENTREGA_FUTURA          | bit                 | Não         | Legado vinculado |                    |
| NATUREZA_RECEITA                | char(3 bytes)       | Sim         | —                |                    |
| COD_ALIQUOTA_PIS_COFINS_DIF     | varchar(9 bytes)    | Sim         | —                |                    |
| DATA_LIMITE_PEDIDO              | datetime            | Sim         | —                |                    |
| LX_STATUS_REGISTRO              | int                 | Não         | Legado vinculado |                    |
| ARREDONDA                       | bit                 | Não         | Legado vinculado |                    |
| ID_ARTIGO                       | int                 | Sim         | —                |                    |
| LX_HASH                         | varbinary(16 bytes) | Sim         | —                |                    |
| SPED_DATA_FIM                   | datetime            | Sim         | —                |                    |
| SPED_DATA_INI                   | datetime            | Sim         | —                |                    |
| TIPO_PP                         | tinyint             | Não         | Declarado        |                    |
| ID_CEST_NCM                     | int                 | Sim         | —                |                    |
| DIAS_ACERTO_CONSIGNACAO         | smallint            | Não         | Legado vinculado |                    |
| FATOR_A                         | float               | Sim         | —                |                    |
| FATOR_B                         | float               | Sim         | —                |                    |
| FATOR_BUFFER                    | float               | Sim         | —                |                    |
| FATOR_LT                        | float               | Sim         | —                |                    |
| TIPO_CANAL                      | varchar(25 bytes)   | Sim         | —                |                    |
| TITULO_B2C                      | varchar(100 bytes)  | Sim         | —                |                    |
| DESCRICAO_B2C                   | varchar(2000 bytes) | Sim         | —                |                    |
| PRE_VENDA                       | bit                 | Sim         | Legado vinculado |                    |
| TAGS                            | varchar(4000 bytes) | Sim         | —                |                    |
| VIDEO_EMBED                     | varchar(4000 bytes) | Sim         | —                |                    |
| CARACTERISTICAS_TECNICAS_B2C    | varchar(4000 bytes) | Sim         | —                |                    |
| FRETE_GRATIS                    | bit                 | Sim         | Legado vinculado |                    |
| ESTOQUE_MINIMO                  | int                 | Sim         | Legado vinculado |                    |
| DATA_PUBLICACAO_B2C             | datetime            | Sim         | —                |                    |
| GRUPO_PRODUTO_B2C               | int                 | Sim         | —                |                    |
| SUBGRUPO_PRODUTO_B2C            | int                 | Sim         | —                |                    |
| TIPO_PRODUTO_B2C                | int                 | Sim         | —                |                    |
| GRIFFE_B2C                      | int                 | Sim         | —                |                    |
| LINHA_B2C                       | int                 | Sim         | —                |                    |
| FABRICANTE_B2C                  | int                 | Sim         | —                |                    |
| CATEGORIA_B2C                   | int                 | Sim         | —                |                    |
| SUBCATEGORIA_B2C                | int                 | Sim         | —                |                    |
| REPOSICAO_B2C                   | bit                 | Sim         | Legado vinculado |                    |
| IMG_ESTILO                      | varchar(60 bytes)   | Sim         | —                |                    |
| DESCRICAO_B2C_2                 | varchar(30 bytes)   | Sim         | —                |                    |
| DESCRICAO_B2C_3                 | varchar(30 bytes)   | Sim         | —                |                    |
| SESSAO_RESERVA                  | varchar(20 bytes)   | Sim         | —                |                    |
| U_CARACTERISTICA_B2C            | varchar(2000 bytes) | Sim         | —                |                    |
| U_DESCRICAO_B2C                 | varchar(2000 bytes) | Sim         | —                |                    |
| U_MANGA_B2C                     | varchar(30 bytes)   | Sim         | —                |                    |
| U_TEMA_B2C                      | varchar(30 bytes)   | Sim         | —                |                    |
| U_BLOQUEIO_FICHA                | bit                 | Sim         | Declarado        |                    |
| U_PACK                          | bit                 | Sim         | Declarado        |                    |
| ENVIA_VTEX                      | bit                 | Sim         | —                |                    |
| SUJEITO_SUBSTITUICAO_TRIBUTARIA | bit                 | Não         | Declarado        |                    |
| OPTION_TITULO                   | tinyint             | Sim         | —                |                    |
| OPTION_DESC                     | tinyint             | Sim         | —                |                    |
| OPTION_CARACTERISTICA           | tinyint             | Sim         | —                |                    |
| U_AGRUPADOR_DESCONTO            | int                 | Sim         | —                |                    |
| U_TABELA_OPERACOES_PILOTO       | varchar(25 bytes)   | Sim         | Declarado        |                    |
| U_NOME_PRODUTO                  | varchar(200 bytes)  | Sim         | —                |                    |
| ID                              | int                 | Não         | —                | Identity           |
| USA_RFID                        | bit                 | Não         | Declarado        |                    |
| MRP_RR                          | int                 | Sim         | —                |                    |
| MRP_FP                          | int                 | Sim         | —                |                    |

### PRODUTO_CORES

| Coluna                    | Tipo                | Aceita NULL | Default          | Observação técnica |
| ------------------------- | ------------------- | ----------- | ---------------- | ------------------ |
| PRODUTO                   | char(12 bytes)      | Não         | —                |                    |
| COR_PRODUTO               | char(10 bytes)      | Não         | —                |                    |
| SIMILAR                   | int                 | Sim         | —                |                    |
| DESC_COR_PRODUTO          | varchar(40 bytes)   | Não         | —                |                    |
| SORTIMENTO_COR            | numeric(8,5)        | Sim         | Legado vinculado |                    |
| COR_SORTIDA               | bit                 | Não         | Legado vinculado |                    |
| STATUS_VENDA_ATUAL        | char(1 bytes)       | Sim         | —                |                    |
| INICIO_VENDAS             | datetime            | Sim         | —                |                    |
| FIM_VENDAS                | datetime            | Sim         | —                |                    |
| COR_FABRICANTE            | char(8 bytes)       | Sim         | Legado vinculado |                    |
| TIPO_LAVAGEM_TINTURARIA   | varchar(25 bytes)   | Sim         | —                |                    |
| TINTURARIA_LAVAGEM        | bit                 | Não         | Legado vinculado |                    |
| COR                       | char(10 bytes)      | Sim         | —                |                    |
| MATERIAL                  | char(11 bytes)      | Sim         | —                |                    |
| COR_MATERIAL              | char(10 bytes)      | Sim         | —                |                    |
| ETIQUETA                  | char(4 bytes)       | Sim         | —                |                    |
| CUSTO_REPOSICAO1          | numeric(14,2)       | Sim         | Legado vinculado |                    |
| CUSTO_REPOSICAO2          | numeric(14,2)       | Sim         | Legado vinculado |                    |
| CUSTO_REPOSICAO3          | numeric(14,2)       | Sim         | Legado vinculado |                    |
| CUSTO_REPOSICAO4          | numeric(14,2)       | Sim         | Legado vinculado |                    |
| TIMESTAMP                 | timestamp           | Sim         | —                | Rowversion         |
| VARIANTE_TAMANHO          | char(2 bytes)       | Sim         | —                |                    |
| DATA_PARA_TRANSFERENCIA   | datetime            | Sim         | Legado vinculado |                    |
| PRECO_REPOSICAO_1         | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_REPOSICAO_2         | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_REPOSICAO_3         | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_REPOSICAO_4         | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_A_VISTA_REPOSICAO_1 | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_A_VISTA_REPOSICAO_2 | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_A_VISTA_REPOSICAO_3 | numeric(14,2)       | Sim         | Legado vinculado |                    |
| PRECO_A_VISTA_REPOSICAO_4 | numeric(14,2)       | Sim         | Legado vinculado |                    |
| CLASSIF_FISCAL            | char(10 bytes)      | Sim         | —                |                    |
| COMPOSICAO                | char(6 bytes)       | Sim         | —                |                    |
| TRIBUT_ORIGEM             | char(3 bytes)       | Sim         | —                |                    |
| LX_STATUS_REGISTRO        | int                 | Não         | Legado vinculado |                    |
| LX_HASH                   | varbinary(16 bytes) | Sim         | —                |                    |
| OBS_EST                   | varchar(150 bytes)  | Sim         | —                |                    |
| OBS_BOR                   | varchar(150 bytes)  | Sim         | —                |                    |
| OBS_LAV                   | varchar(150 bytes)  | Sim         | —                |                    |
| OBS_TER                   | varchar(150 bytes)  | Sim         | —                |                    |
| U_INATIVO                 | bit                 | Sim         | Declarado        |                    |
| U_DESC_COR_FABRICANTE     | varchar(100 bytes)  | Sim         | —                |                    |
| COR_RGB                   | int                 | Sim         | —                |                    |
| PATH_FOTO_COR             | varchar(100 bytes)  | Sim         | —                |                    |
| U_COLECAO                 | char(6 bytes)       | Sim         | —                |                    |
| U_CTRL_ESTOQUE            | bit                 | Sim         | —                |                    |

### PRODUTO_FICHA_VERSAO

| Coluna              | Tipo               | Aceita NULL | Default          | Observação técnica |
| ------------------- | ------------------ | ----------- | ---------------- | ------------------ |
| PRODUTO             | char(12 bytes)     | Não         | —                |                    |
| VERSAO_FICHA        | char(5 bytes)      | Não         | Legado vinculado |                    |
| DESC_VERSAO_FICHA   | varchar(40 bytes)  | Não         | —                |                    |
| DATA_CRIACAO        | datetime           | Sim         | —                |                    |
| RESPONSAVEL         | varchar(40 bytes)  | Não         | —                |                    |
| STATUS_VERSAO_FICHA | char(2 bytes)      | Não         | —                |                    |
| CLIENTE_ATACADO     | varchar(25 bytes)  | Sim         | —                |                    |
| OBS_VERSAO_FICHA    | varchar(250 bytes) | Sim         | —                |                    |
| U_COLECAO           | char(6 bytes)      | Sim         | —                |                    |

### PRODUTO_VERSAO_MATERIAL

| Coluna                  | Tipo              | Aceita NULL | Default          | Observação técnica |
| ----------------------- | ----------------- | ----------- | ---------------- | ------------------ |
| PRODUTO                 | char(12 bytes)    | Não         | —                |                    |
| VERSAO_FICHA            | char(5 bytes)     | Não         | Legado vinculado |                    |
| MATERIAL                | char(11 bytes)    | Não         | —                |                    |
| ITEM                    | char(4 bytes)     | Não         | —                |                    |
| FASE_PRODUCAO           | varchar(25 bytes) | Não         | —                |                    |
| SETOR_PRODUCAO          | varchar(25 bytes) | Não         | —                |                    |
| DESC_USO_MATERIAL       | varchar(80 bytes) | Sim         | Legado vinculado |                    |
| CONSUMO_P_TAMANHO       | bit               | Não         | Legado vinculado |                    |
| MATERIAL_PRINCIPAL      | bit               | Não         | Legado vinculado |                    |
| C1                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C2                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C3                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C4                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C5                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C6                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C7                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C8                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C9                      | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C10                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C11                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C12                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C13                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C14                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C15                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C16                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C17                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C18                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C19                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C20                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C21                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C22                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C23                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C24                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C25                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C26                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C27                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C28                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C29                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C30                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C31                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C32                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C33                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C34                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C35                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C36                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C37                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C38                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C39                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C40                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C41                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C42                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C43                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C44                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C45                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C46                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C47                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| C48                     | numeric(9,3)      | Sim         | Legado vinculado |                    |
| TIMESTAMP               | timestamp         | Sim         | —                | Rowversion         |
| PARTE_APLICADO_MATERIAL | varchar(10 bytes) | Sim         | —                |                    |
| MATERIAL_DEPENDENTE     | tinyint           | Sim         | Legado vinculado |                    |
| INDICA_PACOTE_MATERIAIS | bit               | Não         | Legado vinculado |                    |
| PACOTE_MATERIAIS        | char(6 bytes)     | Sim         | —                |                    |
| LARGURA                 | numeric(9,3)      | Sim         | Legado vinculado |                    |
| ALTURA                  | numeric(9,3)      | Sim         | Legado vinculado |                    |
| SPED_DATA_FIM           | datetime          | Sim         | —                |                    |
| SPED_DATA_INI           | datetime          | Sim         | —                |                    |
| TIPO_PP                 | tinyint           | Não         | Declarado        |                    |
| CONSUMO_FIXO            | bit               | Não         | Declarado        |                    |

### PRODUTO_VERSAO_MATERIAL_COR

| Coluna              | Tipo           | Aceita NULL | Default          | Observação técnica |
| ------------------- | -------------- | ----------- | ---------------- | ------------------ |
| PRODUTO             | char(12 bytes) | Não         | —                |                    |
| MATERIAL            | char(11 bytes) | Não         | —                |                    |
| COR_PRODUTO         | char(10 bytes) | Não         | —                |                    |
| VERSAO_FICHA        | char(5 bytes)  | Não         | Legado vinculado |                    |
| ITEM                | char(4 bytes)  | Não         | —                |                    |
| MATERIAL_PRINCIPAL  | bit            | Não         | Legado vinculado |                    |
| COR_MATERIAL        | char(10 bytes) | Sim         | —                |                    |
| PORCENTAGEM_CONSUMO | numeric(9,3)   | Sim         | Legado vinculado |                    |
