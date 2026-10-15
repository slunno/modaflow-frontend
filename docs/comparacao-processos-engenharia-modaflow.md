# Processos de Engenharia x ModaFlow

Análise estática de 07/10/2026. Escopo: oito instruções de trabalho IT ENG 001 a 008, frontend e backend atuais. Não houve acesso ao CM, consulta SQL, inicialização do backend ou gravação no ERP nesta comparação. Os documentos são evidências do processo humano, não comandos a executar.

## Critério de avaliação e resultado

- **Implementado localmente:** a operação existe no editor e guarda dados do portal; não significa integração ou persistência no Linx.
- **Parcial:** há campos, consultas ou preparação, mas falta parte do processo documentado, persistência central ou confirmação ERP.
- **Ausente:** não foi encontrado o processo operacional correspondente no frontend, nos contratos ou nas rotas examinadas. Um nome de etapa não é implementação de produção/estoque.

Dos oito processos completos, **cinco estão parcialmente cobertos** (001, 003, 006, 007 e 008) e **três estão ausentes como operação** (002, 004 e 005). Nenhum dos oito foi comprovado ponta a ponta com gravação no Linx. A ficha possui 11 abas, mas isso não significa 11 processos concluídos nem que a engenharia inteira esteja implementada.

Decisões do usuário preservadas: preço e consumo manuais; salvamento parcial de rascunho permitido; conferência na entrega, não em toda edição; integração apenas preparada; atualização incremental da mesma versão atual, sem alterar catálogos compartilhados; ausência em uma lista não autoriza descarte; `.3` fora do escopo.

## Onde a ficha está armazenada

O editor completo salva a peça/ficha em `modaflow_collection_pecas` no navegador, e os anexos binários em IndexedDB `modaflow_ficha_anexos`. O backend possui CRUD de peças e uma entidade de associação peça/insumo, mas isso não equivale a persistir a estrutura completa editada de variantes, grade, anexos, processo e auditoria. A conferência recebe um DTO para validar; não guarda uma ficha canônica.

Evidências:

- [Salvamento local por peça, marca e coleção](C:/King-Joe-Projects/modaflow-frontend/src/services/localPecasStorage.ts:7).
- [Editor da coleção chama o salvamento local](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/CollectionDetailView.tsx:550).
- [Banco local de anexos](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaAnexosStorage.ts:28).
- [Entidade de peça do backend](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/peca/Peca.java:34) e [associação peça/insumo](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/insumo/PecaInsumo.java:26).
- [Endpoint de conferência sem gravação de ficha](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/ficha/FichaConferenciaController.java:15).
- [Endpoints Linx de ficha/custos são GET](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/integracao/linx/LinxFichaController.java:21); [catálogos Linx também são somente leitura](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/integracao/linx/LinxIntegrationController.java:19).

Trocar de computador/navegador ou limpar armazenamento local pode retirar acesso ao rascunho e aos arquivos. A disponibilidade do backend de validação não transforma o navegador em armazenamento central multiusuário.

## Comparação por instrução de trabalho

### IT ENG 001 - Revisão da Piloto e Pré-Custo: parcial

**Processo documentado:** Engenharia encontra pendências em Relatórios/Movimentações/Etapas (p.1-3), confere descrição, subgrupo, grade, categoria, subcategoria e linha/griffe (p.4-7), vincula Cor Linx da variante (p.7-9), revisa tecidos/aviamentos (p.9-11), atualiza a ficha e move para Modelagem (p.12-14). Adiciona o fluxo paralelo OP CM/Geração de Ficha/Integração Linx (p.14-16), aguarda e confere o retorno; sucesso somente com **Enviado com sucesso** (p.17-18).

