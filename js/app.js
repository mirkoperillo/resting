(($, localforage, ko) => {
  const makeBookmark = (id, request, name) => ({ id, request, name });

  const makeRequest = (method, url, headers, bodyType, body) =>
    ({ method, url, headers, bodyType, body });

  function AppViewModel() {
    const Resting = {
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
      useFormattedResponseBody: ko.observable(false),
      useRawResponseBody: ko.observable(true),
      bodyType: ko.observable(),
      formDataParams: ko.observableArray(),
      formEncodedParams: ko.observableArray(),
      rawBody: ko.observable(),
      bookmarks: ko.observableArray(),
    };

    const contentTypesFromBodyTypes = {
      'form-data': 'multipart/form-data',
      'x-www-form-urlencoded': 'application/x-www-form-urlencoded',
      'raw': 'application/json',
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
      localforage.iterate(value => Resting.bookmarks.push(JSON.parse(value)));

    // ATTENTION: load the bookmarks in an async mode
    loadBookmarks();

    const convertToUrlEncoded = (data = []) =>
      data.map(([name, value]) => `${name}=${value}`).join('&');

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

      return Resting.parseRequest(selectedBookmark.request);
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

    const saveBookmark = () => {
      const request = makeRequest(
        Resting.requestMethod(), Resting.requestUrl(),
        Resting.requestHeaders(), Resting.bodyType(),
        body(Resting.bodyType()));
      const bookmark = makeBookmark(new Date().toString(), request);
      localforage.setItem(bookmark.id, JSON.stringify(bookmark));
      Resting.bookmarks.push(bookmark);
    };

    const deleteBookmark = bookmark =>
      localforage.removeItem(bookmark.id)
        .then(() =>
          Resting.bookmarks.remove(bookmark));

    const parseHeaders = headers =>
      headers.trim().split('\n')
        .map(header =>
          header.split(':')
            .map(h => h.trim()))
        .map(header => ({ name: header.name, value: header.value }));

    const convertToHeaderObj = headersList =>
      headersList.reduce((acc, header) => {
        acc[header.name] = header.value;
        return acc;
      }, {});

    const send = () => {
      const serviceUrl = Resting.requestUrl();
      const serviceMethod = Resting.requestMethod();

      console.log('send', serviceMethod, '--', serviceUrl);

      const startCall = new Date().getTime();

      $.ajax({
        method: serviceMethod,
        url: serviceUrl,
        headers: convertToHeaderObj(Resting.requestHeaders()),
        processData: (Resting.bodyType() === 'form-data'),
        cache: false,
        crossDomain: true,
        contentType: contentTypesFromBodyTypes[Resting.bodyType()],
        data: Resting.dataToSend(),
        success: (data, status, jqXHR) => {
          const endCall = new Date().getTime();
          const callDuration = endCall - startCall;
          Resting.responseBody(JSON.stringify(data));
          Resting.callDuration(`${callDuration}ms`);
          Resting.callStatus(jqXHR.status);
          parseHeaders(jqXHR.getAllResponseHeaders())
            .forEach(header =>
              Resting.responseHeaders.push(header));
        },
        error: (jqXHR) => {
          Resting.callStatus(jqXHR.status);
        },
      });
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
      hljs.highlightBlock($('#formatted-resp')); // should be removed?
    };

    const rawResponseBody = () => {
      Resting.useFormattedResponseBody(false);
      Resting.useRawResponseBody(true);
    };

    Resting.parseRequest = parseRequest;
    Resting.dataToSend = dataToSend;
    Resting.send = send;
    Resting.saveBookmark = saveBookmark;
    Resting.loadBookmark = loadBookmark;
    Resting.deleteBookmark = deleteBookmark;
    Resting.requestBodyPanel = requestBodyPanel;
    Resting.responseBodyPanel = responseBodyPanel;
    Resting.formattedResponseBody = formattedResponseBody;
    Resting.requestHeadersPanel = requestHeadersPanel;
    Resting.responseHeadersPanel = responseHeadersPanel;
    Resting.rawResponseBody = rawResponseBody;

    return Resting;
  }

  function EntryListViewModel(params) {
    const EntryList = {
      entryList: params.entryList,
      entryName: ko.observable(),
      entryValue: ko.observable(),
    };

    const checkValidEntry = (name, value) =>
      name.trim().length > 0 && value.trim().length > 0;

    const add = () => {
      if (!checkValidEntry(EntryList.entryName(), EntryList.entryValue())) return false;

      EntryList.entryList.push({ name: EntryList.entryName(), value: EntryList.entryValue() });
      EntryList.entryName('');
      EntryList.entryValue('');

      return true;
    };

    const remove = entry =>
      EntryList.entryList.remove(entry);

    EntryList.add = add;
    EntryList.remove = remove;

    return EntryList;
  }

  function RequestBodyViewModel(params) {
    const self = this;

    self.bodyType = params.bodyType;
    self.formDataParams = params.formDataParams;
    self.formEncodedParams = params.formEncodedParams;
    self.rawBody = params.rawBody;
  }

  // Activates knockout.js
  $(() => {
    // seems that this below must be the last instructions to permit component to be registered
    ko.components.register('entry-list-widget', {
      viewModel: EntryListViewModel,
      template: { element: 'entry-list-widget-template' },
    });

    ko.components.register('request-body', {
      viewModel: RequestBodyViewModel,
      template: { element: 'request-body-template' },
    });

    ko.applyBindings(new AppViewModel());
  });
})($, localforage, ko);
