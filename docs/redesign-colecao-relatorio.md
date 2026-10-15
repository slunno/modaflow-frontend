# Redesign da coleção — entrega

O painel de coleção reúne agora metadados e progresso em destaque, navegação por áreas, conteúdo com hierarquia consistente e formulários com preview. A paleta editorial existente foi preservada. Os identificadores das dez abas, os parâmetros `marca`/`colecao`, os campos e as ações anteriores continuam disponíveis.

## Fases

| Fase               | Resultado                                                                                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 — reconhecimento | Revisão da gravação e mapa dos componentes em `redesign-colecao-plano.md`.                                                                                                                                                                                                                                         |
| 1 — fundação       | Tokens e primitivos da ficha já existiam; reutilizados, sem nova biblioteca de UI nem alteração da paleta global. Selects e datas usam controles nativos estilizados.                                                                                                                                              |
| 2 — cabeçalho      | Marca, temporada e ano em chips, entrega e total destacados, progresso derivado das peças, contagem de reservas e peças sem data. Ação principal “Nova peça”; Exportar CSV e Copiar Código mantidos em Opções. Dez abas em Planejamento, Identidade e Materiais, com contagens ou indicação neutra.                |
| 3 — temas e cores  | Miniaturas, progresso, cores e prazo nos temas. Seletor múltiplo por chips; detalhe legado de entrega preservado. Cores com filtros compactos, grade/lista, seleção múltipla, estado vazio com ação e modal com preview. Falha de consulta com “Tentar novamente”, sem impedir cores personalizadas.               |
| 4 — estampas       | Imagens em proporção fixa, tipo e tecidos em chips, acesso à edição pelo card e botão direto para incluir imagem ausente. Editor em duas colunas com upload maior, arrastar e soltar, limite original de 1 MB e ações fixas. IDs e vínculos às fichas preservados na edição.                                       |
| 5 — reservas       | Mesma composição para tecidos e aviamentos. Filtros recolhíveis quando há registros; cards mostram material, cor, quantidades, consumo, estilista, responsável e cadastro. Formulário com resumo ao vivo e unidades disponíveis. Seletor de material com busca, seleção, criação personalizada e confirmação fixa. |
| 6 — outras abas    | Cronograma com marcos de entrega, linha de hoje, legenda e tabela mantida. Peças sem data agrupadas com acesso à ficha. Peças com imagens disponíveis, filtros recolhíveis e estado vazio com ações. Mix, Metas e Painéis harmonizados; conteúdo e cálculos anteriores preservados.                                |

## Arquivos principais

- `CollectionDetailView.tsx`: composição da página e fluxos existentes de peças.
- `CollectionOverview.tsx`: cabeçalho, indicadores e navegação agrupada.
- `CollectionManagementTabs.tsx`: temas, cores, estampas, reservas e seleção de material.
- `CollectionPresentation.tsx`: composição dos dialogs, avisos de consulta e chips de cores.
- `CollectionReservationCard.tsx` e `CollectionSchedule.tsx`: apresentação das reservas e visão temporal.
- `CollectionPrintImageUpload.tsx` e `MiniaturaModal.tsx`: upload e seleção de campos com acessibilidade.
- Testes de coleção, edição de estampas e cronograma.

## Suposições e limites dos dados

- O parâmetro real da URL é `colecao`, sem acento; preservado como está no aplicativo.
- As reservas não possuem status de conclusão. O cabeçalho mostra contagem e avaliação neutra; “Registro local” indica sua origem. A barra representa apenas utilizado / reservado; excesso é indicado por texto e ícone.
- Reservas existentes não armazenam imagem, código ou unidade. A apresentação usa o catálogo local disponível e materiais já selecionados na sessão; sem correspondência, informa a ausência, sem acrescentar campos à persistência nem consultas automáticas.
- `Completos` não tem definição de negócio nem unidade no código. O campo, validação e valor foram mantidos; a interface explicita que sua unidade ainda não está definida.
- A data do tema é o campo principal de prazo. A antiga descrição livre de entrega permanece em detalhe complementar editável, evitando perda de informação.
- O cronograma mostra marcos de previsão, pois não há datas de início para representar duração. Datas inválidas entram no grupo sem prazo; a tabela preserva a previsão original e o fallback da coleção, identificando sua origem.
- Painéis contêm diretrizes editoriais fixas, sem cadastro de imagens/contagem. Metas contém indicadores, sem metas numéricas configuradas. As abas exibem indicação neutra nesses casos.
- Imagens dos temas e peças usam somente os croquis já disponíveis. Não foram acrescentadas imagens fictícias aos dados do aplicativo.
- Nenhum envio ao Linx foi implementado. Serviços, contratos, mocks, chaves e formato dos registros persistidos permanecem intactos; tentativas manuais repetem as consultas existentes.

## Verificação

TypeScript, lint e build executados em cada fase de implementação. Suíte completa: **408 testes em 52 arquivos**. Uma repetição encontrou timeout em um teste antigo de Terceiros na ficha; esse teste passou isoladamente, e a suíte inteira passou com dois workers, sem alterar o código ou o limite do teste. Lint sem erros ou avisos novos; permanece o aviso anterior de dependência `user` em `AuthContext.tsx:135`, fora deste escopo.

Testes cobrem troca das dez abas sem alteração dos parâmetros da URL, navegação por setas, CTA de estado vazio, criação de reservas para ambos os tipos com o mesmo formato salvo, nova tentativa após falha de cores, edição e imagem de estampa sem trocar IDs, e abertura da ficha pelo cronograma.

Revisão visual no navegador em desktop, 390 × 844 e tema escuro: modais, preview, filtros, seleção de material e ações fixas. Os dados de demonstração ficaram apenas na prévia isolada. O upload foi verificado com arquivos nos testes automatizados; a extensão do navegador não permite seleção automatizada de arquivos locais nesta sessão.

Nenhuma dependência foi instalada no frontend. Um FFmpeg temporário (`imageio-ffmpeg`), fora do projeto, foi necessário para extrair quadros da gravação, pois o sistema não tinha decodificador disponível.

## Próximos passos dependentes de definição

Definir a semântica de `Completos`, os estados de reserva e as metas numéricas; disponibilizar metadados históricos dos materiais para reservas antigas; cadastrar painéis visuais quando existir persistência para esse recurso. Essas evoluções exigem dados ou regras adicionais e não foram simuladas nesta entrega.
