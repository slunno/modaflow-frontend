# Criação e edição incremental da ficha no Linx

Análise de 07/10/2026. A atualização da mesma versão, preservando tudo que não foi solicitado, foi confirmada pelo usuário nesta conversa. Essa decisão substitui a proposta anterior de gerar uma nova versão em toda reintegração.

## Resultado e situação da implementação

Atualização de 13/10/2026: para peça sem vínculo confirmado, o planejamento agora é `VERIFICAR_CADASTRO_E_FICHA_COLECAO`, não assume que todo código digitado seja um produto novo. Após leitura no servidor, será necessário criar cadastro se inexistente ou resolver a ficha da coleção reutilizando o cadastro existente, sem duplicar PRODUTOS nem alterar a ficha de origem. Escrita e reserva continuam pendentes. A orientação à TI está em [perfil de cadastro](linx-perfil-cadastro-ti.md).

É possível construir um adaptador de gravação SQL sem uma API pronta. Isso exige contrato de campos, referências, transação, controle de concorrência e homologação; encontrar um SELECT não comprova uma rotina de gravação correta.

Foi acrescentado ao contrato preparado pelo portal o planejamento separado de `CRIAR_PRODUTO_E_FICHA` e `ATUALIZAR_FICHA_ATUAL`. A atualização aponta para a versão confirmada/importada da própria peça e coleção, sem escolher a maior versão do código. Exige releitura do estado real antes de uma futura gravação. Mudança da chave do produto, vínculo de outra coleção/griffe ou identidade incompleta não são tratados como edição comum.

O helper `planejarAlteracaoDeLinha` compara somente os campos expressamente fornecidos, preserva os demais valores e restringe os campos a produto, item da ficha ou associação de cor. Não permite editar chaves/versão nem custos do catálogo. Dados existentes não são convertidos automaticamente em zero, vazio ou valores padrão. Retorna um snapshot de conferência com status `PENDENTE_MAPEAMENTO`, não SQL executável. Não faz inclusões/exclusões de linhas e não é invocado por um gravador.

**Ainda não existe um envio ou atualização efetiva do Linx.** Não foi criada uma rota que simule sucesso. O backend continua somente leitura para Linx. Salvar rascunho continua local e não cria uma versão integrada. Nenhum DDL/migração foi criado e nenhum INSERT/UPDATE/DELETE foi executado nesta análise. O backend não foi iniciado, o .3 não foi acessado e KINGEJOE foi preservado.

## Evidência visual e SQL

Vídeo: `20261007-1157-16.3388469.mp4`, duração 77,9 s. Leitura dos quadros da gravação; não há captura do SQL executado pela tela nem recibo de alteração.

| Momento aproximado | Tela / informação visual                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–15 s             | 040001KIN — Ficha Técnica de Produto Acabado; produto BM.00.301, descrição BERMUDA MOLETOM SLIM e versão exibida 00004                                        |
| 15–40 s            | Materiais: consumo no tamanho-base 38, unidade, principal, consumo por tamanho/molde, uso, item, fase/setor, fator de conversão e tipo                        |
| 40–60 s            | Inclusão / Alteração de Materiais: material 01.02.1758, uso, altura/largura, densidade, consumo 0,393 KG, item 0026 e combinações de cores com percentual 100 |
| 60–70 s            | Fornecedores do material; cor, descrição, fornecedor, referência e descrição do fornecedor                                                                    |
| 70–78 s            | Molde sem linhas visíveis e retorno à lista de materiais                                                                                                      |

A gravação não documenta uma tentativa de salvar que resulte em erro. O controle “Bloqueia Ficha” aparece desmarcado; isso não comprova permissões de edição nem explica sozinho o problema relatado.

Consultas foram SELECT, exclusivamente em `tcp:192.168.1.6,1433`, servidor `srv-sql-dev`, banco `HOMOLOG_COBRANCA`, criptografia TRUE, utilizando credencial protegida do Windows. A senha não foi impressa ou inserida em scripts.

