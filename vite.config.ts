import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Determine the base path based on environment
const getBasePath = () => {
  // For GitHub Pages deployment
  if (process.env.GITHUB_PAGES === 'true') {
    return '/healthcare-doc-analysis/';
  }
  // For S3 website or local development
  return '/';
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path - will be '/' for S3 website and '/healthcare-doc-analysis/' for GitHub Pages
  base: getBasePath(),
  build: {
    // Ensure assets use relative paths
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Use a pattern that works well with S3
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
