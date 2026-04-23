<template>
  <r-dialog
    title="Confirm operation"
    :show-footer="true"
    @dismiss-dialog="$emit('dismiss-dialog')">
    <p>{{ confirmation.msg }}</p>
    <template v-slot:footer>
      <button class="btn btn-danger" @click="executeOperation">Confirm</button>
      <button class="btn btn-default" @click="dismissConfirmDialog">
        Cancel
      </button>
    </template>
  </r-dialog>
</template>

<script>
import RDialog from 'Components/RDialog.vue'

export default {
  name: 'ContextDialog',
  props: {
    confirmation: {
      type: Object,
      default: {},
    },
  },
  methods: {
    dismissConfirmDialog() {
      this.$emit('dismiss-dialog')
    },
    executeOperation() {
      this.confirmation.action()
      this.dismissConfirmDialog()
    },
  },
  components: {
    RDialog,
  },
}
</script>
