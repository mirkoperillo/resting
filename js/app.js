requirejs.config({
    paths: {
        'jquery': 'jquery-2.2.4.min',
        'knockout': 'knockout-3.4.2',
        'localforage': 'localforage.nopromises.min',
        'hjls': 'highlight.pack'
    }
});

requirejs(['jquery','localforage','knockout','hjls','request'], function($,localforage,ko,hjls,request) {

  const makeBookmark = (id, request, name) => ({ id, request, name });

  function AppViewModel() {
    const Resting = {
      responseContent : {},
      bookmarkLoaded: null,
      bookmarkLoadedIdx: -1,
      requestMethod: ko.observable(),
      requestUrl: ko.observable(),
      responseBody: ko.observable(),
      callDuration: ko.observable(),
      callStatus: ko.observable(),
      responseHeaders: ko.observableArray(),
      requestHeaders: ko.observableArray(),
      showRequestHeaders: ko.observable(true),
      showRequestBody: ko.observable(false),
      showResponseHeaders: ko.observable(false),
      showResponseBody: ko.observable(true),
      useFormattedResponseBody: ko.observable(true),
      useRawResponseBody: ko.observable(false), // is it used ??
      bodyType: ko.observable(),
      formDataParams: ko.observableArray(),
      formEncodedParams: ko.observableArray(),
      rawBody: ko.observable(),
      bookmarks: ko.observableArray(),
      bookmarkName: ko.observable(),
      showBookmarkDialog: ko.observable(false),
      methods: ko.observableArray(['GET','POST','PUT','DELETE','HEAD','OPTIONS','CONNECT','TRACE','PATCH'])
    };

    localforage.config({
      name: 'resting',
      storeName: 'bookmarks',
    });

    const convertToFormData = (data = []) =>
      data.reduce((acc, record) => {
        acc[record.name] = record.value;
        return acc;
      }, {});

    const loadBookmarks = () =>
      localforage.iterate(function(value,key,iterationNumber) { Resting.bookmarks.push(JSON.parse(value)); });

    // ATTENTION: load the bookmarks in an async mode
    loadBookmarks();

    const convertToUrlEncoded = (data = []) =>
      data.map( param => `${param.name}=${param.value}`).join('&');

    const updateBody = (bodyType, body) => {
      if (bodyType === 'form-data') {
        return Resting.formDataParams(body);
      }

      if (bodyType === 'x-www-form-urlencoded') {
        return Resting.formEncodedParams(body);
      }

      return Resting.rawBody(body);
    };

    const parseRequest = (req) => {
      Resting.requestMethod(req.method);
      Resting.requestUrl(req.url);
      Resting.bodyType(req.bodyType);
      Resting.requestHeaders(req.headers);
      updateBody(req.bodyType, req.body);
    };

    const dataToSend = () => {
      if (Resting.bodyType() === 'form-data') {
        return convertToFormData(Resting.formDataParams());
      }

      if (Resting.bodyType() === 'x-www-form-urlencoded') {
        return convertToUrlEncoded(Resting.formEncodedParams());
      }

      return Resting.rawBody().trim();
    };

  
    const loadBookmark = (bookmarkIdx) => {
      const selectedBookmark = Resting.bookmarks()[bookmarkIdx()];
      if (!selectedBookmark) return false;
      Resting.bookmarkLoadedIdx = bookmarkIdx();
      return loadBookmarkData(selectedBookmark);
    };
    
    const loadBookmarkData = (bookmark) => {
      Resting.bookmarkLoaded = bookmark.id;
      Resting.parseRequest(bookmark.request);
      Resting.bookmarkName(bookmark.name);
    };

    const body = (bodyType) => {
      if (bodyType === 'form-data') {
        return Resting.formDataParams();
      }

      if (bodyType === 'x-www-form-urlencoded') {
        return Resting.formEncodedParams();
      }

      return Resting.rawBody();
    };


    const validateBookmarkName = (name) => {
      if(name && name.trim().length > 0) {
        return name.trim();
      } else {
        return;
      }
    };

    const saveBookmark = () => {
      const req = request.makeRequest(
        Resting.requestMethod(), Resting.requestUrl(),
        Resting.requestHeaders(), Resting.bodyType(),
        body(Resting.bodyType()));
      const bookmarkId = Resting.bookmarkLoaded ? Resting.bookmarkLoaded : new Date().toString(); 
      const bookmark = makeBookmark(bookmarkId, req, validateBookmarkName(Resting.bookmarkName()));
      localforage.setItem(bookmark.id, JSON.stringify(bookmark));
      if(!Resting.bookmarkLoaded) {
        Resting.bookmarks.push(bookmark);
      } else {
        const oldBookmark = Resting.bookmarks()[Resting.bookmarkLoadedIdx];
        Resting.bookmarks.replace(oldBookmark, bookmark);
      }
    };

    const deleteBookmark = bookmark =>
      localforage.removeItem(bookmark.id)
        .then(() =>
          Resting.bookmarks.remove(bookmark));


    const convertToHeaderObj = headersList =>
      headersList.reduce((acc, header) => {
        acc[header.name] = header.value;
        return acc;
      }, {});


    const displayResponse = (response) => {
      Resting.callDuration(`${response.duration}ms`);
      Resting.callStatus(response.status);
      response.headers.forEach(header => Resting.responseHeaders.push(header));
      Resting.responseContent = response.content;
      if(Resting.useFormattedResponseBody()) {
        Resting.responseBody(JSON.stringify(response.content,null,2));
        highlight();
      } else {
        Resting.responseBody(JSON.stringify(response.content));
      }
    };

    const callOnEnter = (callback, data,event) => {
      const enter = 13;
      if(event.keyCode === enter) {
        callback();
      }
    };

    const send = () => {
      request.execute(Resting.requestMethod(),Resting.requestUrl(),convertToHeaderObj(Resting.requestHeaders()),Resting.bodyType(),Resting.dataToSend(),displayResponse);
    };

    const requestHeadersPanel = () => {
      Resting.showRequestHeaders(true);
      Resting.showRequestBody(false);
    };

    const requestBodyPanel = () => {
      Resting.showRequestHeaders(false);
      Resting.showRequestBody(true);
    };

    const responseHeadersPanel = () => {
      Resting.showResponseHeaders(true);
      Resting.showResponseBody(false);

      // close jquery accordion
      $('#collapseOne').collapse('hide');
    };

    const responseBodyPanel = () => {
      Resting.showResponseBody(true);
      Resting.showResponseHeaders(false);
    };

    const formattedResponseBody = () => {
      Resting.useFormattedResponseBody(true);
      Resting.useRawResponseBody(false);
      Resting.responseBody(JSON.stringify(Resting.responseContent,null,2));
      highlight();
    };

    const rawResponseBody = () => {
      Resting.useFormattedResponseBody(false);
      Resting.useRawResponseBody(true);
      Resting.responseBody(JSON.stringify(Resting.responseContent));
      unhighlight();
    };
    
    const saveBookmarkDialog = () => {
      Resting.showBookmarkDialog(true);
    };
    
    const dismissSaveBookmarkDialog = () => {
      Resting.showBookmarkDialog(false);
      Resting.bookmarkName('');
    };
    
    
    const unhighlight = () => {
      $('#highlighted-response').removeClass('hljs');
    };
    
    const highlight = () => {
      $('#highlighted-response').each(function(i, block) {
      hljs.highlightBlock(block);
      });
    };
    
    
    Resting.parseRequest = parseRequest;
    Resting.dataToSend = dataToSend;
    Resting.send = send;
    Resting.callOnEnter = callOnEnter;
    Resting.saveBookmark = saveBookmark;
    Resting.loadBookmark = loadBookmark;
    Resting.deleteBookmark = deleteBookmark;
    Resting.requestBodyPanel = requestBodyPanel;
    Resting.responseBodyPanel = responseBodyPanel;
    Resting.formattedResponseBody = formattedResponseBody;
    Resting.requestHeadersPanel = requestHeadersPanel;
    Resting.responseHeadersPanel = responseHeadersPanel;
    Resting.rawResponseBody = rawResponseBody;
    Resting.saveBookmarkDialog = saveBookmarkDialog;
    Resting.dismissSaveBookmarkDialog = dismissSaveBookmarkDialog;

    return Resting;
  }

  // init application
  $(() => {
    // seems that this below must be the last instructions to permit component to be registered
    ko.components.register('entry-list', {
      viewModel: { require: 'components/entry-list/component' },
      template: { require: 'text!components/entry-list/view.html' }
    });

    ko.components.register('request-body', {
      viewModel: { require: 'components/request-body/component' },
      template: { require: 'text!components/request-body/template.html' }
    });

    
    ko.applyBindings(new AppViewModel());
    
    const screenWidth = screen.width;
    const dialogLeftPosition = screenWidth / 2  - 200;
    $('div.dialog').css('left', dialogLeftPosition+'px');
    
  });
});
