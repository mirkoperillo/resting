<template>
  <r-dialog style="width: 700px" :title="`Context ${this.selectedContext.name}`" :show-footer="true"
    @dismiss-dialog="$emit('dismiss-dialog')">
    <p>
      Use variables as
      <strong>{var_name}</strong>
      in
    </p>
    <ul>
      <li>the request URL</li>
      <li>value of header</li>
      <li>part of the body</li>
      <li>value of querystring</li>
      <li>as username and password in BASIC authentication</li>
    </ul>
    <entry-list elem="context" :selectedContext="selectedCtx" />

    <template v-slot:footer>
      <button class="btn btn-default" @click="saveContext">Save</button>
      <button class="btn btn-default" @click="dismissContextDialog">
        Cancel
      </button>
      <button class="btn btn-danger pull-right" @click="confirmDeleteContext" v-if="!selectedContext.isDefault">
        Delete
      </button>
    </template>
  </r-dialog>
</template>

<script>
import EntryList from 'Components/EntryList.vue'
import RDialog from 'Components/RDialog.vue'
import bacheca from 'Services/bacheca'

export default {
  name: 'ContextDialog',
  created() {
    this.variables = this.selectedContext ? this.selectedContext.variables : []
  },
  mounted() {
    bacheca.publish('loadEntryList.context', this.selectedContext.variables)
    bacheca.subscribe('update.context.entryList', this.updateVariables)
  },
  props: {
    selectedContext: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      variables: []
    }
  },
  methods: {
    saveContext() {
      bacheca.publish('saveContext', { name: this.selectedContext.name, variables: this.variables })
      this.dismissContextDialog()
    },
    dismissContextDialog() {
      this.$emit('dismiss-dialog')
    },
    confirmDeleteContext() {
      const action = function () {
        bacheca.publish('deleteContext', this.selectedContext.name)
        this.dismissContextDialog()
      }.bind(this)
      bacheca.publish('showConfirmDialog', { msg: 'Confirm context delete ?', action: action })
    },
    updateVariables(entryList = []) {
      this.variables = entryList;
    }
  },
  components: {
    RDialog,
    EntryList,
  },
}
</script>
