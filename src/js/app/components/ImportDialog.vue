<template>
  <r-dialog
    title="Import bookmarks"
    :show-footer="true"
    @dismiss-dialog="$emit('dismiss-dialog')">
    <div class="form-group">
      From:
      <input type="radio" value="har" v-model="importSrc" />
      <label style="margin-left: 2px">har</label>
    </div>
    <div class="form-group">
      <input type="file" ref="import-file" id="import-file" />
    </div>
    <template v-slot:footer>
      <button
        class="btn btn-default"
        @click="importBookmarks"
        >
        Import
      </button>
      <button class="btn btn-default" @click="dismissDialog">
        Cancel
      </button>
    </template>
  </r-dialog>
</template>

<script>
import RDialog from 'Components/RDialog.vue'
import bacheca from 'Services/bacheca'

export default {
  name: 'ImportDialog',
  data() {
    return {
      importSrc: 'har'
    }
  },
  methods: {
    importBookmarks() {
      bacheca.publish('importBookmarks')
      this.dismissDialog()
    },
    dismissDialog() {
      this.$refs['import-file'].value = ''
      this.$emit('dismiss-dialog')
    },
  },
   components: {
    RDialog,
  }
}
</script>
