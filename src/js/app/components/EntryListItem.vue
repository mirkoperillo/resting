<template>
  <div>
    <div class="row form-inline form-group">
      <input type="checkbox" class="form-control" style="margin-right: 2px" v-model="enabled" />
      <label :class="{ disabled: !enabled }">Name</label>
      <input type="text" style="margin-left: 10px" class="form-control" v-model="name" :disabled="!enabled" />
      <span v-if="!isFileEntry">
        <label :class="{ disabled: !enabled }" style="margin-left: 5px">
          Value
        </label>
        <input type="text" style="margin-left: 10px" class="form-control" v-model="value" :disabled="!enabled" />
      </span>
      <span v-if="isFileEntry">
        <label :class="{ disabled: !enabled }" style="margin-left: 5px">
          Value
        </label>
        <span>{{ valueFile.name }}</span>
      </span>
      <button type="button" class="btn btn-default" aria-label="Remove entry" @click="remove">
        <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'EntryListItem',
  created() {
    console.log('created, dentro item ' + this.name + ' -- ' + this.value)
  },
  mounted() {
    console.log('mounted, dentro item ' + this.name + ' -- ' + this.value)
  },
  data() {
    return {
      name: this.item.name,
      value: this.item.value,
      valueFile: this.item.valueFile,
      enabled: this.item.enabled,
      enableFileEntry: this.item.enableFileEntry,
      entryType: this.item.entryType,
      entryTypes: ['Text', 'File'],
    }
  },
  computed: {
    isFileEntry() {
      return this.entryType === 'File'
    },
  },
  methods: {
    remove() {
      this.$emit('remove-item', this.index)
    },
  },
  watch: {
    name(newVal, oldVal) {
      this.$emit('update-entryListItem', {
        index: this.index,
        entry: {
          name: newVal,
          value: this.value,
          enabled: this.enabled,
          valueFile: this.valueFile,
          enableFileEntry: this.enableFileEntry,
          entryType: this.entryType,
        },
      })
    },
    value(newVal, oldVal) {
      this.$emit('update-entryListItem', {
        index: this.index,
        entry: {
          name: this.name,
          value: newVal,
          enabled: this.enabled,
          valueFile: this.valueFile,
          enableFileEntry: this.enableFileEntry,
          entryType: this.entryType,
        },
      })
    },
    enabled(newVal, oldVal) {
      this.$emit('update-entryListItem', {
        index: this.index,
        entry: {
          name: this.name,
          value: this.value,
          enabled: newVal,
          valueFile: this.valueFile,
          enableFileEntry: this.enableFileEntry,
          entryType: this.entryType,
        },
      })
    },
  },
  props: {
    item: Object,
    index: Number,
  },
}
</script>
