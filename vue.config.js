const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        Components: path.resolve(__dirname, 'src/js/app/components')
      }
    },
    externals: {
      /*'Vue': {
        root: 'Vue',
        amd: 'vue'
      },*/
      '../clipboard': 'app/clipboard',
      '../storage': 'app/storage',
      '../bacheca': 'app/bacheca',
      '@/js/app/components/r-dialog.vue': 'vuecomp/r-dialog.umd',
      // 'localforage': 'localforage',
      /*'jquery': {
        root: '$',
        amd: 'jquery',
        commonjs: 'jquery',
        commonjs2: 'jquery'
      }*/
    }      
  }
}
