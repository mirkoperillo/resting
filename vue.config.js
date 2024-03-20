const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        Components: path.resolve(__dirname, 'src/js/app/components'),
        Services: path.resolve(__dirname, 'src/js/app'),
        Vendor: path.resolve(__dirname, 'src/js/vendor'),
      },
    },
    externals: {
      'Services/clipboard': 'app/clipboard',
      'Services/storage': 'app/storage',
      'Services/bacheca': 'app/bacheca',
      'Vendor/jsonViewer': 'json-viewer',
    },
  },
}
