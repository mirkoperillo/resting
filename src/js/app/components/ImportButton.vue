<template>
  <button
    class="btn btn-default btn-sm"
    @click.prevent.stop="action"
    title="Import">
    <span class="glyphicon glyphicon-import" aria-hidden="true"></span>
  </button>
</template>

<script>
import bacheca from 'Services/bacheca'

export default {
  methods: {
    action() {
      bacheca.publish('showImportDialog')
    },
  },
}
</script>
