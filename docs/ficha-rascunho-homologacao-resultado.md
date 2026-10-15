# Rascunhos centrais da ficha — resultado da homologação

**Registro histórico:** depois destes testes, o usuário definiu rascunho e histórico somente no site/navegador. O experimento central foi desativado no código e não integra mais o fluxo da ficha. As tabelas do `.6` ainda não foram excluídas. A decisão vigente está em [armazenamento local](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-local.md).

Data: 07/10/2026. Este registro documenta os testes reais executados após a aprovação do usuário. A persistência do rascunho foi comprovada por HTTP e SELECT em `.6/HOMOLOG_COBRANCA`, inclusive após reiniciar o backend isolado. A consulta do painel real também foi verificada no navegador. Não é recibo de integração Linx, validação de todos os menus da ficha nem ativação do portal normal.

O [plano de homologação](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-homologacao.md) mantém o histórico de preparação anterior à aprovação. O [registro de execução](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-tecnica-execucao.md) distingue essa preparação do estado atual.

## Ambiente efetivamente usado

| Identificação | Evidência informada pela execução da raiz |
| --- | --- |
| SQL Server | `192.168.1.6:1433`, nome interno `srv-sql-dev` |
| Banco atual | `HOMOLOG_COBRANCA` |
| Transporte e criptografia | TCP, TLS ativo (`encrypt_option = TRUE`) |
| Permissão efetiva usada na homologação | `sysadmin = 1`; não representa a permissão definitiva recomendada para o aplicativo |
| Backend de teste | API em `http://127.0.0.1:18081/api/v1`, perfil isolado de homologação |
| Autenticação | Fixture do seeder dev Juliano, usuário `2`, marca autorizada `1` — King & Joe; não é usuário de produção |
| Integração Linx | Desabilitada no perfil usado |
| Ambiente `.3` | Não acessado |
| Configuração normal | `.env` e configuração normal do projeto preservados; não se ativou persistência central no portal normal |

A autenticação do teste usa H2 local exclusivo, enquanto os rascunhos usam o pool dedicado do SQL Server `.6`. Esses armazenamentos não devem ser confundidos. A conexão primária normal e o leitor Linx não foram redirecionados para executar os testes.

## Migração aplicada e reaplicada

No preflight, o schema `modaflow` ainda não existia e a consulta de triggers DDL habilitados retornou zero. Foi aplicada apenas a [migração das estruturas próprias](C:/King-Joe-Projects/modaflow-backend/db/migrations/001-modaflow-ficha-rascunhos.sql), e a reaplicação confirmou seu comportamento idempotente.

SHA-256 da versão aplicada:

`B3F15F9BB175189A037D52BD47D3B30BC73B5ADAB7E4EEA141C3BF14BD66B715`

Estruturas conferidas no SQL Server:

- `modaflow.ficha_documento`: 13 colunas, identidade composta por marca/coleção/peça e revisão do rascunho.
- `modaflow.ficha_auditoria`: 8 colunas, eventos de criação/atualização e snapshots antes/depois.
- Sete constraints CHECK habilitadas e confiáveis (`trusted`) no conjunto das duas tabelas.

As estruturas são próprias do ModaFlow, não tabelas `dbo` do ERP. O fluxo testado não executou integração nem gravação de produto/material/cor no Linx. Guardas de destino, TLS, metadata, triggers e transação permaneceram em vigor; não se desabilitou uma regra para forçar a migração. Os relatos anteriores de preparação, bloqueios e correções continuam históricos, não foram apagados por este resultado.

## Teste HTTP com o cliente real

O [driver isolado](C:/King-Joe-Projects/modaflow-frontend/tests/rascunho-servidor-homolog.e2e.mjs) utiliza as fontes TS reais do cliente, compiladas somente em memória. A URL de teste e a flag opt-in são injetadas nessa execução, sem modificar `.env`. A allowlist permite apenas autenticação e o rascunho sintético identificado pelos prefixos `mf-homolog-peca-` e `mf-homolog-colecao-`.

