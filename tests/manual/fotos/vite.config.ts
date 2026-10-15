import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const base = dirname(fileURLToPath(import.meta.url));
const root = resolve(base, '../../..');
export default defineConfig({
  root,
  envDir: base,
  cacheDir: 'node_modules/.vite-fotos-isoladas',
  plugins: [
    {
      name: 'fotos-sem-api-externa',
      enforce: 'pre',
      resolveId(source, importer) {
        if (!importer || !source.startsWith('.')) return;
        const target = resolve(dirname(importer.split('?')[0]!), source).replace(/\.ts$/, '');
        if (target === resolve(root, 'src/services/api')) return resolve(base, 'apiFixture.ts');
      },
    },
    react(),
    tailwindcss(),
  ],
  server: { host: '127.0.0.1', port: 5195, strictPort: true },
  resolve: { alias: { '@': resolve(root, 'src') } },
  optimizeDeps: { entries: ['tests/manual/fotos/index.html'] },
});
