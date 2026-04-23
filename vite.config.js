import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postcssNesting from 'postcss-nesting'

export default defineConfig({
  plugins: [react()],
  base: '/',
  css: {
    postcss: {
      plugins: [postcssNesting()]
    },
    preprocessorOptions: {}
  },
  optimizeDeps: {
    include: ['@uiw/react-md-editor']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})