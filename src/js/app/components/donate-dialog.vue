<template>
  <r-dialog title="Donate" @dismiss-dialog="$emit('dismiss-dialog')">
    <p>If Resting helps you in your daily job, consider supporting the project</p>
    <a class="donate-link" href="https://www.paypal.me/owlcodesw" target="_blank"><i class="fa fa-paypal"></i>&nbsp;Paypal</a>
    <a class="donate-link" href="https://liberapay.com/mirkoperillo" target="_blank"><i class="fa fa-liberapay"></i>&nbsp;Liberapay</a>
  </r-dialog>         
</template>

<script>
import RDialog from '@/js/app/components/r-dialog.vue'

export default {
  name: 'DonateDialog',
  components: {
    RDialog
  }
}
</script>