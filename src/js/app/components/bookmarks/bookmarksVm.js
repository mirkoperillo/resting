 define(['knockout', 'app/bookmark', 'app/storage', 'app/bacheca', 'component/bookmarks/bookmarkVm'],function(ko, makeBookmarkProvider, storage, bacheca, BookmarkVm) {

  return function BookmarksVm(params) {

    const appVm = params.appVm;

    let bookmarkToDelete = null;
    let bookmarkOfContextMenu;
    const bookmarkToDeleteName = ko.observable();
    const tryToDeleteFolder = ko.observable(false);
    const showBookmarkDeleteDialog = ko.observable(false);
    const showFolderDialog = ko.observable(false);
    const folderName = ko.observable();


    // contextual menu
    const showContextMenu = ko.observable(false);
    const contextMenuPosX = ko.observable('0px');
    const contextMenuPosY = ko.observable('0px');

    // FIXME: direct ref to bookmarks in appVm
    const bookmarks = params.bookmarks;

    const deleteChildrenBookmarks = ko.observable();


    const bookmarkProvider = makeBookmarkProvider(storage);

    const confirmDelete = bookmark => {
      bookmarkToDelete = bookmark;
      bookmarkToDeleteName(bookmark.viewName());
      tryToDeleteFolder(bookmark.isFolder);
      showBookmarkDeleteDialog(true);
    };

    const _serializeBookmark = (bookmarkObj) => {
      return bookmarkProvider.fromJson(JSON.stringify(bookmarkObj));
    }

    const addFolder = () => {
      const folder = bookmarkProvider.makeFolder(new Date().toString(), folderName());
      storage.save(_serializeBookmark(folder));
      bookmarks.push(new BookmarkVm(folder));
      folderName('');
      // close the dialog
      dismissFolderDialog();

      bacheca.publish('addFolder', folder);
    };

    const folderDialog = () => {
      showFolderDialog(true);
    };

    const dismissFolderDialog = () => {
      showFolderDialog(false);
    };

    const addFolderOnEnter = (data,event) => {
      const enter = 13;
      if(event.keyCode === enter) {
        addFolder();
      }
    };

    const _loadBookmarksNewFormat = () =>
      storage.iterate( value => {
        bookmarks.push(new BookmarkVm(value));
        if(value.isFolder) {
          bacheca.publish('addFolder', value);
        }
    });

    const deleteBookmarkFromView = () => {
      deleteBookmark(bookmarkToDelete, deleteChildrenBookmarks());
      if(bookmarkToDelete.isFolder) {
        bacheca.publish('deleteFolder', bookmarkToDelete);
      }

      bookmarkToDelete = null;
      dismissDeleteBookmarkDialog();
    }

    const dismissDeleteBookmarkDialog = () => {
      showBookmarkDeleteDialog(false);
      deleteChildrenBookmarks(false);
    }

    const deleteBookmark = (bookmark, deleteChildrenBookmarks) => {
      if(bookmark.folder) {
        const containerFolder = bookmarks().find( b => b.id === bookmark.folder);
        let modifiedFolder = Object.assign({},containerFolder);
        modifiedFolder.bookmarks = containerFolder.bookmarks.filter(b => b.id !== bookmark.id);
        bookmarkProvider.save(_serializeBookmark(modifiedFolder));
        bookmarks.replace(containerFolder,modifiedFolder);
      } else {
        if(bookmark.isFolder && !deleteChildrenBookmarks) {
          const childrenBookmarks = bookmark.bookmarks.map( child => {
            child.folder=null;
            return child;
          });
          //FIXME: bad use _saveBookmark from appVm
          childrenBookmarks.forEach(child => appVm._saveBookmark(child, true));
        }
        storage.deleteById(bookmark.id, () => bookmarks.remove(bookmark));
      }

      bacheca.publish('deleteBookmark');
       if( bookmark.id == appVm.bookmarkSelected.id()) {

         appVm.bookmarkCopy = null;
         appVm.folderSelected('');

         appVm.bookmarkSelected.id('');
         appVm.bookmarkSelected.name('');
         appVm.clearRequest();
      }
    };

    const loadBookmarkObj = (bookmarkObj) => {
       bacheca.publish('loadBookmark', bookmarkObj);
    };

    const contextMenu = (bookmark, event) => {
        console.log(`CLICK DX ${event.pageY} - ${event.pageX}`);
        bookmarkOfContextMenu = bookmark;
        showContextMenu(true);
        contextMenuPosX(`${event.pageY}px`);
        contextMenuPosY(`${event.pageX}px`);
    };

    const duplicate = () => {
      const duplicate = bookmarkProvider.copyBookmark(bookmarkOfContextMenu);
      if(duplicate.name) {
        duplicate.name = 'Copy_' + duplicate.name;
      }
      duplicate.id = new Date().toString();
      if(duplicate.folder) {
        let folderObj = bookmarks().find(b => b.id === duplicate.folder);
        const modifiedFolder = bookmarkProvider.addBookmarks(folderObj, new BookmarkVm(duplicate));
        bookmarkProvider.save(_serializeBookmark(modifiedFolder));
        bookmarks.replace(folderObj, modifiedFolder);
      } else {
        bookmarkProvider.save(_serializeBookmark(duplicate));
        bookmarks.push(new BookmarkVm(duplicate));
      }
    };

    $(() => {
      const screenWidth = screen.width;
      const dialogLeftPosition = screenWidth / 2  - 200;
      $('div.dialog').css('left', dialogLeftPosition+'px');

       // hide context menu on every click on page
       $(".row").on("click", function() {
        showContextMenu(false);
       });

    });

    // define the storage format conversion
    // this function converts format of bookmarks to the new version
    // consider to maintain the call until version <= 0.6.0 of web-extentsion for compatibility goal
    (() => {
      storage.iterate( value => {
        try {
         const bookmarkObj = bookmarkProvider.fromJson(value);
         bookmarkProvider.save(bookmarkObj);
        } catch(e) {
          console.log('bookmark/folder already converted in new format');
        }
      }, (err,success) => {
        if(!err) {
          _loadBookmarksNewFormat();
        }
      });
    })();


    return {
      showFolderDialog,
      folderName,
      folderDialog,
      dismissFolderDialog,
      addFolderOnEnter,
      addFolder,
      bookmarks,
      showBookmarkDeleteDialog,
      bookmarkToDeleteName,
      tryToDeleteFolder,
      deleteChildrenBookmarks,
      deleteBookmark,
      confirmDelete,
      dismissDeleteBookmarkDialog,
      deleteBookmarkFromView,
      loadBookmarkObj,
      // context menu
      contextMenu,
      showContextMenu,
      contextMenuPosX,
      contextMenuPosY,
      // context menu actions
      duplicate,
    };
  }

});
