# Redesign da Ficha Técnica — ModaFlow

Redesign implementado no frontend Vite / React / TypeScript, com identidade AKR, interface em português e sem novas dependências.

| Fase | Resultado | Commit |
| --- | --- | --- |
| 0 | Reconhecimento das telas e plano de uma página. Snapshot do trabalho local anterior para preservar alterações existentes. | `3a3af7e` |
| 1 | Tokens semânticos, tipografia editorial e primitivos de card, ações, status, estados vazios, skeleton, tooltip e diálogo. Temas claro e escuro. | `f146d7f` |
| 2 | Cabeçalho sticky, ação principal Avançar etapa, ações secundárias em Opções, resumo com pessoas e tags, rascunho visível e 12 abas agrupadas. | `0dfb1d4` |
| 3 | Imagem e materiais da variante selecionada em duas colunas; miniaturas abaixo, teclado, ampliação, troca de imagem e duplicação independente. | `ee725b4` |
| 4 | Geral em cards; anexos por cinco categorias; Modelagem separada, tabela legível com placeholders, cabeçalho fixo e Salvar no rodapé. | `c25450c` |
| 5 | Cadastro compartilhado de tecido/aviamento em formulário e resumo ao vivo, técnicos recolhíveis, ação visível, foco preso, ESC e rótulos associados. | `8daf6b6` |
| 6 | Cronograma com legenda, datas disponíveis, responsáveis e hoje; lista móvel; histórico com antes/depois e filtros por campo e responsável. | `a30640c` |
| 7 | Conferência com três estados e confirmação explícita de não aplicabilidade; links focam campos pendentes. Ajustes de acessibilidade, celular e testes de regressão. | Último commit da branch |

## Arquivos principais

- `src/index.css` e `src/pages/Home/components/fichaSubmenus.css`: tokens, foco, legibilidade e movimento reduzido.
- `src/components/ui/FichaPrimitives.tsx`: componentes compartilhados e diálogo acessível.
- `PecaFichaTecnicaView.tsx`, `FichaNavigation.tsx` e `VariantsTab.tsx`: cabeçalho, composição, navegação e variantes.
- `FichaInsumosEditor.tsx`, `FichaInsumoCard.tsx`, `FichaAnexosPanel.tsx` e `FichaModelagemEditor.tsx`: apresentação dos editores existentes.
- `src/pages/Gestao/modals/CriarTecidoModal.tsx`: cadastro compartilhado de insumos.
- `FichaGraficosPanel.tsx`, `FichaAlteracoesPanel.tsx` e `FichaConferenciaPanel.tsx`: acompanhamento e conferência.
- `src/tests/fichaRedesign.test.tsx`: sete testes adicionais; seletores de testes existentes ajustados à nova composição.

Os componentes sem caminho completo acima ficam em `src/pages/Home/components/`.

## Validação e preservação

Typecheck, lint e build executados em todas as fases. Suíte completa: **46 arquivos e 374 testes aprovados**, incluindo seleção por miniatura, rascunho nas 12 abas, teclado, ampliação/ESC, duplicação, modal, cronograma, filtros e foco nos campos pendentes. Comando: `npm test -- --maxWorkers=2 --testTimeout=15000`. O limite de trabalhadores e o timeout evitam a disputa de recursos observada na execução inicial; não houve alteração da configuração dos testes.

Lint sem erros e sem novos avisos. Permanece o aviso anterior de dependência `user` em `src/contexts/AuthContext.tsx:135`. Revisão visual em desktop, 390 × 844 px e tema escuro; sem transbordamento horizontal. O preview utilizou dados de demonstração e API real bloqueada.

Serviços, mocks existentes, tipos de negócio, dependências e backend não foram modificados. Mantidos os callbacks e contratos de rascunho, localStorage, salvamento automático de tamanhos/mostruário/corte, histórico, validação, preços manuais e limites de anexos. Duplicar usa a variante selecionada; Nova variante continua copiando a Principal. O envio ao Linx continua desabilitado; preparação e download do contrato permanecem disponíveis nas condições anteriores. Exportar abre a impressão da visualização atual.

## Suposições e dados ausentes

As cinco capturas citadas não vieram no anexo; a interface existente foi examinada no navegador antes da implementação. Foram preservadas **12 abas**: a lista solicitada também contém 12, apesar da referência a 11.

A barra mede as três áreas cobertas pela conferência existente: Geral, Tecidos e Aviamentos. As demais exibem “Sem avaliação”. Não se aplica exige confirmação válida para os dados atuais. A versão só aparece quando existe uma versão importada. Tags vazias e pessoas não definidas ficam recolhidas; custo/preço sem cálculo exibem Definir.

O modelo atual oferece uma imagem por variante. Não foi criado um novo armazenamento de imagens; a galeria compartilhada navega entre as imagens existentes. Não foram inventadas datas por etapa: o Gantt conecta mudanças consecutivas do histórico e a previsão de entrega existente. Sem registro, mostra Datas a definir. Não existia ação de varinha no editor atual; Ordenar recebeu explicação sobre a reordenação manual.

## Entrega e próximos passos

Oito commits na branch `codex/redesign-ficha-20261008`, sobre o snapshot `213c5dd`. O delta do redesign é aplicado ao checkout original após conferir que seus arquivos ainda correspondem ao snapshot, preservando o trabalho anterior e o HEAD/index originais. O patch entregue contém somente esse delta.

Próximos passos sugeridos: definir completude das outras áreas e planejamento de datas por etapa; validar o visual com as cinco capturas quando disponíveis; seguir com o contrato de gravação Linx quando o backend oferecer suporte.
