<template>
    <div>
        <about-dialog v-show="showAboutDialog" @dismiss-dialog="showAboutDialog = false"></about-dialog>
        <credits-dialog v-show="showCreditsDialog" @dismiss-dialog="showCreditsDialog = false"></credits-dialog>
        <donate-dialog v-show="showDonateDialog" @dismiss-dialog="showDonateDialog = false"></donate-dialog>
        <folder-dialog v-show="showFolderDialog" @dismiss-dialog="showFolderDialog = false"></folder-dialog>
  </div>
</template>

<script>
import bacheca from '@/js/app/bacheca'
import AboutDialog from '../about-dialog.vue'
import CreditsDialog from '../credits-dialog.vue'
import DonateDialog from '../donate-dialog.vue'
import FolderDialog from '../folder-dialog.vue'

export default {
    name: 'DialogsApp',
    created() {
      bacheca.subscribe('showAboutDialog', () => this.showAboutDialog = true)
      bacheca.subscribe('showCreditsDialog', () => {this.showCreditsDialog = true; console.log('rispondo')})
      bacheca.subscribe('showDonateDialog', () => this.showDonateDialog = true)
      bacheca.subscribe('showFolderDialog', () => this.showFolderDialog = true)
    },
    data() {
      return {
        showAboutDialog: false,
        showCreditsDialog: false,
        showDonateDialog: false,
        showFolderDialog: false
      }
    }, 
    components: {
      AboutDialog, CreditsDialog, DonateDialog, FolderDialog
    },
}
</script>