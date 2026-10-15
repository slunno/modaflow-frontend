# Mapeamento do preço manual do insumo no Linx

Auditoria de 07/10/2026, somente leitura. O pedido é localizar o destino do preço que o usuário informa ao criar/editar tecidos e aviamentos, mantendo esse valor junto do insumo quando solicitado. Não é autorização para gravar o ERP nem para substituir preços de catálogos compartilhados.

## Resultado

**O armazenamento local do preço junto ao insumo está identificado no ModaFlow. Não foi confirmado um destino equivalente, por item/variante/versão da peça, no Linx auditado.**

Nas quatro tabelas de item e staging examinadas, não existem colunas denominadas preço, custo, valor ou fornecedor. Foram encontradas fontes de custo do catálogo do material, da cor do material, do fornecedor e de tabelas de preço. Seus escopos são diferentes do preço manual de um item de uma peça. A ausência nessas tabelas e nessa busca estrutural não prova que um destino não exista em outro módulo, sob outra nomenclatura ou no banco do próprio CM.

Não foi ativado envio, alterado campo de catálogo, criado objeto SQL ou executado procedimento de custo. As views/funções/triggers/procedures foram lidas como texto, não executadas. Os resultados da cópia não comprovam a operação do CM nem o estado atual de outro servidor.

## Ambiente e segurança

- Conexão exclusivamente `tcp:192.168.1.6,1433`, banco inicial e efetivo `HOMOLOG_COBRANCA`.
- Servidor retornado: `srv-sql-dev`; endereço local do servidor `192.168.1.6`; porta `1433`; criptografia `TRUE`; permissão efetiva SELECT = 1.
- Credencial protegida pelo Windows reutilizada com `Import-Clixml`, `SecureString` e `SqlCredential`. Senha não exibida nem incluída em script, documento ou argumento de processo.
- `Encrypt=True` e `TrustServerCertificate=True`. Foi conferida a identidade da conexão antes de executar o arquivo de consultas.
- Não houve acesso ao `.3`, ao banco original, a nomes de quatro partes, synonyms, linked servers ou referências indiretas a outros bancos.
- As consultas de dados leram somente tabelas físicas locais. O login de auditoria não deve ser usado como credencial operacional do portal.
- Exemplos de produtos restritos às referências já autorizadas: BM00301, MO14205K, BM00002 e PO14006K. Nenhuma amostra de outra peça foi consultada.

## O que o projeto já guarda

Leitura do código, sem alterações:

1. `src/types/gestao.ts`: `TecidoInsumoItem` possui `id`, nome, código, fornecedores, cores, `custo: string`, `unidade: string`, propriedades e observações. O preço pertence ao mesmo objeto do tecido/aviamento.
2. `src/pages/Gestao/modals/CriarTecidoModal.tsx`: o bloco Preço e observações preenche `custo` e `unidade`; a criação/edição devolve esses valores junto aos demais dados do insumo. A mesma modal atende os dois tipos.
3. `src/types/ficha.ts`: `FichaInsumo` conserva esses campos e cada `FichaVariante` possui suas listas de tecidos/aviamentos. `precoOrigem: 'manual'` identifica a edição manual.
4. `src/pages/Home/components/FichaInsumosEditor.tsx`: ao adicionar/editar um insumo, conserva os dados do item e registra a origem manual. Alterar unidade limpa consumos incompatíveis, em vez de converter silenciosamente.
5. `src/services/localPecasStorage.ts`: salva a peça e sua ficha em `modaflow_collection_pecas`, no armazenamento local do navegador, com identidade de peça, coleção e marca.
6. `src/services/fichaProcesso.ts`: `contratoConferencia` envia `preco: x.custo`, unidade e consumos dentro de cada insumo/variante para conferência. Isso não é uma gravação de preço no Linx. O contrato de integração continua `PENDENTE_MAPEAMENTO`.
7. `src/services/linxFichaMappers.ts`: insumos importados começam com `custo: ''`; o custo do catálogo não é convertido em escolha manual do usuário.

Após a correção por unidade desta tarefa, o cálculo local usa preço manual vezes Peso para tecido em kg, Consumo para tecido em metros e Quantidade para aviamento, sempre na unidade do preço. Quantidade ausente/inválida ou unidade não reconhecida deixa o custo não informado, sem conversões ou substituição por outro campo. Não homologa a fórmula do ERP nem gravação SQL. Nenhum teste local de cálculo ou preparação deve ser apresentado como prova de integração funcionando.

