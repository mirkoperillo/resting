const requirejs = require('requirejs');

const makeBookmarkProvider = requirejs("src/js/app/bookmark.js");

const mockStorageProvider = {
  save : (bookmark) => ({result: 'OK', message : ''}),
  generateId: () => new Date().getTime()
};


function escapeString(s) {
return s.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
}


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

describe("Import HAR", function() {
  it("with one GET call", function() {
    const harContent = `{
  "log": {
    "version": "1.2",
    "creator": {
      "name": "Firefox",
      "version": "67.0"
    },
    "browser": {
      "name": "Firefox",
      "version": "67.0"
    },
    "pages": [
      {
        "startedDateTime": "2019-04-19T07:36:16.840+02:00",
        "id": "page_1",
        "pageTimings": {
          "onContentLoad": -560589,
          "onLoad": -560520
        }
      }
    ],
    "entries": [
      {
        "pageref": "page_1",
        "startedDateTime": "2019-04-19T07:36:16.840+02:00",
        "request": {
          "bodySize": 0,
          "method": "GET",
          "url": "http://www.corriere.it/?_=1555651616456",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "Host",
              "value": "www.corriere.it"
            },
            {
              "name": "User-Agent",
              "value": "Mozilla/5.0 (X11; Linux i686; rv:67.0) Gecko/20100101 Firefox/67.0"
            },
            {
              "name": "Accept",
              "value": "*/*"
            },
            {
              "name": "Accept-Language",
              "value": "en-US,en;q=0.5"
            },
            {
              "name": "Accept-Encoding",
              "value": "gzip, deflate"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "queryString": [
            {
              "name": "_",
              "value": "1555651616456"
            }
          ],
          "headersSize": 239
        },
        "response": {
          "status": 301,
          "statusText": "Moved Permanently",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "X-Varnish-TTL",
              "value": "10s"
            },
            {
              "name": "X-RCS-CacheZone",
              "value": "cache-client"
            },
            {
              "name": "Location",
              "value": "https://www.corriere.it/?_=1555651616456"
            },
            {
              "name": "Content-Length",
              "value": "248"
            },
            {
              "name": "Content-Type",
              "value": "text/html; charset=iso-8859-1"
            },
            {
              "name": "Referrer-Policy",
              "value": "unsafe-url"
            },
            {
              "name": "Cache-Control",
              "value": "public, max-age=10"
            },
            {
              "name": "Expires",
              "value": "Fri, 19 Apr 2019 05:36:26 GMT"
            },
            {
              "name": "Date",
              "value": "Fri, 19 Apr 2019 05:36:16 GMT"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "content": {
            "mimeType": "text/html; charset=ISO-8859-1",
            "size": 143794,
            "comment": "Response bodies are not included."
          },
          "redirectURL": "https://www.corriere.it/?_=1555651616456",
          "headersSize": 368,
          "bodySize": 32791
        },
        "cache": {},
        "timings": {
          "blocked": 56,
          "dns": 29,
          "connect": 27,
          "ssl": 0,
          "send": 0,
          "wait": 96,
          "receive": 0
        },
        "time": 208,
        "_securityState": "insecure",
        "serverIPAddress": "23.222.8.9",
        "connection": "80"
      }]
  }
}`;

    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const bookmarks = bookmarkProvider.importHAR(harContent).bookmarks;

    expect(1).toBe(bookmarks.length);

    const bookmark = bookmarks[0];
    expect('page_1').toBe(bookmark.name);
    expect('http://www.corriere.it/').toBe(bookmark.request.url);
    expect('GET').toBe(bookmark.request.method);
    expect(1).toBe(bookmark.request.querystring.length);
    expect(6).toBe(bookmark.request.headers.length);

    expect('Accept').toBe(bookmark.request.headers[2].name);
    expect('*/*').toBe(bookmark.request.headers[2].value);
  });

  it("with two GET call", function() {
    const harContent = `{
  "log": {
    "version": "1.2",
    "creator": {
      "name": "Firefox",
      "version": "67.0"
    },
    "browser": {
      "name": "Firefox",
      "version": "67.0"
    },
    "pages": [
      {
        "startedDateTime": "2019-04-19T07:36:16.840+02:00",
        "id": "page_1",
        "pageTimings": {
          "onContentLoad": -560589,
          "onLoad": -560520
        }
      }
    ],
    "entries": [
      {
        "pageref": "page_1",
        "startedDateTime": "2019-04-19T07:36:16.840+02:00",
        "request": {
          "bodySize": 0,
          "method": "GET",
          "url": "http://www.corriere.it/?_=1555651616456",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "Host",
              "value": "www.corriere.it"
            },
            {
              "name": "User-Agent",
              "value": "Mozilla/5.0 (X11; Linux i686; rv:67.0) Gecko/20100101 Firefox/67.0"
            },
            {
              "name": "Accept",
              "value": "*/*"
            },
            {
              "name": "Accept-Language",
              "value": "en-US,en;q=0.5"
            },
            {
              "name": "Accept-Encoding",
              "value": "gzip, deflate"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "queryString": [
            {
              "name": "_",
              "value": "1555651616456"
            }
          ],
          "headersSize": 239
        },
        "response": {
          "status": 301,
          "statusText": "Moved Permanently",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "X-Varnish-TTL",
              "value": "10s"
            },
            {
              "name": "X-RCS-CacheZone",
              "value": "cache-client"
            },
            {
              "name": "Location",
              "value": "https://www.corriere.it/?_=1555651616456"
            },
            {
              "name": "Content-Length",
              "value": "248"
            },
            {
              "name": "Content-Type",
              "value": "text/html; charset=iso-8859-1"
            },
            {
              "name": "Referrer-Policy",
              "value": "unsafe-url"
            },
            {
              "name": "Cache-Control",
              "value": "public, max-age=10"
            },
            {
              "name": "Expires",
              "value": "Fri, 19 Apr 2019 05:36:26 GMT"
            },
            {
              "name": "Date",
              "value": "Fri, 19 Apr 2019 05:36:16 GMT"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "content": {
            "mimeType": "text/html; charset=ISO-8859-1",
            "size": 143794,
            "comment": "Response bodies are not included."
          },
          "redirectURL": "https://www.corriere.it/?_=1555651616456",
          "headersSize": 368,
          "bodySize": 32791
        },
        "cache": {},
        "timings": {
          "blocked": 56,
          "dns": 29,
          "connect": 27,
          "ssl": 0,
          "send": 0,
          "wait": 96,
          "receive": 0
        },
        "time": 208,
        "_securityState": "insecure",
        "serverIPAddress": "23.222.8.9",
        "connection": "80"
      },
      {
        "pageref": "page_1",
        "startedDateTime": "2019-04-19T07:36:17.005+02:00",
        "request": {
          "bodySize": 0,
          "method": "GET",
          "url": "https://www.corriere.it/?_=1555651616456",
          "httpVersion": "HTTP/2.0",
          "headers": [
            {
              "name": "Host",
              "value": "www.corriere.it"
            },
            {
              "name": "User-Agent",
              "value": "Mozilla/5.0 (X11; Linux i686; rv:67.0) Gecko/20100101 Firefox/67.0"
            },
            {
              "name": "Accept",
              "value": "*/*"
            },
            {
              "name": "Accept-Language",
              "value": "en-US,en;q=0.5"
            },
            {
              "name": "Accept-Encoding",
              "value": "gzip, deflate, br"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "queryString": [
            {
              "name": "_",
              "value": "1555651616456"
            }
          ],
          "headersSize": 243
        },
        "response": {
          "status": 200,
          "statusText": "OK",
          "httpVersion": "HTTP/2.0",
          "headers": [
            {
              "name": "content-type",
              "value": "text/html; charset=ISO-8859-1"
            },
            {
              "name": "x-varnish-ttl",
              "value": "10s"
            },
            {
              "name": "vary",
              "value": "Accept-Encoding"
            },
            {
              "name": "referrer-policy",
              "value": "unsafe-url"
            },
            {
              "name": "access-control-allow-methods",
              "value": "GET, HEAD, OPTIONS"
            },
            {
              "name": "access-control-allow-headers",
              "value": "origin, x-requested-with, content-type"
            },
            {
              "name": "access-control-allow-origin",
              "value": "*"
            },
            {
              "name": "x-rcs-cachezone",
              "value": "cache-client"
            },
            {
              "name": "content-encoding",
              "value": "gzip"
            },
            {
              "name": "cache-control",
              "value": "max-age=10"
            },
            {
              "name": "expires",
              "value": "Fri, 19 Apr 2019 05:36:27 GMT"
            },
            {
              "name": "date",
              "value": "Fri, 19 Apr 2019 05:36:17 GMT"
            },
            {
              "name": "content-length",
              "value": "32423"
            },
            {
              "name": "X-Firefox-Spdy",
              "value": "h2"
            }
          ],
          "cookies": [],
          "content": {
            "mimeType": "text/html; charset=ISO-8859-1",
            "size": 143794
          },
          "redirectURL": "",
          "headersSize": 490,
          "bodySize": 32913
        },
        "cache": {},
        "timings": {
          "blocked": 71,
          "dns": 1,
          "connect": 28,
          "ssl": 36,
          "send": 0,
          "wait": 471,
          "receive": 36
        },
        "time": 643,
        "_securityState": "secure",
        "serverIPAddress": "23.222.8.9",
        "connection": "443"
      }
    ]
  }
}`;

    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const bookmarks = bookmarkProvider.importHAR(harContent).bookmarks;
    expect(2).toBe(bookmarks.length);
  });

  it("with one POST JSON call", function() {
    const harContent = `{
  "log": {
    "version": "1.2",
    "creator": {
      "name": "Firefox",
      "version": "67.0"
    },
    "browser": {
      "name": "Firefox",
      "version": "67.0"
    },
    "pages": [
      {
        "startedDateTime": "2019-04-23T07:12:43.793+02:00",
        "id": "page_1",
        "pageTimings": {
          "onContentLoad": -34408,
          "onLoad": -34370
        }
      }
    ],
    "entries": [
      {
        "pageref": "page_1",
        "startedDateTime": "2019-04-23T07:12:43.793+02:00",
        "request": {
          "bodySize": 50,
          "method": "POST",
          "url": "https://jsonplaceholder.typicode.com/posts",
          "httpVersion": "HTTP/2.0",
          "headers": [
            {
              "name": "Host",
              "value": "jsonplaceholder.typicode.com"
            },
            {
              "name": "User-Agent",
              "value": "Mozilla/5.0 (X11; Linux i686; rv:67.0) Gecko/20100101 Firefox/67.0"
            },
            {
              "name": "Accept",
              "value": "*/*"
            },
            {
              "name": "Accept-Language",
              "value": "en-US,en;q=0.5"
            },
            {
              "name": "Accept-Encoding",
              "value": "gzip, deflate, br"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            },
            {
              "name": "Content-Length",
              "value": "50"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "queryString": [],
          "headersSize": 298,
          "postData": {
            "mimeType": "application/json",
            "params": [],
            "text": "{title: 'foo',\\n      body: 'bar',\\n      userId: 1}"
          }
        },
        "cache": {},
        "timings": {
          "blocked": 151,
          "dns": 43,
          "connect": 26,
          "ssl": 75,
          "send": 0,
          "wait": 59750,
          "receive": 0
        },
        "time": 60045,
        "_securityState": "secure",
        "serverIPAddress": "104.28.11.230",
        "connection": "443"
      }
    ]
  }
}`;

    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const bookmarks = bookmarkProvider.importHAR(harContent).bookmarks;
    expect(1).toBe(bookmarks.length);
    const bookmark = bookmarks[0];

    expect("{title: 'foo',\n      body: 'bar',\n      userId: 1}").toBe(bookmark.request.body);
  });

  it("with one POST form-data call", function() {
    const harContent = `{
  "log": {
    "version": "1.1",
    "creator": {
      "name": "Firefox",
      "version": "66.0.3"
    },
    "browser": {
      "name": "Firefox",
      "version": "66.0.3"
    },
    "pages": [
      {
        "startedDateTime": "2019-04-25T06:53:13.527+02:00",
        "id": "page_1",
        "title": "Resting - the REST client",
        "pageTimings": {
          "onContentLoad": -53763,
          "onLoad": -53717
        }
      }
    ],
    "entries": [
      {
        "pageref": "page_1",
        "startedDateTime": "2019-04-25T06:53:13.527+02:00",
        "request": {
          "bodySize": 13,
          "method": "POST",
          "url": "http://localhost:3000/",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "Host",
              "value": "localhost:3000"
            },
            {
              "name": "User-Agent",
              "value": "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:66.0) Gecko/20100101 Firefox/66.0"
            },
            {
              "name": "Accept",
              "value": "*/*"
            },
            {
              "name": "Accept-Language",
              "value": "en-US,en;q=0.5"
            },
            {
              "name": "Accept-Encoding",
              "value": "gzip, deflate"
            },
            {
              "name": "Content-Type",
              "value": "multipart/form-data"
            },
            {
              "name": "Content-Length",
              "value": "13"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "queryString": [],
          "headersSize": 286,
          "postData": {
            "mimeType": "multipart/form-data",
            "params": [],
            "text": "varA=a&varB=b"
          }
        },
        "cache": {},
        "timings": {
          "blocked": 0,
          "dns": 0,
          "connect": 0,
          "ssl": 0,
          "send": 0,
          "wait": 2,
          "receive": 2002
        },
        "time": 2004,
        "_securityState": "insecure",
        "serverIPAddress": "127.0.0.1",
        "connection": "3000"
      }
    ]
  }
}`;

    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const bookmarks = bookmarkProvider.importHAR(harContent).bookmarks;
    expect(1).toBe(bookmarks.length);
    const bookmark = bookmarks[0];

    expect("varA=a&varB=b").toBe(bookmark.request.body);
    expect(9).toBe(bookmark.request.headers.length);
  });

  it("with one POST form-encoded call", function() {
    const harContent = `{
  "log": {
    "version": "1.1",
    "creator": {
      "name": "Firefox",
      "version": "66.0.3"
    },
    "browser": {
      "name": "Firefox",
      "version": "66.0.3"
    },
    "pages": [
      {
        "startedDateTime": "2019-04-25T06:53:13.527+02:00",
        "id": "page_2",
        "title": "Resting - the REST client",
        "pageTimings": {
          "onContentLoad": -53763,
          "onLoad": -53717
        }
      }
    ],
    "entries": [
      {
        "pageref": "page_2",
        "startedDateTime": "2019-04-25T07:21:47.459+02:00",
        "request": {
          "bodySize": 12,
          "method": "POST",
          "url": "http://localhost:3000/",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "Host",
              "value": "localhost:3000"
            },
            {
              "name": "User-Agent",
              "value": "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:66.0) Gecko/20100101 Firefox/66.0"
            },
            {
              "name": "Accept",
              "value": "*/*"
            },
            {
              "name": "Accept-Language",
              "value": "en-US,en;q=0.5"
            },
            {
              "name": "Accept-Encoding",
              "value": "gzip, deflate"
            },
            {
              "name": "Content-Type",
              "value": "application/x-www-form-urlencoded"
            },
            {
              "name": "Content-Length",
              "value": "12"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "queryString": [],
          "headersSize": 300,
          "postData": {
            "mimeType": "application/x-www-form-urlencoded",
            "params": [
              {
                "name": "varA",
                "value": "a"
              },
              {
                "name": "varB",
                "value": "B"
              }
            ],
            "text": "varA=a&varB=B"
          }
        },
        "cache": {},
        "timings": {
          "blocked": 0,
          "dns": 0,
          "connect": 1,
          "ssl": 0,
          "send": 0,
          "wait": 0,
          "receive": 2002
        },
        "time": 2003,
        "_securityState": "insecure",
        "serverIPAddress": "127.0.0.1",
        "connection": "3000"
      }
    ]
  }
}`;

    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const bookmarks = bookmarkProvider.importHAR(harContent).bookmarks;
    expect(1).toBe(bookmarks.length);
    const bookmark = bookmarks[0];

    expect("varA=a&varB=B").toBe(bookmark.request.body);
    expect(9).toBe(bookmark.request.headers.length);
  });

  it("strange values in response field", function() {
    const harContent = `{
  "log": {
    "version": "1.1",
    "creator": {
      "name": "Firefox",
      "version": "66.0.3"
    },
    "browser": {
      "name": "Firefox",
      "version": "66.0.3"
    },
    "pages": [
      {
        "startedDateTime": "2019-04-25T06:53:13.527+02:00",
        "id": "page_2",
        "title": "Resting - the REST client",
        "pageTimings": {
          "onContentLoad": -53763,
          "onLoad": -53717
        }
      }
    ],
    "entries": [
      {
        "pageref": "page_2",
        "startedDateTime": "2019-04-25T06:53:13.527+02:00",
        "request": {
          "bodySize": 13,
          "method": "POST",
          "url": "http://localhost:3000/",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "Host",
              "value": "localhost:3000"
            },
            {
              "name": "User-Agent",
              "value": "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:66.0) Gecko/20100101 Firefox/66.0"
            },
            {
              "name": "Accept",
              "value": "*/*"
            },
            {
              "name": "Accept-Language",
              "value": "en-US,en;q=0.5"
            },
            {
              "name": "Accept-Encoding",
              "value": "gzip, deflate"
            },
            {
              "name": "Content-Type",
              "value": "multipart/form-data"
            },
            {
              "name": "Content-Length",
              "value": "13"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "queryString": [],
          "headersSize": 286,
          "postData": {
            "mimeType": "multipart/form-data",
            "params": [],
            "text": "varA=a&varB=b"
          }
        },
        "response": {
          "status": 200,
          "statusText": "OK",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "Date",
              "value": "Thu Apr 25 2019 06:53:13 GMT+0200 (CEST)"
            },
            {
              "name": "Connection",
              "value": "close"
            },
            {
              "name": "Content-Type",
              "value": "text/plain"
            },
            {
              "name": "Access-Control-Allow-Origin",
              "value": "*"
            }
          ],
          "cookies": [],
          "content": {
            "mimeType": "text/plain",
            "size": 299,
            "text": "POST / HTTP/1.1\r\nHost: localhost:3000\r\nUser-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:66.0) Gecko/20100101 Firefox/66.0\r\nAccept: */*\r\nAccept-Language: en-US,en;q=0.5\r\nAccept-Encoding: gzip, deflate\r\nContent-Type: multipart/form-data\r\nContent-Length: 13\r\nConnection: keep-alive\r\n\r\nvarA=a&varB=b"
          },
          "redirectURL": "",
          "headersSize": 144,
          "bodySize": 443
        },
        "cache": {},
        "timings": {
          "blocked": 0,
          "dns": 0,
          "connect": 0,
          "ssl": 0,
          "send": 0,
          "wait": 2,
          "receive": 2002
        },
        "time": 2004,
        "_securityState": "insecure",
        "serverIPAddress": "127.0.0.1",
        "connection": "3000"
      },
      {
        "pageref": "page_2",
        "startedDateTime": "2019-04-25T07:21:47.459+02:00",
        "request": {
          "bodySize": 12,
          "method": "POST",
          "url": "http://localhost:3000/",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "Host",
              "value": "localhost:3000"
            },
            {
              "name": "User-Agent",
              "value": "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:66.0) Gecko/20100101 Firefox/66.0"
            },
            {
              "name": "Accept",
              "value": "*/*"
            },
            {
              "name": "Accept-Language",
              "value": "en-US,en;q=0.5"
            },
            {
              "name": "Accept-Encoding",
              "value": "gzip, deflate"
            },
            {
              "name": "Content-Type",
              "value": "application/x-www-form-urlencoded"
            },
            {
              "name": "Content-Length",
              "value": "12"
            },
            {
              "name": "Connection",
              "value": "keep-alive"
            }
          ],
          "cookies": [],
          "queryString": [],
          "headersSize": 300,
          "postData": {
            "mimeType": "application/x-www-form-urlencoded",
            "params": [
              {
                "name": "varA",
                "value": "a"
              },
              {
                "name": "vaB",
                "value": "B"
              }
            ],
            "text": "varA=a&vaB=B"
          }
        },
        "response": {
          "status": 200,
          "statusText": "OK",
          "httpVersion": "HTTP/1.1",
          "headers": [
            {
              "name": "Date",
              "value": "Thu Apr 25 2019 07:21:47 GMT+0200 (CEST)"
            },
            {
              "name": "Connection",
              "value": "close"
            },
            {
              "name": "Content-Type",
              "value": "text/plain"
            },
            {
              "name": "Access-Control-Allow-Origin",
              "value": "*"
            }
          ],
          "cookies": [],
          "content": {
            "mimeType": "text/plain",
            "size": 312,
            "text": "POST / HTTP/1.1\r\nHost: localhost:3000\r\nUser-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:66.0) Gecko/20100101 Firefox/66.0\r\nAccept: */*\r\nAccept-Language: en-US,en;q=0.5\r\nAccept-Encoding: gzip, deflate\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 12\r\nConnection: keep-alive\r\n\r\nvarA=a&vaB=B"
          },
          "redirectURL": "",
          "headersSize": 144,
          "bodySize": 456
        },
        "cache": {},
        "timings": {
          "blocked": 0,
          "dns": 0,
          "connect": 1,
          "ssl": 0,
          "send": 0,
          "wait": 0,
          "receive": 2002
        },
        "time": 2003,
        "_securityState": "insecure",
        "serverIPAddress": "127.0.0.1",
        "connection": "3000"
      }
    ]
  }
}`;

    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const bookmarks = bookmarkProvider.importHAR(harContent).bookmarks;
    expect(2).toBe(bookmarks.length);
    const bookmark = bookmarks[0];

    expect("varA=a&varB=b").toBe(bookmark.request.body);
    expect(9).toBe(bookmark.request.headers.length);
  });
});

