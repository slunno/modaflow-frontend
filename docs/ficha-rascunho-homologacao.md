# Rascunhos centrais da ficha — homologação proposta

**Plano histórico encerrado:** o usuário definiu posteriormente rascunho e histórico somente no navegador. Não executar a migração ou o launcher deste experimento. Veja a [decisão de armazenamento local](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-local.md); nenhuma tabela foi excluída automaticamente.

Plano preparado em 07/10/2026, preservado como histórico **ANTES da aprovação e execução dos testes reais**. Posteriormente o usuário aprovou a homologação isolada no `.6/HOMOLOG_COBRANCA`: a migração foi aplicada/reaplicada e a gravação, concorrência, auditoria e persistência após reinício foram comprovadas por HTTP e SELECT. O estado atual e os limites estão no [resultado da homologação](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-homologacao-resultado.md).

As expressões “proposta”, “pendente” e “a apresentar para aprovação” deste plano descrevem a preparação original. Não devem ser lidas como negação da execução posteriormente comprovada nem como aprovação de integração ERP, fluxo completo da interface ou ativação do portal normal. Consulta/histórico do painel real foram conferidos no navegador e os serviços temporários foram encerrados. Salvamento via clique, permissões definitivas e limite de produção permanecem pendentes; os resultados atuais são detalhados no relatório vinculado acima.

## Escopo confirmado

- Testes exclusivamente em `192.168.1.6:1433/HOMOLOG_COBRANCA`.
- `.3` sem acesso. `.3/KINGEJOE` é somente o destino futuro informado pelo usuário.
- Estruturas próprias do portal em `modaflow`, separadas das tabelas Linx `dbo`.
- Editar/salvar rascunho não altera Linx, não integra produto e não cria versão ERP.
- Anexos continuam somente no navegador. Nenhum arquivo, imagem em base64 ou URL `blob:` é armazenado no servidor nesta etapa.
- A conexão primária e o leitor Linx existentes não serão redirecionados ou habilitados automaticamente.

## Operações a apresentar para aprovação

1. Identificar a conexão com SELECT: banco atual, endereço/porta TCP do servidor, criptografia e permissões. Interromper se qualquer identificação divergir de `.6/HOMOLOG_COBRANCA`.
2. Aplicar somente a migração aditiva de `modaflow.ficha_documento` e `modaflow.ficha_auditoria`. Verificar previamente estruturas e triggers; não desabilitar regras preexistentes para forçar a aplicação.
3. Ativar temporariamente apenas a persistência de rascunhos, com credenciais próprias e limite textual configurado. O perfil normal que ainda aponta ao `.3` não pode ser iniciado para esse teste.
4. Usar uma ficha sintética, identificada como teste, com usuário autenticado e marca autorizada. Não reutilizar nem editar produto ou coleção reais do Linx.
5. Executar os casos abaixo e conferir documento/auditoria por SELECT. Não executar integração ERP.
6. Desativar a funcionalidade após o teste, preservando evidências. Não remover registros automaticamente; eventual limpeza exige identificar os registros e aprovar a exclusão separadamente.

## Casos de teste reais pendentes

| Caso | Resultado esperado |
| --- | --- |
| Criar rascunho parcial sem anexos | Documento gravado; revisão, autor e horário atribuídos pelo servidor; um evento CRIAR com antes vazio. |
| Editar dois campos e salvar com revisão válida | Mesma identidade; nova revisão de rascunho; evento ATUALIZAR com antes/depois. Não cria versão Linx. |
| Preservar precisão | Preço/consumo digitados como texto, inclusive vírgula e oito casas decimais, permanecem exatamente como enviados. |
| Dois usuários salvando a mesma revisão | Primeiro confirma; segundo recebe conflito 409, sem sobrescrever e sem registrar atualização fictícia. |
| Falha no registro de auditoria | Transação inteira não confirma: não pode existir documento alterado sem evento correspondente. Deve ser provocada somente em teste controlado, sem alterar constraints/triggers de negócio. |
| Identidade de outra marca ou usuário sem vínculo | Acesso negado; nenhuma leitura/gravação daquela marca. |
| Marca/coleção/peça do conteúdo diferentes da rota/tenant | Requisição rejeitada; nenhuma gravação. |
| Arquivo `data:`/`blob:` ou lista de anexos não vazia | Rejeição no servidor; arquivo local continua preservado. |
| Documento maior que o limite configurado | Rejeição clara; não informar sucesso e não atualizar revisão. |
| Consultar histórico com cursor de outra ficha | Rejeição; não misturar coleções/marcas/peças. |
| Consultar histórico com mais de 50 eventos | Navegar por páginas/cursor até os eventos recentes; erros de página preservam eventos já consultados. |
| Frontend habilitado, endpoint backend ausente | 404 genérico é tratado como erro de disponibilidade, não como confirmação de ficha inexistente. |
| Feature flag desativada no frontend/backend | Sem painel/requisições de rascunho no frontend; sem endpoint/pool dedicado ativo no backend. |
| Conferir ERP antes/depois | Nenhuma operação em tabelas Linx. O executor de rascunho possui somente SQL fixo para as duas tabelas próprias. |

Testes offline com mocks não substituem estes casos em SQL Server. Iniciar e validar o fluxo completo depende da aprovação do teste e de uma configuração de autenticação que não acesse o `.3`.

## Decisões ainda necessárias

- Aprovar aplicação da migração e ficha/usuários de teste, sem reaproveitar dados de produção.
- Confirmar a matriz de permissões de leitura/edição por setor/perfil. O código preparado usa autenticação e vínculo à marca existentes; isso não representa aprovação da matriz definitiva.
- Definir o limite de tamanho do documento textual na configuração de ativação. Os limites de arquivos continuam locais e não substituem esse limite.
- Validar em homologação se a estrutura separada deverá ser adotada no destino futuro de produção. Não existe migração ou acesso ao `.3` preparado para execução automática.

## Próximas etapas, distintas deste teste

Consumo obrigatório por tamanho, exceções na entrega, destino ERP do preço manual, mapeamento de grade/cor/variante, cadastro fiscal de produto, gravação incremental no Linx, recibos de integração e impressão ainda exigem suas próprias validações. Centralizar rascunhos não resolve nem presume essas regras.
