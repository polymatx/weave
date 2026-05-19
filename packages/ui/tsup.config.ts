import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: false,
  target: 'node22',
  tsconfig: 'tsconfig.build.json',
});
