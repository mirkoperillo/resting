<template>
  <r-dialog title="Credits" @dismiss-dialog="$emit('dismiss-dialog')">
    <p>Thank you to all the project <a href="https://github.com/mirkoperillo/resting/blob/master/CONTRIBUTORS.md" target="_blank">contributors</a></p>
    <p>Addon icon made by <a href="http://www.freepik.com" target="_blank">Freepik</a> from <a href="http://www.flaticon.com" target="_blank">www.flaticon.com</a></p>
  </r-dialog>       
</template>

<script>
import RDialog from 'Components/r-dialog.vue'

export default {
  name: 'DonateDialog',
  components: {
    RDialog
  }
}
</script>
