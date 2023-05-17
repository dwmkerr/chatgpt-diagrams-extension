import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'

//  We may use isProduction to configure source maps later.
const isProduction = process.env.NODE_ENV === 'production'

export default {
  input: 'src/manifest.json',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: 'inline', //!isProduction,
  },
  plugins: [
    //  always put chromeExtension() before other plugins
    chromeExtension(),
    simpleReloader(),
    //  plugins required for npm modules, cjs and ts
    resolve(),
    commonjs(),
    //  enable typescript
    //  typescript({ sourceMap: !isProduction, inlineSources: !isProduction }),
    //  typescript({ inlineSources: true }),
    typescript({ inlineSourceMap: true }),
  ],
}

