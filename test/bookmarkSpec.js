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
