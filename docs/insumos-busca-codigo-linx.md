# Busca de tecidos e aviamentos por código Linx

Verificação em 08/10/2026 com SELECT em `192.168.1.6:1433`, banco `HOMOLOG_COBRANCA`, servidor `srv-sql-dev`, conexão criptografada. O `.3` não foi acessado.

O catálogo comum é `dbo.MATERIAIS`; as cores de cada código pertencem a `dbo.MATERIAIS_CORES`. O endpoint de leitura `GET /linx/materiais/cadastro?codigo=...` consulta o código exato sem limitar o grupo a tecidos.

## Amostra confirmada

Material `02160210`: `ZIP NYLON SEP DESL 60CM PUX COR DO ZIPER`, grupo `AVIAMENTOS`, subgrupo `ZIPER`, unidade de estoque e da ficha `UN`. Foram encontradas 27 cores, incluindo `00002/BRANCO`, `00003/PRETO` e `00004/MARINHO`. Os códigos de cor são preservados como texto, inclusive zeros à esquerda.

```sql
SELECT MATERIAL, DESC_MATERIAL, GRUPO, SUBGRUPO, UNID_ESTOQUE, UNID_FICHA_TEC
FROM dbo.MATERIAIS
WHERE MATERIAL = '02160210';

SELECT COR_MATERIAL, DESC_COR_MATERIAL
FROM dbo.MATERIAIS_CORES
WHERE MATERIAL = '02160210'
ORDER BY COR_MATERIAL;
```

Os metadados confirmam `LARGURA`, `COMPRIMENTO` e `U_ALTURA` como `varchar`, e `U_RENDIMENTO` como `numeric`. Nesse zíper as duas primeiras dimensões estão vazias e as demais são nulas. A API lê as dimensões como texto; o formulário aceita somente largura numérica para o tecido, sem presumir conversão de unidade.

## Comportamento no portal

**Regra atualizada em 13/10/2026:** a automação passou a usar o preço do fornecedor por cor, e o cadastro passou a guardar informações independentes por cor. As referências ao custo à vista da cor nas seções anteriores descrevem o comportamento anterior. Consulte a atualização ao final.

- Gestão e ficha técnica compartilham a busca pelo código para tecidos e aviamentos. O modal de Gestão recebe o tipo correto do insumo.
- A busca preenche nome e unidade. A cor é escolhida explicitamente entre as cores daquele material e fica vinculada ao insumo.
- Gramatura, encolhimento e rendimento são exclusivos do formulário de tecido. Rendimento aparece somente para kg. Aviamentos não recebem esse bloco técnico.
- Consumo continua manual. Ao escolher uma cor do Linx, o preço é preenchido pelo `MATERIAIS_CORES.CUSTO_A_VISTA` da cor exata, com a fonte identificada. O preço continua editável. A composição continua manual; a construção permanece manual nos tecidos.
- A referência da cor, a composição e os detalhes do cadastro são preservados no navegador. Nenhuma consulta de material modifica o catálogo Linx.

Validação: testes de interface com respostas simuladas, testes do backend com dimensões vazias e verificação real somente leitura do cadastro do zíper. Não houve teste de gravação nem integração de peça.

## Cadastros ativos, fornecedores e valores

Os metadados consultados no `.6/HOMOLOG_COBRANCA` confirmaram `INATIVO` do tipo `bit NOT NULL` em `MATERIAIS`, `MATERIAIS_CORES`, `FORNECEDORES` e `CADASTRO_CLI_FOR`. `MATERIAIS_FORNECEDOR` não possui esse indicador. A busca agora exige `INATIVO = 0` no material e na cor; os vínculos de fornecedor exigem também fornecedor e cadastro ativos. O autocomplete global de fornecedores aplica a mesma restrição.

As FKs relacionam `MATERIAIS_FORNECEDOR(MATERIAL, COR_MATERIAL)` com `MATERIAIS_CORES`, e `FORNECEDOR` com `CADASTRO_CLI_FOR.NOME_CLIFOR`. `FORNECEDORES.FORNECEDOR` também referencia `NOME_CLIFOR`. O vínculo cor/fornecedor usa esses campos; não deduz uma relação pela semelhança do nome.

