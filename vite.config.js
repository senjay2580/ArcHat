import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  
  plugins: [
    vue(),
    vueDevTools()
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  server: {
    port: 3010,
    host: true,
    open: false,
    proxy: {
      '/api/client/': {
        target: 'http://localhost:8080/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',  // esbuild 比 terser 快 20-40 倍
    chunkSizeWarningLimit: 1500,
    reportCompressedSize: false,  // 禁用 gzip 大小报告，加快构建
    cssCodeSplit: true,  // CSS 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          utils: ['axios', 'marked']
        }
      }
    }
  },
  
  // 启用缓存加速构建
  cacheDir: '.vite',
  
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios', 'marked'],
    force: false
  }
})
