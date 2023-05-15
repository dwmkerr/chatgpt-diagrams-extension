import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'

//  We may use isProduction to configure source maps later.
//  const isProduction = process.env.NODE_ENV === 'production'

export default {
  input: 'src/manifest.json',
  output: {
    dir: 'dist',
    format: 'esm',
    // note sourcemaps seem to fail to generate when set to 'inline'
    sourcemap: true,
  },
  plugins: [
    //  always put chromeExtension() before other plugins
    chromeExtension(),
    simpleReloader(),
    //  plugins required for npm modules, cjs and ts
    resolve(),
    commonjs(),
  ],
}

