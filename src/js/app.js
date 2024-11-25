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
    app: '../app',
    component: '../app/components',
    vuecomp: 'vue-stuff',
    jquery: 'jquery-3.3.1.min',
    knockout: 'knockout-3.4.2',
    'knockout-secure-binding': 'knockout-secure-binding',
    localforage: 'localforage.nopromises.min',
    hjls: 'highlight.pack',
    Vue: 'vue.runtime.min',
    bootstrap: 'bootstrap.min',
    'json-viewer': 'json-viewer',
  },
  shim: {
    bootstrap: {
      deps: ['jquery'],
    },
  },
})

requirejs(
  [
    'jquery',
    'app/storage',
    'knockout',
    'knockout-secure-binding',
    'app/request',
    'app/bookmark',
    'app/bacheca',
    'bootstrap',
    'app/contextVm',
    'app/requestVm',
    'app/tabContextVm',
    'app/bookmarkSelectedVm',
    'Vue',
    'component/entry-list/entryItemVm',
    'component/bookmarks/bookmarkVm',
    'vuecomp/dialogs-app.umd',
    'vuecomp/add-folder-button.umd',
  ],
  function (
    $,
    storage,
    ko,
    ksb,
    requestSrv,
    makeBookmarkProvider,
    bacheca,
    bootstrap,
    ContextVm,
    RequestVm,
    TabContextVm,
    BookmarkSelectedVm,
    Vue,
    EntryItemVm,
    BookmarkVm,
    DialogsApp,
    AddFolderButton
  ) {
    function AppVm() {
      const contexts = ko.observableArray()
      const selectedCtx = new ContextVm()
      const defaultCtxName = 'default';
      let defaultCtxIdx = -1;

      const bookmarkSelected = new BookmarkSelectedVm() // bookmark loaded
      let tabCounter = 0
      const tabContexts = ko.observableArray()
      let activeTab = null
      const request = new RequestVm()
      let bookmarkCopy = null // copy of bookmark object loaded used to match with modified version in _saveBookmark
      const bookmarks = ko.observableArray()
      const folders = ko.observableArray()
      const folderSelected = ko.observable() // used by save dialog
      const folderName = ko.observable() // used by loadedBookmark div
      const bookmarkName = ko.observable() // used by save dialog
      const methods = ko.observableArray([
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'HEAD',
        'OPTIONS',
        'CONNECT',
        'TRACE',
        'PATCH',
      ])

      // request panel flags
      const showRequestHeaders = ko.observable(true)
      const showRequestBody = ko.observable(false)
      const showQuerystring = ko.observable(false)
      const showAuthentication = ko.observable(false)
      const showActiveContext = ko.observable(false)

      // Flags to show/hide dialogs
      const showBookmarkDialog = ko.observable(false)
      const showContextDialog = ko.observable(false)
      const showCreateContextDialog = ko.observable(false)
      const showConfirmDialog = ko.observable(false)

      const executionInProgress = ko.observable(false)
      const saveAsNewBookmark = ko.observable(false)

      const dialogConfirmMessage = ko.observable()
      const contextName = ko.observable()

      const bookmarkProvider = makeBookmarkProvider(storage)

      const convertToFormData = (data = [], context = {}) => {
        const formdata = new FormData()
        data
          .filter((param) => param.enabled())
          .forEach((item) => {
            if (item.isFileEntry()) {
              formdata.append(item.name(), item.valueFile, item.valueFile.name)
            } else {
              formdata.append(item.name(), _applyContext(item.value(), context))
            }
          })
        return formdata
      }

      const serializeBookmark = (bookmarkObj) => {
        return bookmarkProvider.fromJson(JSON.stringify(bookmarkObj))
      }

      const aboutDialog = () => {
        bacheca.publish('showAboutDialog')
      }

      const creditsDialog = () => {
        bacheca.publish('showCreditsDialog')
      }

      const donateDialog = () => {
        bacheca.publish('showDonateDialog')
      }

      const contextDialog = (context) => {
        selectedCtx.name(context.name())
        selectedCtx.variables(context.variables())
        showContextDialog(true)
      }

      const defaultContextDialog = () => {
        contextDialog(_getDefaultCtx())
      }

      const contextDialogByName = () => {
        let ctxToLoad = contexts().find(
          ctx => ctx.name() === request.context()
        )
        if (ctxToLoad === undefined) {
          ctxToLoad = _getDefaultCtx()
        }
        contextDialog(ctxToLoad)
      }

      const dismissContextDialog = () => {
        showContextDialog(false)
      }

      const convertToUrlEncoded = (data = [], context) =>
        data
          .filter((param) => param.enabled())
          .map(
            (param) =>
              `${param.name()}=${_applyContext(param.value(), context)}`
          )
          .join('&')

      const updateBody = (bodyType, body) => {
        clearRequestBody()
        request.bodyType(bodyType)
        if (bodyType === 'form-data') {
          return request.formDataParams(_convertToEntryItemVM(body))
        }

        if (bodyType === 'x-www-form-urlencoded') {
          return request.formEncodedParams(_convertToEntryItemVM(body))
        }

        return request.rawBody(body)
      }

      const clearRequestBody = () => {
        request.formDataParams.removeAll()
        request.formEncodedParams.removeAll()
        request.rawBody('')
        request.bodyType('')
      }

      const clearRequest = () => {
        request.method('GET')
        request.url('')
        clearRequestBody()
        request.headers.removeAll()
        request.querystring.removeAll()
        request.authenticationType('')
        request.username('')
        request.password('')
        request.jwtToken('')
        request.oauthAuthPosition('')
        request.oauthAccessToken('')
        request.context('default')
      }

      const _convertToEntryItemVM = (items = []) =>
        items.map((item) => {
          // enable values by default when the field is missing.
          // The field has been introduced in v0.7.0
          // maintain it for compatibility purposes
          const enabled = item.enabled === undefined ? true : item.enabled
          return new EntryItemVm(item.name, item.value, enabled)
        })

      const bookmarkScreenName = () => {
        return bookmarkSelected.name() && bookmarkSelected.name().length > 0
          ? bookmarkSelected.name()
          : request.method() + ' ' + request.url()
      }

      const parseRequest = (req) => {
        if (req) {
          request.method(req.method)
          request.url(req.url)
          request.bodyType(req.bodyType)
          request.headers(_convertToEntryItemVM(req.headers))
          request.querystring(
            req.querystring ? _convertToEntryItemVM(req.querystring) : []
          )
          _updateAuthentication(req.authentication)
          updateBody(req.bodyType, req.body)
          request.context(req.context)
        }
      }

      const _updateAuthentication = (authentication) => {
        if (authentication) {
          request.authenticationType(authentication.type)
          switch (authentication.type) {
            case 'Basic':
              request.username(authentication.username)
              request.password(authentication.password)
              break
            case 'JWT':
              request.jwtToken(authentication.jwtToken)
              break
            case 'Oauth 2.0':
              request.oauthAuthPosition(authentication.oauthAuthPosition)
              request.oauthAccessToken(authentication.oauthAccessToken)
              break

            default:
            // No authentication
          }
        }
      }

      const dataToSend = (context) => {
        if (request.bodyType() === 'form-data') {
          return convertToFormData(request.formDataParams(), context)
        } else if (request.bodyType() === 'x-www-form-urlencoded') {
          return convertToUrlEncoded(request.formEncodedParams(), context)
        } else if (request.bodyType() === 'raw') {
          return _applyContext(request.rawBody().trim(), context)
        }
      }

      const _authentication = (contexts = []) => ({
        type: request.authenticationType(),
        username: _applyContext(request.username(), contexts),
        password: _applyContext(request.password(), contexts),
        jwtToken: _applyContext(request.jwtToken(), contexts),
        oauthAuthPosition: _applyContext(request.oauthAuthPosition(), contexts),
        oauthAccessToken: _applyContext(request.oauthAccessToken(), contexts),
      })

      const body = (bodyType) => {
        if (bodyType === 'form-data') {
          return _extractModelFromVM(request.formDataParams())
        }

        if (bodyType === 'x-www-form-urlencoded') {
          return _extractModelFromVM(request.formEncodedParams())
        }

        if (bodyType === 'raw') {
          return request.rawBody()
        }

        return undefined
      }

      const validateBookmarkName = (name) => {
        if (name && name.trim().length > 0) {
          return name.trim()
        } else {
          return
        }
      }

      const isBookmarkLoaded = () => {
        return bookmarkSelected.id().length > 0
      }

      const _saveBookmark = (bookmark, internal = false) => {
        if (bookmarkCopy && !saveAsNewBookmark() && !internal) {
          // if edit a bookmark
          if (bookmark.folder) {
            const oldFolder = bookmarkCopy.folder
            if (oldFolder == bookmark.folder) {
              // folderA to folderA
              let folderObj = bookmarks().find((b) => b.id === bookmark.folder)
              const modifiedFolder = bookmarkProvider.replaceBookmark(
                folderObj,
                new BookmarkVm(bookmark)
              )
              bookmarkProvider.save(serializeBookmark(modifiedFolder))
              bookmarks.replace(folderObj, modifiedFolder)
            } else if (!oldFolder) {
              //from no-folder to folderA
              const oldBookmark = bookmarks().find((b) => b.id == bookmark.id) // I need the ref to bookmark saved in observable array
              //  either it is not removed from it
              deleteBookmark(oldBookmark)
              let folderObj = bookmarks().find((b) => b.id === bookmark.folder)
              const modifiedFolder = bookmarkProvider.replaceBookmark(
                folderObj,
                new BookmarkVm(bookmark)
              )
              bookmarkProvider.save(serializeBookmark(modifiedFolder))
              bookmarks.replace(folderObj, modifiedFolder)
            } else if (oldFolder != bookmark.folder) {
              // from folderA to folderB
              deleteBookmark(bookmarkCopy)
              let folderObj = bookmarks().find((b) => b.id === bookmark.folder)
              const modifiedFolder = bookmarkProvider.replaceBookmark(
                folderObj,
                new BookmarkVm(bookmark)
              )
              bookmarkProvider.save(serializeBookmark(modifiedFolder))
              bookmarks.replace(folderObj, modifiedFolder)
            }
          } else {
            if (bookmarkCopy.folder) {
              // from folderA to no-folder
              deleteBookmark(bookmarkCopy)
              bookmarks.push(new BookmarkVm(bookmark))
            } else {
              // from no-folder to no-folder
              const oldBookmark = bookmarks().find((b) => b.id === bookmark.id)
              bookmarks.replace(oldBookmark, new BookmarkVm(bookmark))
            }
            bookmarkProvider.save(serializeBookmark(bookmark))
          }
          bookmarkCopy = bookmarkProvider.copyBookmark(bookmark)
        } else {
          // if new bookmark
          if (bookmark.folder) {
            let folderObj = bookmarks().find((b) => b.id === bookmark.folder)
            const modifiedFolder = bookmarkProvider.addBookmarks(
              folderObj,
              new BookmarkVm(bookmark)
            )
            bookmarkProvider.save(serializeBookmark(modifiedFolder))
            bookmarks.replace(folderObj, modifiedFolder)
          } else {
            bookmarkProvider.save(serializeBookmark(bookmark))
            bookmarks.push(new BookmarkVm(bookmark))
          }

          if (!internal) {
            bookmarkSelected.id(bookmark.id)
            bookmarkCopy = bookmarkProvider.copyBookmark(bookmark)
          }
        }
      }

      const _extractModelFromVM = (items = []) => {
        return items.map((item) => ({
          name: item.name(),
          value: item.value(),
          enabled: item.enabled(),
        }))
      }

      const saveBookmark = () => {
        const req = requestSrv.makeRequest(
          request.method(),
          request.url(),
          _extractModelFromVM(request.headers()),
          _extractModelFromVM(request.querystring()),
          request.bodyType(),
          body(request.bodyType()),
          _authentication(),
          request.context()
        )

        const bookmarkId =
          bookmarkCopy && !saveAsNewBookmark()
            ? bookmarkCopy.id
            : storage.generateId()
        const creationDate =
          bookmarkCopy && !saveAsNewBookmark()
            ? bookmarkCopy.created
            : new Date()
        const bookmarkObj = bookmarkProvider.makeBookmark(
          bookmarkId,
          req,
          validateBookmarkName(bookmarkName()),
          folderSelected(),
          creationDate
        )
        bookmarkSelected.name(bookmarkName())
        bookmarkSelected.folder(folderSelected())
        const name = _folderName(folderSelected())
        folderName(name ? name : '--')
        _saveBookmark(bookmarkObj)

        // close the dialog
        showBookmarkDialog(false)
      }

      const reset = (tabReset = true) => {
        bookmarkCopy = null
        folderSelected('')
        folderName('--')
        bookmarkName('')
        bookmarkSelected.name('')
        bookmarkSelected.id('')
        clearRequest()
        if (tabReset) {
          _tabReset()
        }
        bacheca.publish('reset')
      }

      const _tabReset = () => {
        const tab = activeTab
        tab.reset()
      }

      // used by _saveBookmark...why ?
      const deleteBookmark = (bookmark, deleteChildrenBookmarks) => {
        if (bookmark.folder) {
          const containerFolder = bookmarks().find(
            (b) => b.id === bookmark.folder
          )
          let modifiedFolder = Object.assign({}, containerFolder)
          modifiedFolder.bookmarks = containerFolder.bookmarks.filter(
            (b) => b.id !== bookmark.id
          )
          bookmarkProvider.save(serializeBookmark(modifiedFolder))
          bookmarks.replace(containerFolder, modifiedFolder)
        } else {
          if (bookmark.isFolder && !deleteChildrenBookmarks) {
            const childrenBookmarks = bookmark.bookmarks.map((child) => {
              child.folder = null
              return child
            })
            childrenBookmarks.forEach((child) => _saveBookmark(child))
          }
          storage.deleteById(bookmark.id, () => bookmarks.remove(bookmark))
        }
      }

      const convertToHeaderObj = (headersList = [], context = {}) =>
        headersList
          .filter((header) => header.enabled())
          .reduce((acc, header) => {
            acc[header.name()] = _applyContext(header.value(), context)
            return acc
          }, {})

      const _displayResponse = (response) => {
        bacheca.publish('responseReady', response)
      }

      const _convertToQueryString = (params = [], context = {}) => {
        return params
          .filter((param) => param.enabled())
          .map((param) => ({
            name: param.name(),
            value: _applyContext(param.value(), context),
          }))
      }

      const send = () => {
        if (!request.url() || request.url().trim().length === 0) {
          return
        }

        const mapping = _mapContext()
        requestSrv.execute(
          request.method(),
          _applyContext(request.url().trim(), mapping),
          convertToHeaderObj(request.headers(), mapping),
          _convertToQueryString(request.querystring(), mapping),
          request.bodyType(),
          dataToSend(mapping),
          _authentication(mapping),
          _manageResponse
        )
        executionInProgress(true)
      }

      const _manageResponse = (response) => {
        activeTab.response = response
        executionInProgress(false)
        _displayResponse(response)
      }

      // Note that elements order is important
      const _mapContext = () =>
        [
          _getDefaultCtx(),
          request.context() !== 'default' &&
            contexts().find(ctx => ctx.name() === request.context()),
        ]
          .filter((ctx) => !!ctx)
          .map((ctx) => _extractCtxVars(ctx.variables()))

      const _extractCtxVars = (vars = []) =>
        vars
          .filter((v) => v.enabled())
          .reduce((acc, v) => {
            acc[v.name()] = v.value()
            return acc
          }, {})

      // XXX: context is an object on some calls
      const _applyContext = (value = '', contexts = []) => {
        const contextVars =
          contexts.length > 0
            ? Object.assign(contexts[0], contexts[1] || {})
            : []
        return value.replace(
          /\{\w+\}/g,
          (match) => contextVars[match.substring(1, match.length - 1)] || match
        )
      }

      const loadBookmarkInView = (bookmark = {}) => {
        bookmarkSelected.id(bookmark.id)
        bookmarkSelected.name(bookmark.name)
        bookmarkSelected.folder(bookmark.folder)
        if (bookmark.request) {
          request.method(bookmark.request.method)
          request.url(bookmark.request.url)
        }
      }

      const requestHeadersPanel = () => {
        showRequestHeaders(true)
        showRequestBody(false)
        showQuerystring(false)
        showAuthentication(false)
        showActiveContext(false)
      }

      const requestBodyPanel = () => {
        showRequestHeaders(false)
        showRequestBody(true)
        showQuerystring(false)
        showAuthentication(false)
        showActiveContext(false)
      }

      const querystringPanel = () => {
        showRequestHeaders(false)
        showRequestBody(false)
        showQuerystring(true)
        showAuthentication(false)
        showActiveContext(false)
      }

      const authenticationPanel = () => {
        showRequestHeaders(false)
        showRequestBody(false)
        showQuerystring(false)
        showAuthentication(true)
        showActiveContext(false)
      }

      const contextPanel = () => {
        showRequestHeaders(false)
        showRequestBody(false)
        showQuerystring(false)
        showAuthentication(false)
        showActiveContext(true)
      }

      const saveBookmarkDialog = () => {
        showBookmarkDialog(true)
        saveAsNewBookmark(false)
        bookmarkName(bookmarkSelected.name())
      }

      const saveAsBookmarkDialog = () => {
        showBookmarkDialog(true)
        saveAsNewBookmark(true)
        bookmarkName('')
      }

      const dismissSaveBookmarkDialog = () => {
        showBookmarkDialog(false)
        if (bookmarkCopy == null) {
          bookmarkSelected.name('')
          folderSelected('')
          folderName('--')
        }
      }

      const callSendOnEnter = (data, event) => {
        const enter = 13
        if (event.keyCode === enter) {
          send()
        }
      }

      const callSendOnCtrlEnter = (data, event) => {
        const enter = 13
        if (event.ctrlKey && event.keyCode === enter) {
          send()
        }
      }

      const closeDialogOnEscape = (data, event) => {
        const excape = 27
        if (event.keyCode === excape) {
          showBookmarkDialog(false),
            showContextDialog(false),
            showCreateContextDialog(false),
            showConfirmDialog(false),
            saveAsNewBookmark(false)
        }
      }

      const saveContext = () => {
        storage.saveContext({
          name: selectedCtx.name(),
          variables: _extractModelFromVM(selectedCtx.variables()),
        })
        const contextToEditIdx = contexts().findIndex(
          (ctx) => ctx.name === selectedCtx.name()
        )
        if (contextToEditIdx > -1) {
          contexts.replace(contexts[contextToEditIdx], selectedCtx)
        }

        dismissContextDialog()
      }

      const confirmDeleteContext = () => {
        showConfirmDialog(true)
        dialogConfirmMessage('Confirm context delete ?')
      }

      const deleteContext = () => {
        const ctxToRemove = contexts().find(
          (ctx) => ctx.name() === selectedCtx.name()
        )
        storage.deleteContextById(selectedCtx.name())
        contexts.remove(ctxToRemove)
        dismissConfirmDialog()
        dismissContextDialog()
      }

      const loadContexts = () => {
        // load contexts
        const loadedCtxs = []
        storage.loadContexts(
          ctx => {
            loadedCtxs.push(new ContextVm(ctx.name, ctx.variables))
          },
          () => {
            defaultCtxIdx = loadedCtxs.findIndex(
              ctx => ctx.name() === 'default'
            )
            if (defaultCtxIdx < 0) {
              defaultCtxIdx = 0
              contexts.push(new ContextVm())
            }
            loadedCtxs.forEach(ctx => contexts.push(ctx))
            contexts.sort(sortCriteriaCtx)
          }
        )
      }

      const _getDefaultCtx = () => {
        return defaultCtxIdx >= 0 ? contexts()[defaultCtxIdx] : new ContextVm()
      }

      const dismissConfirmDialog = () => {
        showConfirmDialog(false)
      }

      const createContextDialog = () => {
        showCreateContextDialog(true)
      }

      const dismissCreateContextDialog = () => {
        contextName('')
        showCreateContextDialog(false)
      }

      const createContext = () => {
        if (contextName() !== 'default') {
          contexts.push(new ContextVm(contextName()))
          storage.saveContext({ name: contextName(), variables: [] })
          contexts.sort(sortCriteriaCtx)
        }
        dismissCreateContextDialog()
      }

      const loadBookmarkObj = (bookmarkObj) => {
        bookmarkCopy = bookmarkProvider.copyBookmark(bookmarkObj)
        folderSelected(bookmarkObj.folder)
        const name = _folderName(bookmarkObj.folder)
        folderName(name ? name : '--')
        return loadBookmarkData(bookmarkObj)
      }

      const _openInTab = (bookmarkObj) => {
        newTab()
        loadBookmarkObj(bookmarkObj)
      }

      const _folderName = (id) => {
        const folderObj = folders().find((elem) => elem.id === id)
        return folderObj ? folderObj.name : folderObj
      }

      const loadBookmarkData = (bookmark) => {
        parseRequest(bookmark.request)
        loadBookmarkInView(bookmark)
      }

      const sortCriteria = (f1, f2) => {
        const folderName1 = f1.name
        const folderName2 = f2.name
        if (folderName1.toUpperCase() < folderName2.toUpperCase()) {
          return -1
        }
        if (folderName1.toUpperCase() > folderName2.toUpperCase()) {
          return 1
        }
        return 0
      }

      const sortCriteriaCtx = (e1, e2) => {
        if (e1.name().toUpperCase() < e2.name().toUpperCase()) {
          return -1
        }
        if (e1.name().toUpperCase() > e2.name().toUpperCase()) {
          return 1
        }
        return 0
      }

      const addFolder = ({ folder, selectedFolder }) => {
        folders.push(folder)
        folders.sort(sortCriteria)
        if (selectedFolder) {
          folderSelected(folder.id)
        }
      }

      const removeFolder = (folder) => {
        folders.remove((f) => f.id === folder.id)
      }

      const activateTab = (tabActivated) => {
        _activateTab(tabActivated)
      }

      const _activateTab = (tabActivated) => {
        const newActiveIndex = tabContexts().indexOf(tabActivated)

        tabContexts().forEach(function (tab, idx) {
          if (tab.isActive()) {
            // update old tab data
            tab.request = requestSrv.makeRequest(
              request.method(),
              request.url(),
              _extractModelFromVM(request.headers()),
              _extractModelFromVM(request.querystring()),
              request.bodyType(),
              body(request.bodyType()),
              _authentication(),
              request.context()
            )

            if (bookmarkCopy) {
              tab.bookmarkSelected.id(bookmarkCopy.id)
            } else {
              tab.bookmarkSelected.id('')
            }
            tab.bookmarkSelected.name(bookmarkSelected.name())
            tab.bookmarkSelected.folder(folderSelected())
          }

          // set new active tab
          tab.isActive(idx == newActiveIndex)
        })
        activeTab = tabActivated

        // set new active tab data
        let bookmark = tabActivated.bookmarkSelected.toModel()
        bookmark.request = tabActivated.request
        reset(false)
        if (bookmark.id.length > 0) {
          loadBookmarkObj(bookmark)
        } else {
          parseRequest(tabActivated.request)
        }

        if (!_isEmptyObj(tabActivated.response)) {
          _displayResponse(tabActivated.response)
        }
      }

      const _isEmptyObj = (obj) => {
        return Object.keys(obj).length == 0
      }

      const newTab = () => {
        const newTabContext = new TabContextVm(++tabCounter)
        if (tabContexts().length === 0) {
          newTabContext.showRemoveTabButton(false)
        }
        if (tabContexts().length === 1) {
          const prevTabContext = tabContexts()[0]
          prevTabContext.showRemoveTabButton(true)
        }
        tabContexts.push(newTabContext)
        _activateTab(newTabContext)
      }

      const removeTab = (tab) => {
        const tabToRemoveIndex = tabContexts().indexOf(tab)
        const tabs = tabContexts().length
        if (tabs > 1 && tab.isActive()) {
          _activateTab(tabContexts()[Math.abs(tabToRemoveIndex - 1)])
        }
        tabContexts.remove(tab)

        if (tabContexts().length === 1) {
          const lastTab = tabContexts()[0]
          lastTab.showRemoveTabButton(false)
        }
      }

      const enableSaveButton = () => {
        if (request.url() && request.url().trim().length != 0) {
          return true
        }
        return false
      }

      bacheca.subscribe('openInTab', _openInTab)
      bacheca.subscribe('loadBookmark', loadBookmarkObj)
      bacheca.subscribe('addFolder', addFolder)
      bacheca.subscribe('deleteFolder', removeFolder)

      return {
        contexts,
        selectedCtx,
        defaultCtxName,
        defaultCtxIdx,

        bookmarkSelected,
        tabCounter,
        tabContexts,
        activeTab,
        request,
        bookmarkCopy,
        bookmarks,
        folders,
        folderSelected,
        folderName,
        bookmarkName,
        methods,
        showRequestHeaders,
        showRequestBody,
        showQuerystring,
        showAuthentication,
        showActiveContext,

        showBookmarkDialog,
        showContextDialog,
        showCreateContextDialog,
        showConfirmDialog,

        executionInProgress,
        saveAsNewBookmark,

        dialogConfirmMessage,
        contextName,

        // functions
        clearRequest,
        parseRequest,
        dataToSend,
        deleteBookmark,
        callSendOnEnter,
        callSendOnCtrlEnter,

        send,
        saveBookmark,
        reset,

        requestBodyPanel,
        requestHeadersPanel,
        querystringPanel,
        authenticationPanel,
        contextPanel,

        aboutDialog,
        creditsDialog,
        donateDialog,
        contextDialog,
        defaultContextDialog,
        contextDialogByName,
        saveBookmarkDialog,
        saveAsBookmarkDialog,

        dismissSaveBookmarkDialog,
        dismissContextDialog,
        closeDialogOnEscape,
        saveContext,
        // FIXME: not good to expose this internal function
        _saveBookmark,
        newTab,
        removeTab,
        activateTab,

        loadBookmarkInView,
        isBookmarkLoaded,
        bookmarkScreenName,
        loadContexts,
        createContextDialog,
        dismissCreateContextDialog,
        createContext,
        deleteContext,
        confirmDeleteContext,
        dismissConfirmDialog,
        enableSaveButton,
      }
    }

    // init application
    $(() => {
      // seems that this below must be the last instructions to permit component to be registered
      ko.components.register('entry-list', {
        viewModel: { require: 'app/components/entry-list/entryListVm' },
        template: {
          require: 'text!app/components/entry-list/entryList_view.html',
        },
      })

      ko.components.register('request-body', {
        viewModel: { require: 'app/components/request-body/requestBodyVm' },
        template: {
          require: 'text!app/components/request-body/requestBody_view.html',
        },
      })

      ko.components.register('bookmarks', {
        viewModel: { require: 'app/components/bookmarks/bookmarksVm' },
        template: {
          require: 'text!app/components/bookmarks/bookmarks_view.html',
        },
      })

      ko.components.register('authentication', {
        viewModel: {
          require: 'app/components/authentication/authenticationVm',
        },
        template: {
          require:
            'text!app/components/authentication/authentication_view.html',
        },
      })

      ko.components.register('response-panel', {
        viewModel: { require: 'app/components/response/responseVm' },
        template: {
          require: 'text!app/components/response/response_view.html',
        },
      })

      // Show all options, more restricted setup than the Knockout regular binding.
      var options = {
        attribute: 'data-bind', // default "data-sbind"
        globals: window, // default {}
        bindings: ko.bindingHandlers, // default ko.bindingHandlers
        noVirtualElements: false, // default true
      }

      ko.bindingProvider.instance = new ksb(options)

      const appVM = new AppVm()

      ko.applyBindings(appVM)

      const vueApp = new Vue({
        el: '#v-dialogs',
        components: {
          DialogsApp,
        },
        render: function (h) {
          return h('dialogs-app')
        },
      })

      const saveBookmarkVueApp = new Vue({
        el: '#v-save-bookmark',
        components: {
          AddFolderButton,
        },
        render: function (h) {
          return h(AddFolderButton, { props: { selectedFolder: true } })
        },
      })

      // add the first tab
      appVM.newTab()

      $('ul.dropdown-menu [data-toggle=dropdown]').on(
        'click',
        function (event) {
          event.preventDefault()
          event.stopPropagation()
          $(this).parent().siblings().removeClass('open')
          $(this).parent().toggleClass('open')
        }
      )

      appVM.loadContexts()
    })
  }
)
