import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = dirname(fileURLToPath(import.meta.url));
const root = resolve(base, '../../..');
const replacements = new Map([
  [resolve(root, 'src/services/api'), resolve(base, 'apiFixture.ts')],
  [resolve(root, 'src/contexts/AuthContext'), resolve(base, 'AuthFixture.tsx')],
]);
export default defineConfig({
  root,
  envDir: base,
  cacheDir: 'node_modules/.vite-site-anterior',
  plugins: [
    {
      name: 'site-anterior-sem-backend',
      enforce: 'pre',
      resolveId(source, importer) {
        if (!importer || !source.startsWith('.')) return;
        const target = resolve(dirname(importer.split('?')[0]), source).replace(/\.(tsx|ts)$/, '');
        return replacements.get(target);
      },
    },
    react(),
    tailwindcss(),
  ],
  server: { host: '127.0.0.1', port: 5193, strictPort: true },
  resolve: { alias: { '@': resolve(root, 'src') } },
});
