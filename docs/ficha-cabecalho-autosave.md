# Cabeçalho e salvamento automático da ficha

O ícone **Sinal da ficha** fica antes de **Avançar etapa**. Seu acesso ao histórico continua funcionando. **Integrar no Linx** permanece ao lado do avanço e destaca diferenças detectadas no conteúdo.

O botão **Salvar rascunho** foi retirado da ficha. Todas as abas passam a guardar as alterações automaticamente no mesmo armazenamento local já utilizado. A ficha informa o salvamento automático e as pendências para o Linx.

- A digitação é agrupada por 500 ms para guardar o valor final, sem gerar um evento a cada tecla.
- Sair do campo, usar Voltar, fechar a página ou sair da ficha antecipa a gravação pendente.
- Navegação sem edição e alterações totalmente desfeitas não geram gravação nova.
- O carregamento da ficha, cópia de variante e validação de conclusão suspendem a gravação até o término da operação.
- Campos incompletos continuam permitidos. Histórico, autoria, revisão e confirmação de dados usam os serviços existentes.
- Falha de armazenamento mantém os valores abertos, não confirma o salvamento e impede sair pelo botão Voltar. Uma nova edição ou saída do campo permite tentar novamente.
- Modelagem e Corte também dispensam os seus controles manuais de salvar/atualizar na ficha. As orientações de Variantes, Terceiros, Prova de Roupa e Mostruário foram atualizadas.
- Salvar automaticamente mantém a pendência de integração. O envio e a futura criação no Linx continuam em preparação.

Verificação: 395 testes em 49 arquivos, incluindo agrupamento da digitação, suspensão durante operações, último conteúdo na saída, falha e recuperação, dados de várias abas, reabertura, histórico e sinalização Linx. TypeScript, lint e build aprovados; permanece somente o aviso preexistente em AuthContext.tsx:135.

No navegador com componente real, API de gravação bloqueada e dados sintéticos, descrição, observações de Modelagem e medida foram editadas, salvas e recuperadas ao recarregar. Cabeçalho na ordem solicitada, sem botão de salvar e sem erros de console. Nenhuma dependência adicionada.
