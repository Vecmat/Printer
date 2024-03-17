import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { summary } from 'rollup-plugin-summary';

/**
 * @type {import('rollup').RollupOptions}
 */
const configs = {
  input: ['src/index.ts'],
    output: [
      {
        dir: 'libs',
        format: "cjs",
        sourcemap: true,
        interop: 'auto',
        exports: 'named',
        preserveModules: true,
        entryFileNames: '[name].cjs'
      },
      {
        dir: 'libs',
        format: "esm",
        sourcemap: true,
        interop: 'auto',
        exports: 'named',
        preserveModules: true,
        entryFileNames: '[name].mjs'
      }
    ],
    plugins: [typescript({ tsconfig: 'tsconfig.build.json' }), nodeResolve(), summary()],
    external: [/node_modules/, /@logto/],
};



export default configs;
