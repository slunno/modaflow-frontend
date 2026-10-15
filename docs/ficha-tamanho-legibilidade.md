# Ampliação da ficha técnica inteira

Ajuste solicitado em 08/10/2026. O usuário confirmou que o aumento deve valer para toda a ficha, incluindo cabeçalho, navegação, formulários, insumos, tabelas, imagens e controles.

- A área da ficha no desktop passa de um limite de 80 rem (1280 px) para 100 rem (1600 px), com margens responsivas. O aumento só se aplica quando a ficha está aberta.
- A classe `ficha-tecnica` define tokens locais: textos pequenos de 14 px, textos de corpo/controles de 16 px e títulos maiores. Rótulos antigos de 10/11 px também passam para 14 px dentro da ficha.
- Espaçamentos, ícones e controles aumentam 20% no desktop e 10% em telas menores. Campos mantêm altura mínima de 44 px; botões acompanham a escala. Os componentes existentes de todas as abas recebem a escala por herança.
- A galeria recebe visualização de pelo menos 512 px de altura a partir de 640 px de largura e 608 px a partir de 1280 px. Imagens podem usar até 640 px de altura. Prévia de PDF acompanha a altura maior.
- Miniaturas da peça, desenho técnico, projeto e variantes ficam maiores. A área de imagem tem um pouco mais de largura que o painel de informações no desktop.
- A aba Variantes passa a usar duas colunas a partir de 1024 px. Em celular/tablet, os blocos seguem em uma coluna; as miniaturas permanecem roláveis dentro do seu bloco.
- O zoom do navegador não é alterado. O aumento é feito no layout e na escala visual da ficha.
- Serviços, persistência, mocks, dependências e regras de negócio permanecem sem delta.

## Validação

- Typecheck, lint e build aprovados. Lint mantém somente o aviso preexistente em AuthContext.tsx:135.
- Suíte completa: 47 arquivos, 373 testes aprovados.
- Navegador: todas as 12 abas verificadas em 1440 × 1100 e 390 × 844. Em cada aba, a largura de rolagem da página coincide com a largura disponível.
- Tablet 768 × 1024: Variantes, Modelagem e Corte sem transbordamento horizontal da página.
- Desktop 1920 px: a ficha usa 1536 px dentro do contêiner de 1600 px com margens internas. Campos medidos com fonte de 16 px e altura de 49,6 px; textos pequenos com 14 px. Imagem da variante medida com cerca de 517 × 640 px em desktop.
- Modal de tecido no celular: largura interna e de rolagem de 338 px; botão Criar insumo com 44 px de altura, visível no rodapé da janela. Nenhum insumo foi criado.
- Demonstração isolada usa o componente real e dados de teste existentes, com API remota bloqueada. Nenhuma alteração de dados de teste foi feita na ficha aberta do usuário.
- Revisão React: nenhuma alteração em hooks, efeitos, handlers, persistência ou semântica de navegação. A ampliação usa o sistema de tokens e os componentes existentes.

Arquivos principais: HomePage.tsx, PecaFichaTecnicaView.tsx, fichaSubmenus.css, VariantsTab.tsx e VariantAssetsGallery.tsx.
