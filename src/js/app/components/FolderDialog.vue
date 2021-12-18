<template>
  <r-dialog title="Add folder" :show-footer="true" @dismiss-dialog="$emit('dismiss-dialog')">
    Name: <input type="text" class="form-control" v-model.trim="folderName" @keyup.enter="addFolder"/>
    <template v-slot:footer>
      <button class="btn btn-default" @click="addFolder" :disabled="folderName.length === 0">Save</button><button class="btn btn-default" @click="dismissFolderDialog">Cancel</button>
    </template>
  </r-dialog>      
</template>

<script>
import RDialog from 'Components/RDialog.vue'
import makeBookmarkProvider from 'Services/bookmark'
import storage from 'Services/storage'
import bacheca from 'Services/bacheca'

export default {
  name: 'FolderDialog',
  data() {
    return {
      folderName: '',
      bookmarkProvider: makeBookmarkProvider(storage)
    }
  },
  methods: {
    dismissFolderDialog() {
      this.folderName = ''
      this.$emit('dismiss-dialog')
    },
    addFolder() {
      const folder = this.bookmarkProvider.makeFolder(storage.generateId(), this.folderName);
      storage.save(this._serializeBookmark(folder));
      this.dismissFolderDialog();
   
      bacheca.publish('addFolder', folder);
      /*
       * FIXME: published to newFolder is a workaround:
       * it permits to bookmarksVm to not duplicated folder items in view
      */
      bacheca.publish('newFolder', folder);
    },
    _serializeBookmark(bookmarkObj) {
      return this.bookmarkProvider.fromJson(JSON.stringify(bookmarkObj));
    }
  },
  components: {
    RDialog
  }
}
</script>
