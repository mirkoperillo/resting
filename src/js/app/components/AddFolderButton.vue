<template>
  <button class="btn btn-default btn-sm" @click.prevent.stop="openDialog" title="Add folder">
    <i class="fa fa-plus" aria-hidden="true"></i>
  </button>
</template>

<script>
import bacheca from 'Services/bacheca'

export default {
  methods: {
    openDialog() {
      bacheca.publish('showFolderDialog')
    }
  }
}
</script>