Na cópia, BM00301 tem `PRODUTOS.VERSAO_FICHA = 00001`, `U_BLOQUEIO_FICHA = false`, `COLECAO = 000`. O cabeçalho 00001 está vinculado a U_COLECAO 025 e status A. Há também 00002/026, 00003/027 e 00004 sem U_COLECAO. A versão 00004 do vídeo não pode ser adotada automaticamente como atual no .6. Os cadastros globais e os vínculos da versão têm escopos diferentes.

`PRODUTOS_FICHA` e `PRODUTOS_FICHA_COR` são **views**, não tabelas. Suas definições na cópia não filtram mais exclusivamente a versão atual: os filtros antigos estão comentados. Consultar/gravar somente por PRODUTO sem VERSAO_FICHA mistura versões.

Foram encontrados 15 triggers ativos nos objetos principais examinados. Foram lidas integralmente as definições de `LDIU_PRODUTOS_FICHA`, `LXI_PRODUTO_VERSAO_MATERIAL`, `LXI_KING_CM_RESTAURA_MATERIAL`, `LXI_KING_CM_RESTAURA_MATERIAL_COR` e `FX_KING_VERSAO_FICHA`; os demais não tiveram auditoria completa nesta etapa.

As rotinas de restauração de material/cor têm ramo específico para login CM, com consulta a `KING_CM_STAGE_CTRL` e possível redirecionamento de 00001 para VERSAO_FICHA_DESTINO. Isso mostra que um cliente novo não deve assumir que replicar os INSERTs do CM terá o mesmo resultado sob outra credencial. A função FX_KING_VERSAO_FICHA também possui fallbacks e TOP 1 sem uma ordenação em alguns ramos; não foi adotada como seletor determinístico de destino.

Não foi comprovado que os triggers causem o bloqueio relatado. O vídeo não identifica uma transação falha. No código atual do ModaFlow, a razão comprovada para não alterar o ERP é que os endpoints Linx consultam dados, enquanto o editor salva no navegador — não há conector de gravação.

## Onde os dados estão hoje

| Informação                                                                        | Origem / armazenamento identificado                                    | Regra de envio                                                                                                                                   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rascunho, insumos manuais, variantes, preço/consumo manual e auditoria local      | localStorage do portal; anexos binários em IndexedDB                   | Não estão gravados no Linx por Salvar rascunho                                                                                                   |
| Código e descrição cadastral do produto                                           | PRODUTOS.PRODUTO / DESC_PRODUTO                                        | PRODUTO é chave global; renomear descrição não é trocar código                                                                                   |
| Nome do Produto                                                                   | Campo manual no portal; candidato identificado PRODUTOS.U_NOME_PRODUTO | Distinguir de DESC_PRODUTO; não presumir descrição fiscal                                                                                        |
| Grade, griffe, coleção, linha e subgrupo                                          | Cadastros Linx; PRODUTOS e tabelas de referência                       | Códigos aprovados, sem criar/alterar o catálogo compartilhado                                                                                    |
| Versão, responsável, status e coleção da ficha                                    | PRODUTO_FICHA_VERSAO                                                   | Chave PRODUTO + VERSAO_FICHA; usar vínculo da própria coleção                                                                                    |
| Material, item, principal, uso, fase/setor e consumos C1…C48                      | PRODUTO_VERSAO_MATERIAL                                                | Chave PRODUTO + VERSAO_FICHA + MATERIAL + ITEM                                                                                                   |
| Cor aplicada ao item por cor/variante do produto                                  | PRODUTO_VERSAO_MATERIAL_COR                                            | Chave MATERIAL + PRODUTO + COR_PRODUTO + VERSAO_FICHA + ITEM; COR_MATERIAL é campo do vínculo, não parte dessa PK                                |
| Cores do produto                                                                  | PRODUTO_CORES; catálogo CORES_BASICAS                                  | Chave PRODUTO + COR_PRODUTO; atributos não são versionados da mesma forma que o item da ficha                                                    |
| Descrição/propriedades do material e de sua cor                                   | MATERIAIS / MATERIAIS_CORES                                            | Consultar e vincular códigos existentes; não renomear esses cadastros ao editar a peça                                                           |
| Fornecedores                                                                      | FORNECEDORES; relações de cadastro/preço em MATERIAIS_FORNECEDOR       | O catálogo não define um fornecedor/preço universal por peça                                                                                     |
| Preços/custos de referência                                                       | MATERIAIS, MATERIAIS_CORES e MATERIAIS_FORNECEDOR                      | Fontes diferentes, sem prioridade automática aprovada                                                                                            |
| Preço manual escolhido para o insumo da peça                                      | Portal                                                                 | Não há coluna preço/custo/fornecedor por item identificada nas duas tabelas de materiais versionados. Não gravar globalmente para contornar isso |
| Prova de roupa, arquivos de projeto, simbologia, decisões e auditoria por usuário | Portal                                                                 | Destinos ERP/transporte ainda não confirmados; manter dados locais                                                                               |