O material do print, `01010001 / INDIGO SQUASH PLUS TAIHAY4013AM`, está inativo. A cor `00001 / UNICA` e seus cinco fornecedores Vicunha estão ativos, com custo de reposição 23,16000, mas o material não fica disponível para novos cadastros. Nenhum registro antigo da ficha foi apagado por esse filtro.

Atualização de 09/10/2026: o formulário de criação/edição aceita múltiplas cores tanto em tecidos quanto em aviamentos. O dropdown permanece aberto ao marcar/desmarcar itens, tem `Selecionar todos` e não adiciona uma mesma cor Linx duas vezes. Todas as cores selecionadas são preservadas ao salvar/reabrir e ao reconsultar o código, inclusive cadastros antigos que já possuíam várias cores. `Escape` fecha primeiro o seletor, sem fechar o cadastro.

Os fornecedores continuam separados logo abaixo. A seleção de cores restringe o autocomplete à união dos fornecedores vinculados às cores selecionadas. Escolher fornecedores antes das cores restringe as novas opções às atendidas por ao menos um deles. Seleções antigas fora das opções filtradas não são removidas silenciosamente por `Selecionar todos`. Ao salvar, cada cor conserva apenas os fornecedores escolhidos com vínculo real a ela.

### Fontes dos valores

- `MATERIAIS.CUSTO_A_VISTA` e `CUSTO_REPOSICAO`: referências gerais do cadastro, exibidas separadamente das referências específicas.
- `MATERIAIS_CORES.CUSTO_A_VISTA` e `CUSTO_REPOSICAO`: referências filtradas pela cor e pelos fornecedores escolhidos.
- `MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO`: referência do vínculo material/cor/fornecedor, acompanhada de `UNIDADE` e `FATOR_CONVERSAO_FORNECEDOR`.

As fontes continuam disponíveis na resposta de leitura, mas a lista de valores com botões `Usar este valor` foi retirada deste formulário. A automação usa somente o custo à vista da cor e a unidade de estoque do material, desde que ela coincida com a unidade do insumo, considerando aliases conhecidos (ex.: MT/Metros). A fonte escolhida para esta interface corresponde à rotina de cálculo anteriormente analisada, sem declarar que todas as rotinas do ERP usam a mesma regra. Não há fallback para custo geral, reposição ou fornecedor. Nenhum fator é aplicado. Unidade ausente/diferente requer revisão ou preço manual, sem conversão presumida. Null/vazio não gera valor zero; zero cadastrado é preservado como zero.

A seleção individual de uma nova cor também a coloca em edição para consultar seu custo à vista e propriedades. Clicar no bloco de uma cor já selecionada permite colocá-la em edição sem remover as demais. `corEmEdicaoId` e o vínculo `corLinx` identificam o contexto do preço/propriedades exibidos; esse contexto é preservado no navegador. Não há média, soma ou escolha arbitrária de um preço único ao selecionar várias cores de uma vez. A definição de preços individuais por cor versus preço único ainda foi solicitada ao usuário; não foi criada uma regra de cálculo para várias cores.

Se a cor em edição não possuir um valor válido/compatível, o preço fica vazio, não conserva o anterior. Digitar outro preço remove a origem Linx. Abrir ou reconsultar o cadastro não substitui um preço manual existente; consultas atrasadas não restauram uma seleção de cor ou preço que o usuário já modificou. Remover um fornecedor não altera o custo à vista da cor, pois esse valor não é do fornecedor.

O botão `Cor personalizada` está sempre disponível, mesmo sem cores no Linx. Ele abre o seletor já existente e adiciona a nova cor sem remover as demais. A cor personalizada entra em edição com preço manual no campo `Preço`, sem referência de cor/preço Linx. A cor e tonalidade são mantidas no portal; não criam nem alteram cadastros globais Linx. Gramatura e encolhimento de uma cor Linx anterior não são reaproveitados na cor personalizada.

Seleções antigas sem vínculo ativo são sinalizadas para revisão após a consulta, não apagadas silenciosamente. A lista de novas opções contém somente ativos. A ausência de fornecedores vinculados não dispara busca no catálogo global como fallback.

Amostra real de aviamento ativo: `02160210`, fornecedor `010029 / SANCRIS - STEFFEN`; cor `00002 / BRANCO`, custo 2,81300/UN; cor `00003 / PRETO`, custo 3,04100/UN; cor `00004 / MARINHO`, custo 2,81300/UN. O fator cadastrado nas três relações é 1. Isso confirma que o valor pode variar pela cor para um mesmo material e fornecedor, sem instituir prioridade universal de custos.

