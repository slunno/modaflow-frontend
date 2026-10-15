# Rascunho e histórico somente no site

Decisão atualizada pelo usuário em 07/10/2026, posterior à homologação central: os rascunhos e o histórico da peça devem permanecer somente no navegador. As tabelas SQL próprias não são necessárias para esse fluxo.

## Fluxo mantido

- `PecaFichaTecnicaView` salva a peça e seu `historicoAlteracoes` pelo callback local existente; não monta mais o painel de rascunho central.
- Atualização de 08/10/2026: todas as abas salvam automaticamente no navegador, sem botão Salvar rascunho. Veja [cabeçalho e salvamento automático](ficha-cabecalho-autosave.md).
- `CollectionDetailView` mantém as peças locais em `modaflow_collection_pecas` por meio de `savePecaLocal`, `usePersistedState`/`localStateStorage` e localStorage.
- A aba Histórico continua mostrando criação e alterações antes/depois com responsável/data, sem consultar a auditoria SQL.
- Imagens e anexos locais não foram apagados ou migrados. O armazenamento local existente permanece intacto.
- A leitura dos cadastros Linx e as validações existentes são independentes do armazenamento do rascunho; não foram retiradas.

## Experimento central desativado

A antiga flag do frontend não recoloca o painel na ficha. No backend, configuração/pool e controller do experimento central não são registrados, mesmo com a antiga propriedade `enabled=true`. O launcher isolado foi bloqueado antes de ler credenciais/iniciar processos; o helper de migração recusa `-ApplyMigration` antes de conectar. O código e as evidências da homologação anterior foram preservados para rastreabilidade, não como fluxo operacional vigente.

Nesta alteração não houve conexão SQL, DELETE, DROP ou remoção de estruturas. `modaflow.ficha_documento` e `modaflow.ficha_auditoria`, criadas anteriormente no `.6/HOMOLOG_COBRANCA`, continuam fisicamente no banco, sem uso por este fluxo. Sua exclusão exige confirmação separada e conferência do conteúdo/dependências antes de qualquer DROP. `.3` permanece sem acesso.

## Limitação do armazenamento local

Os rascunhos, históricos e arquivos não são compartilhados automaticamente entre computadores/perfis de navegador. Limpar os dados do site pode removê-los. Essa decisão não transforma o navegador em armazenamento central nem confirma uma integração com o Linx.

## Verificação da mudança

136 testes de backend e 264 de frontend aprovados, sem conexão SQL ou inicialização de serviços. A regressão do frontend confere salvar/reabrir conteúdo e histórico locais, preservar a imagem existente e não montar/consultar o painel central mesmo com a flag antiga verdadeira. A regressão do backend confere que configuração, pool, repository, service e controller centrais não são registrados com essa propriedade verdadeira. Os testes JDBC antigos permanecem isolados com mocks para documentar o experimento, não como funcionalidades ativas.

Build de produção frontend e empacotamento backend aprovados; lint direcionado sem warnings. O bundle frontend não contém painel/endpoint de rascunho central. Os helpers bloqueiam explicitamente a aplicação da migração e a inicialização do servidor central antes de ler qualquer credencial (verificado usando um caminho inexistente). Nenhum banco foi consultado para esses testes de bloqueio.
