# Tela de insumo atualizada — 15/10/2026

Restaurado somente o editor atualizado de tecidos e aviamentos, que havia sido substituído durante a restauração visual do portal de 14/10. Menu, páginas, ficha e outras alterações locais foram preservados.

## Interface recuperada

- Formulário principal e painel de informações por cor em superfícies separadas.
- Cores com amostra, nome e código legíveis; clique na cor abre seu editor.
- Ação Concluir no painel; no celular, retorno ao formulário sem desmontar os campos.
- Seções de preço/unidade e imagens; observações e detalhes técnicos recolhidos.

Os componentes e seus testes foram recuperados da versão já registrada no HEAD anterior a esta entrega. O CSS ganhou medidas e espaçamentos locais para funcionar também com o tema anterior do portal, sem restaurar estilos globais.

## Validação

- Build de produção aprovado (`npm run build`).
- ESLint aprovado nos quatro componentes TSX restaurados.
- 63 testes aprovados em cinco arquivos: cadastro Linx, informações por cor, vínculos Linx, fontes de dados e uso de insumos na ficha.
- Conferência visual na aba local existente: material 01030505, duas cores e fornecedor preservados; nenhum cadastro foi enviado.
- Teste isolado a 390 × 844: edição, cálculo do consumo, Concluir e reabertura preservando preço e consumo.
- Comparação SHA-256 dos demais arquivos modificados: nenhum alterado por esta entrega, exceto o teste do editor restaurado intencionalmente.

Evidências locais:

- `C:/King-Joe-Projects/outputs/insumo-atualizado-restaurado-20261015.jpg`
- `C:/King-Joe-Projects/outputs/insumo-atualizado-mobile-20261015.jpg`

Backup da interface substituída: `C:/King-Joe-Projects/outputs/insumo-restauracao-20261015-backup.patch`.
