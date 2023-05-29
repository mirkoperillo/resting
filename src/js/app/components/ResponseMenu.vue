<template>
  <div class="row">
    <div class="col-md-9">
      <div class="row row-no-gutters" v-show="isActiveBody">
        <div class="col-md-2">
          <select
            class="form-control"
            @change="changeFormat"
            v-model="selectedFormat">
            <option
              v-for="format in bodyFormats"
              :key="format"
              :value="format.value">
              {{ format.text }}
            </option>
          </select>
        </div>
        <div class="btn-group" role="group" style="margin-left: 5px">
          <clipboard-button></clipboard-button>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <ul class="nav nav-pills pull-right">
        <li role="presentation" :class="{ active: isActiveBody }">
          <a href="#" @click.stop="showBodyPanel">Body</a>
        </li>
        <li role="presentation" :class="{ active: isActiveHeaders }">
          <a href="#" @click.stop="showHeadersPanel">Headers</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ClipboardButton from 'Components/ClipboardButton'
import bacheca from 'Services/bacheca'

export default {
  components: {
    ClipboardButton,
  },
  data() {
    return {
      selectedPanel: 'body',
      selectedFormat: 'Pretty',
      bodyFormats: [
        { text: 'Pretty', value: 'Pretty' },
        { text: 'Raw', value: 'Raw' },
      ],
    }
  },
  computed: {
    isActiveBody() {
      return this.selectedPanel === 'body'
    },
    isActiveHeaders() {
      return this.selectedPanel === 'headers'
    },
  },
  methods: {
    showBodyPanel() {
      this.selectedPanel = 'body'
      bacheca.publish('showResponseBody')
    },
    showHeadersPanel() {
      this.selectedPanel = 'headers'
      bacheca.publish('showResponseHeaders')
    },
    changeFormat() {
      if (this.selectedFormat === 'Pretty') {
        bacheca.publish('formattedBody')
      } else {
        bacheca.publish('rawBody')
      }
    },
  },
}
</script>
