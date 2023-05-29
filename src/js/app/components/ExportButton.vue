<template>
  <button
    class="btn btn-default btn-sm"
    @click.prevent.stop="action"
    title="Export">
    <span class="glyphicon glyphicon-export" aria-hidden="true"></span>
  </button>
</template>

<script>
import bacheca from 'Services/bacheca'

export default {
  methods: {
    action() {
      bacheca.publish('exportDialog')
    },
  },
}
</script>
