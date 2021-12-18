<template>
  <button @click.prevent.stop="push" title="Copy to clipboard" class="copy-n-paste">
          <i class="fa fa-clipboard" aria-hidden="true"></i>
        </button>
</template>

<script>

import clipboard from 'Services/clipboard'

export default {
  name: 'ClipBoardButton',
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
      }
}
</script>