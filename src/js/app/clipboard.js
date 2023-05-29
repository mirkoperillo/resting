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

// ATTENTION: in this moment this service class is unused
define(['jquery'], function ($) {
  var handlers = []

  // replace by click event on vue.js component
  function bindOn(selector) {
    $(selector).on('click', function (event) {
      event.preventDefault()
      event.stopPropagation()
      document.execCommand('copy')
    })
  }

  function copyClipboardHandler(contentSelector, copyButtonClass) {
    return function (event) {
      // move from clickable div to click event
      /*if (!$(event.target).hasClass(copyButtonClass)) {
                return;
            }*/

      event.preventDefault()
      event.stopPropagation()

      var response = $(contentSelector).text()
      if (!response) {
        return
      }

      event.clipboardData.setData('text/plain', response)
      notify()
    }
  }

  function copyFrom(contentSelector, copyButtonClass) {
    document.addEventListener(
      'copy',
      copyClipboardHandler(contentSelector, copyButtonClass)
    )
  }

  function onCopy(handler) {
    handlers.push(handler)
  }

  function notify() {
    handlers.forEach(function (handler) {
      handler()
    })
  }

  return {
    bindOn: bindOn,
    copyFrom: copyFrom,
    onCopy: onCopy,
  }
})
