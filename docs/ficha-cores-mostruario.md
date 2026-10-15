# Cores da peça e mostruário

Regra definida pelo usuário em 08/10/2026: as cores da peça são escolhidas nos insumos de **Tecidos/Aviamentos**. A **Cor de mostruário**, na aba **Geral**, é a referência da peça para a futura integração com o Linx.

- Removido o painel **Cores das variantes — vínculo Linx** e sua busca/seleção por variante.
- Removida a exigência de `COR_PRODUTO` por variante na projeção local de integração.
- A projeção usa `coresMostruario` de Geral, mantendo compatibilidade com `corMostruario` de fichas antigas. Uma seleção explicitamente vazia continua vazia.
- As cores de cada tecido/aviamento continuam independentes, provenientes de `coresList` de cada insumo, e aparecem separadamente no planejamento local.
- Os códigos já informados são preservados como referência. Nomes, descrições e códigos locais não são tratados como códigos confirmados no ERP. O destino e a validação da cor de mostruário permanecem pendentes no contrato de planejamento.
- Geral explica o uso da cor de mostruário e onde escolher as cores da peça. O salvamento automático existente permanece.
- Nenhum dado antigo de vínculo é apagado dos rascunhos ou do histórico. A consulta de custos importados e sua seleção continuam preservadas.
- Não houve mudança no armazenamento, nos tipos de domínio, nos mocks, nas dependências ou em chamadas de gravação no ERP. Envio ao Linx continua em preparação.

## Validação

- 47 arquivos e 373 testes aprovados. Testes da regra antiga do painel removido foram substituídos por cobertura de mostruário, independência dos insumos e preservação dos dados anteriores.
- O fluxo testado consulta a grade, escolhe a cor de mostruário em Geral, confirma o salvamento automático, salva o rascunho e duplica uma variante. O mostruário permanece compartilhado; vínculos antigos da variante original são preservados e não copiados para a nova.
- A projeção preserva consumo por tamanho e posições reais da grade, sem criar códigos ou zeros.
- Typecheck, lint e build aprovados; somente o aviso preexistente em AuthContext.tsx:135.
- Aplicação ao checkout original com cópia de segurança, comparação contra o commit anterior e verificação por SHA-256, preservando HEAD, index e alterações preexistentes.

Arquivos principais: PecaFichaTecnicaView.tsx, VariantsTab.tsx, fichaLinxMapeamento.ts e fichaProcesso.ts.
