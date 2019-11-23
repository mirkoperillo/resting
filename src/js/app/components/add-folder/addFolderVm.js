define(['knockout', 'app/bookmark', 'app/storage', 'app/bacheca'],function(ko, makeBookmarkProvider, storage, bacheca) {

  return function AddFolderVm(params) {
    const folderName = ko.observable();
    const bookmarkProvider = makeBookmarkProvider(storage);
    const showFolderDialog = ko.observable(false);

    const addFolder = () => {
      const folder = bookmarkProvider.makeFolder(storage.generateId(), folderName());
      storage.save(_serializeBookmark(folder));
      dismissFolderDialog();

      bacheca.publish('addFolder', folder);
    /*
     * FIXME: published to newFolder is a workaround:
     * it permits to bookmarksVm to not duplicated folder items in view
     */
      bacheca.publish('newFolder', folder);
    };

    const folderDialog = () => {
      showFolderDialog(true);
    };

    const dismissFolderDialog = () => {
      folderName('');
      showFolderDialog(false);
    };

    const addFolderOnEnter = (data, event) => {
      const enter = 13;
      if(event.keyCode === enter) {
        addFolder();
      }
    };

    const _serializeBookmark = (bookmarkObj) => {
      return bookmarkProvider.fromJson(JSON.stringify(bookmarkObj));
    }

    $(() => {
      const screenWidth = screen.width;
      const dialogLeftPosition = screenWidth / 2  - 200;
      $('.dialog').css('left', dialogLeftPosition+'px');
    });

    return {
      addFolder,
      addFolderOnEnter,
      folderDialog,
      dismissFolderDialog,
      showFolderDialog,
      folderName,
    };
  }
});