O mapeamento é estrutural, não afirma que cada campo do CM usa exatamente esse destino. Nomes manuais de insumos do portal não devem renomear DESC_MATERIAL. Cores personalizadas sem código ERP exigem equivalência aprovada antes do envio.

## Regra da futura gravação incremental

1. Autenticar no backend, conferir acesso à marca e carregar a peça canônica. O conteúdo do navegador não é a autoridade para autorizar SQL.
2. Consultar código global, griffe, coleção e versão atual no ERP. Se o código não existe, preparar criação com perfil aprovado; se existe, preservar o cadastro e identificar a ficha/vínculo da coleção antes de qualquer operação. Não duplicar PRODUTOS. Uma referência não autoriza sobrescrever ficha de outra coleção. Atualização não muda identidade/coleção silenciosamente.
3. Carregar a linha/base original e conferir alterações concorrentes. TIMESTAMP em PRODUTOS, PRODUTO_CORES e PRODUTO_VERSAO_MATERIAL é rowversion binário, não data; outros objetos precisam de comparação/lock apropriado.
4. Enviar um conjunto explícito de alterações, com chave completa de cada item/cor. Campo omitido mantém o valor anterior. Não transformar um formulário incompleto em exclusão de todos os demais dados.
5. Inserir apenas linhas novas solicitadas; editar apenas campos solicitados nas existentes. Troca de MATERIAL, parte da PK, precisa tratar vínculos filhos e não pode ser uma alteração ingênua de chave.
6. Exclusão é uma ação separada e confirmada, limitada ao vínculo da peça/versão. A ausência em uma lista filtrada não autoriza excluir. Nunca excluir o material/cor do catálogo global.
7. Validar referências de grade, material/cor, fase/setor, variantes e todos os campos obrigatórios. Sem equivalência aprovada, bloquear e informar o campo, sem criar códigos fictícios.
8. Executar uma transação única na conexão própria de escrita, com destino explicitamente autorizado. Não relaxar o cliente de leitura nem usar sa como credencial operacional do portal. Não invocar rotinas não auditadas que referenciem outro banco.
9. Não gerar uma nova VERSAO_FICHA em uma edição da versão atual. Registrar antes/depois, usuário, operação e idempotência. Recibo confirmado deve identificar a revisão realmente enviada, não um rascunho que mudou durante o envio.
10. Confirmar e reler o resultado antes de marcar sincronizado. Os snapshots de outras versões/coleções permanecem preservados. O helper antigo de criação de histórico não confirma atualização na mesma versão; essa confirmação depende do futuro gravador/recibo específico.

## Dados necessários para produtos novos

