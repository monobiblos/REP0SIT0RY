import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/REP0SIT0RY/',
  css: {
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