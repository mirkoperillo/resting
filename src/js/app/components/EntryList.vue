<template>
  <!--

    Copyright (C) 2017-present Mirko Perillo and contributors
    
    This file is part of Resting.

    Resting is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Resting is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Resting.  If not, see <http://www.gnu.org/licenses/>.
 
-->
  <div>
    <div v-for="(entryListItem, idx) in entryList" :key="`${entryListItem.name}_${entryListItem.value}`">
      <entry-list-item :item="entryListItem" :index="idx" @remove-item="removeItem"
        @update-entryListItem="updateItem" />
    </div>
    <div class="row form-inline form-group">
      <input type="checkbox" class="form-control" style="margin-right: 2px; visibility: hidden" />
      <label>Name</label>
      <span v-if="showHeaderList">
        <input type="text" style="margin-left: 10px" class="form-control" list="headerNames" v-model="entryName"
          ref="name-field" />
        <datalist id="headerNames">
          <option v-for="h in headerNames" :key="h">
            <span>{{ h }}</span>
          </option>
        </datalist>
      </span>
      <span v-else>
        <input type="text" style="margin-left: 10px" class="form-control" v-model="entryName" ref="name-field" />
      </span>
      <select class="form-control" v-if="enableFileEntry" v-model="entryType">
        <option v-for="e in entryTypes" :key="e">{{ e }}</option>
      </select>
      <label style="margin-left: 5px">Value</label>
      <span v-if="!isFileEntry">
        <span v-if="!showHeaderList">
          <input type="text" style="margin-left: 10px" class="form-control" v-model="entryValue"
            @keyup.enter="addOnEnter" ref="value-field" />
        </span>

        <span v-if="showHeaderList">
          <input type="text" style="margin-left: 10px" class="form-control" v-model="entryValue" list="headerValues"
            @keyup.enter="addOnEnter" ref="value-field" />
          <datalist id="headerValues">
            <option v-for="h in headerValues" :key="h">
              <span>{{ h }}</span>
            </option>
          </datalist>
        </span>
      </span>
      <span v-if="isFileEntry">
        <input type="file" id="resting-file" hidden @onChange="onFileSelectedEvent" />
        <label id="select-file-button" class="file-label" for="resting-file">
          Select
        </label>
        <span id="file-name" />
        <button id="file-remove-button" type="button" class="btn btn-default btn-xs" @click="removeFile">
          <i class="fa fa-times" aria-hidden="true"></i>
        </button>
      </span>
      <button type="button" class="btn btn-default" @click="add">
        <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</template>
<script>
import EntryListItem from './EntryListItem.vue'
import bacheca from 'Services/bacheca'
import httpHeaders from 'Services/httpHeaders'

export default {
  name: 'EntryList',
  props: {
    elem: String,
    showHeaderList: Boolean
  },
  mounted() {
    this.headerNames = Object.keys(httpHeaders)
    bacheca.subscribe('reset', this.reset)
    this.$refs['name-field'].focus()

    bacheca.subscribe(`loadEntryList.${this.elem}`, this.load)
  },
  data() {
    return {
      entryList: [],
      entryName: '',
      entryValue: '',
      entryFile: null,
      isFileEntry: false,
      headerNames: [],
    }
  },
  watch: {
    entryList(newVal, oldVal) {
      bacheca.publish(`update.${this.elem}.entryList`, newVal)
    },
  },
  computed: {
    isValidEntryName() {
      return this.entryName.trim().length > 0
    },
    isValidEntryValue() {
      return this.entryValue.trim().length > 0
    },
    headerValues() {
      const vals = httpHeaders[this.entryName]
      return vals ? vals : []
    },
  },
  methods: {
    add() {
      if (this.entryType === 'Text') {
        if (!this.isValidEntryName) {
          this.$refs['name-field'].focus()
          return false
        }
        if (!this.isValidEntryValue) {
          this.$refs['value-field'].focus()
          return false
        }
      }
      if (
        this.entryType === 'File' &&
        (this.entryName.trim().length == 0 || this.entryFile == null)
      ) {
        this.$refs['name-field'].focus()
        return false
      }
      let item
      if (this.entryType === 'Text') {
        item = {
          name: this.entryName,
          value: this.entryValue,
          enabled: true,
          valueFile: null,
          enableFileEntry: this.enableFileEntry,
          entryType: this.entryType,
        }
      }
      if (this.entryType === 'File') {
        item = {
          name: this.entryName,
          value: this.entryValue,
          enabled: true,
          valueFile: this.entryFile,
          enableFileEntry: this.enableFileEntry,
          entryType: this.entryType,
        }
      }
      this.entryList.push(item)
      this.cleanFields()
      this.$refs['name-field'].focus()
      return true
    },
    addOnEnter() {
      this.add()
    },
    removeItem(itemIdx) {
      this.entryList.splice(itemIdx, 1)
      this.$refs['name-field'].focus()
    },
    updateItem({ index, entry }) {
      this.entryList.splice(index, 1, entry)
    },
    cleanFields() {
      this.entryName = ''
      this.entryValue = ''
      this.entryType = 'Text'
      this.removeFile()
      this.$refs['name-field'].focus()
    },
    reset() {
      this.cleanFields()
      this.entryList = []
    },
    load(entryList = []) {
      this.entryList = []
      this.entryList = entryList && Array.isArray(entryList) ? entryList.map((h) => ({
        name: h.name,
        value: h.value,
        enabled: h.enabled,
        valueFile: null,
        enableFileEntry: false,
        entryType: 'Text',
      })) : []
    },
    // better to use refs ?
    removeFile() {
      if (document.getElementById('file-name')) {
        document.getElementById('file-name').innerHTML = ''
        document.getElementById('file-name').style.display = 'none'
        document.getElementById('file-remove-button').style.display = 'none'
        document.getElementById('select-file-button').style.display = 'inline'
        this.entryFile = null
      }
    },
    // better to use refs ?
    onFileSelectedEvent(evt) {
      entryFile = evt.target.files[0]
      const loadedFile = document.getElementById('file-name')
      loadedFile.innerHTML = entryFile.name
      loadedFile.style.display = 'inline'
      document.getElementById('file-remove-button').style.display = 'inline'
      document.getElementById('select-file-button').style.display = 'none'
    },
  },
  components: {
    EntryListItem,
  },
}
</script>
