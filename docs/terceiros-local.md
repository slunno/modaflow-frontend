# Terceiros na ficha técnica

Cada detalhe de produção contém, nesta ordem: tipo e fornecedor, observações do terceiro,
Complementos — Estampa (Tela e Tradução), Custos do processo, Uso em variantes, Técnicas,
Observações com título e descrição e Imagens.

Os tipos sugeridos correspondem ao print: Acabamento, Amaciado, Bord, Bordado, Estamaparia,
Estampa, Estamparia, Lavanderia, Lavanderia + silk, Lumen, Silk, Silk interno, Sublimação,
Vay vay. O usuário também pode digitar outro tipo. O fornecedor usa a consulta existente do Linx.

Tela e Técnicas reutilizam o seletor de opções salvas dos usos de Tecidos e Aviamentos.
Cada campo tem seu próprio catálogo local, isolado dos demais, por tipo original de peça
(subgrupo Linx ou tipo selecionado na criação), compartilhado entre todas as marcas.
As chaves são `modaflow_product_terceiros_v1:<tipo-normalizado>:tela|tecnica`.
Salvar uma opção atualiza os seletores do mesmo catálogo na página e em outras abas do
mesmo navegador. Remover uma opção do catálogo preserva o texto das fichas já preenchidas.
Limpar seleção remove apenas o valor do detalhe atual.

Custos podem ser adicionados e removidos individualmente, com valor em reais e observação.
Aceitam vírgula ou ponto decimal e zero explícito; valores inválidos recebem indicação no campo.
Os custos deste processo não entram no cálculo da Precificação, cuja fonte escolhida é
tecidos e aviamentos da variante.

O processo é vinculado pelos IDs das variantes marcadas. Renomear uma variante mantém o
vínculo; remover a variante também remove sua associação; novas variantes exigem seleção.
A aba Variantes mostra os processos aplicados a cada uma, sem copiar os dados do processo.

Imagens podem ser adicionadas uma a uma, substituídas e removidas, com limite de 2 MB cada.
A imagem única das fichas antigas continua disponível e não é descartada ao acrescentar imagens.

Os dados do detalhe são guardados com **Salvar rascunho**, usando o armazenamento local da
ficha e seu histórico de alterações. Imagens são identificadas no histórico por nome e assinatura,
sem duplicar base64. Os catálogos são salvos ao clicar **Salvar tela** ou **Salvar técnica**.
Nenhum destes campos é enviado ao banco ou ao Linx. O armazenamento é deste navegador/origem.

Preview isolado: executar `npx vite --config tests/manual/ficha/vite.config.ts` e abrir
`http://127.0.0.1:5191/tests/manual/terceiros/index.html`. Dados de teste e API isolada.
