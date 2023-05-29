<template>
  <button
    @click.prevent.stop="push"
    title="Copy to clipboard"
    class="btn btn-default copy-n-paste">
    <i class="fa fa-clipboard" aria-hidden="true"></i>
  </button>
</template>

<script>
import bacheca from 'Services/bacheca'

export default {
  name: 'ClipBoardButton',
  methods: {
    push(event) {
      bacheca.publish('copyResponse')
    },
  },
}
</script>
