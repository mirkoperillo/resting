<template>
  <div>
    <div class="row form-inline form-group">
      <input
        type="checkbox"
        class="form-control"
        style="margin-right: 2px"
        v-model="enabled"
        :disabled="readOnly" />
      <label :class="{ disabled: readOnly }" ref="name">Name</label>
      <input
        type="text"
        style="margin-left: 10px"
        class="form-control"
        v-model="name"
        :disabled="readOnly" />
      <span v-if="!isFileEntry">
        <label
          :class="{ disabled: readOnly }"
          style="margin-left: 5px"
          ref="value">
          Value
        </label>
        <input
          type="text"
          style="margin-left: 10px"
          class="form-control"
          v-model="value"
          :disabled="readOnly" />
      </span>
      <!--  currently this vue component doesn't support fileEntry
      <span v-if="isFileEntry">
        <label :class="{ disabled: !enabled }" style="margin-left: 5px" ref="value">
          Value
        </label>
        <span>{{ valueFile.name }}</span>
      </span> -->
      <div class="btn-group">
        <button
          type="button"
          v-if="readOnly"
          class="btn btn-default"
          aria-label="Edit entry"
          @click="readOnly = false">
          <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
        </button>
        <button
          type="button"
          v-if="!readOnly"
          class="btn btn-default"
          aria-label="Save entry"
          @click="saveItem">
          <span
            class="glyphicon glyphicon-floppy-disk"
            aria-hidden="true"></span>
        </button>
        <button
          type="button"
          v-if="readOnly"
          class="btn btn-default"
          aria-label="Remove entry"
          @click="remove">
          <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'EntryListItem',
  props: {
    item: Object,
    index: Number,
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
      readOnly: true,
    }
  },
  computed: {
    isFileEntry() {
      return this.entryType === 'File'
    },
  },
  methods: {
    saveItem() {
      this.$emit('update-entryListItem', {
        index: this.index,
        entry: {
          name: this.name,
          value: this.value,
          enabled: this.enabled,
          valueFile: this.valueFile,
          enableFileEntry: this.enableFileEntry,
          entryType: this.entryType,
        },
      })
      this.readOnly = true
    },
    remove() {
      this.$emit('remove-item', this.index)
    },
  },
}
</script>
