import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Relative base so the built site works at https://<user>.github.io/<repo>/
export default defineConfig({
  base: './',
  plugins: [react()],
})