## Destinos e escopos encontrados no banco

| Objeto físico | Chave identificada | Valores existentes | Interpretação comprovada / limite |
| --- | --- | --- | --- |
| PRODUTO_VERSAO_MATERIAL | PRODUTO + VERSAO_FICHA + MATERIAL + ITEM | Consumos C1 a C48, uso, principal, largura/altura, fase/setor | Vínculo versionado do insumo à peça. 68 colunas; nenhuma de preço/custo/valor/fornecedor identificada. |
| PRODUTO_VERSAO_MATERIAL_COR | MATERIAL + PRODUTO + COR_PRODUTO + VERSAO_FICHA + ITEM | COR_MATERIAL e PORCENTAGEM_CONSUMO | Aplicação da cor do material à variante/cor da peça. 8 colunas; nenhuma de preço/custo/valor/fornecedor. |
| KING_CM_STAGE_MATERIAL / KING_CM_STAGE_MATERIAL_COR | Controle e linhas temporárias, sem PK retornada no recorte | 70 e 10 colunas, respectivamente | Staging de restauração dos vínculos; também sem campos de preço/custo/valor/fornecedor. Não demonstram armazenamento do preço manual do CM. |
| MATERIAIS | MATERIAL | CUSTO_A_VISTA, CUSTO_REPOSICAO | Custo do cadastro compartilhado do material; não está vinculado à coleção/item/variante da peça. |
| MATERIAIS_CORES | MATERIAL + COR_MATERIAL | CUSTO_A_VISTA, CUSTO_REPOSICAO | Custo da cor compartilhada do material. VERSAO_FICHA nessa tabela refere-se ao material, não à versão da ficha do produto. |
| MATERIAIS_FORNECEDOR | MATERIAL + FORNECEDOR + COR_MATERIAL | CUSTO_REPOSICAO, UNIDADE, FATOR_CONVERSAO_FORNECEDOR | Custo da relação material/cor/fornecedor. Não comprova qual fornecedor foi escolhido para o item de uma peça. |
| MATERIAIS_FORNECEDOR_CUSTOS | MATERIAL + FORNECEDOR + COR_MATERIAL + QTDE_COMPRAR | CUSTO_REPOSICAO | Faixa de compra do fornecedor; não equivale automaticamente a consumo por peça/tamanho. |
| MATERIAIS_PRECO | CODIGO_TAB_PRECO + MATERIAL + COR_MATERIAL | PRECO, PRECO_DESCONTO | Tabela de preço compartilhada do material/cor. Não possui produto/versão/item. |
| PRODUTO_CORES | PRODUTO + COR_PRODUTO | Custos/preços de reposição do produto por cor | Valores do produto acabado por cor, não de cada tecido/aviamento aplicado. |
| KING_AUDITORIA_CUSTOS_ITEM | ID_CUSTO_ITEM | CUSTO_MP, custos de operações, CUSTO_FINAL | Agregados por produto/auditoria; não possuem material, cor de material ou item da ficha para guardar cada preço unitário. |

Busca adicional em metadados encontrou 111 tabelas com coluna PRODUTO e nomes de campos contendo PRECO/CUSTO. Nenhuma reúne MATERIAL, VERSAO_FICHA e ITEM com esses campos. PROTOTIPO e GIV_PLANO_SORTIMENTO_PRODUTO_BKP_V801 possuem custo/material/produto, mas não versão/item da ficha e não tinham registros para as quatro referências auditadas. Foram encontrados quatro registros em KING_AUDITORIA_CUSTOS_ITEM, sem equivalência de preço unitário.

Os custos de catálogo/relação de fornecedor examinados são `numeric(15,5)`. MATERIAIS_PRECO.PRECO é `numeric(14,2)`. Encontrar precisão compatível ou o mesmo número não prova equivalência funcional.

As FKs locais ligam o item ao cabeçalho da versão, ao material e ao setor/fase; a cor do item ao item pai, à cor do material e à cor do produto; e os preços/fornecedores ao catálogo de materiais/cores. As 31 linhas de colunas das FKs consultadas estão ativas (`is_disabled = 0`) e não confiáveis para todo o legado (`is_not_trusted = 1`). Isso não significa que novos registros inválidos estejam liberados.

