import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - use the repository name
  // For example, if your repository is username.github.io/healthcare-doc-analysis
  // then use '/healthcare-doc-analysis/'
  // For local development, you can comment this out or use '/'
  base: '/healthcare-doc-analysis/',
})
