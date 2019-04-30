define(function() {

  const makeBookmarkFromJson = ({id, request, name, folder}) => ({ id, request, name, folder, isFolder: false});

  const makeFolderFromJson= ({id,name,bookmarks = []}) => ({id,name, bookmarks, isFolder : true});

  const makeBookmark = (id, request, name, folder) => ({ id, request, name, folder, isFolder: false});

  const makeFolder= (id,name,bookmarks = []) => ({id,name, bookmarks, isFolder : true});


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

  const importHAR = (harContent) => {
    const har = JSON.parse(_escapeJsonContent(harContent));
    const harEntries = har.log.entries;
    const bookmarks = harEntries.map(entry => _convertHarEntry(entry));
    return bookmarks;
  };

  const _escapeJsonContent = (content) => {
    if(content) {
      content = content.replace(/\n/g,'');
      content = content.replace(/\t/g,'');
      content = content.replace(/\r/g,'');
      content = content.replace(/"response":\s?{.*},"/,'"response": {},"');
    }

    return content;
  };
  const _convertHarEntry = (entry) => {
    const bookmark = {};
    bookmark.name = entry.pageref;
    bookmark.request = _convertHarRequest(entry.request);
    return bookmark;
  };

  const _convertHarRequest = (harRequest) => {
    const request = {};
    const querystringIndex = harRequest.url.indexOf('?');
    const endUrlIndex = querystringIndex != -1 ? querystringIndex : harRequest.url.length;
    request.url = harRequest.url.substring(0, endUrlIndex);
    request.method = harRequest.method;
    request.querystring = harRequest.queryString.map((qs) => ({name: qs.name, value: qs.value}));
    request.headers = harRequest.headers.map(header => ({name: header.name, value: header.value}));
    if(harRequest.postData) {
      request.headers.push({name:'Content-Type', value: harRequest.postData.mimeType});
      request.body = harRequest.postData.text;
    }
    return request;
  };

  return function(storageProvider) {
      return {
        makeBookmark : makeBookmark,
        makeFolder : makeFolder,
        fromJson : fromJson,
        addBookmarks : addBookmarks,
        removeBookmarks : removeBookmarks,
        copyBookmark : copyBookmark,
        replaceBookmark : replaceBookmark,
        save : bookmark => storageProvider.save(bookmark),
        importHAR,
      };
  };
});
