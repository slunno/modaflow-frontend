# Etapa e alterações pendentes para o Linx

A movimentação manual agora abre pelo campo Etapa no resumo da ficha. O campo mostra a etapa atual e uma seta; o menu Opções deixa de repetir Entregar / alterar etapa. Avançar etapa salva diretamente a próxima etapa, inclusive de 01 para 02, sem janela de confirmação.

Integrar no Linx fica ao lado de Avançar etapa no cabeçalho fixo. O botão tem fundo verde forte quando existe diferença no conteúdo da ficha; fica neutro, apagado e desabilitado sem alterações. Uma janela explica o estado e a futura criação da peça na primeira integração ou atualização da peça vinculada.

Conforme esclarecimento do usuário, esta etapa apenas detecta mudanças e informa a futura integração. Não há endpoint novo, gravação no Linx, criação de produto nem recibo simulado. A preparação existente no menu continua disponível para fichas concluídas.

## Referência de comparação

- A comparação inclui os dados editáveis da peça e de todas as abas, etapa, responsável, variantes, insumos, medidas, corte, preços e manifesto de imagens/arquivos.
- A referência é o retrato da última integração confirmada, quando existe. Sem recibo, o conteúdo da primeira abertura vira a referência inicial: o estado cinza significa somente ausência de diferença detectada, não que a peça já existe ou foi enviada ao ERP.
- São guardados no navegador apenas o identificador da referência e seu resumo SHA-256, separados por marca, coleção e peça. O salvamento automático, conclusão e preparação não apagam a pendência; reabrir mantém a comparação.
- Mudar de aba, trocar a variante em exibição, consulta automática de dados Linx e metadados de auditoria não criam pendência. Desfazer integralmente as mudanças restaura o estado neutro.
- Um futuro recibo confirmado poderá substituir a referência. O envio real deve validar identidade e mapeamento, criar/atualizar no ambiente aprovado, receber confirmação do Linx e somente então registrar a versão integrada.

## Validação

- 48 arquivos e 386 testes aprovados, incluindo 13 novos casos de detecção, persistência, recibos, arquivos e acesso pelo campo Etapa. A suíte foi executada com até quatro trabalhadores para evitar saturação da máquina; a primeira execução concorrente atingiu timeout de cinco segundos em dois testes existentes.
- Typecheck, lint e build aprovados. Lint conserva somente o aviso preexistente em AuthContext.tsx:135.
- Navegador isolado com componente real e API remota bloqueada: estado neutro inicial, uma letra/ponto ativa o verde, janela informativa, salvar mantém pendência e desfazer restaura o estado neutro.
- Celular 390 × 844: largura/rolagem da página 375/375 px; janela de integração 353/353 px. Sem transbordamento horizontal.
- Revisão React: comparação derivada do conteúdo, base de referência em estado próprio, hashes fora do render, cancelamento de respostas após desmontagem e diálogo com gestão de foco. Nenhuma dependência adicionada.