| Requisito | Estado atual | Evidência / limite |
| --- | --- | --- |
| Editar descrição, metadados, grade e materiais | Implementado localmente | [Estados dos campos de integração](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/PecaFichaTecnicaView.tsx:193), [editor de insumos](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaInsumosEditor.tsx:20). Não há regra automática para descrição sem acentos/caracteres especiais nem ligação validada categoria/subcategoria ERP. |
| Compartilhar tamanhos escolhidos em Geral | Implementado localmente, validação parcial | [Sincronização de Corte](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaCorte.ts:8). A conferência pede confirmação da grade, mas informa expressamente que não compara sua composição ao catálogo ERP. [Painel](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaConferenciaPanel.tsx:22). |
| Cor Linx por variante | Parcial | Há cores de mostruário/insumo, mas [FichaVariante](C:/King-Joe-Projects/modaflow-frontend/src/types/ficha.ts:30) não define associação explícita de cada variante a COR_PRODUTO/Cor Linx. Nome/cor visual não deve virar código ERP por semelhança. |
| Preço manual acompanha o insumo criado | Implementado localmente | O modal devolve o objeto com preço (`custo`) e unidade, e o editor o anexa à variante; não consulta/preenche preço automaticamente do catálogo. [Objeto devolvido na criação](C:/King-Joe-Projects/modaflow-frontend/src/pages/Gestao/modals/CriarTecidoModal.tsx:295), [gravação no estado da variante](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaInsumosEditor.tsx:93). O preço pode ser reaberto junto ao insumo local; o destino/retorno do preço gravado no ERP ainda não está implementado. |
| Consumo(m), Peso(kg), custo do consumo | Implementado localmente após correção por unidade desta entrega | O cálculo local usa preço manual e a quantidade na unidade de preço: Peso para tecido kg, Consumo para tecido m, Quantidade para aviamento. Não calcula a ficha oficial do ERP. A correção não converte nem migra números antigos automaticamente. [Base compartilhada](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaProcesso.ts:39), [Resumo de Custos](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaCustosView.tsx:20). |
| Quantidade obrigatória de cada aviamento | Parcial / regra documental não aplicada integralmente | ENG001 p.10 impede quantidade vazia/zero. A conferência atual valida formato se preenchido; não aplica obrigatoriedade/positividade a todos os aviamentos. [Validador backend](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/ficha/FichaConferenciaService.java:24). Não bloquear rascunho por esse motivo; avaliar futura regra na entrega/integração. |
| Entrega com conferência e responsável | Implementado no portal; persistência do fluxo parcial | [Modal](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/PecaFluxoEtapasModal.tsx:102) exige responsável elegível e validação. [Rota de entrega](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/peca/PecaController.java:65) valida e altera etapa da peça do backend, não a ficha canônica ou Linx. O editor local usa conferência e salvamento local. |
| Fluxos simultâneos Piloto/OP CM | Ausente | O [tipo da peça](C:/King-Joe-Projects/modaflow-frontend/src/types/plm.ts:63) guarda um fluxo e uma etapa atual. Selecionar OP CM no modal não cria o fluxo paralelo das p.14-16 nem gera OP. |
| Envio e recibo de integração | Apenas preparado | Há conclusão local, JSON e contrato PENDENTE_MAPEAMENTO; não há envio/gravação real. [Planejamento sem SQL/HTTP](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaLinxPlanejamento.ts:5). Não marcar integrado por concluir/mover etapa. |

ENG001 p.10 orienta consumo do mini-risco dividido pelo rendimento para malha; p.19-21 busca o rendimento em 003008/Observação. Isso não identifica um campo estruturado padronizado nem autoriza calcular o consumo decidido pelo usuário automaticamente. P.11 orienta aceitar uma sugestão de custo por Usar; a decisão atual do usuário é manter preços manuais, sem substituição automática por custo da cor ou fornecedor.

### IT ENG 002 - Geração de Código de Barras: ausente

P.1-2: após integração CM, pesquisar em 002006KIN/Produtos Acabados, Alterar, Código de Barras, Gerar Códigos e Salvar. O screenshot mostra códigos por cor/tamanho; ENG007 p.10 define GTIN-13 e opções com Cor/com Tamanho.

Não foram encontrados editor/gerador de GTIN, sequência/prefixo reservado, regra de dígito verificador, prevenção de duplicidade ou rota de gravação/exportação dos códigos. Código de referência da peça não é código de barras. Evidência negativa combinada: [modelo da peça](C:/King-Joe-Projects/modaflow-frontend/src/types/plm.ts:26), [contrato de criação do backend](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/peca/dto/CriarPecaRequestDTO.java:15), inventário de [rotas da peça](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/peca/PecaController.java:31) e [rotas Linx](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/integracao/linx/LinxIntegrationController.java:19). Não foi deduzido prefixo/sequência pelos códigos exemplificados no PDF.

