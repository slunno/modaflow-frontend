# Finalização da ficha técnica — execução

**Decisão vigente, posterior à homologação de 07/10/2026:** rascunho e histórico somente no navegador. O painel central foi retirado da ficha e sua ativação no backend foi bloqueada. A exclusão das tabelas já criadas no `.6` aguarda confirmação; nesta correção não houve acesso SQL. Veja [armazenamento local](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-local.md). O relato de homologação abaixo é histórico, não a arquitetura atual.

Início: 07/10/2026. Este registro acompanha a execução do prompt aprovado pelo usuário. Após a preparação inicial, o usuário aprovou a aplicação das estruturas próprias e os testes reais de rascunho no `.6/HOMOLOG_COBRANCA`. A migração, gravação HTTP, concorrência, auditoria e persistência após reinício foram comprovadas somente no perfil isolado de teste, conforme o [resultado da homologação](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-homologacao-resultado.md). Não é uma declaração de integração ERP, ativação do portal normal ou conclusão de todas as etapas.

## Limites vigentes

- Na preparação inicial, não houve início de serviços ou conexão SQL. Na homologação posteriormente aprovada, foram iniciados apenas backend e interface isolados de teste, com acesso SQL a `.6/HOMOLOG_COBRANCA` via TCP/TLS. Os serviços temporários foram encerrados ao final; os serviços normais foram preservados.
- `.3` permanece sem acesso, conforme confirmação explícita posterior do usuário. A indicação de destinos futuros não foi tratada como autorização para conectar ou executar DDL/DML.
- A migração de `modaflow.ficha_documento` e `modaflow.ficha_auditoria` foi aplicada e reaplicada anteriormente no `.6`. Após a decisão de armazenamento somente local, o experimento central foi desativado no código, não podendo ser reativado pela flag anterior. As tabelas não foram excluídas nesta correção.
- `KINGEJOE`, catálogos Linx e alterações preexistentes do projeto são preservados.
- Contratos e testes offline, isoladamente, não comprovam persistência central ou gravação ERP. A persistência de rascunho tem agora comprovação real limitada à homologação isolada; consulta e histórico do painel real foram conferidos no navegador, sem gravar via clique nem substituir o conteúdo local. O Linx permaneceu desabilitado.
- Arquivos continuam somente no navegador. Permissões definitivas e limite textual de produção continuam pendentes; os valores técnicos do teste não definem regras de negócio.

## Respostas recebidas — preparação ANTES da aprovação dos testes reais

Esta seção preserva o histórico das respostas e da preparação. As afirmações de ausência de execução abaixo referem-se àquela etapa, não substituem o resultado posterior da homologação.

### Banco

O usuário indicou `.3/KINGEJOE` como destino futuro de produção, e pediu preparação de gravação para `.6/HOMOLOG_COBRANCA` e `.3/HOMOLOGACAO_COBRANCA`. Na confirmação posterior escolheu: preparar e apresentar para aprovação os testes de gravação no `.6/HOMOLOG_COBRANCA`; `.3` continua sem acesso. Não houve alteração de conexão ativa nem escrita.

Na resposta seguinte, o usuário confirmou que `.6` serve apenas para testes/configuração e que a produção futura será `.3/KINGEJOE`. A preparação usa o schema próprio `modaflow`, sem reutilizar tabelas `dbo` do ERP, sem alterar a conexão principal e sem acesso ao `.3`. A aplicação da migração e os dados de teste ainda serão apresentados para aprovação; a configuração não implica execução automática.

### Consulta e importação

Regra confirmada: “Está no Linx, apresenta no site”. Isso define leitura/importação do ERP. Não foi interpretado como autorização para migrar ou apagar fichas/anexos digitados no navegador. Esses dados continuam preservados.

### Anexos

