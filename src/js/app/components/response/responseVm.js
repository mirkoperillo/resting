/*
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
*/

define([
  'knockout',
  'jquery',
  'app/bacheca',
  'app/response',
  'Vue',
  'vuecomp/response-menu.umd',
  'vuecomp/response-viewer.umd',
], function (ko, $, bacheca, responseHelper, Vue, ResponseMenu, ResponseViewer) {
  return function ResponseVm(params) {
    const callDuration = ko.observable('-')
    const callStatus = ko.observable('-')
    const statusHelp = ko.observable('')
    const callSize = ko.observable('-')
    const headers = ko.observableArray()
    const content = ko.observable('')

    const showHeaders = ko.observable(false)
    const showBody = ko.observable(true)
    const useFormattedBody = ko.observable(true)
    const useRawBody = ko.observable(false)
    let responseBody = ''

    const headersPanel = () => {
      showHeaders(true)
      showBody(false)
    }

    const bodyPanel = () => {
      showBody(true)
      showHeaders(false)
    }

    const formattedBody = () => {
      useFormattedBody(true)
      useRawBody(false)
      prepareBodyForView()
    }

    const rawBody = () => {
      useFormattedBody(false)
      useRawBody(true)
      prepareBodyForView()
    }

    const display = (response) => {
      clear()
      setTimeout(function () {
        callDuration(`${response.duration}ms`)
        const { label, desc, link } = responseHelper.statusMeaning[response.status]
        statusHelp(`${desc}
        for more info ${link}`)
        callStatus(label)
        callSize(`${response.size.toFixed(2)}KB`)
        response.headers.forEach((header) => headers.push(header))
        responseBody = response.content
        prepareBodyForView()
      }, 500)
    }

    const prepareBodyForView = () => {
      let view = ''
      if (responseBody.length === 0 && !Array.isArray(responseBody)) {
        // do nothing
      } else if (useFormattedBody()) {
        view = JSON.stringify(responseBody, null, 2)
        bacheca.publish('response', view)
      } else {
        view = JSON.stringify(responseBody)
      }
      content(view)
    }

    const clear = () => {
      headers.removeAll()
      content('')
      bacheca.publish('response', '')
      callDuration('-')
      callStatus('-')
      statusHelp('')
      callSize('-')
    }

    const copyResponse = () => {
      responseContent = content()
      navigator.clipboard
        .writeText(responseContent)
        .then(() => {
          $('.alert').removeClass('hide')
          setTimeout(function () {
            $('.alert').addClass('hide')
          }, 2000)
        })
        .catch(() => console.log('Error copying to clipboard'))
    }

    bacheca.subscribe('responseReady', display)
    bacheca.subscribe('reset', clear)
    bacheca.subscribe('loadBookmark', clear)
    bacheca.subscribe('deleteBookmark', clear)
    bacheca.subscribe('copyResponse', copyResponse)
    bacheca.subscribe('showResponseBody', () => {
      showBody(true)
      showHeaders(false)
    })
    bacheca.subscribe('showResponseHeaders', () => {
      showBody(false)
      showHeaders(true)
    })
    bacheca.subscribe('formattedBody', formattedBody)
    bacheca.subscribe('rawBody', rawBody)

    new Vue({
      el: '#v-response-b-group',
      components: {
        ResponseMenu,
      },
      render: function (h) {
        return h('response-menu')
      },
    })

    new Vue({
      el: '#v-response-viewer',
      components: {
        ResponseViewer,
      },
      render: function (h) {
        return h('response-viewer')
      },
    })

    return {
      headersPanel,
      bodyPanel,
      rawBody,
      formattedBody,
      showHeaders,
      showBody,
      useFormattedBody,
      useRawBody,

      // response fields
      content,
      callDuration,
      callStatus,
      statusHelp,
      callSize,
      headers,
    }
  }
})
