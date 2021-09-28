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

define(['knockout','jquery','hjls','app/clipboard', 'app/bacheca','Vue','component/clip'],function(ko,$,hjls,clipboard,bacheca, Vue) {

  return function ResponseVm(params) {

    const callDuration = ko.observable('-');
    const callStatus = ko.observable('-');
    const callSize = ko.observable('-');
    const headers = ko.observableArray();;
    const content = ko.observable();

    const showHeaders = ko.observable(false);
    const showBody = ko.observable(true);
    const useFormattedBody = ko.observable(true);
    const useRawBody = ko.observable(false);
    const body = ko.observable('');

   const headersPanel = () => {
      showHeaders(true);
      showBody(false);

      // close jquery accordion
      $('#collapseOne').collapse('hide');
    };

    const bodyPanel = () => {
      showBody(true);
      showHeaders(false);
    };

    const formattedBody = () => {
      useFormattedBody(true);
      useRawBody(false);
      if(content().length === 0) {
        body('');
      } else {
        body(JSON.stringify(content(),null,2));
      }
      _highlight();
    };

    const rawBody = () => {
      useFormattedBody(false);
      useRawBody(true);
       if(content().length === 0) {
        body('');
      } else {
        body(JSON.stringify(content()));
      }
      _unhighlight();
    };

    content.subscribe( newValue => {
     if(newValue.length === 0) {
        body('');
     }else if(useFormattedBody()) {
        body(JSON.stringify(newValue,null,2));
        _highlight();
      } else {
        body(JSON.stringify(newValue));
      }
    });

   const _unhighlight = () => {
      $('#highlighted-response').removeClass('hljs');
    };

    const _highlight = () => {
      $('#highlighted-response').each(function(i, block) {
      hljs.highlightBlock(block);
      });
    };

    const display = (response) => {
      clear();
       setTimeout(function () {
        callDuration(`${response.duration}ms`);
        callStatus(response.status);
        callSize(`${response.size.toFixed(2)}KB`)
        response.headers.forEach(header => headers.push(header));
        content(response.content);
    }, 500);
    };

    const clear = () => {
      headers.removeAll();
      content('');
      callDuration('-');
      callStatus('-');
      callSize('-');
    };

    bacheca.subscribe('responseReady', display);
    bacheca.subscribe('reset', clear);
    bacheca.subscribe('loadBookmark', clear);
    bacheca.subscribe('deleteBookmark', clear);

    var vueApp = new Vue({
    el: '#vue-stuff'
    })

  $(() => {

    clipboard.bindOn('div.copy-n-paste');
    clipboard.copyFrom('#highlighted-response', 'copy-n-paste');
    clipboard.onCopy(function() {
      $('.alert').removeClass('hide');
      setTimeout(function () { $('.alert').addClass('hide'); }, 2000);
    });
  });

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
      body,
      callDuration,
      callStatus,
      callSize,
      headers,
    };

  }
});
