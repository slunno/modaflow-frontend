# AKR BRANDS — atualização local de 13/10/2026

## Resultado

O portal mantém a ficha técnica e os editores especializados e passa a compartilhar os registros operacionais pela API. Coleções, modelos, cadastros, Kanban, dashboard e BI usam a mesma origem de dados. A navegação final restaura a composição anterior escolhida pelo usuário: **AKR à esquerda, Relatórios/Gestão/Kanban centralizados e conta à direita**, em uma única faixa compacta. Coleções e peças ficam acessíveis pelo menu Relatórios; a marca também abre Coleções. Marca, coleção e busca permanecem disponíveis em um menu auxiliar, inclusive em telas pequenas. Tema claro e escuro preservados.

O menu de Gestão foi refinado novamente após a revisão do usuário: uma lista compacta de categorias substitui o painel de três colunas. Cadastros, Operação e Administração abrem submenus com os respectivos destinos; Acervo anterior mantém acesso direto. No celular, as categorias expandem dentro do menu. Setas, Escape e restauração de foco são tratados por nível.

O pedido final de “subir” foi esclarecido como atualização local e commit. Não foi solicitado deploy nem push. As consultas à Vercel foram somente de leitura; nenhum deployment ou configuração foi alterado.

## Páginas e cadastros

- Coleções: criação, edição, busca, cards/tabela, modelos vinculados, unidades válidas, distribuição por etapa, pendências e custo previsto.
- Modelos: criação com coleção, busca, filtros, paginação, exportação e abertura da ficha com contexto.
- Ficha: identificação, variantes, materiais, consumos, modelagem, medidas, corte, terceiros/processos, custos, precificação, provas, arquivos, histórico e cronograma.
- Cadastros compartilhados: custos fixos, regras de precificação, tipos de peça, tags, fluxos/etapas, campos customizados, características/medidas e times.
- Fluxos: etapas ordenadas, início/fim, prazo por etapa e critérios de avanço. A ficha e o Kanban usam a configuração cadastrada.
- Marcas, usuários, tecidos e aviamentos mantêm seus cadastros e consultas existentes. Fornecedores não foi incluído no menu nem na nova implementação.
- Catálogo Linx continua disponível em Relatórios, em modo consulta. Gestão → Acervo anterior mantém os registros e recursos locais anteriores.

## Persistência e proteção das alterações

`/api/v1/workspace` mantém documentos, revisões, eventos e anexos por marca, com autenticação e autorização por usuário. Atualizações exigem a revisão atual; conflito retorna HTTP 409 e não sobrescreve o registro silenciosamente. A chave de origem impede cópias duplicadas de itens importados. Os vínculos e campos tipados são validados no servidor. Arquivamento preserva referências históricas.

A base operacional é independente do catálogo Linx e do datasource de autenticação. O padrão é H2 em arquivo, em `modaflow-backend/data/akr-workspace.mv.db`; a propriedade `modaflow.workspace.url` permite apontar para outro arquivo H2. O diretório precisa ser persistente e fazer parte do backup do servidor. A implementação atual é para uma instância do backend; não foi configurado um cluster nem migração para outro motor de banco.

Os binários novos são enviados à API; anexos locais antigos continuam disponíveis para cópia explícita. Limites atuais: 12 MB por documento JSON e 100 MB por arquivo. Fotografias embutidas em JSON contam para o limite do documento. Os arquivos de banco e variáveis locais ficam fora do Git.

Os dados que existiam apenas no navegador não são automaticamente tratados como compartilhados. As ações de importação/cópia preservam os originais. Cadastros de times locais podem ser copiados para a marca escolhida. Recursos antigos acessados pelo Acervo anterior conservam sua persistência anterior até serem copiados para a área compartilhada.

## Cálculos e indicadores

| Medida              | Regra e origem                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Modelos             | Identificadores distintos dos produtos operacionais do recorte, antes da paginação.                                                        |
| Variantes           | Variantes cadastradas nas fichas dos modelos filtrados.                                                                                    |
| Unidades planejadas | Quantidades válidas informadas por variante; ausência não vira uma unidade fictícia.                                                       |
| Em desenvolvimento  | Modelos que não estão concluídos nem cancelados.                                                                                           |
| Concluídos          | Status PLM de conclusão; o avanço à etapa final configurada conclui o desenvolvimento.                                                     |
| Atrasados           | Modelos ativos com prazo planejado anterior à data atual em São Paulo. Sem prazo e concluídos não entram.                                  |
| Custos              | Preço do material × consumo, processos/serviços e rateios por base de unidades. Cálculo central compartilhado entre ficha e indicadores.   |
| Lote previsto       | Custo unitário válido × quantidade válida da variante; totais parciais têm sua cobertura informada.                                        |
| Preço               | Markup ou margem-alvo conforme regra vigente e prioritária aplicada; preço aprovado e justificativa separados. Não representa faturamento. |
| Histórico           | Eventos efetivamente gravados no servidor; não são reconstruídos a partir do estado atual.                                                 |
| Permanência         | Intervalos com entrada e saída observadas da etapa; sem ambas não há duração afirmada.                                                     |

