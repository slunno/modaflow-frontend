# ModaFlow PLM Frontend

Sistema de Gestão de Coleções de Moda Multi-Marca (Multi-Tenant).

## 🚀 Tecnologias

- **Framework:** [React 19](https://react.dev/)
- **Linguagem:** [TypeScript 6](https://www.typescriptlang.org/) (`strict: true`)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Roteamento:** `react-router-dom v7`
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Drag and Drop:** `@hello-pangea/dnd`

## 🛠️ Qualidade de Código & Tooling

O projeto adota padrões estritos de qualidade para ambiente enterprise:

- **TypeScript Strict Mode:** Configurado via `tsconfig.app.json` (`strict`, `strictNullChecks`, `noImplicitAny`, `noUncheckedIndexedAccess`). Proibido o uso de `any`.
- **Linter:** [ESLint 10](https://eslint.org/) (Flat Config) com regras `@typescript-eslint`, `react-hooks` e `react-refresh`.
- **Formatação:** [Prettier](https://prettier.io/) para padronização de código.
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) + `lint-staged` para validação e autocoerção no `pre-commit`.
- **CI/CD:** Pipeline de Integração Contínua via GitHub Actions (`.github/workflows/ci.yml`).

## ⚙️ Configuração de Ambiente

Crie um arquivo `.env.local` na raiz do projeto para configurar o endpoint da API backend:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Caso a variável não seja fornecida, o cliente HTTP utilizará `http://localhost:8080/api/v1` como fallback padrão local.

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento Vite.
- `npm run build`: Executa verificação de tipos e compila a aplicação (`tsc -b && vite build`).
- `npm run lint`: Executa a verificação estática de erros com ESLint.
- `npm run format`: Formata todos os arquivos do projeto com Prettier.
- `npm run format:check`: Verifica se o código atende às regras do Prettier.
- `npm run preview`: Visualiza o build de produção localmente.

## 🏗️ Estrutura de Pastas

```text
src/
├── assets/          # Recursos estáticos (imagens, SVGs)
├── components/      # Componentes compartilhados e UI reutilizável
├── contexts/        # Contextos React (ex: AuthContext)
├── pages/           # Páginas da aplicação (Home, Gestão, Login)
├── types/           # Interfaces e tipos globais TypeScript
├── App.tsx          # Componente raiz
└── main.tsx         # Ponto de entrada da aplicação
```