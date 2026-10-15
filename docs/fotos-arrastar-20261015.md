# Arrastar fotos para a prévia — 15/10/2026

A área grande da imagem da peça na aba Variantes agora recebe diretamente arquivos arrastados, tanto na Principal quanto nas demais variantes. Ela também abre o seletor ao clicar. O envio substitui a foto selecionada e usa o armazenamento e a confirmação de salvamento já existentes.

- A área destaca o destino e mostra “Solte a imagem para salvar”. O destaque se mantém ao passar sobre elementos internos.
- A prévia salva fica aparente, com instrução para arrastar outra imagem e substituir. O estado vazio informa o limite de 10 MB e o salvamento automático.
- Seleção por clique, troca, remoção, progresso e erros continuam acessíveis. O mesmo componente valida o arquivo nos dois caminhos.
- Arquivos de outro formato, acima do limite ou múltiplas imagens no mesmo envio são recusados com mensagem. Envios simultâneos são bloqueados e uma falha preserva a imagem anterior.

Validação: 28 testes aprovados em cinco arquivos, incluindo quatro cenários de arrastar/soltar e o fluxo de persistência da Principal e da variante até a capa da coleção. Build TypeScript/Vite e ESLint aprovados. Conferência visual e envio pelo seletor na área grande realizados na prévia isolada com IndexedDB real.

Evidência: `C:/King-Joe-Projects/outputs/fotos-arrastar-area-20261015.jpg`.
