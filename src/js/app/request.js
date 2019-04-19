define(['jquery','app/response'],function($,response){
  const processedRequest = new Map();
  const requestQueue = [];
  const makeRequest = (method, url, headers, querystring, bodyType, body, authentication, context='default') =>
    ({ method, url, headers, querystring, bodyType, body, authentication, context });


  const contentTypesFromBodyTypes = {
      'form-data': 'multipart/form-data',
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
    const requestUrl = _appendQuerystring(prefixProtocol(url),querystring);
    requestQueue.push(requestUrl);
    $.ajax({
      method: method,
      url: requestUrl,
      headers: headers,
      processData: (bodyType === 'form-data'),
      cache: false,
      crossDomain: true,
      contentType: contentTypesFromBodyTypes[bodyType],
      data: body,
      beforeSend: function(xhr) {
        if( authentication.type === 'Basic') {
          xhr.setRequestHeader('Authorization', 'Basic ' + btoa(authentication.username+':'+authentication.password));
        }
      },
      success: (data, status, jqXHR) => {
        const endCall = new Date().getTime();
        const callDuration = endCall - startCall;
        onResponse(response.makeResponse({content: data, headers: response.parseHeaders(processedRequest.get(requestUrl)), status: jqXHR.status,duration: callDuration, size: jqXHR.responseText.length / 1024}));
      },
      error: (jqXHR) => {
        const endCall = new Date().getTime();
        const callDuration = endCall - startCall;
        onResponse(response.makeResponse({content: jqXHR.responseJSON, headers: response.parseHeaders(jqXHR.getAllResponseHeaders()), status: jqXHR.status,duration: callDuration, size: jqXHR.responseText.length / 1024 }));
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
