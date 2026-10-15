-- Auditoria de 07/10/2026: somente leitura, nao e um contrato de gravacao.
-- Conexao exigida: tcp:192.168.1.6,1433; Initial Catalog=HOMOLOG_COBRANCA.
-- Encrypt=True; TrustServerCertificate=True; credencial Windows protegida.
-- Nao executar no .3 nem no banco original. Nenhuma consulta muda o banco.
-- Os codigos abaixo sao somente as amostras previamente autorizadas.
-- Definicoes de views/functions/triggers/procedures sao lidas COMO TEXTO.
-- Nao executar os objetos cujas definicoes sao retornadas pela consulta 06.

-- QUERY 01: identidade e criptografia da propria conexao.
SELECT @@SERVERNAME AS servidor, DB_NAME() AS banco,
       CONNECTIONPROPERTY('local_net_address') AS endereco_servidor,
       CONNECTIONPROPERTY('local_tcp_port') AS porta_servidor,
       (SELECT encrypt_option FROM sys.dm_exec_connections WHERE session_id = @@SPID) AS conexao_criptografada,
       ORIGINAL_LOGIN() AS login_sql,
       HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'SELECT') AS pode_select;

-- QUERY 02: campos fisicos de ficha, catalogos e candidatos de preco.
SELECT s.name AS esquema, t.name AS tabela, c.name AS coluna,
       TYPE_NAME(c.user_type_id) AS tipo, c.max_length, c.precision, c.scale,
       c.is_computed, c.is_nullable
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.columns c ON c.object_id = t.object_id
WHERE s.name = 'dbo' AND t.name IN (
    'PRODUTO_FICHA_VERSAO', 'PRODUTO_VERSAO_MATERIAL', 'PRODUTO_VERSAO_MATERIAL_COR',
    'KING_CM_STAGE_MATERIAL', 'KING_CM_STAGE_MATERIAL_COR',
    'MATERIAIS', 'MATERIAIS_CORES', 'MATERIAIS_FORNECEDOR',
    'MATERIAIS_FORNECEDOR_CUSTOS', 'MATERIAIS_PRECO',
    'KING_AUDITORIA_CUSTOS_ITEM', 'PROTOTIPO', 'GIV_PLANO_SORTIMENTO_PRODUTO_BKP_V801')
ORDER BY t.name, c.column_id;

-- QUERY 03: PK/unique; distingue preco compartilhado de preco por item da peca.
SELECT s.name + '.' + t.name AS tabela, kc.name AS chave,
       STRING_AGG(CONVERT(nvarchar(max), c.name), ', ')
           WITHIN GROUP (ORDER BY ic.key_ordinal) AS colunas_chave
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.key_constraints kc ON kc.parent_object_id = t.object_id
JOIN sys.index_columns ic ON ic.object_id = t.object_id AND ic.index_id = kc.unique_index_id
JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = ic.column_id
WHERE s.name = 'dbo' AND t.name IN (
    'PRODUTO_FICHA_VERSAO', 'PRODUTO_VERSAO_MATERIAL', 'PRODUTO_VERSAO_MATERIAL_COR',
    'MATERIAIS', 'MATERIAIS_CORES', 'MATERIAIS_FORNECEDOR',
    'MATERIAIS_FORNECEDOR_CUSTOS', 'MATERIAIS_PRECO', 'PRODUTO_CORES',
    'KING_CM_STAGE_MATERIAL', 'KING_CM_STAGE_MATERIAL_COR',
    'KING_AUDITORIA_CUSTOS', 'KING_AUDITORIA_CUSTOS_ITEM')
GROUP BY s.name, t.name, kc.name
ORDER BY s.name, t.name, kc.name;

