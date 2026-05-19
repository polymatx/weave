import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { resolve: false, entry: 'src/index.ts' },
  tsconfig: 'tsconfig.build.json',
  sourcemap: true,
  clean: true,
  target: 'node22',
});
