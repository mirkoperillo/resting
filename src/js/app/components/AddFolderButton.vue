<template>
  <button class="btn btn-default btn-sm" @click.prevent.stop="openDialog" title="New folder">
    <i class="fa fa-plus" aria-hidden="true"></i>
  </button>
</template>

<script>
import bacheca from 'Services/bacheca'

export default {
  props: {
    selectedFolder: {
      type: Boolean,
      default: false,
    }   
  },
  methods: {
    openDialog() {
      bacheca.publish('showFolderDialog', { selectedFolder: this.selectedFolder })
    }
  }
}
</script>