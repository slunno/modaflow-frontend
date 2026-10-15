# Refinamento visual da ficha técnica — outubro/2026

## Status — revertido em 14/10/2026

Após o esclarecimento de que o pedido abrangia o site inteiro, a restauração foi estendida à
entrada, navegação e páginas principais do portal. Ver `restauracao-site-20261014.md`.

Por solicitação do usuário, o último refinamento visual descrito abaixo foi desfeito.
O registro original foi mantido somente como histórico e não descreve mais a UI atual.

A restauração devolveu o tema, cabeçalho, navegação, galerias e apresentação financeira
anteriores; os formulários de tecido/aviamento voltaram a mostrar as observações diretamente,
o resumo lateral e o editor de cores opcional dentro do mesmo diálogo. Os botões de edição e
remoção dos insumos estão novamente visíveis sem depender de hover.

Foram preservados os vínculos de cores/fornecedores/preços, os campos próprios da peça,
rascunhos, cálculos e funcionalidades posteriores do workspace. Alterações existentes no menu
e no cadastro de fornecedores não foram revertidas.

Verificação: 207 testes de regressão em 19 arquivos aprovados; build e TypeScript aprovados;
lint sem erros (um aviso preexistente em `AuthContext.tsx`). Cadastro e edição foram
conferidos no navegador com fixtures isoladas. Nenhum backend, banco ou Linx foi acessado.

## Mapeamento anterior às alterações

| Área                | Componentes existentes reutilizados                                                       |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Tema e estrutura    | `index.css`, `MainLayout`, `FichaPrimitives`, `fichaSubmenus.css`                         |
| Cabeçalho e abas    | `PecaFichaTecnicaView`, `FichaNavigation`                                                 |
| Cadastro de insumo  | `CriarTecidoModal`, `InsumoResumo`, `insumoEditor.css`                                    |
| Cores               | `MaterialColorTile`, `InsumoInformacoesCores`                                             |
| Tecidos/aviamentos  | `FichaInsumosEditor`, `FichaInsumoCard`                                                   |
| Variantes e imagens | `VariantsTab`, `VariantAssetsGallery`, `FichaImageUpload`                                 |
| Medidas             | `FichaModelagemEditor`                                                                    |
| Financeiro          | `FichaCustosView`, `FichaPrecificacaoEditor`                                              |
| Acompanhamento      | `FichaGraficosPanel`, `CollectionSchedule`, `FichaAlteracoesPanel`, `FichaHistoricoPanel` |

## Limites

Somente apresentação. Não modificar serviços, cálculos, entidades, rotas, API, regras de
conferência, persistência ou integração. As prévias utilizam servidores isolados com dados
simulados, sem proxy para o backend e sem acesso ao SQL.

Os resultados atuais de precificação não oferecem lucro nem margem efetiva como valores
prontos. Não acrescentar fórmulas para preencher esses indicadores. Mostrar somente resultados
existentes e registrar a decisão necessária ao final.

## Resultado por seção da solicitação

1. **Escala global:** base 13 px/1,45, legendas/rótulos 12 px, seções 15 px, peça 20–22 px e títulos de página até 24 px. Controles 34–36 px, cards de 16 px, raio 12 px e limite de conteúdo 1280 px. Nenhum CSS zoom ou scale.
2. **Cabeçalho/abas:** resumo em chips, pendências suaves, ação principal em caramelo, integração secundária, navegação agrupada com Lucide e indicadores vazio/parcial/check. Cabeçalho e navegação ficam juntos durante a rolagem; em telas estreitas só a própria barra de abas rola horizontalmente.
3. **Insumos:** formulário inicialmente central de 800 px; resumo sempre no topo. O conjunto aberto tem até 1200 px, painel direito de 400 px e movimento de 250 ms. Abaixo de 1024 px o editor é uma segunda etapa com Voltar/Concluir, sem desmontar os campos principais. Origem do preço, observações e detalhes técnicos ficam recolhidos. Clique na cor também abre o editor. Esc, Tab e restauração do foco verificados.
4. **Demais abas:** miniatura e metadados dos insumos, cores legíveis em chips e ações em hover/foco; ação dentro dos vazios de tecidos/aviamentos; galerias e upload mais compactos; tabelas com cabeçalho fixo, zebra e foco; totais existentes em cards e números tabulares; markup/margem segmentados; linha do tempo com ícone, autor e data; legendas como badges e linha de hoje destacada. Nenhuma fórmula financeira ou duração de etapa foi criada.
5. **Acessibilidade/temas:** foco visível, alvos de ícone de pelo menos 32 px, um diálogo para formulário e painel, papéis/labels preservados e movimento reduzido respeitado. Doze abas verificadas em modo escuro, sem erro de console nem transbordamento da página.

