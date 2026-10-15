# Escolha ao criar uma variante

Ajuste solicitado em 08/10/2026, após o reposicionamento das miniaturas.

- Removido o seletor **Variante em edição** da aba Variantes. A seleção continua pelas miniaturas. Os seletores de tecidos, aviamentos, custos e precificação continuam disponíveis nas respectivas abas.
- Removido o botão **Duplicar variante** do cabeçalho da aba.
- **+ Nova variante** abre a janela **Criar variante**, com duas ações: **Nova variante** e **Duplicar variante**. Abrir, cancelar ou fechar com ESC não cria registros.
- Suposição adotada: **Nova variante** começa vazia, sem imagem, tecidos, aviamentos ou parâmetros de custo/precificação da variante de origem. **Duplicar variante** copia a variante atualmente selecionada; o nome da origem aparece na janela. A grade continua herdada da peça.
- A duplicação mantém a lógica existente de cópia independente de anexos, IDs de insumos e consumos por tamanho. Cores de vínculo Linx e confirmações continuam sendo limpas conforme as regras existentes.
- Os dois caminhos permanecem em rascunho até **Salvar rascunho**. A seleção muda para a variante criada. As variantes anteriores são preservadas.
- O Dialog recebeu opções de largura e rótulo de fechamento; os padrões das demais janelas foram mantidos. A nova janela tem foco preso, restauração de foco e fechamento por ESC.

## Validação

- Suíte completa: 47 arquivos e 380 testes aprovados.
- Novos testes cobrem a criação vazia, preservação de imagem/insumos das variantes anteriores, grade herdada, gravação e recuperação do rascunho, cancelamento e restauração do foco. Os testes de duplicação e vínculos existentes foram adaptados à escolha explícita.
- Typecheck, lint e build aprovados. Lint mantém somente o aviso preexistente em AuthContext.tsx:135.
- Revisão em desktop e celular 390 × 844, com dados de demonstração e API real bloqueada. Ambas as escolhas e o cancelamento foram exercitados na interface; nenhuma criação de teste foi feita na ficha do usuário.
- Serviços, schema de armazenamento, tipos de negócio, mocks existentes e dependências preservados. Sem envio ao Linx.
- Aplicação ao checkout original por comparação com o commit anterior e verificação por SHA-256, preservando HEAD, index e alterações preexistentes.

Arquivos principais: PecaFichaTecnicaView.tsx, VariantsTab.tsx e FichaPrimitives.tsx.
