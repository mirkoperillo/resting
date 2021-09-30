
define(['Vue','app/clipboard'],function(Vue, clipboard) {
  Vue.component('clipboard-button', {
      created: function() {
        clipboard.copyFrom('#highlighted-response', 'copy-n-paste');
        clipboard.onCopy(function() {
          $('.alert').removeClass('hide');
          setTimeout(function () { $('.alert').addClass('hide'); }, 2000);
        });
      },
      methods: {
        push() {
          document.execCommand('copy')
        }
      },
      template: `
        <button @click.prevent.stop="push" title="Copy to clipboard" class="copy-n-paste">
          <i class="fa fa-clipboard" aria-hidden="true"></i>
        </button>
      `
  })
})