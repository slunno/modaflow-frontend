# Perfil de cadastro para criação de produto — orientação à TI

13/10/2026. Preparação e documentação, sem gravação no ERP. Metadados do `.6/HOMOLOG_COBRANCA` conferidos na auditoria anterior deste chat: 45 colunas não nulas, não identity/computed, das quais 29 têm padrão e 16 não têm. Não é necessário criar 45 campos obrigatórios novos no portal.

## Primeiro distinguir os dois casos

1. **O código já existe em PRODUTOS:** reutilizar esse cadastro, validando griffe e referências. Não copiar seus atributos para outro registro nem sobrescrever coleção/tributação ao apenas utilizar a referência. Os dados da ficha precisam de vínculo explícito com a própria coleção e versão. A rotina dessa associação/gravação ainda não está implementada.
2. **O código não existe:** criar cadastro de produto e ficha somente após validar todos os valores necessários, referências e efeitos dos triggers. É nesse caso que o perfil fiscal/operacional é necessário.

Código é digitado pelo usuário. Código de modelo/referência não prova existência nem autoriza edição do cadastro apontado. O planejamento agora é `VERIFICAR_CADASTRO_E_FICHA_COLECAO` quando a peça ainda não tem vínculo confirmado: o servidor deverá decidir criar/reutilizar depois da consulta, não por suposição do navegador.

## O que deve ser definido/aprovado

Os campos sem default e as decisões necessárias para o futuro gravador:

| Campo Linx | Definição necessária |
| --- | --- |
| PRODUTO | Código digitado; conferir existência, identidade e disponibilidade. A PK é global, não produto+griffe+coleção. |
| CLASSIF_FISCAL | Classificação fiscal/NCM aprovada para o produto e existente no catálogo. Não deduzir só de "bermuda", tecido ou código BM. |
| TIPO_PRODUTO | Valor válido do cadastro de tipos; confirmar regra por tipo de produto. Não confundir com TIPO_PP=2. |
| DESC_PRODUTO | Qual descrição do portal alimenta o cadastro e quais restrições/formatação aplicar. |
| GRUPO_PRODUTO | Grupo válido e sua regra de escolha. |
| SUBGRUPO_PRODUTO | Subgrupo válido; validar o vínculo com grupo/tipo, não apenas o rótulo da peça. |
| COLECAO | Código real da coleção no ERP. UUID do portal ou DESC_COLECAO não substitui esse código. |
| GRADE | Grade ERP aprovada; tamanhos precisam corresponder às posições reais. |
| DESC_PROD_NF | Descrição usada na nota fiscal; definir se pode seguir DESC_PRODUTO ou precisa de valor próprio. |
| LINHA | Linha válida no ERP e regra de escolha. |
| GRIFFE | Griffe do cadastro compatível com a coleção/marca autorizada. Não inferir por sufixo. |
| UNIDADE | Unidade do produto acabado, não unidade de consumo do tecido/aviamento. Definir código válido. |
| FABRICANTE | Fabricante do produto acabado; não confundir com fornecedor de cada tecido. |
| PONTEIRO_PRECO_TAM | Parametrização existente de preço por tamanho; validar regra/valor com cadastro aprovado, sem fabricar 48 posições. |
| TRIBUT_ICMS | Código/regra de tributação aprovado e válido no catálogo. Não preencher como zero por conveniência. |
| TRIBUT_ORIGEM | Origem tributária aprovada para o produto, não uma dedução do fornecedor de tecido. |

Um perfil aprovado pode ser parametrização por tipo/griffe ou um cadastro de referência explicitamente escolhido e validado. A equipe de TI precisa confirmar com a área responsável se NCM, tributação e descrição fiscal realmente se aplicam; um cadastro semelhante não é autorização para copiar tudo. Não há envio ou necessidade de compartilhar senha neste documento.

Os demais 29 defaults também precisam ser avaliados para o processo, embora o SQL consiga atribuí-los. Exemplos: EMPRESA=1, ARREDONDA=1 e vários flags=0. Default técnico não garante que empresa, envio a lojas, status, RFID ou tributação sejam os desejados. Não relaxar constraints para contornar dados ausentes.

## Identidade da ficha e atualização

- Produto: `PRODUTOS.PRODUTO` (chave global).
- Versão: `PRODUTO_FICHA_VERSAO(PRODUTO, VERSAO_FICHA)`, com `U_COLECAO` para associação explícita da ficha à coleção.
- Coleção e griffe precisam ser validadas no servidor; data de criação é apoio à consulta, não chave que permita sobrescrever outra ficha.
- Atualizar uma ficha vinculada mantém a mesma versão atual, campos omitidos e vínculos não descartados. Reutilizar referência não altera ficha de origem.
- Uma peça local sem vínculo confirmado não deve ser enviada automaticamente para a maior versão do código. A definição/alocação de versão para a nova coleção depende da futura rotina de gravação aprovada.

## Pendências para habilitar gravação

Confirmar se o código do produto da nova ficha é o próprio código reutilizado ou outro código que usa o antigo somente como referência; confirmar a sincronização automática versus botão Integrar; aprovar o perfil e o código ERP da coleção; mapear preço por item/cor da Principal sem alterar o catálogo global; auditar efeitos dos triggers e homologar escrita somente no .6 após aprovação. `.3` permanece fora do acesso.
