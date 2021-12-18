const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        Components: path.resolve(__dirname, 'src/js/app/components'),
        Services: path.resolve(__dirname, 'src/js/app')
      }
    },
    externals: {
      'Services/clipboard': 'app/clipboard',
      'Services/storage': 'app/storage',
      'Services/bacheca': 'app/bacheca',
      'Components/RDialog.vue': 'vuecomp/r-dialog.umd'
    }      
  }
}
