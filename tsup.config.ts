import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/plugins/index.ts',
    'src/cli.ts',
    'src/mcp/index.ts'
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  shims: true,
  // Suppress unused import warnings from shim code
  ignoreWatch: ['**/dist/**'],
  banner: {
    js: '// @oxog/deps - Zero-Dependency NPM Package\n// MIT License - Copyright (c) 2025 Ersin Koç'
  }
});
