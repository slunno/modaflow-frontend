# Edição das estampas da coleção

Os cartões de estampas abrem o cadastro para editar código, tipo, observações, tecidos e imagem. A edição mantém o ID do registro, preservando a seleção nas fichas técnicas. Os cartões mostram a imagem ou uma indicação para adicioná-la, além do sinal Editar.

O formulário tem uma área de imagem com prévia maior e os botões Adicionar imagem e Trocar imagem. Também aceita arrastar um arquivo e permite remover a imagem. A validação mantém o limite existente de 1 MB e verifica se o arquivo é uma imagem. O salvamento aguarda a leitura do arquivo, e leituras canceladas não alteram outro formulário.

Salvar alterações atualiza o registro existente; cancelar ou fechar descarta os dados não salvos. Uma nova estampa começa com campos limpos. A janela usa os controles existentes de foco e fechamento por Escape.

Validação: 402 testes em 50 arquivos; TypeScript e build aprovados; lint sem erros, com o aviso preexistente em AuthContext. Testes cobrem edição, persistência, cancelamento, criação, upload, limite e tipo de arquivo, remoção da imagem e vínculo por ID com a ficha. No navegador foram conferidos edição, salvamento, criação, vínculo com a ficha e o formulário a 390 px. O upload pelo agente no Edge foi limitado pela permissão de acesso a arquivos da extensão; a leitura e persistência da imagem foram verificadas nos testes automatizados.

A aplicação no checkout original preserva as alterações atuais por mesclagem, mantém cópia de segurança dos arquivos e verifica que o HEAD e o index originais não foram alterados.
