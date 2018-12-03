const requirejs = require('requirejs');

const makeBookmarkProvider = requirejs("src/js/app/bookmark.js");

const mockStorageProvider = {
  save : (bookmark) => ({result: 'OK', message : ''})
};

describe("Save bookmarks", function() {
  it("save the first bookmark", function() {
    const bookmark = { id : '1', request : {}, name : 'new bookmark' , isFolder: false};
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.save(bookmark);
    expect('OK').toBe(response.result);
  });
});

describe("Handling bookmarks", function() {
  const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);

  describe('replaceBookmark should', function() {
    it("add a bookmark if it not exists", function() {
      const startFolder = bookmarkProvider.makeFolder(1, "my folder");
      const newBookmark = bookmarkProvider.makeBookmark(1, "request", "bookmark name", null);
      const updatedFolder = bookmarkProvider.replaceBookmark(startFolder, newBookmark);
      expect(updatedFolder.id).toBe(startFolder.id);
      expect(updatedFolder.name).toBe(startFolder.name);
      expect(updatedFolder.bookmarks.length).toBe(1);
      expect(startFolder.bookmarks.length).toBe(0);
  
      const otherNewBookmark = bookmarkProvider.makeBookmark(2, "another request", "bookmark name", null);
      const leastFolder = bookmarkProvider.replaceBookmark(updatedFolder, otherNewBookmark);
      expect(leastFolder.bookmarks.length).toBe(2);
    });
  
    it("replace an existing bookmark", function() {
      const startFolder = bookmarkProvider.makeFolder(1, "my folder", [
        bookmarkProvider.makeBookmark(1, "request 1", "bookmark name", null)
      ]);
      const emendedBookmark = bookmarkProvider.makeBookmark(1, "request 2", "bookmark name", null);
  
      const updatedFolder = bookmarkProvider.replaceBookmark(startFolder, emendedBookmark);
  
      expect(updatedFolder.bookmarks.length).toBe(1);
      expect(updatedFolder.bookmarks[0].name).toBe(emendedBookmark.name);
      expect(updatedFolder.bookmarks[0].request).toBe(emendedBookmark.request);
      expect(startFolder.bookmarks[0].request).not.toBe(emendedBookmark.request);
    });

    it("replace the first bookmark", function() {
      const startFolder = bookmarkProvider.makeFolder(1, "my folder", [
        bookmarkProvider.makeBookmark(1, "request POST", "bookmark name", null),
        bookmarkProvider.makeBookmark(2, "request GET", "another name", null),
        bookmarkProvider.makeBookmark(3, "request PUT", "last name", null)
      ]);
      const emendedBookmark = bookmarkProvider.makeBookmark(1, "request DELETE", "bookmark name", null);
  
      const updatedFolder = bookmarkProvider.replaceBookmark(startFolder, emendedBookmark);
  
      expect(updatedFolder.bookmarks.length).toBe(3);
      expect(updatedFolder.bookmarks[0].name).toBe(emendedBookmark.name);
      expect(updatedFolder.bookmarks[0].request).toBe(emendedBookmark.request);
      expect(startFolder.bookmarks[0].request).not.toBe(emendedBookmark.request);
    });

    it("replace the last bookmark", function() {
      const startFolder = bookmarkProvider.makeFolder(1, "my folder", [
        bookmarkProvider.makeBookmark(1, "request POST", "bookmark name", null),
        bookmarkProvider.makeBookmark(2, "request GET", "another name", null),
        bookmarkProvider.makeBookmark(3, "request PUT", "last name", null)
      ]);
      const emendedBookmark = bookmarkProvider.makeBookmark(3, "request DELETE", "bookmark name", null);
  
      const updatedFolder = bookmarkProvider.replaceBookmark(startFolder, emendedBookmark);
  
      expect(updatedFolder.bookmarks.length).toBe(3);
      const lastBookmark = updatedFolder.bookmarks[2];
      expect(lastBookmark.name).toBe(emendedBookmark.name);
      expect(lastBookmark.request).toBe(emendedBookmark.request);
      expect(startFolder.bookmarks[2].request).not.toBe(emendedBookmark.request);
    });
  });

  describe("removeBookmark should", function() {
    it("remove an existing bookmark from a folder", function () {
      const startFolder = bookmarkProvider.makeFolder(1, "my folder",[
        bookmarkProvider.makeBookmark(1, "request", "bookmark name", null)
      ]);
      const updatedFolder = bookmarkProvider.removeBookmarks(startFolder, { id: 1 });

      expect(updatedFolder.bookmarks.length).toBe(0);
    });

    it("remove existing bookmarks from a folder", function() {
      const startFolder = bookmarkProvider.makeFolder(1, "my folder",[
        bookmarkProvider.makeBookmark(1, "request", "bookmark name", null)
      ]);
      const updatedFolder = bookmarkProvider.removeBookmarks(startFolder, [{ id: 1 }]);

      expect(updatedFolder.bookmarks.length).toBe(0);
    });

    it("remove all the bookmarks from a folder", function() {
      const bookmarksToRemove = [
        bookmarkProvider.makeBookmark(1, "request", "bookmark name", null),
        bookmarkProvider.makeBookmark(2, "request", "bookmark name", null),
        bookmarkProvider.makeBookmark(3, "request", "bookmark name", null),
        bookmarkProvider.makeBookmark(4, "request", "bookmark name", null)
      ];
      const startFolder = bookmarkProvider.makeFolder(1, "my folder",bookmarksToRemove.slice());
      const updatedFolder = bookmarkProvider.removeBookmarks(startFolder, bookmarksToRemove);

      expect(updatedFolder.bookmarks.length).toBe(0);
    });

    it("remove the last bookmark from a folder", function() {
      const bookmarksToRemove = [
        bookmarkProvider.makeBookmark(1, "request", "bookmark name", null),
        bookmarkProvider.makeBookmark(2, "request", "bookmark name", null),
        bookmarkProvider.makeBookmark(3, "request", "bookmark name", null),
        bookmarkProvider.makeBookmark(4, "request", "bookmark name", null)
      ];
      const startFolder = bookmarkProvider.makeFolder(1, "my folder",bookmarksToRemove.slice());
      const updatedFolder = bookmarkProvider.removeBookmarks(startFolder, bookmarksToRemove[3]);

      expect(updatedFolder.bookmarks.length).toBe(3);
      expect(updatedFolder.bookmarks.findIndex(b => b.id === 4)).toBe(-1);
    });
  });
});