O usuário escolheu manter os arquivos somente no navegador por enquanto, ciente de que não estarão disponíveis em outros computadores. Não será criado armazenamento de arquivos no servidor ou no Linx. Os anexos existentes continuam no IndexedDB/localmente, com os limites atuais de 10 MB por imagem e 100 MB por arquivo.

A gravação central preparada é apenas do conteúdo textual/estruturado do rascunho. URLs `data:` e `blob:` não são binários persistidos no servidor e não serão enviadas como tal. Os arquivos locais não serão apagados nem automaticamente enviados; carregar dados centrais não pode substituí-los silenciosamente.

### Rascunhos e integração

Alterações no ModaFlow permanecem em rascunho até uma integração explícita. Salvar localmente ou no futuro repositório de rascunhos não atualiza Linx, não cria versão ERP e não gera recibo de integração. A leitura de dados Linx continua distinta da gravação de dados próprios do portal.

## Situação por item

| Item | Estado observado / trabalho desta execução | Dependência para concluir |
| --- | --- | --- |
| 1 — Persistência | Conforme decisão atualizada: rascunho, histórico e anexos somente no navegador. Painel central retirado; configuração/pool/API centrais bloqueados. Dados locais preservados, sem migração ou exclusão SQL nesta correção. | Eventual exclusão das duas tabelas do experimento no `.6` exige confirmação separada e conferência prévia. Não é requisito do fluxo local. |
| 2 — Grade | Editor manual e consumo por tamanho por variante, com preservação dos valores fora da grade. Consulta das 48 posições reais Linx e comparação explícita implementadas; não atribui Cn pela ordem de seleção do portal. | Releitura/validação no adaptador transacional futuro; divergência entre NUMERO_TAMANHOS e posições nomeadas não foi interpretada como regra de negócio. |
| 3 — Conferência | Aplicabilidade explícita por variante para zíper, etiqueta, elástico e entretela; somente elástico exige consumo por tamanho e confirmação nominal do zero. Front/back conferem antes da entrega, mantendo rascunho parcial livre. Veja [conferência](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-conferencia-entrega.md). | Matriz definitiva de permissões por cargo ainda não definida; declarações/histórico locais não são prova inviolável de autoria. |
| 4 — Mapeamento | Consulta de grade e vínculos COR_PRODUTO/COR separados, seleção explícita por variante e projeção local com pendências implementadas. Veja [mapeamento](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-mapeamento-grade-cor.md). | Geração de COR_PRODUTO para produto novo, associação material/cor por item, campos personalizados, Modelagem, destino do preço manual e perfil fiscal/operacional. |
| 5 — Gravação | Planejamento incremental existente; não há gravador ativo. Perfil de leitura `homolog6` preparado, desligado por padrão, com guarda local antes do pool. Não altera o DataSource primário. | Contrato de criação/edição, código repetido em outra coleção, transação, concorrência e homologação autorizada. |
| 6 — Preço | Preço manual permanece no insumo/variante; cálculo local por unidade já corrigido. | Destino ERP por item ainda não comprovado; não sobrescrever custos globais para contornar. |
| 7 — Recibos | Preparação local existente não confirma envio. Mesmo número de versão é deduplicado no helper antigo, inadequado para registrar cada atualização da versão atual. | Ledger central e confirmação do snapshot/revisão realmente enviados após releitura do ERP. |
| 8 — Impressão | Exportar da ficha ainda não executa impressão padronizada. | Modelo aprovado, conteúdo e definições de campos anteriormente adiados. |
| 9 — Complementares | GTIN, rotas e OP/reservas não possuem operação completa no portal. | Decidir execução no ModaFlow ou acompanhamento de execução no Linx. |

## Cuidados encontrados no código