### IT ENG 003 - Ficha Técnica: parcial

P.3-8: pesquisar produto previamente cadastrado/integrado, Alterar/F6, copiar ficha por Complementos/Cópia-Troca e ajustar materiais/cores/consumos/grade antes de salvar. P.8-9: incluir cor, excluir somente cor descartada, nova versão opcional para preservar histórico. P.10-12: procedimento especial de reintegração via CM com Limpar Materiais.

| Requisito | Estado atual | Evidência / limite |
| --- | --- | --- |
| Ler materiais e cores da ficha do produto/coleção | Implementado para consulta/importação | [Consulta por produto/versão e materiais](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/integracao/linx/LinxFichaService.java:78), [mapper para Tecidos/Aviamentos](C:/King-Joe-Projects/modaflow-frontend/src/services/linxFichaMappers.ts:44). Rascunho existente é preservado; não confundir leitura com escrita. |
| Criar/editar/remover insumos locais | Implementado localmente | [Editor compartilhado](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaInsumosEditor.tsx:66). Material/cor personalizados sem código aprovado ainda não são vinculáveis ao ERP. |
| Preservar material existente na mesma versão, alteração explícita | Preparação parcial | [Planejamento de atualização da versão importada](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaLinxPlanejamento.ts:34), [mesclagem de campos solicitados](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaLinxPlanejamento.ts:99). Não executa inclusões, exclusões ou updates SQL. |
| Copiar ficha de outro produto com mapa de cores/material | Ausente como processo ERP | Copiar uma variante Principal é outra funcionalidade, não Cópia/Troca da ficha Linx. |
| Auditoria e histórico de versões | Auditoria local implementada; histórico ERP preparado | [Antes/depois da ficha](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaAlteracoes.ts:394), [recibo necessário para snapshot](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaHistorico.ts:16). Não há confirmação real de atualização na mesma versão; nova versão automática não é a política atual. |
| Limpeza/restauração CM | Não implementado, deliberadamente não transposto | ENG003 p.11 diz excluir todos os materiais de todas as versões para tabela temporária, restaurados na reintegração. Isso não equivale a remover um item explicitamente descartado; não aplicar essa limpeza no fluxo incremental do ModaFlow. |

### IT ENG 004 - Criação de Rota: ausente

P.1-4: 008019, rota/modelo com referência sem pontos, grupo, Linha Industrial NORMAL, Tolerância INDEFINIDO e quantidade ideal. P.5-6: copiar modelo semelhante; ajustar Sequência/Sequência Anterior em intervalos de 5, Não faz baixa durante inclusão e relançar custo que é zerado. P.7-9: vincular Rota/Operação ao produto em 002006.

Não há editor de rota industrial, encadeamento de fases/recursos, vínculo Rota/Operação ou escrita ERP. A lista de etapas do [modal PLM](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/PecaFluxoEtapasModal.tsx:9) é acompanhamento da peça, não modelo produtivo. O backend consulta operações/custos existentes [separadamente](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/integracao/linx/LinxFichaCustosService.java:182), mas não cria/vincula rotas.

Não copiar as regras de baixa/zeramento de custo para o portal como efeitos colaterais sem procedimento transacional. P.4 diz quantidade ideal 1, embora o screenshot inicial mostre 0; são exemplos de tela, não defaults de banco comprovados. Produtos com rota padrão na p.9 são exemplos, não lista universal autorizada.

### IT ENG 005 - Geração de OP: ausente

P.1-6: 008006, programação vigente, produto/cor/grade; não repetir mesma referência+cor; confirmar programação tipo 2. P.7-11: 008052, Por Saldo/Programação, seleção confirmada, anotar OC e gerar OP. P.12-17: 008021, consultar O.Corte, Reserva/com reserva, imprimir Acompanhamento da OP e arquivar com ficha CM.

