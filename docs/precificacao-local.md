# Precificação da ficha técnica

O custo usado em Precificação é a soma dos custos de consumo dos tecidos e
aviamentos da variante selecionada, com os preços manuais do rascunho do portal:

- Tecido: preço por unidade × consumo nessa unidade.
- Aviamento: preço por unidade × quantidade nessa unidade.

A aba Custos usa o mesmo somatório no total do rascunho. Terceiros, operações e
outros custos do ERP não participam dessa base. Não se combinam variantes nem
cores/tamanhos do Linx. Se um insumo não tiver preço, consumo/quantidade ou unidade
válidos, o total e o preço final ficam pendentes; um zero explícito é válido.

O markup inicia em 2,85 e pode ser editado. Cada variante mantém seu modo,
markup, margem de lucro e preço aprovado de forma independente:

- Markup: preço final = custo × markup, com markup maior que zero.
- Margem: preço final = custo ÷ (1 − margem ÷ 100), com 0 ≤ margem < 100.
- Percentual do custo: custo ÷ preço final × 100.
- Final vs. Aprovado: preço aprovado − preço final.
- Percentual da diferença: diferença ÷ preço final × 100.

Preço aprovado vazio deixa a comparação pendente. Preço final zero não admite
percentuais de comparação. A interface aceita ponto ou vírgula decimal, sem
separadores de milhar, mostra moeda com quatro casas e percentuais com duas,
sem arredondar os valores intermediários.

Exemplo do print: custo 110, markup 2,85 e aprovado 300 produzem preço final
313,5000, custo de 35,09%, diferença de −13,5000 e −4,31%.

“Salvar rascunho” persiste os parâmetros em `fichaTecnica.variantes[].precificacao`
no armazenamento local da peça e registra as alterações no Histórico. A cópia da
Principal copia seus parâmetros e permite edição independente. Os valores não
substituem os campos de preço/custo de origem do ERP nem são enviados ao banco.