- Perfil `dev`: H2 em memória e `ddl-auto: update`, não armazenamento durável para a equipe.
- Perfil `sqlserver`: configuração por variáveis e `ddl-auto: none`. Não trocar para `update` contra o ERP.
- `.env.local` ainda configura leitura Linx no `.3`; não deve ser usado para iniciar serviços desta execução.
- Cliente atual valida nome de banco depois de conectar. O perfil opt-in de homologação precisa validar host, porta, banco e criptografia antes do pool.
- IDs locais são strings/UUIDs e IDs Linx são opacos; não converter para Long nem usar apenas código de referência para identificar a ficha.
- O armazenamento de preço/consumo existente em `PecaInsumo` não cobre a ficha/variantes e usa precisões diferentes; não reutilizá-lo como substituto integral sem análise.
- Versão de ficha, auditoria antes/depois e ledger de operações de integração são registros distintos.

## Evidências e verificação

Atualização da etapa de mapeamento: SELECT de metadados/amostras somente no `.6/HOMOLOG_COBRANCA`, conexão TCP/TLS confirmada. Nenhuma escrita SQL ou acesso ao `.3`. Frontend 38 arquivos/300 testes, backend 149 testes, build e lint dos arquivos envolvidos aprovados; não houve teste de integração/gravação ERP. Os números abaixo registram etapas anteriores.

Resultado posterior à aprovação: [homologação real de rascunhos](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-homologacao-resultado.md). Backend: 135 testes; frontend: 263 testes aprovados nesta execução pela raiz. Os registros abaixo são preservados como histórico de preparação e verificação offline anterior.

Referências: [comparação dos processos](C:/King-Joe-Projects/modaflow-frontend/docs/comparacao-processos-engenharia-modaflow.md), [criação/edição incremental](C:/King-Joe-Projects/modaflow-frontend/docs/linx-criacao-edicao-ficha.md) e [destino do preço](C:/King-Joe-Projects/modaflow-frontend/docs/linx-preco-manual-mapeamento.md).

Verificações da etapa inicial (antes da preparação de rascunhos centrais):

- Frontend completo: 34 arquivos / 229 testes aprovados (`--maxWorkers=2`), incluindo 10 novos casos de consumo por tamanho. Executado com `VITE_API_BASE_URL=offline-test://modaflow.invalid/api/v1`, impedindo HTTP real nos testes que não mockam a API. Não iniciou Vite ou backend.
- TypeScript + build Vite aprovados; ESLint dos seis arquivos envolvidos na UI aprovado.
- Backend completo: 105 testes aprovados via Maven offline, com integração desligada por propriedade e importação de configuração externa desabilitada na execução. Testes usam mocks/contratos, sem contexto de aplicação ou conexão SQL real.
- Desses testes backend, 12 cobrem contratos de persistência e 46 a guarda de homologação. Compilação Java aprovada.
- Não houve validação ponta a ponta com persistência central ou envio ERP. Nenhum resultado destes testes é recibo de integração.

### Arquivos desta implementação

- [Editor por tamanho](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaConsumoTamanhosEditor.tsx) e [helper imutável](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaConsumoTamanhos.ts), integrados ao card/editor de insumos e à grade de Geral.
- [Contratos e portas de persistência](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/ficha/persistence/FichaPersistenceContracts.java): não são uma persistência ativa e não selecionam banco/schema ou arquivos.
- [Perfil homolog6 opt-in](C:/King-Joe-Projects/modaflow-backend/src/main/resources/application-homolog6.yml) e [guarda offline](C:/King-Joe-Projects/modaflow-backend/src/main/java/com/modaflow/backend/integracao/linx/config/LinxHomologConnectionValidator.java), integrados ao cliente de leitura com banco esperado por instância. Variáveis próprias, sem fallback às credenciais/URL normal.

### Preparação de rascunhos centrais — ANTES da aprovação da aplicação e dos testes reais

