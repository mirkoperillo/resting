function AppViewModel() {
  const self = this;
  self.requestMethod = ko.observable();
  self.requestUrl = ko.observable();
  self.responseBody = ko.observable();
  self.callDuration = ko.observable();
  self.callStatus = ko.observable();
  self.responseHeaders = ko.observableArray();
  self.requestHeaders = ko.observableArray();

  self.showRequestHeaders = ko.observable(true);
  self.showRequestBody = ko.observable(false);

  self.showResponseHeaders = ko.observable(false);
  self.showResponseBody = ko.observable(true);
  
  self.useFormattedResponseBody = ko.observable(false);
  self.useRawResponseBody = ko.observable(true);
  
  self.bodyType = ko.observable();
  self.formDataParams = ko.observableArray();
  self.formEncodedParams = ko.observableArray();
  self.rawBody = ko.observable();
  
  self.bookmarks = ko.observableArray();
  
 
  
  localforage.config({
    name: 'resting',
    storeName: 'bookmarks'
});
  
  
  let convertToFormData = function(data) {
    let formDataObj = {};
    if(data) {
      data.forEach(function(entry) {
        formDataObj[entry.name] = entry.value;
      });
    }
    return formDataObj;
  };
  
  let loadBookmarks = function() {
    let bookmarks = [];
    localforage.iterate(function(value,key, iterationNumber) {
      self.bookmarks.push(JSON.parse(value));
    });
  };
  
   
   // ATTENTION: load the bookmarks in an async mode
   loadBookmarks();

  
  let convertToUrlEncoded = function(data) {
    let encodedParams = "";
    if(data) {
      data.forEach(function(entry) {
        encodedParams+=`${entry.name}=${entry.value}&`;
      });
    }
    return encodedParams.slice(0,-1);
  };

  this.loadBookmark = function(bookmarkIdx) {
      let idx = bookmarkIdx();
      let selectedBookmark = self.bookmarks()[idx];
      if(selectedBookmark) {
        self.requestMethod(selectedBookmark.request.method);
        self.requestUrl(selectedBookmark.request.url);
        self.bodyType(selectedBookmark.request.bodyType);
        if(self.bodyType() == 'form-data') {
          self.formDataParams(selectedBookmark.request.body);
        } else if (bodyType == 'x-www-form-urlencoded') {
          self.formEncodedParams(selectedBookmark.request.body);
        } else {
          self.rawBody(selectedBookmark.request.body);
        }
      }
  }

  this.saveBookmark = function() {
    let bodyContent = body(self.bodyType());
    let request = makeRequest(self.requestMethod(), self.requestUrl(),self.requestHeaders(), self.bodyType(), bodyContent);
    let bookmark = makeBookmark(new Date().toString(), request);
    localforage.setItem(bookmark.id, JSON.stringify(bookmark));
    self.bookmarks.push(bookmark);
  }
  
  this.deleteBookmark = function(bookmark) {
    localforage.removeItem(bookmark.id).then(function() {
      self.bookmarks.remove(bookmark);
    });
  }
  
  let body = function(bodyType) {
    if(bodyType == 'form-data') {
      return self.formDataParams();
    } else if (bodyType == 'x-www-form-urlencoded') {
      return self.formEncodedParams();
    } else {
      return self.rawBody();
    }
  }

  this.send = function () {
    console.log(`${self.requestMethod()} -- ${self.requestUrl()}`);
    const serviceUrl = self.requestUrl();
    const startCall = new Date().getTime();
    let contentType = "application/x-www-form-urlencoded";
    let flagProcessData = false;
    
    if(self.bodyType() == "form-data") {
      flagProcessData = true;
      contentType = "multipart/form-data";
      data = convertToFormData(self.formDataParams());
    } else if(self.bodyType() == "x-www-form-urlencoded") {
      contentType = "application/x-www-form-urlencoded";
      data = convertToUrlEncoded(self.formEncodedParams());
    } else if(self.bodyType() == "raw") {
      contentType = "application/json";
      data = self.rawBody().trim();
    } 
    $.ajax({
      method: self.requestMethod(),
      url: serviceUrl,
      headers: convertToHeaderObj(self.requestHeaders()),
      processData: flagProcessData,
      cache: false,
      crossDomain: true,
      contentType: contentType,
      data: data,
      success(data, status, jqXHR) {
        const endCall = new Date().getTime();
        const callDuration = endCall - startCall;
        self.responseBody(JSON.stringify(data));
        self.callDuration(`${callDuration}ms`);
        self.callStatus(jqXHR.status);
        let headers = parseHeaders(jqXHR.getAllResponseHeaders());
        headers.forEach(function(h) {
          self.responseHeaders.push(h);
        });
      },
      error(jqXHR, textStatus, errorThrown) {
        self.callStatus(jqXHR.status);
      },
    });
  };

  this.requestHeadersPanel = function() {
    self.showRequestHeaders(true);
    self.showRequestBody(false);
  }
  
  this.requestBodyPanel = function() {
    self.showRequestHeaders(false);
    self.showRequestBody(true);
  }
  
  this.responseHeadersPanel = function() {
    self.showResponseHeaders(true);
    self.showResponseBody(false);
    
    // close jquery accordion
    $('#collapseOne').collapse('hide');
  };
  
  this.responseBodyPanel = function() {
    self.showResponseBody(true);
    self.showResponseHeaders(false);
  };
  
  this.formattedResponseBody = function() {
    self.useFormattedResponseBody(true);
    self.useRawResponseBody(false);
    hljs.highlightBlock($('#formatted-resp'));
  };
  
  this.rawResponseBody = function() {
    self.useFormattedResponseBody(false);
    self.useRawResponseBody(true);
  };

  let convertToHeaderObj = function(headersList) {
    let headerObj = {};
    $.each(headersList, function(index, header) {
      headerObj[header.name] = header.value;
    });
    return headerObj;
  }
}

function parseHeaders(headers) {
  return headers.trim().split('\n').map((header) => {
    const i = header.indexOf(':');
    return {
      name: header.substr(0, i).trim(),
      value: header.substr(i + 1).trim(),
    };
  });
}


function EntryListViewModel(params) {
  const self = this;
  self.entryList = params.entryList;
  
  self.entryName = ko.observable();
  self.entryValue = ko.observable();
  
  
  self.add = function() {
    if(checkValidEntry(self.entryName(),self.entryValue())) {
      self.entryList.push({name: self.entryName() , value: self.entryValue()});
      self.entryName('');
      self.entryValue('');
    }
  }
  
  self.remove = function(entry) {
    self.entryList.remove(entry);
  }
  
  let checkValidEntry = function(name,value) {
    return name.trim().length > 0 && value.trim().length > 0;
  }
}

function RequestBodyViewModel(params) {
  const self = this;
  
  self.bodyType = params.bodyType;
  self.formDataParams = params.formDataParams;
  self.formEncodedParams = params.formEncodedParams;
  self.rawBody = params.rawBody;
}

// Activates knockout.js
$(document).ready(function() {
// seems that this below must be the last instructions to permit component to be registered
  ko.components.register('entry-list-widget', {
      viewModel: EntryListViewModel,
      template: { element : 'entry-list-widget-template'}
  });

  ko.components.register('request-body', {
      viewModel: RequestBodyViewModel,
      template: { element : 'request-body-template'}
  });

  ko.applyBindings(new AppViewModel());
});


let makeBookmark = function(id,request, name) {
  return {id: id, request : request , name : name};
}
let makeRequest = function(method, url, headers, bodyType, body) {
  return {method: method, url : url, headers : headers, bodyType : bodyType, body : body};
}
