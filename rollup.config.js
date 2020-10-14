import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: [
    { dir: 'build', sourcemap: true, format: 'cjs' },
    { dir: 'build/es', sourcemap: true, format: 'es' }
  ],
  plugins: [typescript(), terser({ format: { comments: false } })]
}