-- QUERY 04: busca estrutural de preco/custo associado a PRODUTO.
-- A nomenclatura nao comprova semantica nem gravação do CM.
SELECT s.name + '.' + t.name AS tabela,
       STRING_AGG(CONVERT(nvarchar(max), c.name), ', ') AS colunas_preco,
       CASE WHEN EXISTS (SELECT 1 FROM sys.columns x WHERE x.object_id = t.object_id AND x.name = 'MATERIAL') THEN 1 ELSE 0 END AS tem_material,
       CASE WHEN EXISTS (SELECT 1 FROM sys.columns x WHERE x.object_id = t.object_id AND x.name = 'VERSAO_FICHA') THEN 1 ELSE 0 END AS tem_versao_ficha,
       CASE WHEN EXISTS (SELECT 1 FROM sys.columns x WHERE x.object_id = t.object_id AND x.name = 'ITEM') THEN 1 ELSE 0 END AS tem_item,
       CASE WHEN EXISTS (SELECT 1 FROM sys.columns x WHERE x.object_id = t.object_id AND x.name IN ('COR_PRODUTO', 'COR_MATERIAL')) THEN 1 ELSE 0 END AS tem_cor
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.columns c ON c.object_id = t.object_id
WHERE EXISTS (SELECT 1 FROM sys.columns cp WHERE cp.object_id = t.object_id AND cp.name = 'PRODUTO')
  AND (c.name LIKE '%PRECO%' OR c.name LIKE '%CUSTO%')
GROUP BY s.name, t.name, t.object_id
ORDER BY s.name, t.name;

-- QUERY 05: FKs locais e seu estado; uma FK untrusted nao valida todo o legado.
SELECT fk.name AS fk,
       OBJECT_SCHEMA_NAME(fk.parent_object_id) + '.' + OBJECT_NAME(fk.parent_object_id) AS tabela_filha,
       cp.name AS coluna_filha,
       OBJECT_SCHEMA_NAME(fk.referenced_object_id) + '.' + OBJECT_NAME(fk.referenced_object_id) AS tabela_pai,
       cr.name AS coluna_pai, fk.is_disabled, fk.is_not_trusted
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns cp ON cp.object_id = fkc.parent_object_id AND cp.column_id = fkc.parent_column_id
JOIN sys.columns cr ON cr.object_id = fkc.referenced_object_id AND cr.column_id = fkc.referenced_column_id
WHERE OBJECT_NAME(fk.parent_object_id) IN (
    'PRODUTO_VERSAO_MATERIAL', 'PRODUTO_VERSAO_MATERIAL_COR', 'MATERIAIS_CORES',
    'MATERIAIS_FORNECEDOR', 'MATERIAIS_FORNECEDOR_CUSTOS', 'MATERIAIS_PRECO')
ORDER BY tabela_filha, fk.name, fkc.constraint_column_id;

-- QUERY 06: texto dos objetos conhecidos; NAO os invoca.
SELECT s.name AS esquema, o.name AS objeto, o.type_desc,
       sm.definition AS definicao_somente_texto
FROM sys.objects o
JOIN sys.schemas s ON s.schema_id = o.schema_id
JOIN sys.sql_modules sm ON sm.object_id = o.object_id
WHERE s.name = 'dbo' AND o.name IN (
    'FX_KING_CUSTO_PRODUTO_FICHA', 'W_KING_PRODUTO_CUSTO_FICHA_SINTETICO',
    'PRODUTOS_FICHA', 'PRODUTOS_FICHA_COR', 'W_MATERIAIS_CORES',
    'LXI_KING_CM_RESTAURA_MATERIAL', 'LXI_KING_CM_RESTAURA_MATERIAL_COR',
    'LXI_PRODUTO_VERSAO_MATERIAL', 'KINGJOE_ALTERA_CUSTO_REPOSICAO', 'W_PRODUTOS_CUSTO')
ORDER BY o.name;

-- QUERY 07: ausencia de colunas de preco/custo/fornecedor nos itens e staging.
SELECT t.name AS tabela, COUNT(*) AS colunas,
       SUM(CASE WHEN c.name LIKE '%PRECO%' OR c.name LIKE '%CUSTO%' OR c.name LIKE '%VALOR%' THEN 1 ELSE 0 END) AS colunas_valor,
       SUM(CASE WHEN c.name LIKE '%FORNECEDOR%' OR c.name LIKE '%FORNEC%' THEN 1 ELSE 0 END) AS colunas_fornecedor
FROM sys.tables t JOIN sys.columns c ON c.object_id = t.object_id
WHERE t.name IN ('PRODUTO_VERSAO_MATERIAL', 'PRODUTO_VERSAO_MATERIAL_COR',
                 'KING_CM_STAGE_MATERIAL', 'KING_CM_STAGE_MATERIAL_COR')
