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
 
define(function() {

  const makeBookmarkFromJson = ({id, request, name, folder, created}) => ({ id, request, name, folder, isFolder: false, created});

  const makeFolderFromJson= ({id,name,bookmarks = [], created}) => ({id,name, bookmarks, isFolder : true, created});

  const makeBookmark = (id, request, name, folder, created = new Date()) => ({ id, request, name, folder, isFolder: false, created});

  const makeFolder= (id,name,bookmarks = [], created = new Date()) => ({id,name, bookmarks, isFolder : true, created});


  const fromJson = (json = {}) => {
    const obj = JSON.parse(json);
    if(obj.isFolder) {
      return makeFolderFromJson(obj);
    } else {
      return makeBookmarkFromJson(obj);
    }
  };

  const addBookmarks = (folder,bookmarks = []) => {
    const newFolder = Object.assign({},folder);
    newFolder.bookmarks = folder.bookmarks.concat(bookmarks);
    return newFolder;
  }

  const bookmarkById = ({ id }) => b => (b.id === id);

  const sortBookmarks = (folder, criteria) => {
    const bookmarks = folder.bookmarks
    bookmarks.sort(criteria)
    return Object.assign({}, folder, {bookmarks})
  }

  const replaceBookmark = (folder,bookmark) => {
    const bookmarks = folder.bookmarks.slice();
    const indexToReplace = bookmarks.findIndex(bookmarkById(bookmark));
    if(indexToReplace !== -1) {
      bookmarks.splice(indexToReplace,1, bookmark);
    } else {
      bookmarks.push(bookmark);
    }

    return Object.assign({}, folder, {bookmarks});
  };

  const removeBookmarks = (folder,bookmarksToRemove = []) => {
    let bookmarks = folder.bookmarks.slice();

    const bookmarksToRemoveIds = (Array.isArray(bookmarksToRemove)
      ? bookmarksToRemove
      : [bookmarksToRemove])
    .map(b => b.id);

    bookmarks = bookmarks.filter(b => bookmarksToRemoveIds.indexOf(b.id) === -1);

    return Object.assign({},folder,{bookmarks});
  };

  const copyBookmark = (bookmark) => {
    return Object.assign({},bookmark);
  };

  const importHAR = (storageProvider, harContent) => (harContent) => {
    const har = JSON.parse(_escapeJsonContent(harContent))
    if(_isRestingFormat(har.log.creator)) {
      return importObj(har)
    } else {
      const harEntries = har.log.entries
      const bookmarks = harEntries.map(entry => _convertHarEntry(storageProvider, entry))
      return {bookmarks : bookmarks, contexts : []}
    }
  };

  const _isRestingFormat = (creatorFields = {}) => {
    return creatorFields.name == 'Resting WebExtension' && creatorFields.version == '1.0';
  };

  const _escapeJsonContent = (content) => {
    if(content) {
      content = content.replace(/\n/g,'');
      content = content.replace(/\t/g,'');
      content = content.replace(/\r/g,'');
      //content = content.replace(/"response":\s?{.*},"/,'"response": {},"');
    }
    return content;

/*    return content.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");*/
  };
  
  const _convertHarEntry = (storage, entry) => {
    const bookmark = {};
    bookmark.id = storage.generateId();
    bookmark.name = entry.pageref;
    bookmark.request = _convertHarRequest(entry.request);
    return bookmark;
  };

  const _convertHarRequest = (harRequest = {}) => {
    const request = {};
    if(harRequest.url) {
      const querystringIndex = harRequest.url.indexOf('?');
      const endUrlIndex = querystringIndex != -1 ? querystringIndex : harRequest.url.length;
      request.url = harRequest.url.substring(0, endUrlIndex);
    }
    request.method = harRequest.method;
    if(harRequest.queryString) {
      request.querystring = harRequest.queryString.map((qs) => ({name: qs.name, value: qs.value}));
    }
    if(harRequest.headers) {
      request.headers = harRequest.headers.map(header => ({name: header.name, value: header.value}));
    }
    if(harRequest.postData) {
      request.headers.push({name:'Content-Type', value: harRequest.postData.mimeType});
      request.body = harRequest.postData.text;
    }
    return request;
  };

  const exportObj = (bookmarks = [], contexts = []) => {
      let harExport = {};
      harExport.log = {};
      harExport.log.version = '1.1';
      harExport.log.creator = {};
      harExport.log.creator.name = 'Resting WebExtension';
      harExport.log.creator.version = '1.0';
      harExport.log.entries = _bookmarkToHar(bookmarks);
      harExport.log._contexts = _contextsToHar(contexts);
      return harExport;
  };

  const _contextsToHar = (contexts = []) => {
      return contexts.map(c => {
        let contextHarField = {};
        contextHarField.name = c.name;
        contextHarField.variables = c.variables.map(v => ({name: v.name, value: v.value, enabled: v.enabled}));
        return contextHarField;
        }
      )
  };

  const _bookmarkToHar = (sources = []) => {
    let exported = [];
    if(sources.length > 0) {
      let bookmarkExport = {};
      bookmarkExport._name = sources[0].name;
      bookmarkExport._isFolder = sources[0].isFolder;
      bookmarkExport._id = sources[0].id;
      bookmarkExport._created = sources[0].created;
      bookmarkExport._folder = sources[0].folder;
      bookmarkExport.startedDateTime = "1970-01-01T00:00:00Z"; // not supported
      bookmarkExport.request = {headersSize: -1, bodySize: -1, httpVersion:'', cookies: [], url: '', method: '', headers: [], queryString: []};
      bookmarkExport.response = {status: 0, statusText: '', httpVersion:'', cookies:[], headers: [], redirectURL:'', headersSize: -1, bodySize: -1, content: {size: 0, mimeType: ''}};
      bookmarkExport.cache = {};
      bookmarkExport.timings = {wait: -1, send: -1, receive: -1};
      bookmarkExport.time = -1;
      if(sources[0].request) {
        if(sources[0].request.url) {
          bookmarkExport.request.url = sources[0].request.url;
        } else {
          bookmarkExport.request.url = '';
        }
        if(sources[0].request.method) {
          bookmarkExport.request.method = sources[0].request.method;
        } else {
          bookmarkExport.request.method = '';
        }
        if(sources[0].request.headers) {
          bookmarkExport.request.headers = sources[0].request.headers.map(h => ({name: h.name, value: h.value, _enabled: h.enabled}));
        } else {
          bookmarkExport.request.headers = [];
        }
        if(sources[0].request.querystring) {
          bookmarkExport.request.queryString = sources[0].request.querystring.map(q => ({name: q.name, value: q.value, _enabled: q.enabled}));
        } else {
          bookmarkExport.request.queryString = [];
        }
        if(sources[0].request.body) {
          bookmarkExport.request.postData = {};
          bookmarkExport.request.postData.mimeType = _getMimeType(sources[0].request.bodyType);
          if(bookmarkExport.request.postData.mimeType === 'application/x-www-form-urlencoded' || bookmarkExport.request.postData.mimeType === 'multipart/form-data') {
            bookmarkExport.request.postData.params = sources[0].request.body.map(p => ({name: p.name, value: p.value, _enabled: p.enabled}));;
          } else {
            bookmarkExport.request.postData.text = sources[0].request.body;
          }
        }
        bookmarkExport.request._authentication = sources[0].request.authentication;
        bookmarkExport.request._context = sources[0].request.context;
      }

      exported.push(bookmarkExport);
      if(bookmarkExport._isFolder) {
        exported = exported.concat(_bookmarkToHar(sources[0].bookmarks));
      }
      exported = exported.concat(_bookmarkToHar(sources.slice(1)));
    }

    return exported;
  };

  const _getMimeType = repr => {
    switch(repr){
      case 'form-data':
        return 'multipart/form-data';
      case 'raw':
        return 'application/json';
      default:
      case 'x-www-form-urlencoded':
        return 'application/x-www-form-urlencoded';
    }
  };

  const _getBodyType = mime => {
    switch(mime){
      case 'multipart/form-data':
        return 'form-data';
      case 'application/json':
        return 'raw';
      default:
      case 'application/x-www-form-urlencoded':
        return 'x-www-form-urlencoded';
    }
  };


  const importObj = (obj = {}) => {
      let importObj = {};
      const entries = obj.log ? obj.log.entries : undefined;
      const contexts = obj.log ? obj.log._contexts : undefined;
      if(entries) {
        const indexRelationship = _extractRelationship(entries);
        importObj.bookmarks = entries.map(e => _importEntry(e));
        importObj.bookmarks = _fixStructure(importObj.bookmarks, indexRelationship);
      }
      if(contexts) {
        importObj.contexts = contexts.map(e => _importContext(e));
      }
      return importObj;
  };

  const _fixStructure = (bookmarks, mapping) => {
    let indexBookmarks = {}
    let i = 0
    for(let bookmark of bookmarks) {
      const bookmarkId = bookmark.id
      indexBookmarks[bookmarkId] = bookmark
      i++
    }
    for(let folderId of Object.keys(mapping)) {
      const insideBookmarkIds = mapping[folderId]
      insideBookmarkIds.forEach(id => {
        if(indexBookmarks.hasOwnProperty(folderId) && !indexBookmarks[folderId].bookmarks) {
          indexBookmarks[folderId].bookmarks = []
        }
        indexBookmarks[folderId].bookmarks.push(indexBookmarks[id])
        bookmarks.splice(bookmarks.indexOf(indexBookmarks[id]), 1)
      });
    }
    return bookmarks;
  }

  const _extractRelationship = (entries = []) => {
    let relationMapping = {}
    entries.forEach((e) => {
      const id = e._id
      const folderId = e._folder
      if(folderId) {
        if(!relationMapping.hasOwnProperty(folderId)) {
          relationMapping[folderId] = []
        }
        relationMapping[folderId].push(id)
      }
    })
    return relationMapping
  }

  const _importEntry = (entry = {}) => {
    let bookmark = {};
    bookmark.request = {};
    bookmark.isFolder = entry._isFolder;
    bookmark.folder = entry._folder;
    if(entry._name) {
      bookmark.name = entry._name;
    }
    if(entry._id) {
      bookmark.id = entry._id;
    }
    if(entry._created) {
      bookmark.created = entry._created;
    }
    const entryRequest = entry.request;
    bookmark.request.context = entryRequest._context;
    if(entryRequest.url) {
      bookmark.request.url = entryRequest.url;
    }
    if(entryRequest.method) {
      bookmark.request.method = entryRequest.method;
    }
    if(entryRequest.headers) {
      bookmark.request.headers = entryRequest.headers.map(h => ({name: h.name, value: h.value, enabled: h._enabled}));
    }

    if(entryRequest.queryString) {
      bookmark.request.querystring = entryRequest.queryString.map(h => ({name: h.name, value: h.value, enabled: h._enabled}));
    }
    if(entryRequest._authentication) {
      bookmark.request.authentication = entryRequest._authentication;
    }
    if(entryRequest.postData) {
      bookmark.request.bodyType = _getBodyType(entryRequest.postData.mimeType);
      if(entryRequest.postData.mimeType === 'multipart/form-data' || entryRequest.postData.mimeType === 'application/x-www-form-urlencoded') {
        bookmark.request.body = entryRequest.postData.params.map(p => ({name: p.name, value: p.value, enabled: p._enabled}));
      } else {
        bookmark.request.body = entryRequest.postData.text;
      }
    }
    return bookmark;
  };

  const _importContext = (entry = {}) => {
    let context = {}
    if(entry.name) {
      context.name = entry.name
    }
    if(entry.variables) {
      context.variables = entry.variables.map(v => ({name: v.name, value: v.value, enabled: v.enabled}))
    }
    return context
  }

  return function(storageProvider) {
      return {
        makeBookmark : makeBookmark,
        makeFolder : makeFolder,
        fromJson : fromJson,
        addBookmarks : addBookmarks,
        removeBookmarks : removeBookmarks,
        copyBookmark : copyBookmark,
        replaceBookmark : replaceBookmark,
        sortBookmarks,
        save : bookmark => storageProvider.save(bookmark),
        importHAR : importHAR(storageProvider),
        exportObj,
        importObj,
      }
  }
})
