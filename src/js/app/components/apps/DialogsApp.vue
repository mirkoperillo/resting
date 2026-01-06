<template>
  <div>
    <about-dialog v-show="showAboutDialog" @dismiss-dialog="showAboutDialog = false"></about-dialog>
    <credits-dialog v-show="showCreditsDialog" @dismiss-dialog="showCreditsDialog = false"></credits-dialog>
    <donate-dialog v-show="showDonateDialog" @dismiss-dialog="showDonateDialog = false"></donate-dialog>
    <folder-dialog v-show="showFolderDialog" :selected-folder="selectedFolder"
      @dismiss-dialog="showFolderDialog = false"></folder-dialog>
    <import-dialog v-show="showImportDialog" @dismiss-dialog="showImportDialog = false"></import-dialog>
    <export-dialog v-show="showExportDialog" @dismiss-dialog="showExportDialog = false"></export-dialog>
    <create-context-dialog v-show="showCreateContextDialog"
      @dismiss-dialog="showCreateContextDialog = false"></create-context-dialog>
    <context-dialog v-show="showContextDialog" :selected-context="selectedContext"
      @dismiss-dialog="showContextDialog = false"></context-dialog>
    <confirm-dialog v-show="showConfirmDialog" :confirmation="confirmationAction"
      @dismiss-dialog="showConfirmDialog = false"></confirm-dialog>
  </div>
</template>

<script>
import bacheca from 'Services/bacheca'
import AboutDialog from 'Components/AboutDialog.vue'
import CreditsDialog from 'Components/CreditsDialog.vue'
import DonateDialog from 'Components/DonateDialog.vue'
import FolderDialog from 'Components/FolderDialog.vue'
import ImportDialog from 'Components/ImportDialog.vue'
import ExportDialog from 'Components/ExportDialog.vue'
import CreateContextDialog from 'Components/CreateContextDialog.vue'
import ContextDialog from 'Components/ContextDialog.vue'
import ConfirmDialog from 'Components/ConfirmDialog.vue'

export default {
  name: 'DialogsApp',
  created() {
    bacheca.subscribe('showAboutDialog', () => (this.showAboutDialog = true))
    bacheca.subscribe(
      'showCreditsDialog',
      () => (this.showCreditsDialog = true)
    )
    bacheca.subscribe('showDonateDialog', () => (this.showDonateDialog = true))
    bacheca.subscribe('showFolderDialog', ({ selectedFolder }) => {
      this.showFolderDialog = true
      this.selectedFolder = selectedFolder
    })
    bacheca.subscribe('showImportDialog', () => (this.showImportDialog = true))
    bacheca.subscribe('showExportDialog', () => (this.showExportDialog = true))
    bacheca.subscribe(
      'showCreateContextDialog',
      () => (this.showCreateContextDialog = true)
    )
    bacheca.subscribe('showContext', (context) => {
      this.showContextDialog = true
      this.selectedContext = context
      bacheca.publish('loadEntryList.context', context.variables)
    })
    bacheca.subscribe('showConfirmDialog', (action) => {
      this.showConfirmDialog = true
      this.confirmationAction = action
      // bacheca.publish('loadEntryList.context', context.variables)
    })
  },
  data() {
    return {
      showAboutDialog: false,
      showCreditsDialog: false,
      showDonateDialog: false,
      showFolderDialog: false,
      showImportDialog: false,
      showExportDialog: false,
      showCreateContextDialog: false,
      showContextDialog: false,
      showConfirmDialog: false,
      selectedFolder: false,
      selectedContext: {},
      confirmationAction: {},
    }
  },
  components: {
    AboutDialog,
    CreditsDialog,
    DonateDialog,
    FolderDialog,
    ImportDialog,
    ExportDialog,
    CreateContextDialog,
    ContextDialog,
    ConfirmDialog,
  },
}
</script>