A ficha de teste se chama **“Teste de homologação de rascunho — não integrado”**. Seus preços, pesos, quantidades e consumos foram definidos como texto manual com oito casas decimais. A grade e os metadados são fixtures de preservação estrutural, não uma regra de consumo nem um mapeamento C1–C48 do ERP.

| Verificação real | Resultado |
| --- | --- |
| GET/PUT sem autenticação | HTTP `403`, conforme o comportamento de segurança existente. Não houve leitura de conteúdo nem gravação autorizada por essas requisições. Não se afirma retorno `401`. |
| GET/PUT com marca não autorizada | HTTP `403` |
| Criação de rascunho com revisão esperada nula | Documento confirmado e evento `CRIAR` com `antes = null` |
| Duas atualizações concorrentes, mesmo documento e mesma revisão esperada | Exatamente uma resposta `200` e uma `409`; venceu o conteúdo B |
| Reenvio com revisão antiga | HTTP `409`, sem sobrescrever o vencedor |
| Identidade do conteúdo diferente da rota/tenant | HTTP `400` |
| URI binária inesperada no conteúdo | HTTP `400` |
| Lista de anexos não vazia | HTTP `400` |
| Conteúdo maior que 1 MiB | HTTP `413`; 1 MiB é limite técnico deste perfil de teste, não decisão de negócio para produção |
| Cursor de histórico UUID inexistente | HTTP `400` |
| `limit=0` no histórico | HTTP `400` |
| GET e histórico após conflitos/rejeições | Snapshot do vencedor preservado; exatamente dois eventos, sem evento fictício dos pedidos rejeitados |
| Projeção de mídias | Bytes/URIs locais retirados apenas da cópia enviada em campos conhecidos; IDs, nomes e metadados preservados; fixture local não alterada |

O teste concorrente usou duas requisições do mesmo usuário autenticado. Ele comprova concorrência de revisão e não uma matriz de autorização entre dois perfis/setores diferentes.

## Conferência por SELECT

A consulta de conferência retornou um documento e dois eventos para a identidade sintética do teste: marca `1`, coleção `mf-homolog-colecao-20261007t1535` e peça `mf-homolog-peca-20261007t1535`.

- Revisão atual: `e30fb892-9a42-4415-84c2-5767a0cfb7b5`.
- Evento de criação: `626db59a-82e5-48ec-ba96-0d50d3ec158f`.
- Evento de atualização: `1d5b47f9-6e3f-47b8-87d0-16fc5b6f0a0f`.
- Criação UTC: `2026-10-07T15:35:40.4481580Z`.
- Atualização UTC: `2026-10-07T15:35:40.8195510Z`.
- Autor autenticado: usuário dev `2`, marca `1`.

| Campo do conteúdo JSON | Valor confirmado no documento |
| --- | --- |
| `fichaTecnica.variantes[0].tecidos[0].custo` | `14,22222222` |
| `fichaTecnica.variantes[0].tecidos[0].consumo` | `1,50000000` |
| `fichaTecnica.variantes[0].tecidos[0].peso` | `0,42000002` |
| `fichaTecnica.variantes[0].aviamentos[0].custo` | `0,36710000` |
| `fichaTecnica.variantes[0].aviamentos[0].quantidade` | `2,00000001` |
| Lista de anexos do servidor | Zero itens |
| URIs `data:`/`blob:` no conteúdo persistido | Zero |

Esses resultados demonstram preservação dos valores digitados, não cálculo de custo oficial do ERP. O preço manual permanece vinculado ao insumo/variante no documento próprio; o destino de gravação desse preço no Linx ainda não foi comprovado.

## Persistência após reinício

O processo de backend foi reiniciado, passando do PID `43276` para `13804`. Foi realizado novo login e executado o modo `verify` do driver, que permite leituras e proíbe PUT. A releitura HTTP e o SELECT posterior retornaram o mesmo snapshot, a mesma revisão e os mesmos dois eventos.

