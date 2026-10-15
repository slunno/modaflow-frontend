import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const base = dirname(fileURLToPath(import.meta.url));
const apiOriginal = resolve(base, '../../../src/services/api');
export default defineConfig({
  cacheDir: 'node_modules/.vite-ficha-isolada',
  root: resolve(base, '../../..'),
  plugins: [
    {
      name: 'api-isolada-da-ficha',
      enforce: 'pre',
      resolveId(source, importer) {
        if (!importer || !source.startsWith('.')) return;
        const destino = resolve(dirname(importer.split('?')[0]), source);
        if (destino === apiOriginal || destino === `${apiOriginal}.ts`)
          return resolve(base, 'apiFixture.ts');
      },
    },
    react(),
    tailwindcss(),
  ],
  server: { host: '127.0.0.1', port: 5191, strictPort: true },
  resolve: { alias: { '@': resolve(base, '../../../src') } },
  optimizeDeps: { entries: ['tests/manual/ficha/index.html'] },
});
