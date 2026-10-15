-- SOMENTE SELECT. Executar apenas em tcp:192.168.1.6,1433 / HOMOLOG_COBRANCA.
-- Não executar em .3 ou KINGEJOE. Não executar as definições retornadas.
-- Verificar manualmente a consulta 1 antes das demais. Não inclui credenciais.

-- 1. Identidade e criptografia
SELECT CAST(SERVERPROPERTY('ServerName') AS nvarchar(128)) AS SERVIDOR,
       DB_NAME() AS BANCO,
       (SELECT encrypt_option FROM sys.dm_exec_connections WHERE session_id=@@SPID) AS CRIPTOGRAFIA;

-- 2. Produto do vídeo e versão apontada pelo cadastro da cópia
SELECT RTRIM(P.PRODUTO) AS PRODUTO, P.DESC_PRODUTO, P.U_NOME_PRODUTO,
       P.GRIFFE, P.COLECAO, P.VERSAO_FICHA, P.U_BLOQUEIO_FICHA,
       V.STATUS_VERSAO_FICHA, V.U_COLECAO, V.DATA_CRIACAO
FROM dbo.PRODUTOS P
LEFT JOIN dbo.PRODUTO_FICHA_VERSAO V ON V.PRODUTO=P.PRODUTO AND V.VERSAO_FICHA=P.VERSAO_FICHA
WHERE P.PRODUTO='BM00301';

-- 3. Versões e vínculos: não usar o maior número para escolher o destino
SELECT RTRIM(PRODUTO) AS PRODUTO, VERSAO_FICHA, DESC_VERSAO_FICHA,
       U_COLECAO, STATUS_VERSAO_FICHA
FROM dbo.PRODUTO_FICHA_VERSAO WHERE PRODUTO='BM00301' ORDER BY VERSAO_FICHA;

-- 4. Views e tabelas reais
SELECT O.name AS OBJETO, O.type_desc AS TIPO
FROM sys.objects O
WHERE O.object_id IN (OBJECT_ID('dbo.PRODUTOS_FICHA'), OBJECT_ID('dbo.PRODUTOS_FICHA_COR'),
                     OBJECT_ID('dbo.PRODUTO_VERSAO_MATERIAL'), OBJECT_ID('dbo.PRODUTO_VERSAO_MATERIAL_COR'));

-- 5. Campos obrigatórios e defaults do cadastro de produtos
SELECT C.name AS COLUNA, T.name AS TIPO, C.max_length,
       COALESCE(D.definition, SM.definition) AS PADRAO,
       O.name AS OBJETO_PADRAO,
       CASE WHEN D.object_id IS NOT NULL THEN 'DEFAULT_CONSTRAINT'
            WHEN O.object_id IS NOT NULL THEN 'DEFAULT_LEGADO_VINCULADO'
            ELSE 'SEM_DEFAULT' END AS TIPO_PADRAO
FROM sys.columns C JOIN sys.types T ON T.user_type_id=C.user_type_id
LEFT JOIN sys.default_constraints D ON D.object_id=C.default_object_id
LEFT JOIN sys.objects O ON O.object_id=C.default_object_id
LEFT JOIN sys.sql_modules SM ON SM.object_id=C.default_object_id
WHERE C.object_id=OBJECT_ID('dbo.PRODUTOS') AND C.is_nullable=0
  AND C.is_identity=0 AND C.is_computed=0 ORDER BY C.column_id;

-- 6. Chaves de produto, versão, material e cor
SELECT T.name AS TABELA, I.name AS CHAVE,
       STRING_AGG(C.name, ', ') WITHIN GROUP(ORDER BY IC.key_ordinal) AS COLUNAS
FROM sys.tables T JOIN sys.indexes I ON I.object_id=T.object_id
JOIN sys.index_columns IC ON IC.object_id=T.object_id AND IC.index_id=I.index_id
JOIN sys.columns C ON C.object_id=T.object_id AND C.column_id=IC.column_id
WHERE T.name IN ('PRODUTOS','PRODUTO_FICHA_VERSAO','PRODUTO_VERSAO_MATERIAL',
                 'PRODUTO_VERSAO_MATERIAL_COR','PRODUTO_CORES') AND I.is_primary_key=1
GROUP BY T.name,I.name ORDER BY T.name;

-- 7. Triggers ativos: metadados, não execução
SELECT TR.name AS GATILHO, OBJECT_NAME(TR.parent_id) AS OBJETO_PAI, TR.is_disabled
FROM sys.triggers TR
WHERE TR.parent_id IN (OBJECT_ID('dbo.PRODUTOS'), OBJECT_ID('dbo.PRODUTO_FICHA_VERSAO'),
      OBJECT_ID('dbo.PRODUTOS_FICHA'), OBJECT_ID('dbo.PRODUTO_VERSAO_MATERIAL'),
      OBJECT_ID('dbo.PRODUTO_VERSAO_MATERIAL_COR'), OBJECT_ID('dbo.PRODUTO_CORES'))
ORDER BY OBJETO_PAI,GATILHO;

-- 8. Definições examinadas; são texto de evidência, nunca comandos a executar
SELECT O.name AS OBJETO, SM.definition AS DEFINICAO
FROM sys.objects O JOIN sys.sql_modules SM ON SM.object_id=O.object_id
WHERE O.object_id IN (OBJECT_ID('dbo.PRODUTOS_FICHA'), OBJECT_ID('dbo.PRODUTOS_FICHA_COR'),
      OBJECT_ID('dbo.LDIU_PRODUTOS_FICHA'), OBJECT_ID('dbo.LXI_PRODUTO_VERSAO_MATERIAL'),
      OBJECT_ID('dbo.LXI_KING_CM_RESTAURA_MATERIAL'), OBJECT_ID('dbo.LXI_KING_CM_RESTAURA_MATERIAL_COR'),
      OBJECT_ID('dbo.FX_KING_VERSAO_FICHA')) ORDER BY O.name;

-- 9. Rowversions e colunas de preço/custo/fornecedor: não confundir com preço manual por item
SELECT T.name AS TABELA, C.name AS COLUNA, TY.name AS TIPO
FROM sys.tables T JOIN sys.columns C ON C.object_id=T.object_id
JOIN sys.types TY ON TY.user_type_id=C.user_type_id
WHERE T.name IN ('PRODUTOS','PRODUTO_FICHA_VERSAO','PRODUTO_VERSAO_MATERIAL',
                 'PRODUTO_VERSAO_MATERIAL_COR','PRODUTO_CORES')
  AND (TY.name IN ('timestamp','rowversion') OR C.name LIKE '%PRECO%'
       OR C.name LIKE '%CUSTO%' OR C.name LIKE '%FORNEC%') ORDER BY T.name,C.column_id;
