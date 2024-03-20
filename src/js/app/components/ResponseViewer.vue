<template>
  <div>
    <div ref="viewer-panel"></div>
  </div>
</template>

<script>
import bacheca from 'Services/bacheca'
import jsonViewer from 'Vendor/jsonViewer'

export default {
  mounted() {
    this.$refs['viewer-panel'].appendChild(jsonViewer.getContainer())
    bacheca.subscribe('response', this.view)
  },
  methods: {
    view(content) {
      if(content === '') {
        jsonViewer.clear()
      } else {
        jsonViewer.showJSON(JSON.parse(content))
      }
    },
  },
}
</script>
