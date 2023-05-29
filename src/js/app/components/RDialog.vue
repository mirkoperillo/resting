<template>
  <div class="panel panel-primary dialog">
    <div class="panel-heading">
      {{ title }}
      <span
        style="cursor: pointer"
        class="glyphicon glyphicon-remove pull-right"
        @click="$emit('dismiss-dialog')"></span>
    </div>
    <div class="panel-body">
      <slot>
        <p>DEFAULT</p>
      </slot>
    </div>
    <div class="panel-footer" v-show="showFooter">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RDialog',
  mounted() {
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Esc' || event.key === 'Escape') {
        this.$emit('dismiss-dialog')
      }
    })
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    showFooter: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
}
</script>
