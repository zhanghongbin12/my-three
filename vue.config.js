const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // GitHub Pages 项目站点部署在 /my-three/ 子路径下
  publicPath: process.env.NODE_ENV === 'production' ? '/my-three/' : '/'
})
