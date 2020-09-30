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

requirejs(['jquery','app/storage','knockout','knockout-secure-binding','hjls','app/request','app/bookmark','app/clipboard', 'app/bacheca', 'bootstrap','component/entry-list/entryItemVm', 'component/bookmarks/bookmarkVm'], function($,storage,ko,ksb,hjls,request,makeBookmarkProvider,clipboard,bacheca,bootstrap, EntryItemVm, BookmarkVm) {

  function ContextVm(name = 'default',variables = []) {
    const self = this;
    this.name = ko.observable(name);
    this.variables = ko.observableArray(variables.map(v => new EntryItemVm(v.name, v.value, v.enabled)));
    this.isDefault = ko.computed(function() {
        return this.name() === 'default';
    }, this);
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
    this.jwtToken = ko.observable();
    this.oauthAuthPosition = ko.observable();
    this.oauthAccessToken = ko.observable();

    this.bodyType = ko.observable();
    this.formDataParams = ko.observableArray();
    this.formEncodedParams = ko.observableArray();
    this.rawBody = ko.observable();

    this.context = ko.observable('default');
  }

 // already exist a BookmarkVm, why this ??
  function BookmarkSelectedVm(bookmark = {}) {
    const self = this;
    this.id = ko.observable('');
    this.name = ko.observable('');
    this.folder = ko.observable('');

    this.toModel = () => {
      return { id: this.id(), name : this.name(), folder : this.folder() };
    }

    this.reset = () => {
      this.id('');
      this.name('');
      this.folder('');
    };
  }

  function TabContextVm(counter = 1) {
    const self = this;
    this.name = ko.observable('TAB ' + counter);
    this.request = {};
    this.response = {};

    // bookmark stuff
    this.folderName = ko.observable();
    this.bookmarkSelected = new BookmarkSelectedVm();

    this.isActive = ko.observable(false);

    this.reset = () => {
      this.request = {};
      this.response = {};
      this.folderName('');
      this.bookmarkSelected.reset();
    };
  }

  function AppVm() {
    const Resting = {
      contexts : ko.observableArray(),
      selectedContext: new ContextVm(),
      bookmarkSelected : new BookmarkSelectedVm(),  // bookmark loaded
      tabCounter: 0,
      tabContexts : ko.observableArray(),
      activeTab : null,
      request : new RequestVm(),
      bookmarkCopy: null,   // copy of bookmark object loaded
                            // used to match with modified version in _saveBookmark
      bookmarks: ko.observableArray(),
      folders: ko.observableArray(),
      folderSelected: ko.observable(),  // used by save dialog
      folderName: ko.observable(),  // used by loadedBookmark div
      bookmarkName: ko.observable(),  // used by save dialog
      methods: ko.observableArray(['GET','POST','PUT','DELETE','HEAD','OPTIONS','CONNECT','TRACE','PATCH']),

      // request panel flags
      showRequestHeaders: ko.observable(true),
      showRequestBody: ko.observable(false),
      showQuerystring: ko.observable(false),
      showAuthentication: ko.observable(false),
      showActiveContext: ko.observable(false),

      // Flags to show/hide dialogs
      showBookmarkDialog: ko.observable(false),
      showAboutDialog: ko.observable(false),
      showCreditsDialog: ko.observable(false),
      showContextDialog: ko.observable(false),
      showCreateContextDialog: ko.observable(false),
      showConfirmDialog: ko.observable(false),
      //showFeedbackDialog: ko.observable(false),
      //showCommunicationDialog: ko.observable(false),

      saveAsNewBookmark: ko.observable(false),

      dialogConfirmMessage: ko.observable(),
      contextName: ko.observable(),
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

     const contextDialog = (context) => {
      Resting.selectedContext.name(context.name());
      Resting.selectedContext.variables(context.variables());
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
      Resting.request.jwtToken('');
      Resting.request.oauthAuthPosition('');
      Resting.request.oauthAccessToken('');
      Resting.request.context('default');
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
      if(req) {
        Resting.request.method(req.method);
        Resting.request.url(req.url);
        Resting.request.bodyType(req.bodyType);
        Resting.request.headers(_convertToEntryItemVM(req.headers));
        Resting.request.querystring(req.querystring ?  _convertToEntryItemVM(req.querystring) : []);
        _updateAuthentication(req.authentication);
        updateBody(req.bodyType, req.body);
        Resting.request.context(req.context);
      }
    };

    const _updateAuthentication = authentication => {
     if(authentication) {
        Resting.request.authenticationType(authentication.type);
        switch(authentication.type) {
          case 'Basic':
            Resting.request.username(authentication.username);
            Resting.request.password(authentication.password);
            break;
          case 'JWT':
            Resting.request.jwtToken(authentication.jwtToken);
            break;
          case 'Oauth 2.0':
            Resting.request.oauthAuthPosition(authentication.oauthAuthPosition);
            Resting.request.oauthAccessToken(authentication.oauthAccessToken);
            break;

          default:
            // No authentication
        }
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

    const _authentication = (contexts = []) => ({
      type: Resting.request.authenticationType(),
      username: _applyContext(Resting.request.username(), contexts),
      password: _applyContext(Resting.request.password(), contexts),
      jwtToken: _applyContext(Resting.request.jwtToken(), contexts),
      oauthAuthPosition: _applyContext(Resting.request.oauthAuthPosition(), contexts),
      oauthAccessToken: _applyContext(Resting.request.oauthAccessToken(), contexts),
    });

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

    const _saveBookmark = (bookmark, internal=false) => {
       if(Resting.bookmarkCopy && !Resting.saveAsNewBookmark() && !internal) {
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

          if(!internal) {
            Resting.bookmarkSelected.id(bookmark.id);
            Resting.bookmarkCopy = bookmarkProvider.copyBookmark(bookmark);
          }
        }
    };

    const _extractModelFromVM = (items = []) => {
      return items.map(item => ({name: item.name(),value: item.value(),enabled: item.enabled()}))
    };


    const saveBookmark = () => {
      const req = request.makeRequest(
        Resting.request.method(), Resting.request.url(),
        _extractModelFromVM(Resting.request.headers()), _extractModelFromVM(Resting.request.querystring()), Resting.request.bodyType(),
        body(Resting.request.bodyType()),_authentication(), Resting.request.context());

      const bookmarkId = Resting.bookmarkCopy && !Resting.saveAsNewBookmark() ? Resting.bookmarkCopy.id : storage.generateId();
      const creationDate = Resting.bookmarkCopy && !Resting.saveAsNewBookmark() ? Resting.bookmarkCopy.created : new Date();
      const bookmarkObj = bookmarkProvider.makeBookmark(bookmarkId, req, validateBookmarkName(Resting.bookmarkName()), Resting.folderSelected(), creationDate);
      Resting.bookmarkSelected.name(Resting.bookmarkName());
      Resting.bookmarkSelected.folder(Resting.folderSelected());
      const name = _folderName(Resting.folderSelected());
      Resting.folderName(name ? name : '--');
      _saveBookmark(bookmarkObj);

      // close the dialog
      Resting.showBookmarkDialog(false);
    };


    const reset = (tabReset = true) => {
      Resting.bookmarkCopy = null;
      Resting.folderSelected('');
      Resting.folderName('--');
      Resting.bookmarkName('');
      Resting.bookmarkSelected.name('');
      Resting.bookmarkSelected.id('');
      clearRequest();
      if(tabReset) {
        _tabReset();
      }
      bacheca.publish('reset');
    };

    const _tabReset = () => {
      const tab = Resting.activeTab;
      tab.reset();
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
      bacheca.publish('responseReady', response);
    };

    const _convertToQueryString = (params = [], context = {}) => {
      return params.filter(param => param.enabled()).map( param => ({name: param.name(), value: _applyContext(param.value(), context)}));
    };

    const send = () => {
      if (!Resting.request.url() || Resting.request.url().trim().length === 0) {
        return;
      }

      const mapping = _mapContext();
      request.execute(
        Resting.request.method(),
        _applyContext(Resting.request.url().trim(), mapping),
        convertToHeaderObj(
          Resting.request.headers(), mapping
        ),
        _convertToQueryString(
          Resting.request.querystring(), mapping
        ),
        Resting.request.bodyType(),
        Resting.dataToSend(mapping),
        _authentication(mapping), _manageResponse
      );
    };

    const _manageResponse = (response) => {
      Resting.activeTab.response = response;
      _displayResponse(response);
    };

    // Note that elements order is important
    const _mapContext = () =>
      [
        Resting.contexts()
          .find(ctx =>
            ctx.name() === 'default')
        ,
        Resting.request.context() !== 'default' &&
        Resting.contexts()
          .find(ctx =>
            ctx.name() === Resting.request.context())
      ]
        .filter(ctx => !!ctx)
        .map(ctx =>
          _extractCtxVars(ctx.variables()));

    const _extractCtxVars = (vars = []) =>
      vars
        .filter(v => v.enabled())
        .reduce((acc, v) => {
          acc[v.name()] = v.value();
          return acc;
        }, {});

    // XXX: context is an object on some calls
    const _applyContext = (value = '', contexts = []) => {
      const contextVars = contexts.length > 0  ? Object.assign(contexts[0], contexts[1] || {}) : [];
      return value.replace(
        /\{\w+\}/g,
        match =>
          contextVars[match.substring(1,match.length-1)] || match
      );
    };

    const loadBookmarkInView = (bookmark = {}) => {
      Resting.bookmarkSelected.id(bookmark.id);
      Resting.bookmarkSelected.name(bookmark.name);
      Resting.bookmarkSelected.folder(bookmark.folder);
      if(bookmark.request) {
        Resting.request.method(bookmark.request.method);
        Resting.request.url(bookmark.request.url);
      }
    };

    const requestHeadersPanel = () => {
      Resting.showRequestHeaders(true);
      Resting.showRequestBody(false);
      Resting.showQuerystring(false);
      Resting.showAuthentication(false);
      Resting.showActiveContext(false);
    };

    const requestBodyPanel = () => {
      Resting.showRequestHeaders(false);
      Resting.showRequestBody(true);
      Resting.showQuerystring(false);
      Resting.showAuthentication(false);
      Resting.showActiveContext(false);
    };

    const querystringPanel = () => {
      Resting.showRequestHeaders(false);
      Resting.showRequestBody(false);
      Resting.showQuerystring(true);
      Resting.showAuthentication(false);
      Resting.showActiveContext(false);
    };

    const authenticationPanel = () => {
      Resting.showRequestHeaders(false);
      Resting.showRequestBody(false);
      Resting.showQuerystring(false);
      Resting.showAuthentication(true);
      Resting.showActiveContext(false);
    };

    const contextPanel = () => {
      Resting.showRequestHeaders(false);
      Resting.showRequestBody(false);
      Resting.showQuerystring(false);
      Resting.showAuthentication(false);
      Resting.showActiveContext(true);
    };

    const saveBookmarkDialog = () => {
      Resting.showBookmarkDialog(true);
      Resting.saveAsNewBookmark(false);
      Resting.bookmarkName(Resting.bookmarkSelected.name());
    };

    const saveAsBookmarkDialog = () => {
      Resting.showBookmarkDialog(true);
      Resting.saveAsNewBookmark(true);
      Resting.bookmarkName('');
    };

    const dismissSaveBookmarkDialog = () => {
      Resting.showBookmarkDialog(false);
      if(Resting.bookmarkCopy == null) {
        Resting.bookmarkSelected.name('');
        Resting.folderSelected('');
        Resting.folderName('--');
      }
    };

    const callSendOnEnter = (data, event) => {
      const enter = 13;
      if(event.keyCode === enter) {
        send();
      }
    };

    const closeDialogOnExcape = (data, event) => {
      const excape = 27;
      if(event.keyCode === excape) {
        Resting.showAuthentication(false),
        Resting.showActiveContext(false),
        Resting.showBookmarkDialog(false),
        Resting.showAboutDialog(false),
        Resting.showCreditsDialog(false),
        Resting.showContextDialog(false),
        Resting.showCreateContextDialog(false),
        Resting.showConfirmDialog(false),
        Resting.saveAsNewBookmark(false),
        Resting.showFeedbackDialog(false)
      }
    };

    const saveContext = () => {
      storage.saveContext({name : Resting.selectedContext.name(), variables : _extractModelFromVM(Resting.selectedContext.variables()) });
      const contextToEditIdx = Resting.contexts().find(ctx => ctx.name === Resting.selectedContext.name());
      if(contextToEditIdx > -1) {
        Resting.contexts.replace(Resting.contexts[contextToEditIdx],Resting.selectedContext);
      }

      dismissContextDialog();
    };

    const confirmDeleteContext = () => {
       Resting.showConfirmDialog(true);
       Resting.dialogConfirmMessage("Confirm context delete ?");
    };

    const deleteContext = () => {
       const ctxToRemove = Resting.contexts().find(ctx => ctx.name() === Resting.selectedContext.name());
       storage.deleteContextById(Resting.selectedContext.name());
       Resting.contexts.remove(ctxToRemove);
       dismissConfirmDialog();
       dismissContextDialog();
    };

    const loadContexts = () => {
      // load contexts
      storage.loadContexts( ctx => {
        Resting.contexts.push(new ContextVm(ctx.name,ctx.variables));
      },
      () => {
        const isDefaultMissing = Resting.contexts().findIndex(ctx => ctx.name() === 'default') < 0;
        if(isDefaultMissing) {
          // default context
          Resting.contexts.push(new ContextVm());
        }
      }
      );

    };

    const dismissConfirmDialog = () => {
      Resting.showConfirmDialog(false);
    };

    const createContextDialog = () => {
      Resting.showCreateContextDialog(true);
    };

    const dismissCreateContextDialog = () => {
      Resting.contextName('');
      Resting.showCreateContextDialog(false);
    };

    const createContext = () => {
      Resting.contexts.push(new ContextVm(Resting.contextName()));
      storage.saveContext({name : Resting.contextName(), variables : [] });
      dismissCreateContextDialog();

    };
     const loadBookmarkObj = (bookmarkObj) => {
      Resting.bookmarkCopy = bookmarkProvider.copyBookmark(bookmarkObj);
      Resting.folderSelected(bookmarkObj.folder);
      const name = _folderName(bookmarkObj.folder);
      Resting.folderName(name ? name : '--');
      return loadBookmarkData(bookmarkObj);
    };

    const _folderName = (id) => {
      const folderObj =  Resting.folders().find((elem) => elem.id === id);
      return folderObj ? folderObj.name : folderObj;
    };

    const loadBookmarkData = (bookmark) => {
      Resting.parseRequest(bookmark.request);
      loadBookmarkInView(bookmark);
    };

    const addFolder = (folder) => {
      Resting.folders.push(folder);
    };

    const removeFolder = (folder) => {
      Resting.folders.remove(f => f.id === folder.id);
    };

    //const communicationDialog = () => {
      //storage.readSettings('communication', (err,value) => {
        //if(!value || !value.survey || !value.survey.read) {
           //Resting.showCommunicationDialog(true);
        //}
      //})
    //};

    //const feedbackDialog = () => {
      //storage.readSettings('showFeedbackDialog', (err,value) => {
        //if(!value) {
          //Resting.showFeedbackDialog(true);
        //}
      //});
    //};

    //const dismissFeedbackDialog = () => {
      //Resting.showFeedbackDialog(false);
      //storage.saveSettings({showFeedbackDialog : true});
    //};

    //const dismissCommunicationDialog = () => {
      //Resting.showCommunicationDialog(false);
      //const communicationSettings = {};
      //communicationSettings.survey = {};
      //communicationSettings.survey.read = true;
      //storage.saveSettings({communication : communicationSettings});
    //};

    const activateTab = (tabActivated) => {
      _activateTab(tabActivated);
    };

    const _activateTab = (tabActivated) => {
       const newActiveIndex = Resting.tabContexts().indexOf(tabActivated);

       Resting.tabContexts().forEach(function(tab, idx) {
        if(tab.isActive()) { // update old tab data
          tab.request = request.makeRequest(
          Resting.request.method(), Resting.request.url(),
          _extractModelFromVM(Resting.request.headers()), _extractModelFromVM(Resting.request.querystring()), Resting.request.bodyType(),
          body(Resting.request.bodyType()),_authentication(), Resting.request.context());

          if(Resting.bookmarkCopy) {
            tab.bookmarkSelected.id(Resting.bookmarkCopy.id);
          } else {
            tab.bookmarkSelected.id('');
          }
          tab.bookmarkSelected.name(Resting.bookmarkSelected.name());
          tab.bookmarkSelected.folder(Resting.folderSelected());
        }
         
        // set new active tab
        tab.isActive(idx == newActiveIndex);
       });
       Resting.activeTab = tabActivated;

      // set new active tab data
      let bookmark = tabActivated.bookmarkSelected.toModel();
      bookmark.request = tabActivated.request;
      reset(false);
      if(bookmark.id.length > 0) {
        loadBookmarkObj(bookmark);
      } else {
        parseRequest(tabActivated.request);
      }

      if(! _isEmptyObj(tabActivated.response)) {
        _displayResponse(tabActivated.response);
      }
    };

    const _isEmptyObj = (obj) => {
      return Object.keys(obj).length == 0;
    };
    
    const newTab = () => {
      const newTabContext = new TabContextVm(++Resting.tabCounter);
      Resting.tabContexts.push(newTabContext);
      _activateTab(newTabContext);
    };

    const removeTab = (tab) => {
      const tabToRemoveIndex = Resting.tabContexts().indexOf(tab);
      const tabs = Resting.tabContexts().length;
      if(tabs > 1 && tab.isActive()) {
        _activateTab(Resting.tabContexts()[Math.abs(tabToRemoveIndex - 1)]);
      } 
      Resting.tabContexts.remove(tab);
    };

   const disableSaveButton = (value) => {
    console.log(value)
    if(value.trim()) document.getElementById('save-button').disabled = false        
   }

   bacheca.subscribe('loadBookmark', loadBookmarkObj);
   bacheca.subscribe('addFolder', addFolder);
   bacheca.subscribe('deleteFolder', removeFolder);

    Resting.clearRequest = clearRequest;
    Resting.parseRequest = parseRequest;
    Resting.dataToSend = dataToSend;
    Resting.deleteBookmark = deleteBookmark;
    Resting.callSendOnEnter = callSendOnEnter;

    Resting.send = send;
    Resting.saveBookmark = saveBookmark;
    Resting.reset = reset;

    Resting.requestBodyPanel = requestBodyPanel;
    Resting.requestHeadersPanel = requestHeadersPanel;
    Resting.querystringPanel = querystringPanel;
    Resting.authenticationPanel = authenticationPanel;
    Resting.contextPanel = contextPanel;

    Resting.aboutDialog = aboutDialog;
    Resting.creditsDialog = creditsDialog;
    Resting.contextDialog = contextDialog;
    Resting.saveBookmarkDialog = saveBookmarkDialog;
    Resting.saveAsBookmarkDialog = saveAsBookmarkDialog;

    Resting.dismissSaveBookmarkDialog = dismissSaveBookmarkDialog;
    Resting.dismissCreditsDialog = dismissCreditsDialog;
    Resting.dismissAboutDialog = dismissAboutDialog;
    Resting.dismissContextDialog = dismissContextDialog;
    Resting.closeDialogOnExcape = closeDialogOnExcape;
    Resting.saveContext = saveContext;
    // FIXME: not good to expose this internal function
    Resting._saveBookmark = _saveBookmark;
    Resting.newTab = newTab;
    Resting.removeTab = removeTab;
    Resting.activateTab = activateTab;

    Resting.loadBookmarkInView = loadBookmarkInView;
    Resting.isBookmarkLoaded = isBookmarkLoaded;
    Resting.bookmarkScreenName = bookmarkScreenName;
    Resting.loadContexts = loadContexts;
    Resting.createContextDialog = createContextDialog;
    Resting.dismissCreateContextDialog = dismissCreateContextDialog;
    Resting.createContext = createContext;
    Resting.deleteContext = deleteContext;
    Resting.confirmDeleteContext = confirmDeleteContext;
    Resting.dismissConfirmDialog = dismissConfirmDialog;

    // Resting.feedbackDialog = feedbackDialog;
    // Resting.dismissFeedbackDialog = dismissFeedbackDialog;
    //Resting.communicationDialog = communicationDialog;
    //Resting.dismissCommunicationDialog = dismissCommunicationDialog;

    return Resting;
  }

  // init application
  $(() => {
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

    ko.components.register('add-folder-button', {
      viewModel: { require: 'app/components/add-folder/addFolderVm' },
      template: { require: 'text!app/components/add-folder/addFolder_view.html' }
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
   
   // add the first tab
   appVM.newTab();



  $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    $(this).parent().siblings().removeClass('open');
    $(this).parent().toggleClass('open');
  });

  // appVM.feedbackDialog();
  // appVM.communicationDialog();
  appVM.loadContexts();
  });
  
  $('#url-input-field').on('input', function (event) {
    const btn = $('#save-button')[0]
    if (this.value.trim()) {
      btn.disabled = false;
    } else {
      btn.disabled = true
    }
  })
});