Correção da auditoria em 13/10/2026: PRODUTOS tem 45 colunas não nulas, não identity/computed no recorte. A consulta anterior olhava apenas `sys.default_constraints`, identificando 3 padrões declarados diretamente (TIPO_PP=2, SUJEITO_SUBSTITUICAO_TRIBUTARIA=0 e USA_RFID=0). A releitura de `sys.columns.default_object_id`, `sys.objects` e `sys.sql_modules` confirmou também **26 defaults legados vinculados**: 24 colunas com DEFAULT_0=0, EMPRESA com DEFAULT_N1=1 e ARREDONDA com DEFAULT_1=1. Portanto são **29 colunas com default e 16 sem default**, não 42 sem default. A consulta 5 foi corrigida para contemplar os dois tipos. As definições foram lidas como texto, nunca executadas.

As 16 sem default são PRODUTO, CLASSIF_FISCAL, TIPO_PRODUTO, DESC_PRODUTO, GRUPO_PRODUTO, SUBGRUPO_PRODUTO, COLECAO, GRADE, DESC_PROD_NF, LINHA, GRIFFE, UNIDADE, FABRICANTE, PONTEIRO_PRECO_TAM, TRIBUT_ICMS e TRIBUT_ORIGEM. São atributos de uma linha de produto, não 45 produtos nem 45 telas. NOT NULL impede NULL; não comprova que uma string vazia seja um cadastro de negócio válido. Os defaults técnicos não são aprovação de perfil fiscal/operacional para todos os tipos de peça.

Além dos campos do portal, é necessário aprovar um perfil de cadastro contendo classificação fiscal/NCM, descrição para nota fiscal, unidade, fabricante, tributação, empresa e flags operacionais, entre outros. A lista completa é obtida pela consulta 5 do arquivo SQL. Não copiar esses valores de uma peça arbitrária: produtos de tipos diferentes podem ter tratamento diferente.

Tamanhos escolhidos no portal precisam corresponder às posições reais de uma grade ERP aprovada. O campo Modelagem do portal contém referência de produto, mas PRODUTOS.MODELAGEM aponta para PRODUTOS_MODELO; não há equivalência automática autorizada. Nome de coleção/DESC_COLECAO precisa ser ligado ao código COLECOES.COLECAO, não inferido por nome/data sobrepostos.

## Próximas definições para liberar escrita

- Perfil aprovado dos campos fiscais/operacionais para criação: valores informados pelo usuário, defaults por tipo/griffe ou um cadastro de referência explicitamente escolhido.
- Destino do preço manual por item/variante e fornecedor escolhido. Se não houver destino ERP apropriado, decidir manter esses dados no portal sem alterar catálogos.
- Mapa explícito de variantes/cores personalizadas, grade e fase/setor; destino de dados sem correspondência.
- Autorização e recorte dos primeiros testes com gravação, apenas no .6/HOMOLOG_COBRANCA, usando um produto de homologação indicado; nunca presumir que a investigação SELECT autoriza alterar os exemplos reais da cópia.
- Evidência do bloqueio: informar se ocorre no CM, na tela Linx ou no ModaFlow, e a mensagem/ação que falha. Não contornar “Bloqueia Ficha” ou status de aprovação por suposição.

A orientação de backend manteve a separação entre preparação, armazenamento do portal e adaptador transacional do ERP. Nenhuma infraestrutura ou framework foi trocado.

## Verificação desta entrega

- 32 arquivos de teste / 182 testes do frontend passaram, incluindo 7 casos novos de planejamento incremental.
- TypeScript e build de produção passaram. Lint dos três arquivos de código envolvidos passou.
- Há avisos preexistentes de React `act(...)` em testes de componentes; não foram tratados como erro de integração nem ocultados no relatório.
- As nove consultas do arquivo SQL foram executadas na cópia autorizada, com 1, 1, 4, 4, 45, 5, 15, 7 e 34 linhas respectivamente (116 linhas de metadados/evidências, não 116 fichas).
- Nenhuma gravação ERP foi testada ou habilitada. Esses testes confirmam preparação/mesclagem e regressões do portal, não um conector Linx funcionando.
