const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        Components: path.resolve(__dirname, 'src/js/app/components')
      }
    },
    externals: {
      '@/js/app/clipboard': 'app/clipboard',
      '@/js/app/storage': 'app/storage',
      '@/js/app/bacheca': 'app/bacheca',
      '@/js/app/components/RDialog.vue': 'vuecomp/r-dialog.umd'
    }      
  }
}