GROUP BY t.name ORDER BY t.name;

-- QUERY 08: versoes e quantidades. Nao escolhe MAX(VERSAO_FICHA).
SELECT RTRIM(p.PRODUTO) AS produto, RTRIM(p.DESC_PRODUTO) AS descricao,
       RTRIM(p.GRIFFE) AS griffe, RTRIM(p.VERSAO_FICHA) AS versao_atual_produto,
       RTRIM(v.VERSAO_FICHA) AS versao_ficha, RTRIM(v.U_COLECAO) AS colecao_ficha,
       CONVERT(varchar(23), v.DATA_CRIACAO, 121) AS criado_em,
       (SELECT COUNT(*) FROM dbo.PRODUTO_VERSAO_MATERIAL x WHERE x.PRODUTO = v.PRODUTO AND x.VERSAO_FICHA = v.VERSAO_FICHA) AS linhas_insumo,
       (SELECT COUNT(*) FROM dbo.PRODUTO_VERSAO_MATERIAL_COR x WHERE x.PRODUTO = v.PRODUTO AND x.VERSAO_FICHA = v.VERSAO_FICHA) AS vinculos_cor
FROM dbo.PRODUTOS p
LEFT JOIN dbo.PRODUTO_FICHA_VERSAO v ON v.PRODUTO = p.PRODUTO
WHERE p.PRODUTO IN ('BM00301', 'MO14205K', 'BM00002', 'PO14006K')
ORDER BY p.PRODUTO, v.VERSAO_FICHA;

-- QUERY 09: linhas fisicas das 3 amostras, na versao apontada pelo cadastro.
-- C1 e posicao 1 da grade, nao consumo universal nem obrigatoriamente piloto.
SELECT RTRIM(p.PRODUTO) AS produto, RTRIM(f.VERSAO_FICHA) AS versao,
       RTRIM(f.ITEM) AS item, RTRIM(f.MATERIAL) AS material,
       RTRIM(m.DESC_MATERIAL) AS descricao, RTRIM(m.GRUPO) AS grupo,
       RTRIM(m.SUBGRUPO) AS subgrupo, f.C1 AS consumo_posicao_1,
       RTRIM(m.UNID_ESTOQUE) AS unidade_estoque, RTRIM(m.UNID_FICHA_TEC) AS unidade_ficha,
       m.FATOR_CONVERSAO, m.CUSTO_REPOSICAO AS custo_catalogo_reposicao,
       m.CUSTO_A_VISTA AS custo_catalogo_vista
FROM dbo.PRODUTOS p
JOIN dbo.PRODUTO_VERSAO_MATERIAL f ON f.PRODUTO = p.PRODUTO AND f.VERSAO_FICHA = p.VERSAO_FICHA
JOIN dbo.MATERIAIS m ON m.MATERIAL = f.MATERIAL
WHERE p.PRODUTO IN ('MO14205K', 'BM00002', 'PO14006K')
ORDER BY p.PRODUTO, m.GRUPO, f.ITEM;

-- QUERY 10: preco de catalogo x cor nas linhas concretas das 3 pecas.
-- Join completo: PRODUTO + VERSAO_FICHA + MATERIAL + ITEM.
SELECT RTRIM(p.PRODUTO) AS produto, RTRIM(f.VERSAO_FICHA) AS versao,
       RTRIM(f.ITEM) AS item, RTRIM(f.MATERIAL) AS material,
       RTRIM(m.DESC_MATERIAL) AS descricao,
       RTRIM(fc.COR_PRODUTO) AS cor_produto, RTRIM(fc.COR_MATERIAL) AS cor_material,
       RTRIM(mc.DESC_COR_MATERIAL) AS descricao_cor_material,
       f.C1 AS consumo_posicao_1, fc.PORCENTAGEM_CONSUMO,
       m.CUSTO_REPOSICAO AS catalogo_reposicao, m.CUSTO_A_VISTA AS catalogo_vista,
       mc.CUSTO_REPOSICAO AS cor_reposicao, mc.CUSTO_A_VISTA AS cor_vista,
       m.FATOR_CONVERSAO, RTRIM(m.UNID_ESTOQUE) AS unidade_estoque,
       RTRIM(m.UNID_FICHA_TEC) AS unidade_ficha
