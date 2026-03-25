import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  esbuild: false,
  plugins: [swc.vite()],
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.integration-spec.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./test/setup.ts'],
  },
});
