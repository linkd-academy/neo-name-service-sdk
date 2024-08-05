// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], 
  format: ['cjs', 'esm'], 
  dts: true, 
  outDir: 'dist', 
  sourcemap: true, 
  splitting: false, 
  clean: true, 
  minify: false, 
  esbuildOptions: (options) => {
    options.outExtension = {
      '.js': options.format === 'esm' ? '.mjs' : '.cjs',
    };
  },
});
