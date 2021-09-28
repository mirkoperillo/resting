
define(['Vue'],function(Vue) {
  Vue.component('hello', {
      props: ['greets'],
      methods: {
        push() {
          console.log('pushone')
        }
      },
      template: `
        <button @click="push" title="Copy to clipboard">
          <i class="fa fa-clipboard" aria-hidden="true"></i>
        </button>
      `
  })
})