## O que as definições de cálculo demonstram

Somente leitura de `sys.sql_modules`; nenhum destes objetos foi invocado:

- **W_MATERIAIS_CORES:** seus aliases CUSTO_A_VISTA_COR e CUSTO_REPOSICAO_COR vêm de MATERIAIS_CORES. O fator de conversão e unidades vêm de MATERIAIS.
- **W_KING_PRODUTO_CUSTO_FICHA_SINTETICO:** para materiais não semiacabados, o custo de material por posição de tamanho usa consumo Cn × porcentagem/100 × custo à vista da cor / fator de conversão. Inclui operações e extras em partes separadas. Não lê preço manual por item da peça nem escolhe fornecedor.
- **FX_KING_CUSTO_PRODUTO_FICHA:** usa custo à vista da cor, fator de conversão, consumo C1 e percentual; soma operações/extras. Seu recorte exige U_COLECAO nulo. O join entre ficha e cores não inclui versão; não deve ser copiado como contrato seguro por coleção/versão.
- **W_PRODUTOS_CUSTO:** usa custo de reposição da cor, C1, percentual e fator; exclui subgrupo LINHA. Também não restringe o join por versão. Portanto não é a mesma fórmula universal da função anterior.
- **PRODUTOS_FICHA / PRODUTOS_FICHA_COR:** são views sobre as tabelas versionadas. O filtro antigo da versão apontada no produto está comentado. Ler essas views só pelo código pode misturar versões.
- **LXI_KING_CM_RESTAURA_MATERIAL / _COR:** o ramo de login CM restaura/redireciona itens e cores usando staging/controle. Suas listas de colunas não transportam um preço por item.
- **KINGJOE_ALTERA_CUSTO_REPOSICAO:** é uma procedure que altera custo de produto acabado e tabelas de preço a partir de custo agregado. Foi lida como texto e não executada; não é um destino para o preço manual unitário de cada insumo.

Essas evidências identificam fontes de determinados cálculos existentes. Não comprovam qual consulta a tela específica usa, o que o CM grava ao integrar um preço, nem autorizam automatizar a escolha de cor, fornecedor ou valor.

## Três peças para conferência

Recorte explícito: na cópia, PRODUTOS.VERSAO_FICHA aponta para **00001** nas três amostras abaixo. Não foi escolhida a maior versão. O código de coleção do cabeçalho está informado quando existe; não foi inferido pelo sufixo do produto.

| Produto / item | Material / cor do material | Custo do cadastro MATERIAIS | Custo da cor MATERIAIS_CORES | Unidade estoque/ficha |
| --- | --- | --- | --- | --- |
| BM00002 / 0001 | 01010175, BLACK 00094 | 0,00000 | 13,98000 | MT / MT |
| MO14205K / 0001 | 01021757, TELHA 00047 / OCRE DIJON 00250 | 0,00000 | 36,97000 / 37,42000 | KG / KG |
| PO14006K / 0001 | 01021475, MARINHO 00004 / BRANCO 00002 / LARANJA BERGAMOTA 00237 | 0,00000 | 42,62346 / 32,41830 / 35,00576 | KG / KG |

O cabeçalho 00001 de BM00002 está ligado à coleção 028; há outra versão 00002 sem coleção. MO14205K e PO14006K têm 00001 sem U_COLECAO na cópia. BM00301, usado para conferir versões, possui 00001/025, 00002/026, 00003/027 e 00004/sem coleção. Esses casos impedem inferir a coleção simplesmente pela versão mais alta.

Exemplo adicional em **PO14006K / item 0006 / entretela 01040020**:

- Custo geral de material: **0,19000**.
- Custo das cores BRANCO 00002 e GRAFITE 00070: **0,36710**.
- Custo do fornecedor GRUPO TSI: **0,36710**; V.L.O ENTRETELAS: **0,30420**; CABERAF: **0,00000**.
- Unidade MT e fator 1. Os valores da tabela de fornecedor são opções de catálogo, não fornecedor confirmado no item da ficha.