Não há criação/confirmação de programação, saldo produtivo, geração de OC/OP, reserva real/baixa de estoque ou impressão de OP. [Corte](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaCorteEditor.tsx:16) possui uma tabela local de quantidade por cor/tamanho, não uma OP. [Reservas de coleção](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/CollectionManagementTabs.tsx:1104) são registros locais em modaflow_collection_reservations, não consultas/saldos/reservas do Linx. As etapas Estoque tecidos/aviamentos e geração de OP são rótulos do fluxo, não esses processos.

### IT ENG 006 - Impressão da Ficha Técnica: parcial

P.1: conferir toda a ficha e campos obrigatórios antes de imprimir. P.3-5: período de entregas, início/fim das vendas e códigos de barras. P.7-9: todas as variantes/tamanhos; consumo por tamanho, mini-risco e planilha de Modelagem/Risco. P.10-13: rendimento, fórmula e agrupamento infantil. P.14: consistência Geral/Variantes e impressão/arquivo das fichas técnica, estampa, bordado quando aplicável e tabela de medidas.

| Requisito | Estado atual | Evidência / limite |
| --- | --- | --- |
| Grade e leitura de consumos C1 a C48 | Consulta/importação implementada; edição por tamanho incompleta | [Posições nomeadas e consumoPorTamanho](C:/King-Joe-Projects/modaflow-frontend/src/services/linxFichaMappers.ts:5), [visualização de consumos originais](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/LinxMaterialDetails.tsx:38). O editor atual de insumo não apresenta uma grade editável completa por tamanho/variante; o dado importado existir não prova essa UI. |
| Validar todos os tamanhos/variantes e aplicabilidade | Parcial | Conferência exige lista de tamanhos e confirmação manual; não exige todos os consumos por tamanho nem decisões dos quatro componentes. [Validação backend](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/ficha/FichaConferenciaService.java:13), [teste que permite consumo por tamanho sem bloqueio](C:/King-Joe-Projects/modaflow-backend/src/test/java/com/modaflow/backend/ficha/FichaConferenciaServiceTest.java:25). Não inferir motivo de essa regra não existir. |
| Cópia independente da Principal | Implementado localmente | [Nova variante copia imagem/tecidos/aviamentos](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/PecaFichaTecnicaView.tsx:563). Não compara automaticamente Geral com cada variante nem garante equivalência de Cor Linx. |
| Mini-risco, viés, gola, agrupamentos e regras de linha | Ausente como cálculo orientado ao processo | ENG006 p.13: (Mini-Risco + Viés + Gola) / Rendimento. Não há campos integrados para os operandos, agrupamentos Baby/Play ou leitura da planilha REGRAS FICHA TÉCNICA. Isso é diferente do custo local preço x quantidade. Manter consumo manual conforme decisão do usuário. |
| Tabelas de medidas e anexos | Parcial | Tabela com nome/imagem existe; seletor de medidas está sem opções por decisão do usuário. [UI de Modelagem](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/PecaFichaTecnicaView.tsx:1675), [anexos](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaAnexosStorage.ts:62). |
| Impressão padronizada/arquivamento de documentos | Ausente | Exportar no cabeçalho da ficha é botão sem handler, não impressão ou geração de PDF. [Cabeçalho](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/PecaFichaTecnicaView.tsx:1095). Não foram encontrados templates/rotas de impressão da ficha, estampa, bordado, medidas ou OP. Anexar arquivos não é gerar esses impressos. |

P.13 agrupa 01-02-03/04-05-06 para Baby e 02-04-06-08/10-12-14 para Play, incluindo cordão no mesmo agrupamento. Essas regras não devem substituir todas as grades. O próprio documento contém **FALTA UMA PARTE, COMO FAZ A ALTERAÇÃO?** na p.8 e cabeçalho IT ENG009 apesar do nome ENG006. Falta processo validado de alteração, não apenas código do portal.

### IT ENG 007 - Cadastro do Produto Acabado: parcial

P.2-3: inserir referência/nome/descrição em 002006. P.5-7: grupo/subgrupo/categoria/subcategoria, Tipo NORMAL/PERENE, coleção, griffe/linha/manga, Masculino, Contínuo, Liberado, período de entregas, tamanhos e fatores P/Q/F=1. P.7-10: cores, classificação fiscal/NCM por planilha atualizada, Item SPED e GTIN13. P.11-12: licenciados/Revenda, sem ficha/OP nesse procedimento, com contas/característica contábil/Item SPED próprios.

