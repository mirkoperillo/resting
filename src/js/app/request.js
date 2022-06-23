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
 
define(['jquery','app/response'],function($,response){
  const processedRequest = new Map();
  const requestQueue = [];
  const makeRequest = (method, url, headers, querystring, bodyType, body, authentication, context='default') =>
    ({ method, url, headers, querystring, bodyType, body, authentication, context });


  const contentTypesFromBodyTypes = {
      'form-data': false, // leave false to permit insertion of multipart boundary
      'x-www-form-urlencoded': 'application/x-www-form-urlencoded',
      'raw': 'application/json',
  };

  const prefixProtocol = (url) => {
    const validator = new RegExp('^(http|https)://');
    if(!validator.test(url)) {
      return "http://" + url;
    } else {
      return url;
    }
  };

  const _appendQuerystring = (url,querystring = []) => {
    const containsParams = url.indexOf("?") !== -1;
    const convertParams = querystring.map(({name,value}) => `${name}=${value}`);
    const params = convertParams.join('&');
    return params.length > 0 ? (url + (containsParams ? "&" : "?") + params) : url;
  };

  const execute = (method, url, headers, querystring, bodyType, body, authentication, onResponse) => {
    const startCall = new Date().getTime();
    if (authentication.type === 'Oauth 2.0' && authentication.oauthAuthPosition === 'Request URL') {
      querystring = [{ name: "access_token", value: authentication.oauthAccessToken}].concat(querystring);
    }
    const requestUrl = _appendQuerystring(prefixProtocol(url),querystring);
    requestQueue.push(requestUrl);
    $.ajax({
      method: method,
      url: requestUrl,
      headers: headers,
      processData: false,
      cache: false,
      crossDomain: true,
      contentType: contentTypesFromBodyTypes[bodyType],
      data: body,
      converters: {
        'text xml' : window.String,
      },
      beforeSend: function(xhr) {
        switch(authentication.type) {
          case 'Basic':
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(authentication.username+':'+authentication.password));
            break;
          case 'JWT':
            xhr.setRequestHeader('Authorization', 'Bearer ' + authentication.jwtToken);
            break;
          case 'Oauth 2.0':
            if (authentication.oauthAuthPosition === 'Request Header') {
              xhr.setRequestHeader('Authorization', 'Bearer ' + authentication.oauthAccessToken);
            }
            break;
          default:
            // None: no authentication required
        }
      },
      success: (data, status, jqXHR) => {
        const endCall = new Date().getTime();
        const callDuration = endCall - startCall;
        onResponse(response.makeResponse({content: data, headers: response.parseHeaders(processedRequest.get(requestUrl)), status: jqXHR.status,duration: callDuration, size: jqXHR.responseText.length / 1024}));
      },
      error: (jqXHR, status, errorMsg) => {
        const endCall = new Date().getTime();
        const callDuration = endCall - startCall;
        let responseSize = 0;
        if (!!jqXHR.responseText) {
          responseSize = jqXHR.responseText.length / 1024;
        }
        let content = jqXHR.responseJSON;
        if (!content) {
          content = { status: status,  error: errorMsg };
        }
        onResponse(response.makeResponse({content: content, headers: response.parseHeaders(jqXHR.getAllResponseHeaders()), status: jqXHR.status,duration: callDuration, size: responseSize }));
      },
    });
  };

chrome.tabs.getCurrent(currentTab =>
  browser.webRequest.onHeadersReceived.addListener(
    request => {
      const headers = [];
      for (let {name, value} of request.responseHeaders) {
        headers.push(name + ': ' + value);
      }

      const requestId = requestQueue.pop();
      if (!processedRequest.has(requestId)) {
        processedRequest.set(requestId, headers.join('\n'));
      }
    },
    { urls: ['<all_urls>'], tabId: currentTab.id },
    ['responseHeaders'],
  ));

  return {
    makeRequest: makeRequest,
    execute: execute,
  };


});
