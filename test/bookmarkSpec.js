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
    const bookmarks = bookmarkProvider.importHAR(harContent);

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
    const bookmarks = bookmarkProvider.importHAR(harContent);
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
    const bookmarks = bookmarkProvider.importHAR(harContent);
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
    const bookmarks = bookmarkProvider.importHAR(harContent);
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
    const bookmarks = bookmarkProvider.importHAR(harContent);
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
    const bookmarks = bookmarkProvider.importHAR(harContent);
    expect(2).toBe(bookmarks.length);
    const bookmark = bookmarks[0];

    expect("varA=a&varB=b").toBe(bookmark.request.body);
    expect(9).toBe(bookmark.request.headers.length);
  });
});






