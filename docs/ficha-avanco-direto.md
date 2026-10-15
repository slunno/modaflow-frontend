# Avançar etapa sem confirmação

O botão **Avançar etapa** passa imediatamente à próxima etapa da ficha e salva o rascunho local. A passagem de **01 geração de ficha** para **02 engenharia recebimento** agora usa o mesmo fluxo direto das demais etapas.

- Não abre a janela de confirmação nem chama `POST /fichas/conferencia`.
- Preserva os campos do rascunho, fluxo, responsável, previsão, observações, variantes e declarações de conferência existentes.
- Grade pendente e ausência de responsável não bloqueiam o avanço direto nem são preenchidas automaticamente.
- Falha ao salvar mantém a etapa anterior e exibe a mensagem de erro existente.
- **20 Final** continua sendo o fim da sequência. A mudança de etapa mantém a detecção de alterações pendentes para o Linx.
- O campo **Etapa** continua abrindo a alteração manual. A conferência da entrega manual e as validações de conclusão/preparação permanecem disponíveis.

Verificação: **386 testes aprovados em 48 arquivos**, incluindo avanço imediato, serviço de conferência indisponível, rascunho/reabertura, preservação de dados, falha de armazenamento, cancelamento da movimentação manual e término da sequência. TypeScript, build e lint aprovados; lint mantém somente o aviso preexistente de dependência do efeito em AuthContext.tsx:135.

No navegador, o componente real avançou de 01 para 02 com 0/3 áreas conferidas e sem responsável. Não houve diálogo nem erro de console. O botão de integração passou de cinza para verde após a mudança. Foram usados dados sintéticos e API de gravação bloqueada.
