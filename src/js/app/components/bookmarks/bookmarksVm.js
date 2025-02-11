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

define([
  'Vue',
  'knockout',
  'app/bookmark',
  'app/storage',
  'app/bacheca',
  'app/contextVm',
  'component/bookmarks/bookmarkVm',
  'component/entry-list/entryItemVm',
  'vuecomp/bookmarks-menu.umd',
], function (
  Vue,
  ko,
  makeBookmarkProvider,
  storage,
  bacheca,
  ContextVm,
  BookmarkVm,
  EntryItemVm,
  BookmarksMenu
) {
  return function BookmarksVm(params) {
    const appVm = params.appVm

    let bookmarkToDelete = null
    let bookmarkOfContextMenu
    const bookmarkToDeleteName = ko.observable()
    const tryToDeleteFolder = ko.observable(false)
    const showBookmarkDeleteDialog = ko.observable(false)

    // contextual menu
    const showBookmarkContextMenu = ko.observable(false)
    const showFolderContextMenu = ko.observable(false)
    const contextMenuPosX = ko.observable('0px')
    const contextMenuPosY = ko.observable('0px')

    // FIXME: direct ref to bookmarks in appVm
    const bookmarks = params.bookmarks
    const contexts = appVm.contexts

    const deleteChildrenBookmarks = ko.observable()

    const bookmarkProvider = makeBookmarkProvider(storage)

    const confirmDelete = (bookmark) => {
      bookmarkToDelete = bookmark
      bookmarkToDeleteName(bookmark.viewName())
      tryToDeleteFolder(bookmark.isFolder)
      showBookmarkDeleteDialog(true)
    }

    const confirmDeleteFromCtxMenu = () => {
      confirmDelete(bookmarkOfContextMenu)
    }

    const _serializeBookmark = (bookmarkObj) => {
      return bookmarkProvider.fromJson(JSON.stringify(bookmarkObj))
    }

    const expandFolder = (folder) => {
      folder.folderCollapsed(!folder.folderCollapsed())
    }

    const _addFolder = (folder) => {
      bookmarks.push(new BookmarkVm(folder))
    }

    const _loadBookmarksNewFormat = () =>
      storage.loadAll((stored) => {
        stored.forEach((value) => {
          if (value) {
            bookmarks.push(new BookmarkVm(value))
            if (value.isFolder) {
              bacheca.publish('addFolder', { folder: value })
            }
          }
        })
      })

    const deleteBookmarkFromView = () => {
      deleteBookmark(bookmarkToDelete, deleteChildrenBookmarks())
      if (bookmarkToDelete.isFolder) {
        bacheca.publish('deleteFolder', bookmarkToDelete)
      }

      bookmarkToDelete = null
      dismissDeleteBookmarkDialog()
    }

    const dismissDeleteBookmarkDialog = () => {
      showBookmarkDeleteDialog(false)
      deleteChildrenBookmarks(false)
    }

    const deleteBookmark = (bookmark, deleteChildrenBookmarks) => {
      if (bookmark.folder) {
        const containerFolder = bookmarks().find(
          (b) => b.id === bookmark.folder
        )
        let modifiedFolder = Object.assign({}, containerFolder)
        modifiedFolder.bookmarks = containerFolder.bookmarks.filter(
          (b) => b.id !== bookmark.id
        )
        bookmarkProvider.save(_serializeBookmark(modifiedFolder))
        bookmarks.replace(containerFolder, modifiedFolder)
      } else {
        if (bookmark.isFolder && !deleteChildrenBookmarks) {
          const childrenBookmarks = bookmark.bookmarks.map((child) => {
            child.folder = null
            return child
          })
          //FIXME: bad use _saveBookmark from appVm
          childrenBookmarks.forEach((child) => appVm._saveBookmark(child, true))
        }
        storage.deleteById(bookmark.id, () => bookmarks.remove(bookmark))
      }

      bacheca.publish('deleteBookmark')
      if (bookmark.id == appVm.bookmarkSelected.id()) {
        appVm.bookmarkCopy = null
        appVm.folderSelected('')

        appVm.bookmarkSelected.id('')
        appVm.bookmarkSelected.name('')
        appVm.clearRequest()
      }
    }

    const closeDialogOnExcape = (data, event) => {
      const excape = 27
      if (event.keyCode === excape) {
        showBookmarkDeleteDialog(false)
        showBookmarkContextMenu(false)
        showFolderContextMenu(false)
      }
    }
    const loadBookmarkObj = (bookmarkObj) => {
      bacheca.publish('loadBookmark', bookmarkObj)
    }

    const contextMenu = (bookmark, event) => {
      const posX = event.clientY
      const posY = event.clientX
      bookmarkOfContextMenu = bookmark
      if (bookmark.isFolder) {
        showFolderContextMenu(true)
      } else {
        showBookmarkContextMenu(true)
      }
      contextMenuPosX(`${posX}px`)
      contextMenuPosY(`${posY}px`)
    }

    const duplicate = () => {
      const duplicate = bookmarkProvider.copyBookmark(bookmarkOfContextMenu)
      duplicate.created = new Date()
      if (duplicate.name) {
        duplicate.name = 'Copy_' + duplicate.name
      }
      duplicate.id = storage.generateId()
      if (duplicate.folder) {
        let folderObj = bookmarks().find((b) => b.id === duplicate.folder)
        const modifiedFolder = bookmarkProvider.addBookmarks(
          folderObj,
          new BookmarkVm(duplicate)
        )
        bookmarkProvider.save(_serializeBookmark(modifiedFolder))
        bookmarks.replace(folderObj, modifiedFolder)
      } else {
        bookmarkProvider.save(_serializeBookmark(duplicate))
        bookmarks.push(new BookmarkVm(duplicate))
      }
    }

    const exportSelectedBookmarks = () => {
      const contextsModels = _extractContextFromVM(contexts())
      let contextsToExport = []
      if (bookmarkOfContextMenu.isFolder) {
        if (bookmarkOfContextMenu.bookmarks) {
          contextsToExport = [
            ...new Set(
              bookmarkOfContextMenu.bookmarks.map((b) => b.request.context)
            ),
          ]
        }
      } else {
        contextsToExport.push(bookmarkOfContextMenu.request.context)
      }
      const selectedContexts = contextsModels.filter((cm) =>
        contextsToExport.includes(cm.name)
      )
      const exportContent = JSON.stringify(
        bookmarkProvider.exportObj([bookmarkOfContextMenu], selectedContexts)
      )
      const exportFile = new File([exportContent], 'export.resting.json', {
        type: 'application/json',
      })

      const url = URL.createObjectURL(exportFile)

      chrome.downloads.download({
        filename: exportFile.name,
        url: url,
        saveAs: true,
      })
    }

    const _handleImport = () => {
      const f = document.getElementById('import-file').files
      const fr = new FileReader()
      fr.onload = (e) => {
        const content = e.target.result
        const importedBookmarks = bookmarkProvider.importHAR(content)
        importedBookmarks.bookmarks.forEach((b) => {
          bookmarkProvider.save(b)
          const bookmarkToEdit = bookmarks().find(
            (bookmark) => bookmark.id === b.id
          )
          const bookmarkVm = new BookmarkVm(b)
          if (bookmarkToEdit) {
            bookmarks.replace(bookmarkToEdit, bookmarkVm)
          } else {
            bookmarks.push(bookmarkVm)
          }
          if (b.isFolder) {
            bacheca.publish('addFolder', { folder: b })
          }
        })

        importedBookmarks.contexts.forEach((c) => _saveContext(c))
      }
      if (f[0]) {
        fr.readAsText(f[0])
      }
      document.getElementById('import-file').value = ''
    }

    // FIXME: duplication of appVm function
    const _saveContext = (context = {}) => {
      const contextToEditIdx = contexts().findIndex(
        (ctx) => ctx.name() === context.name
      )
      let contextToSave
      if (contextToEditIdx >= 0) {
        // append variables to existent context
        contextToSave = {
          name: context.name,
          variables: _extractItemFromVM(
            contexts()[contextToEditIdx].variables()
          ).concat(context.variables),
        }
      } else {
        contextToSave = context
      }
      storage.saveContext(contextToSave)
      const contextVm = new ContextVm(
        contextToSave.name,
        contextToSave.variables
      )
      if (contextToEditIdx >= 0) {
        contexts.replace(contexts()[contextToEditIdx], contextVm)
      } else {
        contexts.push(contextVm)
      }
      if (context.name === 'default') {
        appVm.defaultCtxIdx = contextToEditIdx
      }
    }

    const _handleExport = () => {
      const contextsModels = _extractContextFromVM(contexts())
      const exportContent = JSON.stringify(
        bookmarkProvider.exportObj(bookmarks(), contextsModels)
      )
      const exportFile = new File([exportContent], 'export.resting.json', {
        type: 'application/json',
      })

      const url = URL.createObjectURL(exportFile)

      chrome.downloads.download({
        filename: exportFile.name,
        url: url,
        saveAs: true,
      })
    }

    const _extractContextFromVM = (contexts = []) => {
      return contexts.map((c) => ({
        name: c.name(),
        variables: _extractItemFromVM(c.variables()),
      }))
    }

    const _extractItemFromVM = (items = []) => {
      return items.map((item) => ({
        name: item.name(),
        value: item.value(),
        enabled: item.enabled(),
      }))
    }

    const sortCriteria = (b1, b2) => {
      const bookmarkName1 = b1.viewName()
      const bookmarkName2 = b2.viewName()
      if (bookmarkName1.toUpperCase() < bookmarkName2.toUpperCase()) {
        return -1
      }
      if (bookmarkName1.toUpperCase() > bookmarkName2.toUpperCase()) {
        return 1
      }
      return 0
    }

    const openInTab = () => {
      bacheca.publish('openInTab', bookmarkOfContextMenu)
    }

    const _sortBookmarks = () => {
      bookmarks.sort(sortCriteria)
      bookmarks().forEach((b) => {
        if (b.isFolder) {
          const sortedFolder = bookmarkProvider.sortBookmarks(b, sortCriteria)
          const originalFolder = bookmarks().find(
            (bookmark) => bookmark.id === b.id
          )
          bookmarks.replace(originalFolder, sortedFolder)
        }
      })
    }

    $(() => {
      // hide context menu on every click on page
      $('.row').on('click', function () {
        showBookmarkContextMenu(false)
        showFolderContextMenu(false)
      })
      _loadBookmarksNewFormat()

      new Vue({
        el: '#v-bookmarks-menu',
        components: {
          BookmarksMenu,
        },
        render: function (h) {
          return h('bookmarks-menu')
        },
      })
    })

    /*
     * FIXME: subscribe to newFolder is a workaround:
     * bookmarksVm publishes and now consumes addFolder events.
     * it publishes addFolder events  loading bookmarks from storage
     * and this duplicates (only in view) all folder elements
     */
    bacheca.subscribe('newFolder', _addFolder)
    bacheca.subscribe('sortBookmarks', _sortBookmarks)
    bacheca.subscribe('importBookmarks', _handleImport)
    bacheca.subscribe('exportBookmarks', _handleExport)

    return {
      closeDialogOnExcape,
      bookmarks,
      showBookmarkDeleteDialog,
      bookmarkToDeleteName,
      tryToDeleteFolder,
      deleteChildrenBookmarks,
      deleteBookmark,
      confirmDelete,
      confirmDeleteFromCtxMenu,
      dismissDeleteBookmarkDialog,
      deleteBookmarkFromView,
      loadBookmarkObj,
      expandFolder,
      exportSelectedBookmarks,
      // context menu
      contextMenu,
      showBookmarkContextMenu,
      showFolderContextMenu,
      contextMenuPosX,
      contextMenuPosY,
      // context menu actions
      openInTab,
      duplicate,
    }
  }
})
