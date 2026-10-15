# Ficha técnica — grade e cor do produto

Etapa de mapeamento preparada em 07/10/2026. Não é uma integração nem habilita escrita no Linx.

## O que mudou no portal

- **Geral → Integração Linx → Grade:** botão “Consultar posições da grade”, tabela tamanho/posição Cn e comparação com os tamanhos selecionados no portal. Consultar não troca a seleção. “Usar tamanhos desta grade” é uma ação explícita que substitui a seleção de tamanhos pelo cadastro consultado e exige nova confirmação de grade. O mecanismo local existente salva essa seleção de tamanhos; o snapshot da consulta e a escolha de Grade são guardados junto com os demais campos pelo botão Atualizar/Salvar. Consumos fora da grade continuam preservados.
- **Variantes → Cores das variantes — vínculo Linx:** seleção explícita de cor para cada variante. Produto existente consulta seus vínculos de cor pela identidade original de produto, griffe, código e descrição da coleção. Produto novo pode selecionar somente a cor básica nesta etapa; a geração de COR_PRODUTO não foi definida.
- Nova variante continua copiando imagem e insumos da Principal, mas não recebe automaticamente seu vínculo de cor ERP. Reutilizar o mesmo COR_PRODUTO em duas variantes gera pendência no planejamento.
- Remover um vínculo exige ação explícita. Falha na consulta não apaga escolhas salvas, valores, anexos ou materiais.
- A seleção de cor e o snapshot da grade ficam no rascunho do navegador e no histórico antes/depois ao salvar. Não há persistência SQL, alteração de catálogo compartilhado nem tabelas novas.
- A preparação JSON inclui posições reais e os consumos digitados por tamanho, sem gerar zeros, distribuir consumo geral, converter unidade ou transformar o código manual de um insumo em um material já validado no ERP. Valores são mantidos como texto para conferência; não são comandos SQL nem valores prontos para execução.

A conferência de entrega da etapa anterior continua funcionando por variante; o salvamento parcial permanece permitido. Este mapeamento é uma preparação adicional, não uma nova exigência presumida para a passagem da etapa 1 para 2.

## Evidência observada no .6

Foram executados somente SELECT de metadados e leitura dos quatro produtos previamente autorizados (BM00301, BM00002, MO14205K, PO14006K). A conexão confirmou `.6:1433`, `HOMOLOG_COBRANCA`, `srv-sql-dev`, TCP e criptografia TRUE. Não houve acesso ao `.3`, DDL, DML ou uso do backend normal.

| Vínculo               | Origem comprovada                                                | Cuidados                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Grade                 | `dbo.PRODUTOS_TAMANHOS.GRADE`, `NUMERO_TAMANHOS`, `TAMANHO_1…48` | Posições vazias não são compactadas. O nome do tamanho deve coincidir exatamente; não converter `02` em `2` nem deduzir tamanhos pela quantidade.                                    |
| Cor básica            | `dbo.CORES_BASICAS.COR` e `DESC_COR`                             | O endpoint novo lista até 50 registros por busca, por nome/código, com `USO_PRODUTOS = 1`. Não agrupa cores somente pela descrição. Os endpoints antigos de cores foram preservados. |
| Cor do produto        | PK `dbo.PRODUTO_CORES (PRODUTO, COR_PRODUTO)`                    | `COR_PRODUTO` não é a FK para CORES_BASICAS. O campo separado `PRODUTO_CORES.COR` referencia `CORES_BASICAS.COR`.                                                                    |
| Cor/material na ficha | `dbo.PRODUTO_VERSAO_MATERIAL_COR`                                | Referencia `(PRODUTO, COR_PRODUTO)` em PRODUTO_CORES e `(MATERIAL, COR_MATERIAL)` em MATERIAIS_CORES. Não igualar as chaves por descrição.                                           |

Nos quatro exemplos, COR_PRODUTO coincide com COR. Isso **não comprova** que os códigos devam sempre ser iguais ou que o Linx gere um deles automaticamente. Há também cores do BM00301 vinculadas explicitamente às coleções 025 e 027; a consulta não permite que uma cor explicitamente de outra coleção entre na seleção. Quando U_COLECAO da cor é vazio, a consulta usa a coleção atual do PRODUTOS e informa essa limitação, sem atribuir à cor um vínculo histórico inexistente.

As grades observadas `38-50` e `02-18` informam NUMERO_TAMANHOS = 12, enquanto possuem respectivamente 7 e 9 nomes, após conferir as 48 posições. A interface mostra o aviso de divergência; **não completa as posições vazias nem altera a grade no SQL**. Não foi identificada a regra de negócio que explica esse número. TIMESTAMP não foi usado como data de criação.

## Endpoints preparados

Todos são GET autenticados, com parâmetros e guarda do banco esperado antes da consulta:

- `/linx/grades/detalhe?grade=...`: grade exata; devolve as 48 posições incluindo as vazias. Grade ausente/ambígua é erro, sem fallback.
- `/linx/cores-basicas/codigos?search=...`: códigos e descrições do catálogo básico, sem dedução visual/RGB.
- `/linx/colecoes/{colecao}/produtos/{produto}/cores?griffe=...&descColecao=...`: consulta a coleção atual do produto e ambas as griffes; mantém COR_PRODUTO e COR separados. Cores inativas são identificadas e não podem ser selecionadas como novo vínculo.

Os contratos e consultas foram testados com mocks. Não houve chamada desses endpoints no serviço normal nem alteração da sua configuração. Para disponibilizar as rotas novas, será necessário reiniciar o backend posteriormente em um perfil autorizado; **não iniciar o perfil normal enquanto ele aponta para o .3**.

## O que não ficou resolvido

1. Regra de geração/atribuição de COR_PRODUTO para produto novo: pergunta enviada ao usuário, sem código presumido.
2. Validação/releitura das escolhas na futura operação transacional de gravação. Um snapshot do navegador não é comprovação atual de FK, permissão ou concorrência. A projeção declara expressamente essa exigência e continua PENDENTE_MAPEAMENTO.
3. Criação das associações entre material e cor por variante, inclusive porcentagem e item, ainda exige operação incremental aprovada. Selecionar a cor do produto não cria linhas em PRODUTO_VERSAO_MATERIAL_COR.
4. Destino do preço manual por item/variante, Modelagem do portal versus PRODUTOS_MODELO e perfil fiscal/operacional obrigatório de produto novo.
5. Procedimento/API/contrato de gravação, transação, exclusões explícitas, concorrência e recibo real após releitura. Nada disso foi substituído por um INSERT presumido.

Arquivos/anexos permanecem somente no navegador e não devem ir ao Linx, conforme a decisão vigente. Campo não mapeado fica pendente, não é apagado nem gravado por suposição.

## Verificação

Frontend completo: 38 arquivos / 300 testes aprovados, incluindo 25 novos casos; backend completo: 149 testes aprovados, incluindo 8 novos casos, sem iniciar aplicação ou conectar SQL nos testes. TypeScript, build Vite, pacote Java e ESLint dos arquivos envolvidos aprovados. A API dos testes frontend foi isolada em um esquema não HTTP; o build foi executado em outro processo, sem essa variável de teste.

Os testes novos cobrem posições vazias/repetidas/inválidas, diferenças de nome, tamanhos faltantes, código básico distinto do código da variante, troca de produto/griffe/coleção, duplicidade/inatividade, preservação de consumo, histórico local, consulta explícita, erro HTTP e resposta após desmontagem. Esses resultados não comprovam escrita ERP nem execução ponta a ponta com os serviços reais.
