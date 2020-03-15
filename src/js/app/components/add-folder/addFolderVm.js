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
