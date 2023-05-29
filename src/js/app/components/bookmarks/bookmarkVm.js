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

define(['knockout'], function (ko) {
  return function BookmarkViewModel(bookmark = {}) {
    const self = this
    this.id = bookmark.id
    this.name = bookmark.name
    this.isFolder = bookmark.isFolder
    this.folder = bookmark.folder
    this.requestMethod = bookmark.request ? bookmark.request.method : null
    this.requestUrl = bookmark.request ? bookmark.request.url : null
    this.bookmarks = bookmark.bookmarks
      ? bookmark.bookmarks.map((b) => new BookmarkViewModel(b))
      : undefined
    this.folderCollapsed = ko.observable(true)
    this.request = bookmark.request
    this.created = bookmark.created
    this.viewName = function () {
      return self.name && self.name.length > 0
        ? self.name
        : self.requestMethod + ' ' + self.requestUrl
    }
  }
})
