# Revisão de identidade, Principal e preço — 13/10/2026

## Escopo e resultado

Correções de código e testes locais; SQL exclusivamente SELECT em `tcp:192.168.1.6,1433`, banco efetivo `HOMOLOG_COBRANCA`, servidor `srv-sql-dev`, conexão criptografada. Sem acesso ao .3, sem gravações, migração ou inicialização do backend. As regras de avanço já existentes não foram alteradas.

- Geral agora separa `Código do produto` (`PecaItem.codigo`) de `Código de Referência` (`fichaTecnica.codigoReferencia`). Antes, o código de referência substituía o código do produto ao salvar. Uma referência não atribui identidade ERP, não autoriza atualização do produto referenciado e não muda sua coleção. Código próprio é editável enquanto não integrado, com limite estrutural de 12 caracteres; o código integrado é somente leitura. Não houve renumeração/migração de dados antigos.
- Planejamento mantém criação e atualização da versão atual separados. A referência entra como informação `somenteReferencia`, com `atualizarProdutoReferenciado=false`. Reserva/gravação de código continua `PENDENTE_GRAVADOR_ERP`; não se afirma que um código salvo localmente foi reservado no SQL.
- Somente a Principal (primeira variante do editor, mesmo renomeada) entra no contrato versão 2 e no mapeamento de consumos. A conferência para preparação envia uma única variante e seu `variantePrincipalId`; backend rejeita outras variantes, identidade ausente ou divergente. Conferência local de entrega continua considerando as variantes locais.
- Essa rota valida o DTO recebido, não uma ficha canônica persistida. Identificar a Principal no pedido não substitui a futura releitura/autorização no servidor antes da escrita ERP.
- Variantes adicionais, imagens, arquivos, prova de roupa e histórico permanecem no navegador e não entram no contrato Linx. O download não inclui mais o manifesto de anexos. Cores personalizadas não entram no mapeamento; referências de cores de material são limitadas ao vínculo explícito com o material. A seleção de mostruário registra se veio do catálogo Linx; cores sem origem confirmada permanecem locais, sem inferir código pela descrição.
- A detecção de alterações Linx não considera variantes adicionais, cores personalizadas ou arquivos. A referência do hash tem namespace v2; dados/hash antigos não foram apagados.
- Preço automático continua `MATERIAIS_CORES.CUSTO_A_VISTA` da cor em edição, quando unidade é compatível. Fornecedor filtra cores, mas não escolhe automaticamente `MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO`. Não houve troca dessa prioridade nem criação de conversão. Texto do modal e card agora distingue preço selecionado do Linx de preço manual; editar o preço mantém o valor e remove sua origem automática.

## Correção dos defaults de PRODUTOS

A análise anterior identificava apenas `sys.default_constraints` e deixou de considerar defaults legados vinculados. A leitura conjunta de `sys.columns.default_object_id`, `sys.objects`, `sys.default_constraints` e `sys.sql_modules` confirmou:

| Recorte de colunas não nulas, não identity/computed | Quantidade |
| --- | ---: |
| Total | 45 |
| Com DEFAULT_CONSTRAINT | 3 |
| Com default legado vinculado | 26 |
| Total com padrão | 29 |
| Sem padrão | 16 |

Os três declarados são `TIPO_PP=2`, `SUJEITO_SUBSTITUICAO_TRIBUTARIA=0` e `USA_RFID=0`. Os 26 legados são 24 vínculos a DEFAULT_0=0, EMPRESA/DEFAULT_N1=1 e ARREDONDA/DEFAULT_1=1. As definições foram consultadas como texto, não executadas. A consulta 5 de `linx-criacao-edicao-SELECT.sql` foi corrigida. Padrão técnico não é aprovação da parametrização para todo produto.

As 16 sem default: PRODUTO, CLASSIF_FISCAL, TIPO_PRODUTO, DESC_PRODUTO, GRUPO_PRODUTO, SUBGRUPO_PRODUTO, COLECAO, GRADE, DESC_PROD_NF, LINHA, GRIFFE, UNIDADE, FABRICANTE, PONTEIRO_PRECO_TAM, TRIBUT_ICMS, TRIBUT_ORIGEM. Esses são atributos de uma linha do cadastro. NOT NULL não garante string não vazia nem validade fiscal.

## Leitura do preço não é gravação do preço

A consulta atual confirmou novamente zero colunas com nomes contendo PRECO/CUSTO/FORNEC em PRODUTO_VERSAO_MATERIAL e PRODUTO_VERSAO_MATERIAL_COR. Isso não prova ausência de destino em todo o ERP; continua sem destino confirmado por item da peça. Ter o valor no catálogo ou na ficha local não comprova onde o preço corrigido será gravado. Não modificar o preço global da cor/material/fornecedor para contornar essa pendência.

## Dúvidas preservadas para definição posterior

1. Código novo será digitado ou seguirá uma sequência/regra de reserva? Ao reutilizar, a nova peça terá código próprio ou compartilhará o mesmo registro ERP? A PK de PRODUTOS é global.
2. A sincronização desejada é automática a cada salvamento ou somente após Integrar? A implementação mantém rascunho local e não inicia escrita automática.
3. Quais valores fiscais/operacionais e cadastros de referência foram aprovados por tipo/griffe? Não copiar uma peça arbitrária para preencher os 16 campos.
4. O preço deve continuar seguindo o custo à vista da cor ou passar a seguir o fornecedor específico? Para múltiplas cores, guardar preço por cor ou um único valor? Não mudar a política sem definição.
5. Qual destino Linx deve receber o preço manual da Principal? A TI precisa indicar/validar uma rotina ou campo apropriado sem alterar catálogos globais inadvertidamente.

O gravador transacional ERP e a reserva real continuam não implementados/habilitados; é necessário homologar defaults, campos, vínculos e efeitos dos triggers no .6 antes de confirmar integrações.

## Verificação

- 201 testes de frontend em 16 arquivos passaram, incluindo separação código/referência, código integrado somente leitura, Principal renomeada, exclusão de variantes/cores/arquivos locais do contrato, hash do escopo, preço automático e edição manual.
- 15 testes de backend (serviço e controller de conferência) passaram com mocks/MockMvc, sem iniciar a aplicação nem acessar SQL para esses testes.
- TypeScript, build de produção e lint dos arquivos alterados passaram.
- SQL real foi usado exclusivamente para consultar identidade e metadados no .6. Os testes não demonstram uma integração gravando produto/ficha nem reserva persistida de código.
- A revisão React manteve hooks incondicionais, campos rotulados, indicação acessível do código somente leitura, salvamento existente e isolamento de dados locais. A orientação de backend preservou Spring/SQL Server e a separação entre validação, planejamento e escrita ERP.