- [API e isolamento do backend](C:/King-Joe-Projects/modaflow-backend/docs/ficha-rascunho-persistencia.md): GET/PUT de documento e consulta de histórico, com autenticação e vínculo à marca. Identidade composta por marca/coleção/peça; autor e horário obtidos no servidor. Atualização exige revisão anterior, e documento/auditoria são gravados na mesma transação.
- [Migração preparada](C:/King-Joe-Projects/modaflow-backend/db/migrations/001-modaflow-ficha-rascunhos.sql) e [cuidados de aplicação](C:/King-Joe-Projects/modaflow-backend/db/README.md): somente duas tabelas próprias, sem alterações em tabelas Linx, sem DDL automático. O script exige destino `.6/HOMOLOG_COBRANCA`, TCP/TLS e metadata compatível; não foi executado.
- [Executor preparado](C:/King-Joe-Projects/modaflow-backend/tools/Invoke-ModaflowFichaMigration.ps1): usa credencial Windows protegida, sem desembrulhar a senha; por padrão faz somente identificação via SELECT. O switch de aplicação não foi utilizado. Sua sintaxe foi verificada sem executar o script.
- [Cliente do frontend](C:/King-Joe-Projects/modaflow-frontend/src/services/fichaRascunhoServidor.ts) e [painel opcional](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaRascunhoServidorPanel.tsx): não aparecem nem fazem requisições sem a flag explícita `VITE_FICHA_SERVER_DRAFT_ENABLED=true`. Consulta, confirmação e gravação são ações separadas. Conflito nunca reaplica automaticamente o conteúdo.
- A projeção central retira mídias somente de campos conhecidos, preservando a ficha local, IDs e metadados; mídia em campo inesperado é rejeitada, não apagada silenciosamente. Não há upload de anexos nem aplicação automática do snapshot central sobre o formulário local. O botão local de salvar permaneceu intacto.
- [Plano de testes reais para aprovação](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-homologacao.md): escopo, operações, casos de teste e limitações. Não é recibo de gravação.

O perfil de rascunho usa um pool dedicado e não publica um bean DataSource primário. Sua configuração permite somente o `.6` antes de abrir o pool e confere novamente o alvo na mesma conexão/transação usada para operar. Isso não retira as permissões reais da credencial; a matriz definitiva de cargos ainda precisa ser validada.

A revisão adicional alinhou a detecção de mídias locais com espaços Unicode, adicionou paginação por cursor no histórico e distinguiu ficha inexistente (`DRAFT_NOT_FOUND`) de endpoint indisponível: uma rota 404 genérica não confirma que o rascunho pode ser criado. A checagem do alvo SQL exige TLS também no batch da migração.

Verificação final desta preparação, ANTES da homologação real:

- Frontend: 36 arquivos / 263 testes aprovados, com API de teste isolada de qualquer HTTP real; TypeScript, build Vite e ESLint dos cinco arquivos envolvidos aprovados. A variável de API isolada foi restaurada antes do build, não incorporada ao artefato final.
- Backend: 133 testes aprovados via Maven offline com Linx desabilitado e importação de configuração externa desabilitada. São 28 novos testes de configuração, controller, validator e repositório, além dos 105 já existentes.
- O executor PowerShell passou na análise de sintaxe; não foi invocado. Migração SQL revisada estaticamente, sem comprovação de compilação/aplicação em SQL Server.
- Nenhum serviço foi iniciado, nenhum SQL foi executado, nenhuma migração aplicada e nenhuma configuração de produção alterada. Persistência real e fluxo ponta a ponta ainda dependem da aprovação dos testes descritos no plano.

**Não iniciar o perfil normal do backend nesta etapa.** A configuração normal e `.env.local` permanecem intactas; a guarda nova limita apenas o modo `homolog6-only`. Não retira permissões reais da credencial, não habilita escrita e não audita dependências SQL indiretas.

A guarda deliberadamente aceita uma sintaxe JDBC reduzida e rejeita aliases, propriedades duplicadas e redirecionamentos. O driver possui regras de precedência para essas propriedades; a restrição evita interpretar uma URL ambígua ([documentação Microsoft](https://learn.microsoft.com/en-us/sql/connect/jdbc/setting-the-connection-properties?view=sql-server-ver17)).
