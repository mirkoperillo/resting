define(['Vue','component/r-dialog'],function(Vue) {
  Vue.component('about-dialog', {
    template: `
      <r-dialog title="About Resting" @dismiss-dialog="$emit('dismiss-dialog')">
        <h4>Resting v1.2.0</h4>
        <p>License: <a href="https://github.com/mirkoperillo/resting/blob/master/LICENSE" target="_blank">GPLv3</a></p>
        <a target="_blank" href="https://github.com/mirkoperillo/resting">Project Website</a> --
        <a target="_blank" href="https://github.com/mirkoperillo/resting/issues">Issue tracker</a>
      </r-dialog>       
    `
  })
})