## Atualização — fornecedor e informações independentes por cor (13/10/2026)

Regra confirmada pelo usuário: fornecedor escolhido filtra cores; o valor automático vem da relação material/cor/fornecedor. O formulário usa `MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO`, único campo de preço identificado no vínculo retornado pela API. Não usa custo geral, custo à vista da cor, menor preço nem média como fallback. O valor e a unidade de origem são preservados e a fonte é exibida. Nenhum fator de conversão é aplicado. Relação ausente, várias linhas para a mesma relação, preço nulo/vazio/inválido ou unidade divergente deixam o campo para revisão/preenchimento manual. Zero cadastrado é preservado.

O SELECT do backend já retorna essa relação e exige material, cor, fornecedor e cadastro ativos; não foi alterado nesta entrega. Nenhuma consulta/gravação ao SQL foi executada nesta atualização. A origem foi verificada no código da consulta existente; testes de resposta e UI usam fixtures simuladas.

- Na criação/edição de tecido e aviamento, `Editar informação das cores` abre o editor dentro da mesma janela do cadastro, fechado por padrão mesmo com várias cores. As cores aparecem como abas e somente os campos da cor selecionada ficam abertos. No card do insumo já criado, `Editar informações por cor` continua reabrindo seu editor opcional.
- Cada `coresList[].dadosInsumo` guarda preço, unidade, fornecedor, origem do preço, consumo/metragem e peso (tecidos) ou quantidade (aviamentos), além de observações. Tudo fica no armazenamento do portal, sem novas tabelas.
- Um único fornecedor escolhido e vinculado à cor permite preenchimento automático. Se vários fornecedores escolhidos atendem à mesma cor, ela apresenta seleção explícita; não escolhe o primeiro ou o mais barato.
- Editar preço marca definição manual apenas daquela cor. Fechar/reabrir, trocar a cor em foco e reconsultar o catálogo preservam correções manuais e quantidades. Respostas atrasadas usam o estado mais recente e não substituem uma digitação já realizada.
- A troca explícita do fornecedor de uma cor Linx consulta o valor do novo vínculo; os consumos não são convertidos. Cores personalizadas seguem manuais, inclusive ao escolher fornecedor.
- Os campos principais continuam disponíveis e correspondem somente à cor em foco. `Usar esta cor nos campos principais` muda o contexto. Não soma nem faz média de preços/consumos de cores diferentes. Sem foco definido em um insumo novo com várias informações por cor, o cálculo fica pendente de seleção.
- No cálculo local, tecido por kg usa peso, por metros usa consumo; aviamento usa quantidade. Metragem de referência não vira peso automaticamente. Custos oficiais do Linx continuam separados da definição local.
- Os cadastros antigos são preservados: apenas a cor antes em foco recebe os dados gerais legados; preço/consumo antigos não são replicados para todas as cores. A auditoria local registra os campos por cor alterados.
- O contrato preparado da Principal guarda dados por cor Linx para conferência. Isso não mapeia nem grava preço no ERP; o destino do preço por item continua pendente. Cores personalizadas continuam excluídas desse contrato.

Verificação desta atualização: 224 testes direcionados em 19 arquivos passaram, incluindo 11 casos do menu/contexto por cor. TypeScript, build e lint dos arquivos alterados passaram. A revisão React manteve controles rotulados, Escape limitado ao menu e proteção de dados atuais contra respostas atrasadas. Nenhuma escrita ERP ou reserva de código foi habilitada/testada. Na criação é necessário confirmar `Criar insumo`/`Salvar alterações` para guardar o cadastro; fechar apenas o menu não descarta as informações já digitadas.

### Primeira versão do painel lateral (13/10/2026, substituída pela refatoração abaixo)

O painel fica fora do formulário principal e acompanha a mesma `coresList`, sem cópia de estado. Selecionar/desmarcar uma cor do Linx, adicionar uma cor personalizada ou remover um tile atualiza a lista de campos imediatamente. As informações das cores mantidas não são reinicializadas. Se todas forem removidas, o painel apresenta um estado vazio e permite continuar selecionando cores no cadastro.