FROM dbo.PRODUTOS p
JOIN dbo.PRODUTO_VERSAO_MATERIAL f ON f.PRODUTO = p.PRODUTO AND f.VERSAO_FICHA = p.VERSAO_FICHA
JOIN dbo.PRODUTO_VERSAO_MATERIAL_COR fc ON fc.PRODUTO = f.PRODUTO
 AND fc.VERSAO_FICHA = f.VERSAO_FICHA AND fc.MATERIAL = f.MATERIAL AND fc.ITEM = f.ITEM
JOIN dbo.MATERIAIS m ON m.MATERIAL = f.MATERIAL
LEFT JOIN dbo.MATERIAIS_CORES mc ON mc.MATERIAL = fc.MATERIAL AND mc.COR_MATERIAL = fc.COR_MATERIAL
WHERE p.PRODUTO IN ('MO14205K', 'BM00002', 'PO14006K')
  AND (f.ITEM = '0001' OR (p.PRODUTO = 'PO14006K' AND f.ITEM = '0006'))
ORDER BY p.PRODUTO, f.ITEM, fc.COR_PRODUTO;

-- QUERY 11: opcoes do catalogo fornecedor para os materiais da consulta 10.
-- Nao afirma que qualquer desses fornecedores foi selecionado para a peca.
-- Inclui cores existentes no material, nao somente as cores usadas na ficha.
SELECT RTRIM(p.PRODUTO) AS produto, RTRIM(f.ITEM) AS item,
       RTRIM(mf.MATERIAL) AS material, RTRIM(mf.COR_MATERIAL) AS cor_material,
       RTRIM(mf.FORNECEDOR) AS fornecedor, RTRIM(mf.UNIDADE) AS unidade_fornecedor,
       mf.FATOR_CONVERSAO_FORNECEDOR, mf.CUSTO_REPOSICAO AS custo_fornecedor
FROM dbo.PRODUTOS p
JOIN dbo.PRODUTO_VERSAO_MATERIAL f ON f.PRODUTO = p.PRODUTO AND f.VERSAO_FICHA = p.VERSAO_FICHA
JOIN dbo.MATERIAIS_FORNECEDOR mf ON mf.MATERIAL = f.MATERIAL
WHERE p.PRODUTO IN ('MO14205K', 'BM00002', 'PO14006K')
  AND (f.ITEM = '0001' OR (p.PRODUTO = 'PO14006K' AND f.ITEM = '0006'))
ORDER BY p.PRODUTO, f.ITEM, mf.COR_MATERIAL, mf.FORNECEDOR;

-- QUERY 12: tabela de preco do MATERIAL, nao preco por item da ficha.
SELECT 'MATERIAIS_PRECO' AS fonte, RTRIM(mp.MATERIAL) AS material,
       RTRIM(mp.COR_MATERIAL) AS cor_material, RTRIM(mp.CODIGO_TAB_PRECO) AS tabela_preco,
       mp.PRECO, mp.PRECO_DESCONTO
FROM dbo.MATERIAIS_PRECO mp
WHERE EXISTS (
 SELECT 1 FROM dbo.PRODUTOS p
 JOIN dbo.PRODUTO_VERSAO_MATERIAL f ON f.PRODUTO = p.PRODUTO AND f.VERSAO_FICHA = p.VERSAO_FICHA
 WHERE p.PRODUTO IN ('MO14205K', 'BM00002', 'PO14006K')
   AND (f.ITEM = '0001' OR (p.PRODUTO = 'PO14006K' AND f.ITEM = '0006'))
   AND f.MATERIAL = mp.MATERIAL)
ORDER BY mp.MATERIAL, mp.COR_MATERIAL, mp.CODIGO_TAB_PRECO;

