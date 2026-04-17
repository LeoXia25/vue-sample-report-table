/**
 * Vite 库模式构建配置
 * 构建目标：生成 ESM + CJS + CSS，发布到 npm
 *
 * 使用方式：npm run build
 */
const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const { resolve } = require('path')

module.exports = defineConfig({
  plugins: [vue()],
  build: {
    // 入口文件
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'VueSampleReportTable',
      formats: ['es', 'cjs'],
      fileName: (format) => `vue-sample-report-table.${format}.js`
    },
    rollupOptions: {
      // Vue 不打包，由用户项目提供
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        exports: 'named'
      }
    },
    // 不生成 index.html（库模式不需要）
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    minify: false,
    sourcemap: true
  }
})
