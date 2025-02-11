<template>
  <r-dialog
    title="Export bookmarks"
    :show-footer="true"
    @dismiss-dialog="$emit('dismiss-dialog')">
    <div class="form-group">
      To:
      <input type="radio" value="har" v-model="exportSrc" />
      <label style="margin-left: 2px">har</label>
    </div>
    <template v-slot:footer>
      <button class="btn btn-default" @click="exportBookmarks">Export</button>
      <button class="btn btn-default" @click="dismissDialog">Cancel</button>
    </template>
  </r-dialog>
</template>

<script>
import RDialog from 'Components/RDialog.vue'
import bacheca from 'Services/bacheca'

export default {
  name: 'ExportDialog',
  data() {
    return {
      exportSrc: 'har',
    }
  },
  methods: {
    exportBookmarks() {
      bacheca.publish('exportBookmarks')
      this.dismissDialog()
    },
    dismissDialog() {
      this.$emit('dismiss-dialog')
    },
  },
  components: {
    RDialog,
  },
}
</script>