-- QUERY 13: custo do fornecedor por faixa de quantidade de COMPRA.
-- QTDE_COMPRAR nao e automaticamente consumo por peca/tamanho.
SELECT 'MATERIAIS_FORNECEDOR_CUSTOS' AS fonte,
       RTRIM(mf.MATERIAL) AS material, RTRIM(mf.COR_MATERIAL) AS cor_material,
       RTRIM(mf.FORNECEDOR) AS fornecedor, mf.QTDE_COMPRAR, mf.CUSTO_REPOSICAO
FROM dbo.MATERIAIS_FORNECEDOR_CUSTOS mf
WHERE EXISTS (
 SELECT 1 FROM dbo.PRODUTOS p
 JOIN dbo.PRODUTO_VERSAO_MATERIAL f ON f.PRODUTO = p.PRODUTO AND f.VERSAO_FICHA = p.VERSAO_FICHA
 WHERE p.PRODUTO IN ('MO14205K', 'BM00002', 'PO14006K')
   AND (f.ITEM = '0001' OR (p.PRODUTO = 'PO14006K' AND f.ITEM = '0006'))
   AND f.MATERIAL = mf.MATERIAL)
ORDER BY mf.MATERIAL, mf.COR_MATERIAL, mf.FORNECEDOR, mf.QTDE_COMPRAR;

-- QUERY 14: candidatos com custo, limitados as referencias autorizadas.
SELECT 'PROTOTIPO' AS tabela, COUNT(*) AS registros
FROM dbo.PROTOTIPO WHERE PRODUTO IN ('BM00301', 'MO14205K', 'BM00002', 'PO14006K')
UNION ALL
SELECT 'GIV_PLANO_SORTIMENTO_PRODUTO_BKP_V801', COUNT(*)
FROM dbo.GIV_PLANO_SORTIMENTO_PRODUTO_BKP_V801 WHERE PRODUTO IN ('BM00301', 'MO14205K', 'BM00002', 'PO14006K')
UNION ALL
SELECT 'KING_AUDITORIA_CUSTOS_ITEM', COUNT(*)
FROM dbo.KING_AUDITORIA_CUSTOS_ITEM WHERE PRODUTO IN ('BM00301', 'MO14205K', 'BM00002', 'PO14006K');

-- QUERY 15: campos de preco/custo com escopos de material/ficha/CM/customizacao.
SELECT s.name + '.' + t.name AS tabela,
       STRING_AGG(CONVERT(nvarchar(max), c.name + ':' + TYPE_NAME(c.user_type_id)), ', ') AS colunas_valores
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.columns c ON c.object_id = t.object_id
WHERE (t.name LIKE 'MATERIAIS%' OR t.name LIKE 'PRODUTO[_]VERSAO%' OR t.name LIKE 'PRODUTO[_]FICHA%'
 OR t.name LIKE 'CM[_]%' OR t.name LIKE '%FICHA%' OR t.name LIKE 'U[_]%')
 AND (c.name LIKE '%PRECO%' OR c.name LIKE '%CUSTO%' OR c.name LIKE '%VALOR%')
GROUP BY s.name, t.name ORDER BY s.name, t.name;

-- QUERY 16: todas as tabelas que combinam produto e material, inclusive logs.
SELECT s.name + '.' + t.name AS tabela,
       STRING_AGG(CONVERT(nvarchar(max), c.name + ':' + TYPE_NAME(c.user_type_id)), ', ') AS colunas
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.columns c ON c.object_id = t.object_id
WHERE (EXISTS (SELECT 1 FROM sys.columns cp WHERE cp.object_id = t.object_id AND cp.name IN ('PRODUTO', 'COD_PRODUTO', 'PRODUTO_ACABADO'))
 AND EXISTS (SELECT 1 FROM sys.columns cm WHERE cm.object_id = t.object_id AND cm.name IN ('MATERIAL', 'COD_MATERIAL')))
 OR t.name LIKE '%CUSTO%FICHA%' OR t.name LIKE '%FICHA%CUSTO%'
 OR t.name LIKE '%CTRL%MATERIAL%' OR t.name LIKE '%PRE%CUSTO%'
 OR t.name IN ('MATERIAIS_FORNECEDOR_CUSTOS', 'MATERIAIS_PRECO', 'PRODUTOS_CUSTOS', 'PRODUTOS_CUSTO')
GROUP BY s.name, t.name ORDER BY s.name, t.name;
