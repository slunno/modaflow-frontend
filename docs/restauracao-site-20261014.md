# Restauração do modelo anterior do portal — 14/10/2026

O usuário esclareceu que a restauração se refere ao site inteiro, não somente à ficha técnica.
Foi restaurada a entrada principal e a composição anterior das páginas, usando a revisão
`11cbd7f` como referência de apresentação e mantendo os recursos posteriores da ficha.
Não houve reset do repositório nem exclusão de dados.

## Modelo principal restaurado

- Início (`/`): seleção de marcas e coleções, em vez do redirecionamento ao novo dashboard.
- Cabeçalho: AKR à esquerda, Relatórios/Gestão/Kanban no centro, tema e conta à direita.
- Relatórios: submenu suspenso de Peças, Dashboard e Gráficos, conforme o pedido anterior;
  não foi reintroduzida a barra horizontal de três itens.
- Gestão: abas anteriores visíveis, incluindo Fornecedores; cadastros anteriores voltaram aos
  caminhos `/gestao` e `/gestao/:tab`. A edição existente de `FornecedoresTab` foi preservada.
- Dashboard, Gráficos, Notificações, Relatórios e Kanban voltaram aos componentes anteriores.
- Os estilos da área compartilhada saíram do layout global e ficaram restritos às suas páginas.
- Login, autenticação, serviços, regras de negócio, rascunhos e anexos não foram reescritos.

## Recursos compartilhados preservados

Nenhum arquivo do módulo compartilhado ou do backend foi excluído. As páginas permanecem
acessíveis diretamente, sem substituir a navegação principal restaurada:

| Recurso                     | Caminho                                 |
| --------------------------- | --------------------------------------- |
| Coleções compartilhadas     | `/colecoes`                             |
| Peças/fichas compartilhadas | `/pecas`, `/pecas/:id`                  |
| Indicadores compartilhados  | `/workspace/dashboard`, `/workspace/bi` |
| Pendências compartilhadas   | `/workspace/notifications`              |
| Kanban compartilhado        | `/workspace/kanban`                     |
| Cadastros compartilhados    | `/workspace/gestao/:tab`                |

Os links internos de retorno e configuração de fluxos foram ajustados para continuar dentro
da área compartilhada. Não foi feita migração entre os armazenamentos antigo e novo.

## Validação

- Suíte completa do frontend: 484 testes aprovados em 59 arquivos.
- TypeScript e build de produção aprovados.
- Lint sem erros; um aviso preexistente em `AuthContext.tsx`.
- Prévia isolada em `127.0.0.1:5193`, sem proxy, com API e autenticação substituídas por fixtures.
- Seleção de marca, coleções, Gestão, tecidos, Dashboard, Gráficos e Kanban conferidos no navegador.
- Nenhum acesso ao SQL, Linx ou backend real. Nenhuma limpeza de localStorage dos usuários.

Evidência: `C:/King-Joe-Projects/outputs/site-modelo-anterior-restaurado.png` (dados simulados).