## Tokens centralizados em index.css

| Tokens                                   | Valores/uso                                                  |
| ---------------------------------------- | ------------------------------------------------------------ |
| `--text-xs/sm/base/lg/xl/2xl/3xl…6xl`    | 12/13/13/15/20/22/24 px; line-height base 1,45               |
| `--color-action/hover/foreground`        | Caramelo de marca e contraste próprio, incluindo tema escuro |
| `--radius-card/control`, `--shadow-card` | 12/8 px e sombra mínima                                      |
| `--spacing-card/section`                 | 16/20 px                                                     |
| `--spacing-control/control-compact/hit`  | 36/34/32 px                                                  |
| `--spacing-app-header`                   | 56 px, também usado no deslocamento sticky                   |
| `--spacing-dialog-height/insumo-panel`   | 85dvh/400 px                                                 |
| `--container-app/insumo/insumo-pair`     | 1280/800/1200 px                                             |
| `--spacing-gallery/gallery-empty`        | 384/192 px                                                   |
| `--transition-ui/panel`                  | 180/250 ms                                                   |

Os overrides locais de fonte/raio foram retirados. Cores reais dos insumos continuam sendo dados
do cadastro; não são substituídas por tokens de marca. Cores sem tonalidade exata continuam
identificadas como ilustrativas.

## Verificação visual — ambiente isolado

**Fluxo:** cadastro de insumo → consulta simulada com o contrato existente → seleção de
cores/fornecedor → edição opcional por cor → resumo. Serviços reais não foram chamados.

- Portas 5191/5192, somente localhost, sem proxy. Backend e SQL não iniciados/acessados.
- Viewports 1366×768, 1920×1080 e 2560×1440 verificados.
- O navegador não expõe controle de zoom real; Ctrl +/- não mudou viewport nem escala.
  Para 90% e 125%, foram usados viewports CSS equivalentes, **não zoom real confirmado**.
  Isso verifica espaço/breakpoints, mas não substitui validar zoom no navegador habitual.
- Ficha limitada a 1280 px e modal sem transbordamento externo. Rodapés visíveis na matriz.
- Verificações adicionais em 850×768 e 375×768: somente o passo de cores visível quando aberto,
  alvo mínimo de botão 32 px, Esc retorna ao cadastro e depois o fecha.
- Preços distintos por cor preservados e reabertura sem salvar antecipadamente. Consulta e
  correção manual continuam seguindo os helpers existentes.
- Contraste dos tokens de ajuda/rótulos: mínimo medido 5,16:1 no claro e 6,32:1 no escuro.
  Botão primário: 5,19:1 no claro, 6,85:1 no escuro. Estados desabilitados não fazem parte dessa medição.
- Sem erros/warnings de console nos fluxos simulados de ficha e insumo.

| Resolução solicitada | 100% (viewport de teste) | Equivalente de 90% | Equivalente de 125% |
| -------------------- | ------------------------ | ------------------ | ------------------- |
| 1366×768             | 1366×768                 | 1518×854           | 1093×614            |
| 1920×1080            | 1920×1080                | 2133×1200          | 1536×864            |
| 2560×1440            | 2560×1440                | 2844×1600          | 2048×1152           |

O viewport útil da ficha pode ser menor pela largura da barra de rolagem. O navegador também
arredonda algumas dimensões em um pixel.

### Capturas com dados fictícios exclusivos de teste

- [Modal claro](C:/King-Joe-Projects/outputs/insumo-refinado-light.png)
- [Modal escuro](C:/King-Joe-Projects/outputs/insumo-refinado-dark.png)
- [Passo mobile](C:/King-Joe-Projects/outputs/insumo-refinado-mobile.png)
- [Ficha escura / cabeçalho e abas](C:/King-Joe-Projects/outputs/ficha-refinada-dark.png)

## Verificações de código

