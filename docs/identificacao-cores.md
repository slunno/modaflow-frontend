# Identificação das cores da coleção

O formulário de adicionar e editar cor mostra os campos Nome da cor (obrigatório) e Código da cor (opcional), abaixo da seleção de tonalidade. A seleção preenche os campos com a identificação já cadastrada. A prévia acompanha as alterações durante a digitação.

O salvamento remove espaços nas extremidades, conserva códigos como texto (incluindo zeros à esquerda) e mantém a tonalidade, Pantone, paleta e fornecedores. Editar mantém o ID da cor na coleção e atualiza sua identificação no catálogo local sem deixar o cadastro anterior duplicado. Os registros de outras coleções permanecem preservados. Fechar descarta a edição ainda não salva.

Validação: nove testes das cores e das abas de gestão passaram; TypeScript, lint dos arquivos alterados e build passaram. No navegador, uma prévia isolada confirmou adicionar, buscar por código, reabrir e alterar o nome de uma cor. Dados de demonstração foram usados apenas na prévia.

O cadastro continua local, sem envio de alterações ao Linx.