Filtros são combinados e preservados nos detalhamentos compatíveis. O período dos indicadores atuais se refere ao prazo planejado; nas métricas históricas, à data do evento indicada na tela. Agrupamentos por tags contam um modelo uma vez em cada grupo; a soma dos grupos não é apresentada como total distinto. Booleano `false` é um valor válido de campo customizado. Gráficos oferecem tabela, exportação e acesso aos registros de origem.

Alterações de catálogo não reescrevem os valores históricos da ficha. Rateios e regras são aplicados explicitamente com referência à revisão. Sem quantidades não é inventada uma média ponderada. Valores incompletos continuam pendentes; zero informado é mantido como zero.

## Validação executada

Ambiente isolado: frontend `localhost:5174`, API `127.0.0.1:18080`, banco H2 separado e Linx desabilitado. O banner identifica os dados de teste. O sistema normal continua em `localhost:5173` com backend `localhost:8080`; a nova API também respondeu nesse backend.

- **466 testes de frontend passaram**, com dois workers e timeout de 15 segundos para acomodar os testes de integração da ficha neste computador. Relatório: `akr-vitest-results.json`.
- **170 testes de backend passaram**, sem falhas ou testes ignorados, no `mvn package`.
- TypeScript e build de produção passaram. ESLint do projeto: zero erros; permanece um aviso de dependência de hook em `AuthContext.tsx`.
- API: persistência confirmada, conflito 409, isolamento entre marcas com 404, gravação/leitura idêntica de arquivo e proteção contra duplicação. Evidência: `akr-api-validation.json` e `tests/manual/workspace-api.mjs`.
- Navegador: criação de coleção, modelo, tag e campo booleano; aplicação da tag e do valor `false`; filtros de BI e exportação CSV; abrir a ficha e voltar mantendo filtros; recarregar preservando alterações.
- Conferência financeira: tecido 40 × 1,5 + aviamentos 5 + serviços 10 + rateio 5 = **80 por unidade**; markup 2,5 = **200 sugerido**; 100 unidades = **8.000**; 200 unidades = **16.000**. Alterar consumo para 2 resultou em custo 100 e preço 250, depois restaurados para 80/200.
- Movimento real no Kanban de 03 Modelagem para 10 Corte: ficha e histórico atualizados somente após confirmação do servidor. Avanço pela ficha para 20 Final: revisão 10, status Completa e dashboard com um modelo concluído. Os três eventos e as duas permanências observadas aparecem no histórico.
- Interface conferida em 1440 × 1000 e 390 × 844, claro/escuro, menus, Escape, foco, carregamento e rolagem. A página móvel não apresentou rolagem horizontal global; tabelas/abas extensas mantêm rolagem própria.

## Evidências visuais

- `evidence/akr-menu-gestao-compacto.jpg` — menu final de Gestão com categorias e submenu, capturado no sistema normal em localhost:5173.
- `evidence/akr-menu-restaurado-desktop.jpg` — composição final: marca à esquerda, três menus centralizados e conta à direita. A correção passou nos 12 testes de navegação e foi conferida em desktop e celular.
- `evidence/akr-dashboard-desktop.jpg`
- `evidence/akr-dashboard-dark.jpg`
- `evidence/akr-dashboard-mobile.jpg`
- `evidence/akr-navegacao-desktop.jpg`
- `evidence/akr-ficha-mobile.jpg`

A captura do menu compacto de Gestão usa a página normal do portal. As demais capturas usam o cenário isolado de conferência e documentam as etapas anteriores de validação; a imagem do menu restaurado registra a composição do cabeçalho. Não foram adicionados números demonstrativos à base operacional normal.

## Limites preservados

O envio de dados ao Linx continua desabilitado: o projeto possui consultas e preparação do contrato, mas não uma operação de escrita ERP concluída. A interface apresenta essa situação sem simular integração bem-sucedida. A conferência do PLM e a situação do ERP permanecem conceitos separados.

As novas páginas não usam os endpoints antigos de dashboard que retornavam `null`. Esses endpoints legados não foram completados nesta atualização; os indicadores atuais usam os documentos e eventos da área compartilhada.

Os vídeos mencionados no pedido original não estavam anexados. A implementação e a revisão visual partiram do código, das telas disponíveis e das correções dadas pelo usuário durante o trabalho.
