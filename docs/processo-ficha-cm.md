# Ficha técnica: processo confirmado no CM

## O que foi incorporado

- Rascunho continua parcial, salvo no navegador (localStorage para a ficha e IndexedDB para arquivos), sem escrita SQL ou integração Linx.
- Tamanhos de Geral são compartilhados com a modelagem, os consumos por tamanho dos insumos e o contrato de futura integração. Não se inicia uma peça nova com uma grade fictícia.
- Fichas antigas podem trazer as posições nomeadas da grade atual do produto. Quando CONSUMO_P_TAMANHO está ativo, C1…C48 são ligados aos respectivos TAMANHO_n. NUMERO_TAMANHOS não determina sozinho a grade e a grade atual não reconstitui uma grade histórica.
- Saída da etapa de geração da ficha e demais mudanças para etapas não iniciais exigem conferência local e no backend. Não há encaminhamento automático para Engenharia: o fluxo Direto observado pode seguir para revisão, enquanto Piloto passou pela etapa 02.
- A grade completa é confirmada pelo usuário. Zíper, etiqueta, elástico e entretela precisam de decisão explícita por variante. “Não se aplica” dispensa somente essa variante; não altera o catálogo ou as regras globais. A matriz de permissões especial para dispensas ainda não foi definida: não foram inventados cargos aprovadores.
- Finalidade do insumo é classificação explícita. Nem nome, grupo/subgrupo nem o texto de Uso determinam a obrigatoriedade. Item existente contradiz a dispensa do mesmo componente.
- Consumos por tamanho dos quatro componentes precisam ser positivos ou explicitamente não aplicáveis naquele tamanho. Zero não é tratado automaticamente como dispensa. Consumo geral e preço continuam manuais. Outros insumos têm sua finalidade marcada como Outro, sem inferência de regras adicionais.
- Preço manual é do insumo dentro da variante, não do catálogo global. Preço zero é aceito; vazio não vira zero. Preço × consumo na mesma unidade é somente o custo simples do consumo, não o custo total do ERP. Terceiros ficam fora do cálculo. Alterar unidade exige preencher os consumos novamente, sem conversão presumida.
- Antes/depois dos consumos por tamanho, da finalidade e das decisões aparecem na trilha de alterações com usuário e horário. Nova variante copia os insumos independentemente, mas precisa de suas próprias decisões de aplicabilidade.
- Nas etapas Final e de prontidão para Integração Linx configuradas no projeto, Concluir ficha faz a conferência e salva a conclusão. Isso atende também ao fluxo Direto observado no CM; entrar na etapa Integração Linx não representa envio ao ERP. Depois aparece “Integrar no Linx — preparar”, que pode ser usado imediatamente ou posteriormente. Edições ou mudança de anexos invalidam a conclusão para a revisão atual, sem apagar versões integradas e sem criar uma versão Linx.
- O contrato JSON preparado inclui identidade da peça, griffe, coleção/DESC_COLECAO, revisão, campos da ficha e manifesto de anexos. Status é PENDENTE_MAPEAMENTO, nunca CONFIRMADA. Arquivos IndexedDB não são enviados ao ERP por URLs locais.
- A leitura da ficha atual exige a VERSAO_FICHA indicada em PRODUTOS, dentro do vínculo de coleção/griffe. Não seleciona uma versão apenas por ser a maior ou a mais recente de outra ficha.

## Backend e limites da arquitetura atual

`POST /api/v1/fichas/conferencia` valida o rascunho recebido, exige autenticação e acesso à marca, mas não persiste a ficha. O frontend somente efetiva a entrega local depois de receber `valida: true`; falhas bloqueiam a entrega, não o rascunho.

As rotas antigas de mudança de etapa (Peças e Kanban) e a criação direta em etapa avançada não podem contornar essa conferência. Para peças já cadastradas no backend existe `POST /api/v1/pecas/{id}/entrega?novaEtapa=...`, com o mesmo corpo de conferência e verificação de propriedade da peça. Essa operação altera somente a etapa no banco do portal, caso um cliente autorizado a invoque. Ela não é invocada pelo editor local nem envia dados ao Linx.

O backend ainda não guarda uma ficha técnica canônica completa. Sua validação atesta o conteúdo enviado no pedido, não uma comparação com uma ficha persistida no servidor. Não é um mecanismo antifraude sobre localStorage. Centralizar fichas, decisões, auditoria e anexos em armazenamento do portal é uma etapa adicional, com definição do banco e autorização de migração. Nenhuma migração/DDL foi criada ou executada nesta implementação.

## Pendências deliberadamente não simuladas

1. API/procedimento de gravação e recibo de integração Linx; transação, idempotência e confirmação da revisão realmente enviada.
2. Destino do preço manual por item e variante. As tabelas PRODUTO_VERSAO_MATERIAL e PRODUTO_VERSAO_MATERIAL_COR analisadas não têm um campo de preço por item identificado. Não atualizar MATERIAIS globalmente para acomodar esse preço.
3. Regra de preço automático: material, cor e fornecedor têm valores diferentes. Nenhuma prioridade foi escolhida.
4. Associação da variante do portal com a cor ERP, ordem C1…C48 de uma grade aprovada, campos fiscais/operacionais obrigatórios e transporte dos anexos.
5. Modelagem do portal usa referência de peça. No ERP, PRODUTOS.MODELAGEM se relaciona com PRODUTOS_MODELO.MODELAGEM, não com PRODUTOS.PRODUTO. Sem equivalência aprovada, esse campo não deve ser enviado automaticamente.
6. Características, opções do seletor de Medidas e regras completas de Corte continuam pendentes de definição, como solicitado anteriormente. Nenhum conteúdo fictício novo foi cadastrado.

## Verificação manual

1. Criar peça em coleção nova, preencher um campo e salvar rascunho: deve permitir reabrir o preenchimento parcial.
2. Escolher tamanhos em Geral, adicionar insumos, expandir e preencher finalidade/consumos por tamanho. Consumos de variantes devem permanecer independentes.
3. Entregar para outra etapa com pendências: deve mostrar a pergunta de aplicabilidade e os campos faltantes, sem mudar a etapa. Escolher responsável ativo com acesso à marca, corrigir e confirmar a grade.
4. Desligar a API ou receber reprovação: entrega deve continuar bloqueada; salvar rascunho deve funcionar.
5. Na etapa Final, concluir, preparar a integração e baixar o contrato. Verificar preço manual e identidade da coleção. Nada deve aparecer como integrado ou gerar versão integrada.
6. Alterar preço, consumo ou anexo: deve exigir nova conclusão. Verificar histórico antes/depois. Conferir que outra coleção com o mesmo código não recebe a preparação desta ficha.

Testes são isolados com dados de fixture, sem conexão aos bancos .3 ou .6 e sem mudanças no CM. Não iniciar um backend de produção para executar esses testes.

Para reproduzir somente a conferência visual, a página `tests/manual/ficha/index.html` usa uma configuração dedicada: `node node_modules/vite/bin/vite.js --config tests/manual/ficha/vite.config.ts`. Acesse `http://127.0.0.1:5191/tests/manual/ficha/index.html`. A API é substituída exclusivamente nesse servidor de teste, requisições externas são bloqueadas e nenhum proxy para 8080 é usado. Essa fixture confirma a UI, não a comunicação com um backend real. O contrato HTTP do backend é verificado separadamente por MockMvc e os serviços por testes unitários, sem banco.
