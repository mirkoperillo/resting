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
  
  const removeBookmarks = (folder,bookmarks = []) => {
    const newFolder = Object.assign({},folder);
    if(Array.isArray(bookmarks)) {
      const bookmarksIds = folder.bookmarks.map(b => b.id);
      newFolder.bookmarks = folder.bookmarks.filter(b => bookmarksIds.indexOf(b.id) != -1);
    } else {
      newFolder.bookmarks = folder.bookmarks.filter(b => b.id != bookmarks.id);
    }
    return newFolder;
  }
  
  const copyBookmark = (bookmark) => {
    return Object.assign({},bookmark);
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
        save : bookmark => storageProvider.save(bookmark)
      };
  };
});
