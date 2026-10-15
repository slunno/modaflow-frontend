import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const api = 'http://127.0.0.1:18081/api/v1';
const sourceFiles = new Set([
  '/tests/homolog6-ui.tsx',
  '/src/index.css',
  '/src/pages/Home/components/FichaRascunhoServidorPanel.tsx',
  '/src/services/api.ts',
  '/src/services/authService.ts',
  '/src/services/fichaRascunhoServidor.ts',
]);

const harnessOnly: Plugin = {
  name: 'modaflow-homolog6-harness-only',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const path = new URL(request.url ?? '/', 'http://localhost:5174').pathname;
      // Não serve index/App/rotas do portal nem outros HTMLs no servidor de teste.
      const allowed =
        path === '/tests/homolog6-ui.html' ||
        sourceFiles.has(path) ||
        path === '/@vite/client' ||
        path === '/@react-refresh' ||
        path === '/@vite/env' ||
        path.startsWith('/node_modules/') ||
        path.startsWith('/@id/');
      if (!allowed) {
        response.statusCode = 403;
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.end('Servidor isolado: abra somente /tests/homolog6-ui.html. App principal e outros caminhos bloqueados.');
        return;
      }
      next();
    });
  },
};

// Não usa vite.config.ts normal, seu proxy8080 ou arquivos .env do projeto.
export default defineConfig({
  root,
  envDir: false,
  envPrefix: 'MF_HOMOLOG6_UI_UNUSED_',
  cacheDir: 'node_modules/.vite-homolog6-ui',
  plugins: [harnessOnly, react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(api),
    'import.meta.env.VITE_FICHA_SERVER_DRAFT_ENABLED': JSON.stringify('true'),
  },
  server: {
    host: 'localhost',
    port: 5174,
    strictPort: true,
    open: false,
    allowedHosts: ['localhost'],
    fs: { strict: true, allow: [root], deny: ['.env', '.env.*', '**/.git/**', '**/*.clixml', '**/*.pem', '**/*.crt', '**/*.key'] },
  },
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
});
