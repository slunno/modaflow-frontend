# Usos por tipo de peça

A lista de “Nome da peça” é carregada por `getLinxSubgrupos()` em
`CollectionDetailView`, usando `GET /api/v1/linx/subgrupos`. No backend,
`LinxIntegrationService.getSubgrupos()` lê `SUBGRUPO_PRODUTO` de
`dbo.PRODUTOS_SUBGRUPO`, com `GRUPO_PRODUTO = 'ROUPAS'`, `INATIVO = 0`
(ou nulo), sem valores vazios e sem repetições.

As 23 opções foram conferidas no modal da sessão autenticada do portal em
06/10/2026: AVENTAL, BATA, BERMUDA, BLAZER, BLUSA, CALÇA, CAMISA, CAMISETA,
CASACO, COLETE, CONJUNTO, CUECA, JAQUETA, MACACÃO, MALHÃO, MOLETOM,
OVERSHIRT, PIJAMA, POLO, REGATA, SHORTS, SUNGA e TRICOT.

O compartilhamento usa o subgrupo original do Linx ou o tipo escolhido ao criar
a peça. Alterar o nome do produto não altera esse vínculo. A regra é dinâmica
e também atende novos tipos retornados pela API, sem uma lista fixa no código.

Os usos ficam no armazenamento local do navegador, compartilhados entre marcas
e coleções pelo tipo de peça. Tecidos e aviamentos mantêm seus catálogos separados.
Na aba Tecidos, o seletor “Uso do tecido” lista somente usos de tecidos; na aba
Aviamentos, “Uso do aviamento” lista somente usos de aviamentos. Ambos permitem
pesquisar, selecionar e cadastrar opções no próprio campo.
Salvar um uso adiciona uma opção para as outras peças do mesmo tipo; selecionar
essa opção preenche somente o insumo em edição.

O formato `modaflow_product_usos_v2:<tipo-de-peca>:<tipo-de-insumo>` recupera
também os usos do formato anterior, que separava as opções por marca. Os registros
anteriores são preservados. Nenhum uso é gravado no banco de dados ou no Linx.
