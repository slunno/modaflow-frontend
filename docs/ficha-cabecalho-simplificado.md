# Cabeçalho simplificado da ficha

Removidas as etiquetas de subcategoria, tecidos, tema, tipo e linha do resumo do cabeçalho. Etapa, Custo, Preço, Estilista e Modelista são centralizados verticalmente na mesma linha, com quebra responsiva quando necessário.

Removidos o bloco visual de Rascunho local e a faixa Conferência de obrigatórios com seu contador, barra e texto de avaliação. As abas continuam acessíveis pelo teclado. O botão de integração continua identificando mudanças e mantém sua descrição acessível, sem uma faixa visual permanente.

O salvamento automático continua funcionando. Mensagens normais ficam disponíveis aos leitores de tela; falhas de salvamento, avanço, conclusão, preparação e contrato continuam visíveis como alertas quando acontecem.

Validação isolada: 48 testes de cabeçalho, redesign, salvamento automático e alterações para Linx passaram; lint dos arquivos alterados e build com TypeScript passaram. No navegador, os cinco campos do resumo apresentaram a mesma coordenada vertical central. Captura em outputs/ficha-cabecalho-simplificado-preview.png.
