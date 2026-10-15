# Conferência de entrega por variante

Implementado em 07/10/2026, conforme as respostas do estilista nesta conversa.

## Como usar

1. Em Geral, selecione todos os tamanhos e confirme que a grade está completa, não somente o piloto.
2. Em Tecidos/Aviamentos, identifique manualmente a **Finalidade do insumo**: zíper, etiqueta, elástico, entretela ou outro. O sistema não deduz a finalidade pelo nome, grupo ou texto de Uso e não altera cadastros Linx.
3. Somente para elásticos, abra **Consumo por tamanho** e digite os valores para todos os tamanhos da grade. Não há distribuição automática nem conversão de unidade.
4. Ao mudar manualmente da etapa 1 para 2 pelo campo **Etapa**, a tela de movimentação mostra **Conferência antes da entrega**, separada por variante. Nenhuma resposta é pré-selecionada. O botão **Avançar etapa** segue direto e não abre essa confirmação.
5. Para cada componente ausente, responda **Sim** (mantém pendência até cadastrar/identificar o insumo) ou **Não — este item não se aplica**. “Preciso revisar” permanece sem confirmação e impede a entrega.
6. Para cada elástico com consumo zero, marque a confirmação nominal de que **não é usado naquele tamanho daquela variante**. Vazio não pode ser dispensado. A antiga opção booleana “Não se aplica” sozinha não libera elástico; revise o valor, digite zero quando correto e confirme na entrega.

Um componente cadastrado não pode ser marcado como não aplicável. A classificação ou remoção deve ser feita explicitamente pelo usuário; o sistema nunca apaga insumos para liberar a ficha.

## Independência e revalidação

- Respostas de uma variante não liberam outra. Nova variante copia os dados principais, mas não copia declarações de não uso de elástico.
- As respostas guardam nome/identificador do usuário autenticado no portal e data/hora. Não é usado o nome do destinatário da próxima etapa como autor da confirmação.
- Cada declaração é vinculada a um retrato do identificador da variante, grade, identificadores/nome/código/finalidade dos insumos, preços/unidades, consumo geral na unidade do preço e consumos por tamanho. Alterar esses campos invalida as respostas anteriores daquela variante. Reordenar insumos não invalida; reordenar a grade exige nova conferência. Confirmações antigas sem esse retrato precisam ser refeitas.
- Alterações em apenas outra variante não invalidam a variante que permaneceu igual.
- O editor de insumos também limpa as declarações daquela variante ao alterar outros detalhes dos materiais, como cores, fornecedores ou observações. Os valores permanecem preservados; somente as confirmações precisam ser refeitas.
- Editar um valor por tamanho remove sua confirmação de zero. O retrato também impede que outros zeros confirmados anteriormente sejam reutilizados depois de alterações relevantes na variante.
- “Salvar rascunho” continua permitindo ficha incompleta e não chama a conferência. Não há bloqueio de atualização parcial.

## Fluxo e persistência

Atualização de 08/10/2026: toda peça nova começa em **01 geração de ficha**, tanto na criação local quanto no serviço de criação do backend. O botão **Avançar** segue uma etapa por clique, até **20 Final**, sem disparar integração automaticamente.

A pedido do usuário em 08/10/2026, **Avançar etapa** salva diretamente a próxima etapa, inclusive **01 geração de ficha → 02 engenharia recebimento**, sem abrir confirmação e sem chamar o serviço de conferência. O avanço preserva os campos, responsáveis e declarações existentes; não marca dados pendentes como conferidos.

A movimentação manual continua disponível pelo campo **Etapa**. As validações específicas da entrega manual, **Concluir ficha** e **Integrar no Linx — preparar** permanecem separadas do avanço direto e não foram removidas.

Na entrega manual de 01 → 02, o frontend lista as pendências com variante, insumo e tamanho e fornece o caminho de correção. O backend recalcula as mesmas regras em `POST /fichas/conferencia`, autenticado e restrito à marca. Erro/indisponibilidade/reprovação do backend não confirma a entrega. A rota de movimentação simples do backend continua bloqueando essa passagem sem conferência; ela não é chamada pelo botão de avanço direto da ficha local.

As declarações e o antes/depois ficam no **rascunho/histórico do navegador**, somente quando salvos ou na entrega confirmada. A tela de movimentação aberta pela coleção também guarda localmente as respostas quando se escolhe abrir a ficha para corrigir, sem mudar a etapa. Fechar essa tela sem salvar nem corrigir descarta as respostas ainda não guardadas. No formulário da ficha, as respostas continuam no estado do rascunho até salvar.

Não foram criadas tabelas, não há auditoria central nem assinatura digital. O backend valida o retrato recebido, sem persistir ficha ou histórico; portanto esta trilha local não é prova inviolável de autoria. Não foi implementada uma nova matriz de permissões por cargo, que ainda não foi definida. Somente um usuário identificado no portal pode registrar as declarações pela interface.

## Limites preservados

- Nenhuma integração/gravação no Linx foi executada ou habilitada.
- Nenhum acesso ao `.3` ou alteração SQL foi realizado nesta etapa.
- Não se atribuem tamanhos a C1…C48 pela posição da grade.
- Consumos por tamanho não recalculam automaticamente o consumo geral ou os custos Linx.
- Para zíper, etiqueta e entretela, consumo por tamanho não se tornou obrigatório. A confirmação de aplicabilidade permanece por variante.
- Preços permanecem manuais, com as validações já existentes; zero no **preço** não exige a declaração de não uso, que se aplica exclusivamente ao **consumo por tamanho do elástico**.

## Verificação

Testes offline com dados sintéticos e chamadas API/repositórios substituídas: componentes ausentes, Sim sem insumo, Não com identificação/data, zero confirmado/não confirmado, legado/vazio, alteração do retrato, cópia de variante, contrato TypeScript/Java, falha do backend, histórico local e salvamento parcial. Não foi usado o CM nem os bancos para testar.