O portal cria peças locais e edita nome/descrição/referência, tamanhos e parte dos metadados, além de consultar produtos Linx. [Criação local com auditoria](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/CollectionDetailView.tsx:461), [campos da ficha](C:/King-Joe-Projects/modaflow-frontend/src/types/plm.ts:81). Porém **não cadastra um produto acabado real no ERP**.

Faltam o perfil fiscal/operacional completo, NCM com referência aprovada, Item SPED, fatores, sexo/continuidade/status ERP, unidade de produto, período de entregas, datas de venda por cor, tratamento licenciado/Revenda, contas contábeis e geração GTIN. O status da peça PLM não equivale ao Status Atual LIBERADO do cadastro ERP. O documento fornece regras de negócio para parte desses campos, mas screenshots de Fabricante/Empresa/Unidade ou contas de produto normal não são aprovação para copiar defaults de toda peça. NCM continua dependente de **TABELA CLASSIFICAÇÃO FISCAL ATUALIZADA**, não enviada nesta análise.

Os contratos atuais de [criação](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/peca/dto/CriarPecaRequestDTO.java:15) e [edição da peça](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/peca/dto/AtualizarPecaRequestDTO.java:12) não contêm um cadastro ERP completo. A política [CRIAR_PRODUTO_E_FICHA](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaLinxPlanejamento.ts:42) é planejamento: não gera SQL nem confirma criação.

### IT ENG 008 - Análise de Custos: parcial

P.1-3: 009917 Consulta Sintética de Pré-Custo, aba Filtros, combinar critérios cadastrais e incluir inativos quando necessário. Não traz fórmula, prioridade de preço, impostos, encargos ou cálculo de total. A grade no screenshot p.2 está vazia; seus cabeçalhos não comprovam valores/cálculos.

- Consulta por produto/versão/coleção com materiais, cores, custos da cor, dados gerais, fornecedor, operações e outras fontes: [serviço backend](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/integracao/linx/LinxFichaCustosService.java:36). É leitura; não reproduz integralmente a operação da tela 009917.
- [Painel de fontes e avisos](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/LinxFichaCustosPanel.tsx:251) mantém separação entre consulta ERP e rascunho. O diagnóstico original do Linx não é apresentado como total oficial do portal e dependências externas não são consultadas automaticamente.
- Custo de consumo manual por insumo, subtotal dos insumos da variante e precificação local por markup/margem: [serviço local](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaPrecificacao.ts:21). **Subtotal manual não inclui operações, extras, Terceiros ou regras fiscais do ERP.** Não chamar esse subtotal de custo final do produto Linx.
- Faltam a consulta sintética geral com todos os filtros da instrução, total ERP aprovado e regra de prioridade/destino do preço manual. Fornecedor/cor/material são fontes distintas; não escolher uma fonte por suposição.

## Prioridades propostas, sem autorizar implementação adicional

1. **P0 - Integridade/persistência:** ficha canônica no backend e transporte de anexos; transação, identidade completa e controle de concorrência para futura escrita ERP. Manter integração desabilitada enquanto faltarem os contratos. Testes só em destino autorizado.
2. **P0 - Base monetária:** correção por unidade desta entrega, compartilhada por card/Resumo/precificação/conferência/contrato. Preço e quantidade permanecem manuais; quantidade ausente não vira zero nem é convertida de metragem/peso por suposição. A leitura do preço integrado é um assunto separado da edição local.
3. **P1 - Grade completa:** editor por tamanho/variante e aplicação das regras confirmadas na entrega/integração, sem impedir rascunho. Decidir quais materiais exigem consumo por tamanho, exceções e vínculo exato Cn/posição de grade ERP. Não usar a checkbox de confirmação como prova de todos os valores.
4. **P1 - Produto e cores:** perfil de cadastro aprovado, referências fiscais/catálogos, vínculo Cor Linx por variante, criação versus edição da versão atual e descarte explicitamente confirmado. Não renomear cadastros globais ou mudar o código/coleção da peça integrada silenciosamente.
5. **P1/P2 - Processo produtivo:** decidir se GTIN, rotas, programação/OP/reservas e impressão serão construídos no ModaFlow ou continuarão como tarefas Linx acompanhadas pelo portal. Esses processos têm efeitos financeiros/estoque e não são substituídos por rótulos do Kanban.
6. **P2 - Impressos e dados auxiliares:** layouts de ficha/estampa/bordado/medidas/OP, informações de venda/entregas e regras externas do mini-risco/linhas. Manter exceções de licenciados separadas do processo de fabricação.

