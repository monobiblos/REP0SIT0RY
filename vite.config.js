import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/REP0SIT0RY/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          mui: ['@mui/material'],
          'mui-icons': ['@mui/icons-material'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