No BM00002, o fornecedor da cor BLACK também tem custos diferentes: VICUNHA - GUARULHOS SP e VICUNHA - MARACANAU = 13,98000; MARACANAU 2 = 15,98000; PACAJUS = 16,10000; SAO GONCALO = 14,25000.

O valor 13,98000 encontrado nesta cópia não prova que veio de uma digitação do CM nem contradiz automaticamente o valor 14,9799 mostrado anteriormente pelo usuário. Servidor/cópia, momento e fonte são diferentes; uma correspondência numérica não demonstra a rotina de gravação.

As amostras não representam preço manual escolhido, custo total da peça, preço de venda ou autorização para substituir dados. C1 é somente a posição 1 da grade; para avaliar consumo de um tamanho é necessário o vínculo correto com a grade.

## Execução e limites da auditoria

O arquivo `docs/linx-preco-manual-SELECT.sql` contém **16 consultas SELECT**, todas executadas com sucesso na conexão fixa autorizada. Não contém USE, GO, EXEC, DDL/DML, acesso a módulos de outro banco ou invocação dos objetos retornados como texto.

| Consulta | Finalidade | Linhas retornadas |
| --- | --- | ---: |
| 01 | Conexão, banco e criptografia | 1 |
| 02 | Colunas físicas de ficha/catálogos/candidatos | 367 |
| 03 | PK/unique das fontes | 11 |
| 04 | Tabelas com PRODUTO e preço/custo | 111 |
| 05 | Colunas de FKs locais | 31 |
| 06 | Definições de objetos, somente texto | 10 |
| 07 | Contagem de campos de valor/fornecedor nos itens/staging | 4 |
| 08 | Cabeçalhos das quatro referências | 8 |
| 09 | Insumos das três amostras na versão apontada | 78 |
| 10 | Comparação de material/cor em itens determinados | 9 |
| 11 | Opções de fornecedor dos materiais selecionados | 103 |
| 12 | MATERIAIS_PRECO nos materiais selecionados | 0 |
| 13 | MATERIAIS_FORNECEDOR_CUSTOS nos materiais selecionados | 0 |
| 14 | Contagens dos outros candidatos nas quatro referências | 3 |
| 15 | Busca de campos de valor em famílias relacionadas | 58 |
| 16 | Busca de tabelas com produto/material e candidatos | 27 |

Zero linhas em 12/13 se refere somente aos quatro materiais selecionados (01010175, 01021757, 01021475 e 01040020), não à inexistência de preços nas tabelas inteiras. A consulta 11 mostra cores de catálogo do material, inclusive não aplicadas à peça.

Uma busca exploratória ampla no conteúdo de todos os módulos relacionados a ficha/material/custo excedeu o timeout de 30 segundos; não produziu resultado utilizável. Ela foi substituída pela leitura dirigida dos dez objetos identificados por nome. Não há alegação de auditoria completa de todas as rotinas do banco.

## Decisões que ainda faltam para gravar o preço

1. Confirmar se o preço digitado deve valer somente no item/variante da peça ou atualizar o cadastro compartilhado do insumo. A colocação visual do preço junto ao tecido/aviamento no CM não define seu destino SQL.
2. Se o destino esperado for por item, obter a rotina/API ou uma captura de gravação desse campo no Linx/integração do CM. As tabelas principais auditadas não oferecem esse campo. Não deslocar o preço para C1/consumo, percentual, uso, dimensão ou custo agregado para contornar a ausência.
3. Se houver intenção de alterar custo do material/cor/fornecedor globalmente, isso deve ser uma autorização específica e uma regra aprovada, pois afetará outras peças/cálculos que consultam o mesmo catálogo. Esta auditoria não autoriza essa alteração.
4. Enquanto não houver equivalência confirmada, preservar o preço manual e sua unidade no objeto local do insumo/variante e manter envio do valor pendente. Não informar sincronização de preço que não ocorreu.
5. Antes de qualquer homologação de escrita, definir produto de teste, recorte, credencial operacional, transação, concorrência e confirmação do resultado. Não usar as amostras auditadas como autorização de modificação.

Esta auditoria de mapeamento acrescenta somente documentação e consultas de leitura. Ela não alterou código, configurações, dependências, preços ou dados do portal/ERP; não iniciou backend/frontend e não realizou commits. A correção do cálculo local por unidade pertence à implementação separada desta mesma tarefa.