describe("Export", function() {
  it("no bookmarks", function() {
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.exportObj([]);
    expect('1.1').toBe(response.log.version);
    expect('Resting WebExtension').toBe(response.log.creator.name);
    expect('1.0').toBe(response.log.creator.version);
  });


   it("folder with one bookmark", function() {
    const bookmarks = '[{"id":"7e1a4356-fede-41c3-b764-5024c8f17188","name":"FOLDER","bookmarks":[{"id":"618c48e8-7336-474a-8263-525da96c0cc5","name":"my-bookmark","isFolder":false,"folder":"7e1a4356-fede-41c3-b764-5024c8f17188","requestMethod":"PUT","requestUrl":"www.google.it","request":{"method":"PUT","url":"www.google.it","headers":[{"name":"header1","value":"v1","enabled":true},{"name":"header2","value":"v2","enabled":true}],"querystring":[],"bodyType":"raw","body":"{\\n\\"field\\" : \\"value\\" \\n}","authentication":{"type":"Basic","username":"gino","password":"pilo"},"context":"default"},"created":"2019-05-28T04:36:48.322Z"}],"isFolder":true,"created":"2019-05-28T04:36:38.346Z"}]';
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.exportObj(JSON.parse(bookmarks));
    expect('1.1').toBe(response.log.version);
    expect('Resting WebExtension').toBe(response.log.creator.name);
    expect('1.0').toBe(response.log.creator.version);
    expect(2).toBe(response.log.entries.length);
    expect("FOLDER").toBe(response.log.entries[0]._name);
    expect(true).toBe(response.log.entries[0]._isFolder);
    expect("7e1a4356-fede-41c3-b764-5024c8f17188").toBe(response.log.entries[0]._id);
    expect("2019-05-28T04:36:38.346Z").toBe(response.log.entries[0]._created);
    expect('my-bookmark').toBe(response.log.entries[1]._name);
    expect('www.google.it').toBe(response.log.entries[1].request.url)
    expect('PUT').toBe(response.log.entries[1].request.method);
    expect(2).toBe(response.log.entries[1].request.headers.length);
    expect(true).toBe(response.log.entries[1].request.headers[1]._enabled);
    expect("application/json").toBe(response.log.entries[1].request.postData.mimeType);
    expect('{\n\"field\" : \"value\" \n}').toBe(response.log.entries[1].request.postData.text);
    expect('gino').toBe(response.log.entries[1].request._authentication.username);
  });

  it("bookmark post request urlencoded", function() {
    const bookmarks = '[{"id":"9406075c-e754-4d9b-a264-cb6b9f4fd9ea","request":{"method":"POST","url":"test.local","headers":[],"querystring":[],"bodyType":"x-www-form-urlencoded","body":[{"name":"ccc","value":"ooo","enabled":true},{"name":"qqq","value":"ppp","enabled":false}],"authentication":{"username":"","password":""},"context":"default"},"name":"book","isFolder":false,"created":"2019-06-11T04:49:40.308Z"}]';
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.exportObj(JSON.parse(bookmarks));
    expect('1.1').toBe(response.log.version);
    expect('Resting WebExtension').toBe(response.log.creator.name);
    expect('1.0').toBe(response.log.creator.version);
    expect(1).toBe(response.log.entries.length);
    expect("book").toBe(response.log.entries[0]._name);
    expect(false).toBe(response.log.entries[0]._isFolder);
    expect("9406075c-e754-4d9b-a264-cb6b9f4fd9ea").toBe(response.log.entries[0]._id);
    expect("2019-06-11T04:49:40.308Z").toBe(response.log.entries[0]._created);
    expect('test.local').toBe(response.log.entries[0].request.url)
    expect('POST').toBe(response.log.entries[0].request.method);
    expect(0).toBe(response.log.entries[0].request.headers.length);
    expect("application/x-www-form-urlencoded").toBe(response.log.entries[0].request.postData.mimeType);
    expect(response.log.entries[0].request.postData.text).toBeUndefined();
    expect(response.log.entries[0].request.postData.params.length).toBe(2);
    expect('').toBe(response.log.entries[0].request._authentication.username);
  });

  it("bookmark post request form-data", function() {
    const bookmarks = '[{"id":"2cf18425-2f1c-4491-9706-930f6c679f9b","request":{"method":"POST","url":"google.com","headers":[],"querystring":[],"bodyType":"form-data","body":[{"name":"p1","value":"v1","enabled":true},{"name":"p2","value":"v2","enabled":true},{"name":"p3","value":"v3","enabled":true}],"authentication":{"username":"","password":""},"context":"default"},"name":"test","isFolder":false,"created":"2019-06-14T04:29:43.764Z"}]';
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.exportObj(JSON.parse(bookmarks));
    expect(response.log.version).toBe('1.1');
    expect(response.log.creator.name).toBe('Resting WebExtension');
    expect(response.log.creator.version).toBe('1.0');
    expect(response.log.entries.length).toBe(1);
    expect(response.log.entries[0]._name).toBe("test");
    expect(response.log.entries[0]._isFolder).toBe(false);
    expect(response.log.entries[0]._id).toBe("2cf18425-2f1c-4491-9706-930f6c679f9b");
    expect(response.log.entries[0]._created).toBe("2019-06-14T04:29:43.764Z");
    expect(response.log.entries[0].request.url).toBe('google.com')
    expect(response.log.entries[0].request.method).toBe('POST');
    expect(response.log.entries[0].request.headers.length).toBe(0);
    expect(response.log.entries[0].request.postData.mimeType).toBe("multipart/form-data");
    expect(response.log.entries[0].request.postData.text).toBeUndefined();
    expect(response.log.entries[0].request.postData.params.length).toBe(3);
    expect(response.log.entries[0].request._authentication.username).toBe('');
  });

  it("contexts", function() {
    const contexts = '[{"name":"default","variables":[{"name":"def","value":"1111","enabled":true}]},{"name":"dev","variables":[{"name":"p1","value":"v1","enabled":true},{"name":"p2","value":"v2","enabled":true},{"name":"p3","value":"v3","enabled":true}]},{"name":"prod","variables":[{"name":"var1","value":"value","enabled":true},{"name":"var2","value":"value-2","enabled":true}]}]';
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.exportObj([],JSON.parse(contexts));
    expect(response.log.version).toBe('1.1');
    expect(response.log.creator.name).toBe('Resting WebExtension');
    expect(response.log.creator.version).toBe('1.0');
    expect(response.log.entries.length).toBe(0);
    expect(response.log._contexts.length).toBe(3);
    expect(response.log._contexts[0].name).toBe('default');
    expect(response.log._contexts[0].variables.length).toBe(1);
    expect(response.log._contexts[0].variables[0]).toEqual({name:'def', value:'1111', enabled:true});
    expect(response.log._contexts[1].name).toBe('dev');
    expect(response.log._contexts[1].variables.length).toBe(3);
    expect(response.log._contexts[2].name).toBe('prod');
    expect(response.log._contexts[2].variables.length).toBe(2);

  });

});


