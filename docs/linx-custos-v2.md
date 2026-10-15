# Custos da ficha — integração v2

Implementação e verificação local em 07/10/2026. A aba Custos segue a referência visual enviada: quantidade de produção, editor de outros custos, resumo por grupo com consumo/preço/subtotal, total e custo por variante com média. As informações técnicas ficam em “Detalhes da integração”, fechado inicialmente.

## Por que os valores eram diferentes

Foram comparados os vídeos, a ficha `AC01701J / 00001` e a base `HOMOLOGACAO_COBRANCA` configurada no backend que atende o portal.

1. A consulta anterior filtrava `TECIDO` e `AVIAMENTOS`, omitindo os materiais do grupo `EMBALAGEM`. Esse filtro também estava na importação dos insumos da ficha e nos resumos da coleção.
2. A precificação dependia dos campos manuais de preço e consumo. Eles estavam vazios nas peças importadas, embora o Linx tivesse preços por cor e consumos por posição da grade.
3. A ficha do vídeo do portal anterior tem outros consumos, preços salvos e custos de processo. Esses valores não são iguais aos cadastros atuais do Linx.

Exemplo concreto, cor `00003 — PRETO`, tamanho P:

| Componente | Base atual do Linx | Referência visual anterior |
| --- | --- | --- |
| Malha `01022115` | Consumo 0,084 KG; custo R$ 6,06648252 | Consumo 0,086 KG; subtotal R$ 6,0713 |
| Linha `02170175` | Consumo zero; custo zero | Custo zero |
| Elástico `02180026` | Consumo 0,68 MT × R$ 1,90 = R$ 1,292 | Consumo 0,70 MT × R$ 1,90 = R$ 1,33 |
| Etiqueta | `03030003`, 2 UN × R$ 0,015 = R$ 0,03 | Outro material, `02230002`, 1 UN × R$ 0,0071 |
| Embalagem `03090011` | 1 UN × R$ 1,96 | Preço salvo R$ 2,10 |
| Outros custos | Costura R$ 4,10 | Costura R$ 5,45 e corte R$ 0,25 |
| Total de produção por peça | R$ 13,44848252 | R$ 15,2084 |

O total atual de insumos é R$ 9,34848252. Somando costura de R$ 4,10, o total de produção é R$ 13,44848252, que arredonda para R$ 13,45, valor também observado no cadastro do produto. O cálculo usa os valores completos e arredonda apenas a apresentação. A coincidência com o cadastro foi verificada nesta peça; o preço do cadastro não é usado como substituto do cálculo da ficha.

## Fontes e contrato

- Endpoint novo: `GET /linx/produtos/{produto}/fichas/{versao}/custos/v2`, com os mesmos parâmetros de identidade de marca, coleção, descrição e ficha legada. A resposta deve trazer `versaoIntegracao: "custos-v2"`; o frontend rejeita uma resposta antiga ou de outra peça/versão.
- Materiais: todos os grupos, identificados por produto, versão, item, material e cor. Nenhum filtro limita a lista a tecidos e aviamentos. Grupos não classificados como tecido aparecem no editor de Aviamentos, mantendo seu grupo original no resumo dos custos.
- Consumos: posições físicas `C1` a `C48`, com o nome de tamanho da grade atual. Cores e tamanhos diferentes não são somados entre si.
- Preço do resumo: `MATERIAIS_CORES.CUSTO_A_VISTA`, convertido para a unidade da ficha pelo fator do material. Preços gerais do material, preços de fornecedores e tabelas comerciais continuam disponíveis nos detalhes como fontes distintas.
- Fórmula para materiais não semiacabados: `Cn × preço à vista da cor ÷ fator de conversão × porcentagem de consumo ÷ 100`. A expressão foi conferida na view existente nas posições 1 a 9; a v2 aplica a mesma fórmula às demais posições físicas, com identificação própria dessa regra.
- Operações: `CUSTO_SUGERIDO`, uma vez por fase/valor da rota selecionada, seguindo a deduplicação observada na view. O tempo da operação não multiplica esse custo. Se houver rotas alternativas, é necessário selecionar uma para formar o custo completo.
- Extras: preservam `PRODUTOS_OPE_EXTRA.CUSTO_TOTAL`. Não substituem silenciosamente um total cadastrado por preço × quantidade. Ao editar preço ou quantidade localmente, o usuário passa a usar o cálculo local.
- Os registros completos de fornecedores, operações, extras, preços do produto e diagnóstico continuam disponíveis em “Detalhes da integração”. O total do diagnóstico não é somado ao resumo.

Preços, grade e operações representam os cadastros atuais. Eles não constituem um retrato histórico da data da versão. A ficha legada sem `U_COLECAO` permanece vinculada pelo cadastro atual do produto e pela coleção validada.

## Comportamento no portal

Na ausência de preços manuais, a ficha importada utiliza a base Linx assim que a consulta termina. Rascunhos com preços manuais mantêm a base Portal. O usuário pode selecionar a base, cor, tamanho e quantidade na aba Custos e ajustar os outros custos separadamente por variante.

Essas escolhas e ajustes fazem parte do rascunho local da variante, salvo pelo botão **Salvar rascunho**. Eles não atualizam o SQL nem criam uma versão de ficha no ERP. Reconsultar os dados do Linx não sobrescreve os ajustes locais. Selecionar outra rota reinicia a lista de outros custos para carregar as operações correspondentes.

A precificação compartilha a seleção de custos da variante. Por padrão soma tecidos, aviamentos e embalagens, preservando a escolha anterior do usuário de precificar pelos insumos. A opção “Custo de produção completo, com outros custos” também permite incluir os processos. Ambos os modos usam o custo **por peça**, independentemente da quantidade de produção.

Dados ausentes, materiais sem vínculo de cor e semiacabados sem regra de custo validada permanecem pendentes. Zero cadastrado é válido; dado ausente não vira zero. A média por variante permanece pendente se algum custo exigido não estiver confirmado.

## Validação

- 101 testes de frontend em dez arquivos: composição completa, posição 48, seleção por cor/tamanho, rota alternativa, valores ausentes, unidade de consumo, preços manuais, precificação, rascunho salvo e reabertura.
- 46 testes de backend em cinco classes: serviço de custos, ficha, controller, mapeamento de leitura e integração Linx; sem falhas.
- Build TypeScript/Vite e ESLint dos arquivos alterados aprovados.
- Requisição autenticada real ao endpoint v2: HTTP 200, marcador `custos-v2`, cinco materiais × 48 posições = 240 linhas, 17 registros de operações e cinco registros de fornecedores para `AC01701J / 00001`.
- Conferência no navegador do portal em `localhost:5173`: resumo com os cinco materiais, produção R$ 13,4485 e precificação com base de insumos R$ 9,3485. A prévia também verificou alteração de tamanho/quantidade, ajuste por variante e persistência após recarregar.

Todas as consultas ao Linx usadas nesta alteração são de leitura. Não foi feita publicação nem alteração de dados no ERP.
