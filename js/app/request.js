define(['jquery','app/response'],function($,response){

  const makeRequest = (method, url, headers, bodyType, body) =>
    ({ method, url, headers, bodyType, body });


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

  const execute = (method, url, headers, bodyType, body, onResponse) => {
    const startCall = new Date().getTime();
     $.ajax({
      method: method,
      url: prefixProtocol(url),
      headers: headers,
      processData: (bodyType === 'form-data'),
      cache: false,
      crossDomain: true,
      contentType: contentTypesFromBodyTypes[bodyType],
      data: body,
      success: (data, status, jqXHR) => {
        const endCall = new Date().getTime();
        const callDuration = endCall - startCall;
        onResponse(response.makeResponse(data,response.parseHeaders(jqXHR.getAllResponseHeaders()),jqXHR.status,callDuration));
      },
      error: (jqXHR) => {
        onResponse(response.makeResponse({status: jqXHR.status}));
      },
    });
  };

  return {
    makeRequest: makeRequest,
    execute: execute,
  };


});