describe("Import", function() {
  it("no bookmarks", function() {
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.importObj({});
    expect(response.bookmarks).toBeUndefined();
    expect(response.contexts).toBeUndefined();
  });

  it("bookmark of request multipart body", function() {
    const sampleExport = `{"log": {"version":"1.1","creator":{"name":"Resting WebExtension","version":"1.0"},"entries":[{"_name":"test","_isFolder":false,"_id":"2cf18425-2f1c-4491-9706-930f6c679f9b","_created":"2019-06-14T04:29:43.764Z","request": {"headerSize":-1,"bodySize":-1,"url":"google.com","method":"POST","headers":[],"queryString":[],"postData":{"mimeType":"multipart/form-data","params":[{"name":"p1","value":"v1","_enabled":true},{"name":"p2","value":"v2","_enabled":true},{"name":"p3","value":"v3","_enabled":true}]},"_authentication":{"username":"","password":""}}}],"_contexts":[]}}`;
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.importObj(JSON.parse(sampleExport));
    expect(response.bookmarks.length).toBe(1);
    expect(response.bookmarks[0].id).toBe('2cf18425-2f1c-4491-9706-930f6c679f9b');
    expect(response.bookmarks[0].created).toBe('2019-06-14T04:29:43.764Z');
    expect(response.bookmarks[0].name).toBe('test');
    expect(response.bookmarks[0].request.url).toBe('google.com');
    expect(response.bookmarks[0].request.method).toBe('POST');
    expect(response.bookmarks[0].request.headers.length).toBe(0);
    expect(response.bookmarks[0].request.querystring.length).toBe(0);
    expect(response.bookmarks[0].request.authentication).toEqual({username:'',password:''});
    expect(response.bookmarks[0].request.body).toEqual([{"name":"p1","value":"v1","enabled":true},{"name":"p2","value":"v2","enabled":true},{"name":"p3","value":"v3","enabled":true}]);
    expect(response.bookmarks[0].request.bodyType).toBe('form-data');
    expect(response.contexts.length).toBe(0);
  });

   it("bookmark of request JSON body", function() {
    const d = `[{"id":"f8432b7b-55de-4108-bb4c-e546580ad016","request":{"method":"POST","url":"test.url","headers":[{"name":"Contenxt","value":"application/json","enabled":true}],"querystring":[],"bodyType":"raw","body":"{\\n\\"field\\": \\"my-value\\",\\n\\"array\\": [1,2,3,4,5]\\n}","authentication":{"username":"","password":""},"context":"default"},"name":"json body request","isFolder":false,"created":"2019-06-20T04:48:34.974Z"}]`;
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const sampleExport = escapeString(JSON.stringify(bookmarkProvider.exportObj(JSON.parse(d))));
    //console.log(JSON.stringify(sampleExport));
    //const sampleExport = `{"version":"1.1","creator":{"name":"Resting WebExtension","version":"1.0"},"entries":[{"_name":"json body request","_isFolder":false,"_id":"f8432b7b-55de-4108-bb4c-e546580ad016","_created":"2019-06-20T04:48:34.974Z","headerSize":-1,"bodySize":-1,"url":"test.url","method":"POST","headers":[{"name":"Contenxt","value":"application/json","_enabled":true}],"queryString":[],"postData":{"mimeType":"application/json","text":"{\\n\\"field\\": \\"my-value\\",\\n\\"array\\": [1,2,3,4,5]\\n}"},"_authentication":{"username":"","password":""}}],"_contexts":[]}`;
    //const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.importObj(JSON.parse(sampleExport));
    expect(response.bookmarks.length).toBe(1);
    expect(response.bookmarks[0].id).toBe('f8432b7b-55de-4108-bb4c-e546580ad016');
    expect(response.bookmarks[0].created).toBe('2019-06-20T04:48:34.974Z');
    expect(response.bookmarks[0].name).toBe('json body request');
    expect(response.bookmarks[0].request.url).toBe('test.url');
    expect(response.bookmarks[0].request.method).toBe('POST');
    expect(response.bookmarks[0].request.headers.length).toBe(1);
    expect(response.bookmarks[0].request.headers[0]).toEqual({name: 'Contenxt', value: 'application/json', enabled: true});
    expect(response.bookmarks[0].request.querystring.length).toBe(0);
    expect(response.bookmarks[0].request.authentication).toEqual({username:'',password:''});
    expect(response.bookmarks[0].request.body).toBe('{\n\"field\": \"my-value\",\n\"array\": [1,2,3,4,5]\n}');
    expect(response.bookmarks[0].request.bodyType).toBe('raw');
    expect(response.contexts.length).toBe(0);
  });


   it("folder", function() {
    const d = `[{"id":"1078d8a7-bfa9-45d2-b8ef-47a808ebfb88","name":"My folder","bookmarks":[],"isFolder":true,"created":"2019-06-21T04:38:42.163Z"}]`;
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const sampleExport = escapeString(JSON.stringify(bookmarkProvider.exportObj(JSON.parse(d))));
    //console.log(JSON.stringify(response));

    //const sampleExport = `{"version":"1.1","creator":{"name":"Resting WebExtension","version":"1.0"},"entries":[{"_name":"My folder","_isFolder":true,"_id":"1078d8a7-bfa9-45d2-b8ef-47a808ebfb88","_created":"2019-06-21T04:38:42.163Z","headerSize":-1,"bodySize":-1}],"_contexts":[]}`;
    //const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.importObj(JSON.parse(sampleExport));
    expect(response.bookmarks.length).toBe(1);
    expect(response.bookmarks[0].isFolder).toBe(true);
    expect(response.bookmarks[0].id).toBe('1078d8a7-bfa9-45d2-b8ef-47a808ebfb88');
    expect(response.bookmarks[0].created).toBe('2019-06-21T04:38:42.163Z');
    expect(response.bookmarks[0].name).toBe('My folder');
    expect(response.contexts.length).toBe(0);
  });


   it("contexts", function() {
    const d = `[{"name":"default","variables":[{"name":"nano","value":"nano","enabled":true},{"name":"paco","value":"paco","enabled":true}]}, {"name":"dev","variables":[{"name":"p1","value":"v1","enabled":false}]}]`;
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const sampleExport = escapeString(JSON.stringify(bookmarkProvider.exportObj([],JSON.parse(d))));
    //console.log(JSON.stringify(response));

    //const sampleExport = `{"version":"1.1","creator":{"name":"Resting WebExtension","version":"1.0"},"entries":[],"_contexts":[{"name":"default","variables":[{"name":"nano","value":"nano","enabled":true},{"name":"paco","value":"paco","enabled":true}]},{"name":"dev","variables":[{"name":"p1","value":"v1","enabled":false}]}]}`;
    //const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.importObj(JSON.parse(sampleExport));
    expect(response.bookmarks.length).toBe(0);
    expect(response.contexts.length).toBe(2);
    expect(response.contexts[1].name).toBe('dev');
    expect(response.contexts[1].variables[0]).toEqual({name: 'p1', value: 'v1', enabled: false});
    expect(response.contexts[0].name).toBe('default');
    expect(response.contexts[0].variables.length).toBe(2);
  });

  it("a bookmark inside folder, a bookmark outside", function() {
    const d = `[{"id":"5fff2aa9-6347-480c-8520-a0e3d586d667","request":{"method":"GET","url":"google.com","headers":[],"querystring":[],"authentication":{"username":"","password":""},"context":"default"},"isFolder":false,"created":"2019-07-27T18:51:37.270Z"}, {"id":"cdd58512-418d-4254-85d5-134e298886fd","name":"FOLDER","bookmarks":[{"id":"b0d3f619-c73d-42aa-87b1-a7c44dc01227","name":"book","isFolder":false,"folder":"cdd58512-418d-4254-85d5-134e298886fd","requestMethod":"GET","requestUrl":"example.com","request":{"method":"GET","url":"example.com","headers":[],"querystring":[],"authentication":{"username":"","password":""},"context":"default"},"created":"2019-07-27T18:51:28.894Z"}],"isFolder":true,"created":"2019-07-27T18:51:13.483Z"}]`;
    const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const sampleExport = escapeString(JSON.stringify(bookmarkProvider.exportObj(JSON.parse(d))));
    //console.log(JSON.stringify(response));

    //const sampleExport = `{"version":"1.1","creator":{"name":"Resting WebExtension","version":"1.0"},"entries":[{"_isFolder":false,"_id":"5fff2aa9-6347-480c-8520-a0e3d586d667","_created":"2019-07-27T18:51:37.270Z","headerSize":-1,"bodySize":-1,"url":"google.com","method":"GET","headers":[],"queryString":[],"_authentication":{"username":"","password":""}},{"_name":"FOLDER","_isFolder":true,"_id":"cdd58512-418d-4254-85d5-134e298886fd","_created":"2019-07-27T18:51:13.483Z","headerSize":-1,"bodySize":-1},{"_name":"book","_isFolder":false,"_id":"b0d3f619-c73d-42aa-87b1-a7c44dc01227","_created":"2019-07-27T18:51:28.894Z","_folder":"cdd58512-418d-4254-85d5-134e298886fd","headerSize":-1,"bodySize":-1,"url":"example.com","method":"GET","headers":[],"queryString":[],"_authentication":{"username":"","password":""}}],"_contexts":[]}`;
    //const bookmarkProvider = makeBookmarkProvider(mockStorageProvider);
    const response = bookmarkProvider.importObj(JSON.parse(sampleExport));
    expect(response.bookmarks.length).toBe(2);
    expect(response.contexts.length).toBe(0);
    expect(response.bookmarks[1].name).toBe('FOLDER');
    expect(response.bookmarks[1].bookmarks.length).toBe(1);
  });
});


