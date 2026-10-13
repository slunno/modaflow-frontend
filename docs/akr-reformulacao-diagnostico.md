# AKR BRANDS — diagnóstico da reformulação

## Base encontrada em 13/10/2026

- Frontend: React 19, TypeScript, Vite 8, Tailwind 4, React Router e Vitest. Backend: Java 21, Spring Boot 3.2, Spring Security/JWT, JPA e JDBC.
- Rotas existentes: `/`, `/products`, `/dashboard`, `/bi`, `/notifications`, `/gestao`, `/relatorios`, `/kanban` e `/login`.
- O catálogo Linx usa consultas dedicadas. O cadastro JPA de peças e o catálogo Linx são fontes diferentes; os indicadores anteriores não consultavam a ficha local de desenvolvimento.
- `DashboardServiceImpl` retorna `null` nos dois métodos. O frontend oculta parte das falhas. Ausência de informação nessas telas não comprova ausência de registros.
- `getBiMetrics` ignora o agrupamento e trata valores de custo como contagem; filtros de coleção, período, tags e campos não chegam à consulta.
- `getProducts` consulta somente a primeira página de 100 produtos.
- Custos Fixos, Precificação, Tipos de Peça, Tags, Fluxos e Campos Customizados contêm listas inicialmente vazias, sem persistência compartilhada nem ações completas de criação. São funcionalidades parciais, não cadastros confirmadamente vazios.
- Coleções criadas no portal, fichas, variantes, medidas, corte e parte dos vínculos são guardados em localStorage. Anexos binários usam IndexedDB. O rascunho central existente é opt-in e não inclui os arquivos.
- As 23 etapas da ficha e as etapas do backend têm contratos diferentes; os nomes e códigos existentes devem ser preservados.
- O Kanban grava etapa sem histórico comum e calcula atraso mesmo para produtos concluídos. Sua navegação por etapas usa o índice da lista filtrada.
- O perfil `dev` usa H2 em memória. O perfil SQL Server desabilita alterações de esquema porque o banco pertence ao Linx.
- Há alterações anteriores extensas não commitadas nos dois projetos. A implementação parte desse estado e não restaura arquivos.
- Os vídeos descritos no pedido não foram anexados; a análise foi feita sobre o código disponível.

## Decisões de implementação

Manter a ficha técnica e seus editores especializados; introduzir uma camada operacional compartilhada pela API, com revisão otimista, identidade por marca e histórico. Após a revisão visual, o usuário escolheu navegação superior em uma única faixa compacta, substituindo a proposta inicial de sidebar. A persistência operacional deve ser separada do catálogo ERP, sem gravações no Linx. Gráficos devem derivar dos registros completos do recorte e oferecer os mesmos registros no detalhamento. Ausência de dados deve continuar explícita.

O módulo Fornecedores não integra a navegação nem a nova implementação. Vínculos existentes em insumos e serviços permanecem válidos.
