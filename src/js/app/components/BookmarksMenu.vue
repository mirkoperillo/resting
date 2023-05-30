<template>
  <div class="btn-group" role="group" style="margin-bottom: 2px">
    <add-folder-button />
    <import-button />
    <export-button />
    <sort-button />
  </div>
</template>

<script>
import AddFolderButton from 'Components/AddFolderButton.vue'
import ImportButton from 'Components/ImportButton.vue'
import ExportButton from 'Components/ExportButton.vue'
import SortButton from 'Components/SortButton.vue'

export default {
  components: {
    AddFolderButton,
    ImportButton,
    ExportButton,
    SortButton,
  },
}
</script>
