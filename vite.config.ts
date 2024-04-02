import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index'
    }
  },
  plugins: [dts()],
  resolve: { alias: { src: resolve('src/') } }
})