- Typecheck: `tsc -b` aprovado.
- Lint completo: `npm run lint` aprovado, zero erros. Um warning em
  `src/contexts/AuthContext.tsx:135` sobre dependência `user`; arquivo não alterado nesta tarefa.
- Build: `npm run build` aprovado.
- Formatação dos arquivos alterados e `git diff --check` aprovados.
- Regressão selecionada: **246 testes**, 23 arquivos. A execução conjunta final teve
  245 aprovações e um timeout de 5 s em `fichaIdentityAndColors`; esse teste passou
  ao repetir isoladamente, com o mesmo limite e sem alterar suas asserções.
- React: componentes reutilizados, sem estado de negócio duplicado, sem escrita de refs no render
  introduzida e sem modificar serviços/contratos/validação. Ajustes de foco limitados à apresentação.

## Decisão necessária — não implementada

Os resultados existentes de precificação fornecem custo e preço final, mas não lucro ou margem
efetiva prontos. Os cards mostram esses resultados disponíveis. **Não foi presumida a fórmula
“lucro = preço − custo”**, nem confundida a margem configurada com um resultado efetivo.
Para acrescentar os dois indicadores, é necessário confirmar fonte e regra aprovada em outra etapa.

## Arquivos alterados nesta tarefa

Esta lista identifica apenas as intervenções deste refinamento. O repositório já tinha alterações
anteriores, que foram preservadas. Nenhum arquivo do backend foi alterado.

- [src/index.css](C:/King-Joe-Projects/modaflow-frontend/src/index.css)
- [src/components/layout/MainLayout.tsx](C:/King-Joe-Projects/modaflow-frontend/src/components/layout/MainLayout.tsx)
- [src/components/ui/FichaPrimitives.tsx](C:/King-Joe-Projects/modaflow-frontend/src/components/ui/FichaPrimitives.tsx)
- [src/pages/Home/components/fichaSubmenus.css](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/fichaSubmenus.css)
- [src/pages/Home/components/PecaFichaTecnicaView.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/PecaFichaTecnicaView.tsx)
- [src/pages/Home/components/FichaNavigation.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaNavigation.tsx)
- [src/pages/Gestao/modals/CriarTecidoModal.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Gestao/modals/CriarTecidoModal.tsx)
- [src/pages/Gestao/modals/InsumoResumo.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Gestao/modals/InsumoResumo.tsx)
- [src/pages/Gestao/modals/insumoEditor.css](C:/King-Joe-Projects/modaflow-frontend/src/pages/Gestao/modals/insumoEditor.css)
- [src/pages/Home/components/InsumoInformacoesCores.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/InsumoInformacoesCores.tsx)
- [src/pages/Home/components/MaterialColorTile.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/MaterialColorTile.tsx)
- [src/pages/Home/components/FichaInsumosEditor.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaInsumosEditor.tsx)
- [src/pages/Home/components/FichaInsumoCard.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaInsumoCard.tsx)
- [src/pages/Home/components/FichaPrecificacaoEditor.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaPrecificacaoEditor.tsx)
- [src/pages/Home/components/FichaCustosView.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaCustosView.tsx)
- [src/pages/Home/components/FichaAlteracoesPanel.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaAlteracoesPanel.tsx)
- [src/pages/Home/components/FichaImageUpload.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaImageUpload.tsx)
- [src/pages/Home/components/VariantAssetsGallery.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/VariantAssetsGallery.tsx)
- [src/pages/Home/components/VariantsTab.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/VariantsTab.tsx)
- [src/pages/Home/components/FichaGraficosPanel.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/FichaGraficosPanel.tsx)
- [src/pages/Home/components/CollectionSchedule.tsx](C:/King-Joe-Projects/modaflow-frontend/src/pages/Home/components/CollectionSchedule.tsx)
- [src/tests/insumoInformacoesCores.test.tsx](C:/King-Joe-Projects/modaflow-frontend/src/tests/insumoInformacoesCores.test.tsx)
- [tests/manual/ficha/main.tsx](C:/King-Joe-Projects/modaflow-frontend/tests/manual/ficha/main.tsx)
- [tests/manual/insumo-cores/main.tsx](C:/King-Joe-Projects/modaflow-frontend/tests/manual/insumo-cores/main.tsx)
- [docs/refinamento-ficha-ui.md](C:/King-Joe-Projects/modaflow-frontend/docs/refinamento-ficha-ui.md)
