import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = dirname(fileURLToPath(import.meta.url));
const linxOriginal = resolve(base, '../../../src/services/linxService');
export default defineConfig({
  cacheDir: 'node_modules/.vite-insumo-cores-isolado',
  root: resolve(base, '../../..'),
  plugins: [
    {
      name: 'linx-simulado-insumo-cores',
      enforce: 'pre',
      resolveId(source, importer) {
        if (!importer || !source.startsWith('.')) return;
        const destino = resolve(dirname(importer.split('?')[0]), source);
        if (destino === linxOriginal || destino === `${linxOriginal}.ts`) {
          return resolve(base, 'linxFixture.ts');
        }
      },
    },
    react(),
    tailwindcss(),
  ],
  server: { host: '127.0.0.1', port: 5192, strictPort: true },
  resolve: { alias: { '@': resolve(base, '../../../src') } },
  optimizeDeps: { entries: ['tests/manual/insumo-cores/index.html'] },
});