Os dois painéis compartilham um único diálogo e a navegação de teclado. Fechar o editor de cores (inclusive por Escape) mantém o cadastro aberto, preserva as informações digitadas e devolve o foco ao botão. Em telas largas o cadastro fica à esquerda e o editor à direita, cada um com rolagem própria; em telas menores os painéis ficam empilhados dentro da área rolável. `Criar insumo`/`Salvar alterações` continua sendo a confirmação que salva o cadastro. Nenhuma API, regra de preço, tabela ou integração ERP foi modificada para essa mudança visual.

Verificação do painel lateral: 227 testes em 19 arquivos passaram na rodada final, incluindo inclusão/remoção de cores Linx e personalizadas, estado vazio, preservação de valores, criação/reabertura e foco do teclado. Build de produção, TypeScript, lint e formatação dos arquivos alterados passaram. O navegador confirmou tecido e aviamento em uma página isolada com respostas simuladas; o layout foi conferido em 1440×900 e 390×844. Nenhum backend foi iniciado, nem banco SQL consultado ou alterado. O servidor exclusivo de preview foi encerrado após a conferência.

Para repetir somente a verificação visual, use `tests/manual/insumo-cores/vite.config.ts` com Vite e abra `/tests/manual/insumo-cores/index.html` na porta local 5192; `?tipo=aviamento` seleciona o segundo formulário. Esse preview usa apenas fixtures e memória da página, intercepta o serviço Linx e bloqueia chamadas à API real/rede externa. A imagem de evidência foi salva em `C:/King-Joe-Projects/outputs/insumo-cores-painel.png`.

### Densidade compacta e janela única (13/10/2026)

O vídeo `20261013-1454-53.6730998.mp4` mostrou espaçamentos/fontes ampliados pelo CSS da ficha, prévia de insumo muito alta e rolagem horizontal no painel estreito. A refatoração limita a densidade à ficha e ao cadastro de insumo, sem modificar o zoom do navegador ou os demais módulos. Os campos da ficha têm fonte de 13 px e altura de 32 px no desktop; textos de apoio são menores, cabeçalho/abas/blocos têm menos espaço e alvos de toque mantêm altura maior em dispositivos com ponteiro grosseiro.

O cadastro agora tem uma única superfície, cabeçalho e rodapé. Cores/fornecedores são organizados em colunas no desktop; o resumo vira uma faixa compacta quando o editor está aberto. O editor de cores fica dentro da janela e usa abas acessíveis por teclado (setas, Home/End), mostrando uma cor de cada vez. A origem do preço e orientações extensas continuam disponíveis em áreas recolhíveis. Textos longos quebram linha e fieldsets/controles respeitam a largura, sem arrastar a área de cores horizontalmente.

A lista e os valores continuam controlados pelo mesmo estado. Adicionar/remover cores atualiza as abas; trocar/fechar/reabrir preserva as informações das cores mantidas. Em telas pequenas as áreas ficam empilhadas com uma única rolagem do conteúdo; cabeçalho e ação de salvar permanecem fora dessa rolagem. A página de fundo fica bloqueada enquanto o cadastro está aberto e seu estado de rolagem é restaurado ao fechar. Nenhuma regra de preço, quantidade, gravação ou integração ERP foi alterada.

A conferência visual foi isolada: cadastro em 1366×768, ficha em viewport de desktop e teste móvel em 390×844; confirmou campos de 32 px/13 px, ausência de rolagem horizontal com nomes longos e empilhamento sem sobreposição. O preview usa o CSS real da ficha para detectar herança de estilos, e aceita `?unidade=kg` e `?tipo=aviamento&longos=1`. Evidências: `C:/King-Joe-Projects/outputs/insumo-cores-compacto.png` e `C:/King-Joe-Projects/outputs/ficha-tecnica-compacta.png`. Os servidores de preview foram encerrados; não houve acesso ao SQL/CM ou inicialização do backend real.

Verificação final: build de produção/TypeScript, lint dos arquivos alterados, Prettier e diff sem erros de whitespace passaram. Foram verificados 229 testes em 19 arquivos: 17 arquivos/202 testes passaram na rodada ampliada; dois workers do pool de processos não iniciaram dentro do prazo, e os dois arquivos restantes (`fichaProcesso` e `fichaConferenciaEntrega`) foram executados isoladamente em um pool de threads, com 27 testes aprovados. Não houve falha de asserção nesses arquivos. Os 16 casos do editor de cores incluem navegação por teclado, preservação de valores, remoção/inclusão de cores e restauração da rolagem da página ao fechar.
