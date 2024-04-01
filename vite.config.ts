import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    build: { lib: {
        entry: resolve(__dirname, 'src/main.ts'),
            formats: ['es', 'cjs'],
            fileName: 'index',
    } },
    resolve: { alias: { src: resolve('src/') } },
})