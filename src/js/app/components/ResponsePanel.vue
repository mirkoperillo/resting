<template>
    <div class="row">
    <div class="col-md-12">
      <div class="panel panel-default">
        <div class="panel-heading">
          <p class="text-center">
            <span class="response-metric">Status:</span>
            <span
              class="response-metric-value"> {{callStatus}} </span>
            <span class="response-metric">Time:</span>
            <span
              class="response-metric-value"> {{callDuration}} </span>
            <span class="response-metric">Size:</span>
            <span
              class="response-metric-value"> {{callSize}} </span>
          </p>
        </div>

        <div class="panel-body row">
          <div class="col-md-12">
            <response-menu></response-menu>
            <div class="alert alert-success" :class="{'hide': isHidden}" role="alert">
              <p>Response copied successfully!</p>
            </div>
            <div v-if="showBody">
            <response-viewer v-if="useFormattedBody"></response-viewer>
            <pre
              class="pre-scrollable"
              v-if="useRawBody">
              <code id="highlighted-response">{{content}}</code>
            </pre>
            </div>
            <div v-if="showHeaders">
              <table class="table table-striped">
                <tbody v-for="header in headers" :key="header.name">
                  <tr>
                    <td>
                      <strong>{{header.name}}</strong>
                    </td>
                    <td>{{header.value}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ResponseMenu from './ResponseMenu.vue'
import ResponseViewer from './ResponseViewer.vue'
import bacheca from 'Services/bacheca'

export default {
  name: 'ResponsePanel',
  mounted() {
    bacheca.subscribe('responseReady', this.display)
    bacheca.subscribe('reset', this.clear)
    bacheca.subscribe('loadBookmark', this.clear)
    bacheca.subscribe('deleteBookmark', this.clear)
    bacheca.subscribe('copyResponse', this.copyResponse)
    bacheca.subscribe('showResponseBody', this.showResponseBody),
    bacheca.subscribe('showResponseHeaders', this.showResponseHeaders),
    bacheca.subscribe('formattedBody', this.formattedBody)
    bacheca.subscribe('rawBody', this.rawBody)
  },
  data(){
    return {
      callStatus: '-',
      callDuration: '-',
      callSize: '-',
      headers: [],
      content: '',
      responseBody: '', // to improve
      showHeaders: false,
      showBody: true,
      useFormattedBody: true,
      useRawBody: false,
      isHidden: true,
    }
  },
  methods: {
    headersPanel() {
      this.showHeaders = true
      this.showBody = false
    },
    showResponseBody() {
      this.showBody = true
      this.showHeaders = false
    },
    showResponseHeaders() {
      this.showBody = false
      this.showHeaders = true
    },
    bodyPanel() {
      this.showBody = true
      this.showHeaders = false
    },
    prepareBodyForView() {
      if (this.responseBody.length === 0 && !Array.isArray(this.responseBody)) {
        // do nothing
      } else if (this.useFormattedBody) {
        this.content = JSON.stringify(this.responseBody, null, 2) // used only for clipboard formatted body
        bacheca.publish('response', this.content)
      } else {
        this.content = JSON.stringify(this.responseBody)
      }
    },
    formattedBody() {
      this.useFormattedBody = true
      this.useRawBody = false
      this.prepareBodyForView()
    },
    rawBody() {
      this.useFormattedBody = false
      this.useRawBody = true
      this.prepareBodyForView()
    },
    clear() {
      this.headers.splice(0, this.headers.length)
      this.content = ''
      bacheca.publish('response', '')
      this.callDuration = '-'
      this.allStatus = '-'
      this.callSize = '-'
    },
    display(response) {
      this.clear()
      setTimeout(() => {
        this.callDuration = `${response.duration}ms`
        this.callStatus = response.status
        this.callSize = `${response.size.toFixed(2)}KB`
        this.headers = response.headers
        this.responseBody = response.content
        this.prepareBodyForView()
      }, 500)
    },
    copyResponse() {
      const responseContent = this.content
      navigator.clipboard
        .writeText(responseContent)
        .then(() => {
          this.isHidden = false
          setTimeout(() => {
            this.isHidden = true
          }, 2000)
        })
        .catch(() => console.log('Error copying to clipboard'))
    }
  },
  components: {
    ResponseMenu, ResponseViewer
  }
}
</script>
