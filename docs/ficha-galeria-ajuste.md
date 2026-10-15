# Ajuste da galeria da Ficha Técnica

Aplicado em 08/10/2026 como complemento ao redesign da ficha.

- Removida a coluna lateral de galeria e anexos das abas da ficha. O conteúdo ocupa a largura disponível.
- O gerenciador completo foi movido para **Opções → Gerenciar anexos**, mantendo as cinco categorias, os arquivos anteriores e as ações de adicionar, baixar e remover.
- A aba Variantes apresenta três miniaturas à esquerda da visualização principal: imagem da peça, desenho técnico e arquivo de projeto. Clique, setas do teclado, Home e End alternam a visualização.
- Há um campo de envio de arquivo único para desenho técnico e outro para projeto. O último arquivo de cada categoria aparece no painel; trocar adiciona o novo arquivo e preserva os anteriores no gerenciador.
- O desenho técnico e o projeto pertencem à peça, conforme o armazenamento existente. A imagem continua específica da variante, com as mesmas regras de herança e salvamento.
- Imagens podem ser ampliadas. PDFs usam o visualizador do navegador; há orientação para abrir ou baixar se a prévia não aparecer. Corel, Illustrator e Photoshop apresentam nome e ações de abrir/baixar.

O estado de anexos passou a ser compartilhado entre a galeria e o gerenciador por um hook de interface. Serviços, schema de IndexedDB, tipos de negócio, mocks existentes, dependências e envio ao Linx foram preservados.

## Validação

- Suíte completa: 47 arquivos e 378 testes aprovados.
- Quatro novos testes cobrem gerenciador, envio de um desenho e um projeto, troca pelas miniaturas, teclado, recuperação ao reabrir, preservação de arquivos anteriores e falha de armazenamento.
- Typecheck, lint e build aprovados. Lint mantém apenas o aviso preexistente em AuthContext.tsx:135.
- Revisão visual em desktop e celular (390 × 844), com dados de demonstração e API externa bloqueada. Largura móvel conferida: clientWidth = scrollWidth = 375 px.
- Desenho técnico e anexos salvos foram conferidos na interface real com IndexedDB. O upload automático pelo seletor do navegador foi bloqueado pela permissão da extensão; os testes de componente cobrem o envio pelo input e a revisão visual utilizou arquivos de demonstração carregados pelo serviço existente.
- A prévia nativa de PDF ficou em branco no Edge de revisão. O iframe aponta para o arquivo salvo e as ações de abrir/baixar continuam disponíveis; sua renderização depende do visualizador de PDF do navegador.
- Alterações aplicadas ao checkout original após comparar cada arquivo com o estado anterior, preservando HEAD, index e alterações preexistentes.

Capturas disponíveis na entrega: ficha geral sem coluna, galeria com desenho técnico e galeria no celular. Arquivos de demonstração não foram adicionados ao produto.
