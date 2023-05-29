<template>
  <div>
    <about-dialog
      v-show="showAboutDialog"
      @dismiss-dialog="showAboutDialog = false"></about-dialog>
    <credits-dialog
      v-show="showCreditsDialog"
      @dismiss-dialog="showCreditsDialog = false"></credits-dialog>
    <donate-dialog
      v-show="showDonateDialog"
      @dismiss-dialog="showDonateDialog = false"></donate-dialog>
    <folder-dialog
      v-show="showFolderDialog"
      :selected-folder="selectedFolder"
      @dismiss-dialog="showFolderDialog = false"></folder-dialog>
  </div>
</template>

<script>
import bacheca from 'Services/bacheca'
import AboutDialog from 'Components/AboutDialog.vue'
import CreditsDialog from 'Components/CreditsDialog.vue'
import DonateDialog from 'Components/DonateDialog.vue'
import FolderDialog from 'Components/FolderDialog.vue'

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
  },
  data() {
    return {
      showAboutDialog: false,
      showCreditsDialog: false,
      showDonateDialog: false,
      showFolderDialog: false,
      selectedFolder: false,
    }
  },
  components: {
    AboutDialog,
    CreditsDialog,
    DonateDialog,
    FolderDialog,
  },
}
</script>
