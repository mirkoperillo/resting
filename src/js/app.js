requirejs.config({
    baseUrl: 'js/vendor',
    paths: {
         app : '../app',
         component : '../app/components',
        'jquery': 'jquery-3.3.1.min',
        'knockout': 'knockout-3.4.2',
        'knockout-secure-binding': 'knockout-secure-binding',
        'localforage': 'localforage.nopromises.min',
        'hjls': 'highlight.pack'
    }
});

requirejs(['jquery','app/storage','knockout','knockout-secure-binding','hjls','app/request','app/bookmark','app/clipboard','bootstrap','component/entry-list/entryItemVm', 'component/bookmarks/bookmarkVm'], function($,storage,ko,ksb,hjls,request,makeBookmarkProvider,clipboard,bootstrap, EntryItemVm, BookmarkVm) {

  function ContextVm(createDefault) {
    const self = this;
    this.name = ko.observable(createDefault ? 'default' : '');
    this.variables = ko.observableArray();
    this.isDefault = createDefault;
  };

  function RequestVm(request = {}) {
    const self = this;
    this.method = ko.observable('');
    this.url = ko.observable('');
    this.headers = ko.observableArray();
    this.querystring = ko.observableArray();

    this.authenticationType = ko.observable();
    this.username = ko.observable();
    this.password = ko.observable();

    this.bodyType = ko.observable();
    this.formDataParams = ko.observableArray();
    this.formEncodedParams = ko.observableArray();
    this.rawBody = ko.observable();
  }

  function ResponseVm(response = {}) {
    this.callDuration = ko.observable('-');
    this.callStatus = ko.observable('-');
    this.headers = ko.observableArray();
    this.content = ko.observable();
  }

 // already exist a BookmarkVm, why this ??
  function BookmarkSelectedVm(bookmark = {}) {
    const self = this;
    this.id = ko.observable('');
    this.name = ko.observable('');
  }

  function AppVm() {
    const Resting = {
      contexts : new ContextVm(true),
      bookmarkSelected : new BookmarkSelectedVm(),
      request : new RequestVm(),
      response : new ResponseVm(),
      bookmarkCopy: null,   // copy of bookmark object loaded
                            // used to match with modified version in _saveBookmark
      bookmarks: ko.observableArray(),
      folders: ko.observableArray(),
      folderSelected: ko.observable(),
      methods: ko.observableArray(['GET','POST','PUT','DELETE','HEAD','OPTIONS','CONNECT','TRACE','PATCH']),

      // request panel flags
      showRequestHeaders: ko.observable(true),
      showRequestBody: ko.observable(false),
      showQuerystring: ko.observable(false),
      showAuthentication: ko.observable(false),

      // Flags to show/hide dialogs
      showBookmarkDialog: ko.observable(false),
      showAboutDialog: ko.observable(false),
      showCreditsDialog: ko.observable(false),
      showContextDialog: ko.observable(false),
    };

    const bookmarkProvider = makeBookmarkProvider(storage);

    const convertToFormData = (data = [], context = {}) =>
      data.filter(param => param.enabled()).reduce((acc, record) => {
        acc[record.name()] = _applyContext(record.value(),context);
        return acc;
      }, {});

    const serializeBookmark = (bookmarkObj) => {
      return bookmarkProvider.fromJson(JSON.stringify(bookmarkObj));
    }

    const aboutDialog = () => {
      Resting.showAboutDialog(true);
    };

    const creditsDialog = () => {
      Resting.showCreditsDialog(true);
    };

     const contextDialog = () => {
      Resting.showContextDialog(true);
    };

    const dismissCreditsDialog = () => {
      Resting.showCreditsDialog(false);
    };

    const dismissAboutDialog = () => {
      Resting.showAboutDialog(false);
    };

    const dismissContextDialog = () => {
      Resting.showContextDialog(false);
    };

    const convertToUrlEncoded = (data = [], context) =>
      data.filter(param => param.enabled()).map( param => `${param.name()}=${_applyContext(param.value(),context)}`).join('&');

    const updateBody = (bodyType, body) => {
      clearRequestBody();
      Resting.request.bodyType(bodyType);
      if (bodyType === 'form-data') {
        return Resting.request.formDataParams(_convertToEntryItemVM(body));
      }

      if (bodyType === 'x-www-form-urlencoded') {
        return Resting.request.formEncodedParams(_convertToEntryItemVM(body));
      }

      return Resting.request.rawBody(body);
    };

    const clearRequestBody = () => {
      Resting.request.formDataParams.removeAll();
      Resting.request.formEncodedParams.removeAll();
      Resting.request.rawBody('');
      Resting.request.bodyType('');
    };

    const clearRequest = () => {
      Resting.request.method('GET');
      Resting.request.url('');
      clearRequestBody();
      Resting.request.headers.removeAll();
      Resting.request.querystring.removeAll();
      Resting.request.authenticationType('');
      Resting.request.username('');
      Resting.request.password('');
    };

    const clearResponse = () => {
      Resting.response.headers.removeAll();
      Resting.response.content('');
      Resting.response.callDuration('-');
      Resting.response.callStatus('-');
    };

    const _convertToEntryItemVM = (items = []) => items.map(item => {
      // enable values by default when the field is missing.
      // The field has been introduced in v0.7.0
      // maintain it for compatibility purposes
      const enabled = item.enabled === undefined ? true : item.enabled;
      return new EntryItemVm(item.name,item.value, enabled);
    });


    const bookmarkScreenName = () => {
      return Resting.bookmarkSelected.name() && Resting.bookmarkSelected.name().length > 0 ? Resting.bookmarkSelected.name() : Resting.request.method() + ' ' + Resting.request.url();
    };

    const parseRequest = (req) => {
      Resting.request.method(req.method);
      Resting.request.url(req.url);
      Resting.request.bodyType(req.bodyType);
      Resting.request.headers(_convertToEntryItemVM(req.headers));
      Resting.request.querystring(req.querystring ?  _convertToEntryItemVM(req.querystring) : []);
      _updateAuthentication(req.authentication);
      updateBody(req.bodyType, req.body);
    };

    const _updateAuthentication = authentication => {
     if(authentication) {
        Resting.request.authenticationType(authentication.type);
        Resting.request.username(authentication.username);
        Resting.request.password(authentication.password);
      }
    };

    const dataToSend = (context) => {
      if (Resting.request.bodyType() === 'form-data') {
        return convertToFormData(Resting.request.formDataParams(),context);
      } else if (Resting.request.bodyType() === 'x-www-form-urlencoded') {
        return convertToUrlEncoded(Resting.request.formEncodedParams(), context);
      } else if (Resting.request.bodyType() === 'raw') {
        return _applyContext(Resting.request.rawBody().trim(),context);
      }
    };

    const _applyContextToArray = (a = [], context = {}) => {
      return
    };
    const _authentication = (context = {}) => ({type: Resting.request.authenticationType(), username: _applyContext(Resting.request.username(),context), password: _applyContext(Resting.request.password(),context)});

    const body = (bodyType) => {
      if (bodyType === 'form-data') {
        return _extractModelFromVM(Resting.request.formDataParams());
      }

      if (bodyType === 'x-www-form-urlencoded') {
        return _extractModelFromVM(Resting.request.formEncodedParams());
      }

      if (bodyType === 'raw') {
        return Resting.request.rawBody();
      }

      return undefined;
    };


    const validateBookmarkName = (name) => {
      if(name && name.trim().length > 0) {
        return name.trim();
      } else {
        return;
      }
    };

    const isBookmarkLoaded = () => {
      return Resting.bookmarkSelected.id().length > 0;
    }

    const _saveBookmark = bookmark => {
       if(Resting.bookmarkCopy) {
          // if edit a bookmark
          if(bookmark.folder) {
            const oldFolder = Resting.bookmarkCopy.folder;
            if(oldFolder == bookmark.folder) { // folderA to folderA
              let folderObj = Resting.bookmarks().find(b => b.id === bookmark.folder);
              const modifiedFolder = bookmarkProvider.replaceBookmark(folderObj, new BookmarkVm(bookmark));
              bookmarkProvider.save(serializeBookmark(modifiedFolder));
              Resting.bookmarks.replace(folderObj, modifiedFolder);
            } else if(!oldFolder) { //from no-folder to folderA
              const oldBookmark = Resting.bookmarks().find(b => b.id == bookmark.id); // I need the ref to bookmark saved in observable array
                                                                                        //  either it is not removed from it
              deleteBookmark(oldBookmark);
              let folderObj = Resting.bookmarks().find(b => b.id === bookmark.folder);
              const modifiedFolder = bookmarkProvider.replaceBookmark(folderObj, new BookmarkVm(bookmark));
              bookmarkProvider.save(serializeBookmark(modifiedFolder));
              Resting.bookmarks.replace(folderObj, modifiedFolder);
            } else if( oldFolder != bookmark.folder) { // from folderA to folderB
              deleteBookmark(Resting.bookmarkCopy);
              let folderObj = Resting.bookmarks().find(b => b.id === bookmark.folder);
              const modifiedFolder = bookmarkProvider.replaceBookmark(folderObj, new BookmarkVm(bookmark));
              bookmarkProvider.save(serializeBookmark(modifiedFolder));
              Resting.bookmarks.replace(folderObj, modifiedFolder);
            }
          } else {
            if(Resting.bookmarkCopy.folder) { // from folderA to no-folder
              deleteBookmark(Resting.bookmarkCopy);
              Resting.bookmarks.push(new BookmarkVm(bookmark));
            } else { // from no-folder to no-folder
              const oldBookmark = Resting.bookmarks().find(b => b.id === bookmark.id);
              Resting.bookmarks.replace(oldBookmark, new BookmarkVm(bookmark));
            }
            bookmarkProvider.save(serializeBookmark(bookmark));
          }
          Resting.bookmarkCopy = bookmarkProvider.copyBookmark(bookmark);
        } else { // if new bookmark
          if(bookmark.folder) {
            let folderObj = Resting.bookmarks().find(b => b.id === bookmark.folder);
            const modifiedFolder = bookmarkProvider.addBookmarks(folderObj, new BookmarkVm(bookmark));
            bookmarkProvider.save(serializeBookmark(modifiedFolder));
            Resting.bookmarks.replace(folderObj, modifiedFolder);
          } else {
             bookmarkProvider.save(serializeBookmark(bookmark));
             Resting.bookmarks.push(new BookmarkVm(bookmark));
          }

          Resting.bookmarkSelected.id(bookmark.id);
          Resting.bookmarkCopy = bookmarkProvider.copyBookmark(bookmark);
        }
    };

    const _extractModelFromVM = (items = []) => {
      return items.map(item => ({name: item.name(),value: item.value(),enabled: item.enabled()}))
    };


    const saveBookmark = () => {
      const req = request.makeRequest(
        Resting.request.method(), Resting.request.url(),
        _extractModelFromVM(Resting.request.headers()), _extractModelFromVM(Resting.request.querystring()), Resting.request.bodyType(),
        body(Resting.request.bodyType()),_authentication());

      const bookmarkId = Resting.bookmarkCopy ? Resting.bookmarkCopy.id : new Date().toString();
      const bookmarkObj = bookmarkProvider.makeBookmark(bookmarkId, req, validateBookmarkName(Resting.bookmarkSelected.name()), Resting.folderSelected());
      _saveBookmark(bookmarkObj);

      // close the dialog
      Resting.showBookmarkDialog(false);
    };

    const reset = () => {
      Resting.bookmarkCopy = null;
      Resting.folderSelected('');

      Resting.bookmarkSelected.name('');
      Resting.bookmarkSelected.id('');

      clearRequest();
      clearResponse();
    };

    // used by _saveBookmark...why ?
    const deleteBookmark = (bookmark, deleteChildrenBookmarks) => {
      if(bookmark.folder) {
        const containerFolder = Resting.bookmarks().find( b => b.id === bookmark.folder);
        let modifiedFolder = Object.assign({},containerFolder);
        modifiedFolder.bookmarks = containerFolder.bookmarks.filter(b => b.id !== bookmark.id);
        bookmarkProvider.save(serializeBookmark(modifiedFolder));
        Resting.bookmarks.replace(containerFolder,modifiedFolder);
      } else {
        if(bookmark.isFolder && !deleteChildrenBookmarks) {
          const childrenBookmarks = bookmark.bookmarks.map( child => {
            child.folder = null;
            return child;
          });
          childrenBookmarks.forEach(child => _saveBookmark(child));
        }
        storage.deleteById(bookmark.id, () => Resting.bookmarks.remove(bookmark));
      }
    };

    const convertToHeaderObj = (headersList = [], context = {}) =>
      headersList.filter(header => header.enabled()).reduce((acc, header) => {
        acc[header.name()] = _applyContext(header.value(),context);
        return acc;
      }, {});


    const _displayResponse = (response) => {
      Resting.response.headers.removeAll();
      Resting.response.callDuration(`${response.duration}ms`);
      Resting.response.callStatus(response.status);
      response.headers.forEach(header => Resting.response.headers.push(header));
      Resting.response.content(response.content);
    };

    const _convertToQueryString = (params = [], context = {}) => {
      return params.filter(param => param.enabled()).map( param => ({name: param.name(), value: _applyContext(param.value(), context)}));
    };

    const send = () => {
      const mapping = _mapContext();
      if(Resting.request.url() && Resting.request.url().trim().length > 0) {
        clearResponse();
        const url = _applyContext(Resting.request.url(),mapping);
        request.execute(Resting.request.method(),url,convertToHeaderObj(Resting.request.headers(), mapping), _convertToQueryString(Resting.request.querystring(), mapping), Resting.request.bodyType(),Resting.dataToSend(mapping),
        _authentication(mapping),_displayResponse);
      }
    };

    const _mapContext = () => {
      const mapping = {};
      Resting.contexts.variables().filter(v => v.enabled()).forEach( v => mapping[v.name()] = v.value());
      return mapping;
    };

    const _applyContext = (value = '',context = {}) => {
      const tokens = _tokenize(value);
      let computed = value.slice(0);
      if(tokens) {
        tokens.forEach(t => {
          const contextVar = t.substring(1,t.length-1);
          if(context[contextVar]) {
            computed = computed.replace(t, context[contextVar]);
          }
        });
      }
      return computed;
    };

    const _tokenize = (v = '') => {
      const varRegexp = /\{\w+\}/g;
      const tokens = v.match(varRegexp);
      return tokens;
    };

    const loadBookmarkInView = (bookmark = {}) => {
      Resting.bookmarkSelected.id(bookmark.id);
      Resting.bookmarkSelected.name(bookmark.name);
      Resting.request.method(bookmark.request.method);
      Resting.request.url(bookmark.request.url);
    };

    const requestHeadersPanel = () => {
      Resting.showRequestHeaders(true);
      Resting.showRequestBody(false);
      Resting.showQuerystring(false);
      Resting.showAuthentication(false);
    };

    const requestBodyPanel = () => {
      Resting.showRequestHeaders(false);
      Resting.showRequestBody(true);
      Resting.showQuerystring(false);
      Resting.showAuthentication(false);
    };

    const querystringPanel = () => {
      Resting.showRequestHeaders(false);
      Resting.showRequestBody(false);
      Resting.showQuerystring(true);
      Resting.showAuthentication(false);
    };

    const authenticationPanel = () => {
      Resting.showRequestHeaders(false);
      Resting.showRequestBody(false);
      Resting.showQuerystring(false);
      Resting.showAuthentication(true);
    };

    const saveBookmarkDialog = () => {
      Resting.showBookmarkDialog(true);
    };

    const dismissSaveBookmarkDialog = () => {
      Resting.showBookmarkDialog(false);
      if(Resting.bookmarkCopy == null) {
        Resting.bookmarkSelected.name('');
        Resting.folderSelected('');
      }
    };

    const callSendOnEnter = (data, event) => {
      const enter = 13;
      if(event.keyCode === enter) {
        send();
      }
    };

    const saveContext = () => {
      storage.saveContext({name : Resting.contexts.name(), variables : _extractModelFromVM(Resting.contexts.variables()) });
      dismissContextDialog();
    };

    const loadContexts = () => {
      // load contexts
      storage.loadContexts( ctx => {
        Resting.contexts.variables(_convertToEntryItemVM(ctx.variables));
      });
    };


    Resting.parseRequest = parseRequest;
    Resting.dataToSend = dataToSend;
    Resting.deleteBookmark = deleteBookmark;
    Resting.callSendOnEnter = callSendOnEnter;
    Resting.clearResponse = clearResponse;

    Resting.send = send;
    Resting.saveBookmark = saveBookmark;
    Resting.reset = reset;

    Resting.requestBodyPanel = requestBodyPanel;
    Resting.requestHeadersPanel = requestHeadersPanel;
    Resting.querystringPanel = querystringPanel;
    Resting.authenticationPanel = authenticationPanel;

    Resting.aboutDialog = aboutDialog;
    Resting.creditsDialog = creditsDialog;
    Resting.contextDialog = contextDialog;
    Resting.saveBookmarkDialog = saveBookmarkDialog;

    Resting.dismissSaveBookmarkDialog = dismissSaveBookmarkDialog;
    Resting.dismissCreditsDialog = dismissCreditsDialog;
    Resting.dismissAboutDialog = dismissAboutDialog;
    Resting.dismissContextDialog = dismissContextDialog;

    Resting.saveContext = saveContext;
    // FIXME: not good to expose this internal function
    Resting._saveBookmark = _saveBookmark;

    Resting.loadBookmarkInView = loadBookmarkInView;
    Resting.isBookmarkLoaded = isBookmarkLoaded;
    Resting.bookmarkScreenName = bookmarkScreenName;
    Resting.loadContexts = loadContexts;

    return Resting;
  }

  // init application
  $(() => {
    const screenWidth = screen.width;
    const dialogLeftPosition = screenWidth / 2  - 200;
    $('div.dialog').css('left', dialogLeftPosition+'px');

    // seems that this below must be the last instructions to permit component to be registered
    ko.components.register('entry-list', {
      viewModel: { require: 'app/components/entry-list/entryListVm' },
      template: { require: 'text!app/components/entry-list/entryList_view.html' }
    });

    ko.components.register('request-body', {
      viewModel: { require: 'app/components/request-body/requestBodyVm' },
      template: { require: 'text!app/components/request-body/requestBody_view.html' }
    });

     ko.components.register('bookmarks', {
      viewModel: { require: 'app/components/bookmarks/bookmarksVm' },
      template: { require: 'text!app/components/bookmarks/bookmarks_view.html' }
    });

    ko.components.register('authentication', {
      viewModel: { require: 'app/components/authentication/authenticationVm' },
      template: { require: 'text!app/components/authentication/authentication_view.html' }
    });

    ko.components.register('response-panel', {
      viewModel: { require: 'app/components/response/responseVm' },
      template: { require: 'text!app/components/response/response_view.html' }
    });



   // Show all options, more restricted setup than the Knockout regular binding.
   var options = {
     attribute: "data-bind",        // default "data-sbind"
     globals: window,               // default {}
     bindings: ko.bindingHandlers,  // default ko.bindingHandlers
     noVirtualElements: false       // default true
   };

   ko.bindingProvider.instance = new ksb(options);

   const appVM = new AppVm();
   ko.applyBindings(appVM);

  $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    $(this).parent().siblings().removeClass('open');
    $(this).parent().toggleClass('open');
  });

  appVM.loadContexts();
  });
});
