const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8889',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