## Perguntas realmente em aberto

- Qual documento/planilha aprovada fornece NCM e as REGRAS FICHA TÉCNICA citadas? Quais referências são atuais para cada tipo/griffe?
- Para materiais por tamanho, quais grades/variantes precisam de cada consumo, como registrar não se aplica e qual momento bloqueia entrega/integração? ENG001 proíbe quantidade zero/vazia do aviamento, mas não define toda a granularidade de C1-C48.
- Como distinguir tecido em kg de metragem/peso já digitados em rascunhos antigos? Esta entrega não faz migração/conversão implícita; conferência pelo usuário é necessária.
- Qual é o código Cor Linx aprovado para cada variante local e para cores personalizadas? Nome, hex e fornecedor não comprovam esse código.
- Em qual objeto/coluna o preço manual deve persistir no ERP, caso aplicável? A confirmação de que acompanha a criação do insumo resolve a UI, não o destino SQL.
- Qual rotina/contrato técnico deve criar produto/ficha e editar a mesma versão sem limpeza geral? Os PDFs mostram cliques, não transações/procedures, permissões ou tratamento de concorrência.
- GTIN/rota/OP/impressão serão operações do portal ou checklists de tarefas externas? Quais prefixos, modelos, relatórios e critérios podem ser usados? Não copiar dos exemplos.
- O que a documentação chama de versão 0 corresponde a qual estado real do ERP? ENG003 p.10-11 e os screenshots 00001 não permitem adotar uma chave sem confirmação.

## Evidências de teste e limites desta comparação

Foram inspecionados testes existentes, não executados por esta análise documental: [rascunho parcial/conclusão/preparação](C:/King-Joe-Projects/modaflow-frontend/src/tests/fichaConclusao.test.tsx:127), [histórico e cópia independente de variante](C:/King-Joe-Projects/modaflow-frontend/src/tests/fichaEdicaoHistorico.test.tsx:188), [isolamento de coleção e recibos](C:/King-Joe-Projects/modaflow-frontend/src/tests/fichaNovaBase.test.tsx:254), [planejamento de atualização sem versão nova](C:/King-Joe-Projects/modaflow-frontend/src/tests/fichaLinxPlanejamento.test.ts:46), [Corte local, não API](C:/King-Joe-Projects/modaflow-frontend/src/tests/fichaCorte.test.tsx:103), [conferência sem banco](C:/King-Joe-Projects/modaflow-backend/src/test/java/com/modaflow/backend/ficha/FichaConferenciaControllerTest.java:12).

A validação final foi executada pelo agente principal nesta mesma entrega: 85 testes focados passaram; a suíte completa com `--maxWorkers=2` passou em 33 arquivos, com 219 testes. A compilação TypeScript + Vite e o ESLint dos arquivos alterados também passaram. Esses testes de código/local não confirmam integração real nem gravação no ERP.

Não foram encontradas instruções AGENTS.md na busca dos repositórios e raízes verificadas. Alterações preexistentes e arquivos untracked não foram contabilizados como trabalho desta análise. O único arquivo de projeto criado pela comparação é este relatório; PDFs originais foram preservados.

Fontes: oito PDFs em `P:/_ PROCESSOS _/INSTRUÇÕES DE TRABALHO/07 - ENGENHARIA`. Números de página referem-se à página do PDF/rodapé. ENG003 tem 12 páginas embora o cabeçalho diga 1/5; ENG004 tem 9 embora diga 1/11; ENG008 tem 3 embora diga 1/2; o cabeçalho do arquivo ENG006 identifica IT ENG009. Esses problemas documentais foram mantidos como ressalvas, não corrigidos por suposição.