Isso comprova persistência do rascunho e da auditoria no SQL Server após reinício do backend de teste. Não foi reaplicado o conteúdo local para obter esse resultado.

## Conferência do painel no navegador

A página [isolada de teste](C:/King-Joe-Projects/modaflow-frontend/tests/homolog6-ui.html) reutilizou o componente real `FichaRascunhoServidorPanel`, com API em `127.0.0.1:18081` e interface em `localhost:5174`. Não carregou o App principal nem seu proxy/configuração normal. As requisições foram limitadas ao login local e à identidade sintética acima.

- Autenticação da fixture local Juliano, marca King & Joe `1`.
- Antes da consulta, o botão de salvar no servidor estava desabilitado.
- O nome em memória foi alterado para “Rascunho local preservado — teste visual”. Consultar o servidor manteve esse nome, sem hidratação automática do formulário.
- O painel exibiu a revisão `e30fb892-9a42-4415-84c2-5767a0cfb7b5`, autor Juliano e horário UTC da atualização confirmada.
- “Consultar histórico central” exibiu exatamente os dois eventos CRIAR/ATUALIZAR, autor/data e “Não há mais eventos nesta consulta”.
- Nenhum checkbox de autorização/substituição foi marcado e nenhum PUT foi executado pela interface. A gravação real foi testada pelo driver que usa os serviços TS reais, não por um clique de salvar no navegador.
- A sessão local foi encerrada e somente a aba temporária criada para o teste foi fechada.

![Painel real consultando revisão e dois eventos de histórico](C:/King-Joe-Projects/modaflow-frontend/docs/ficha-rascunho-homologacao-painel-20261007.jpg)

## Verificações automatizadas e limites

- Backend: 135 testes aprovados, zero falhas/erros, inclusive na repetição final offline.
- Frontend: 36 arquivos / 263 testes aprovados, inclusive na repetição final com API offline para impedir conexões reais.
- Build de produção do frontend aprovado. Harness isolado aprovado em TypeScript estrito com verificação de variáveis/parâmetros não utilizados; lint direcionado e parsing dos três helpers PowerShell verificados.
- A execução real HTTP/SQL descrita acima é evidência adicional; testes offline/mocks não foram tratados como substitutos dessa execução.
- Falha provocada na gravação da auditoria e rollback correspondente: cobertura unitária apenas. Não se alteraram permissões ou triggers do SQL para provocar essa falha; este relatório não afirma rollback real testado por injeção de falha.
- Interface isolada: consultas do painel real verificadas conforme a seção anterior. Não há declaração de salvamento via clique, upload real ou funcionamento de todos os processos da ficha técnica.
- Anexos continuam somente no navegador. Metadados no documento central não tornam os arquivos disponíveis em outro computador.
- Nenhuma integração ERP, criação de versão Linx, cadastro de produto, edição de catálogo global, impressão ou recibo de integração foi testado.
- Matriz definitiva de permissões e credencial de menor privilégio ainda pendentes; as guardas do aplicativo não reduzem a permissão `sysadmin` observada.
- Limite textual para produção ainda pendente. O teste com 1 MiB não define esse requisito.
- Serviços temporários encerrados ao final: backend isolado PID `13804`, após conferir PID/starttime/executável/command line registrados, e Vite de teste via sua própria sessão. As portas `18081` e `5174` deixaram de ter listeners. Os listeners normais `8080`/PID `44908` e `5173`/PID `34460` foram preservados, sem conexão aos serviços normais nesta homologação.
- Registros sintéticos são preservados. Eventual exclusão precisa de identificação e autorização separadas; não houve limpeza automática dos dados para ocultar o resultado.

## Próxima etapa

A próxima etapa é a conferência de entrega da etapa 1 para a etapa 2. Ela exige validar aplicabilidade, campos obrigatórios, consumo por tamanho, exceções e quem pode autorizar “não se aplica”. Salvar rascunho parcial continua permitido. A persistência agora comprovada não autoriza presumir essas regras nem implementar integração Linx sem seu contrato próprio.
