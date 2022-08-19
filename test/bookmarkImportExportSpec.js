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
            .replace(/\\f/g, "\\f")
}

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
      const sampleExport = `{
        "log": {
          "version": "1.1",
          "creator": {
            "name": "Resting WebExtension",
            "version": "1.0"
          },
          "entries": [
            {
              "_name": "FOLDER",
              "_isFolder": true,
              "_id": "faee1f92-149b-4942-bf97-7570bf18ad50",
              "_created": "2022-07-29T13:24:25.936Z",
              "startedDateTime": "1970-01-01T00:00:00Z",
              "request": {
                "headersSize": -1,
                "bodySize": -1,
                "httpVersion": "",
                "cookies": [],
                "url": "",
                "method": "",
                "headers": [],
                "queryString": []
              },
              "response": {
                "status": 0,
                "statusText": "",
                "httpVersion": "",
                "cookies": [],
                "headers": [],
                "redirectURL": "",
                "headersSize": -1,
                "bodySize": -1,
                "content": {
                  "size": 0,
                  "mimeType": ""
                }
              },
              "cache": {},
              "timings": {
                "wait": -1,
                "send": -1,
                "receive": -1
              },
              "time": -1
            },
            {
              "_name": "example",
              "_isFolder": false,
              "_id": "9f18186b-7aa0-47ca-9bf0-676aa6ada012",
              "_created": "2022-07-29T13:24:47.148Z",
              "_folder": "faee1f92-149b-4942-bf97-7570bf18ad50",
              "startedDateTime": "1970-01-01T00:00:00Z",
              "request": {
                "headersSize": -1,
                "bodySize": -1,
                "httpVersion": "",
                "cookies": [],
                "url": "www.example.net",
                "method": "GET",
                "headers": [],
                "queryString": [],
                "_authentication": {
                  "username": "",
                  "password": "",
                  "jwtToken": "",
                  "oauthAuthPosition": "",
                  "oauthAccessToken": ""
                },
                "_context": "default"
              },
              "response": {
                "status": 0,
                "statusText": "",
                "httpVersion": "",
                "cookies": [],
                "headers": [],
                "redirectURL": "",
                "headersSize": -1,
                "bodySize": -1,
                "content": {
                  "size": 0,
                  "mimeType": ""
                }
              },
              "cache": {},
              "timings": {
                "wait": -1,
                "send": -1,
                "receive": -1
              },
              "time": -1
            }
          ],
          "_contexts": [
            {
              "name": "default",
              "variables": []
            }
          ]
        }
      }`
      const bookmarkProvider = makeBookmarkProvider(mockStorageProvider)
      const response = bookmarkProvider.importObj(JSON.parse(sampleExport))
      expect(response.bookmarks.length).toBe(1)
      expect(response.contexts.length).toBe(1)
      expect(response.bookmarks[0].name).toBe('FOLDER')
      expect(response.bookmarks[0].bookmarks.length).toBe(1)
      const nestedBookmark = response.bookmarks[0].bookmarks[0]
      expect(nestedBookmark.folder).toBe('faee1f92-149b-4942-bf97-7570bf18ad50')
      expect(nestedBookmark.name).toBe('example')
      expect(nestedBookmark.id).toBe('9f18186b-7aa0-47ca-9bf0-676aa6ada012')
    })
  
    it("multiple bookmarks inside folder", function() {
      const sampleExport = `{
        "log": {
          "version": "1.1",
          "creator": {
            "name": "Resting WebExtension",
            "version": "1.0"
          },
          "entries": [
            {
              "_name": "FOLDER",
              "_isFolder": true,
              "_id": "faee1f92-149b-4942-bf97-7570bf18ad50",
              "_created": "2022-07-29T13:24:25.936Z",
              "startedDateTime": "1970-01-01T00:00:00Z",
              "request": {
                "headersSize": -1,
                "bodySize": -1,
                "httpVersion": "",
                "cookies": [],
                "url": "",
                "method": "",
                "headers": [],
                "queryString": []
              },
              "response": {
                "status": 0,
                "statusText": "",
                "httpVersion": "",
                "cookies": [],
                "headers": [],
                "redirectURL": "",
                "headersSize": -1,
                "bodySize": -1,
                "content": {
                  "size": 0,
                  "mimeType": ""
                }
              },
              "cache": {},
              "timings": {
                "wait": -1,
                "send": -1,
                "receive": -1
              },
              "time": -1
            },
            {
              "_name": "example",
              "_isFolder": false,
              "_id": "9f18186b-7aa0-47ca-9bf0-676aa6ada012",
              "_created": "2022-07-29T13:24:47.148Z",
              "_folder": "faee1f92-149b-4942-bf97-7570bf18ad50",
              "startedDateTime": "1970-01-01T00:00:00Z",
              "request": {
                "headersSize": -1,
                "bodySize": -1,
                "httpVersion": "",
                "cookies": [],
                "url": "www.example.net",
                "method": "GET",
                "headers": [],
                "queryString": [],
                "_authentication": {
                  "username": "",
                  "password": "",
                  "jwtToken": "",
                  "oauthAuthPosition": "",
                  "oauthAccessToken": ""
                },
                "_context": "default"
              },
              "response": {
                "status": 0,
                "statusText": "",
                "httpVersion": "",
                "cookies": [],
                "headers": [],
                "redirectURL": "",
                "headersSize": -1,
                "bodySize": -1,
                "content": {
                  "size": 0,
                  "mimeType": ""
                }
              },
              "cache": {},
              "timings": {
                "wait": -1,
                "send": -1,
                "receive": -1
              },
              "time": -1
            },
            {
              "_name": "google",
              "_isFolder": false,
              "_id": "ea3e39d6-0d5a-4181-b8a2-23a8b5097a12",
              "_created": "2022-08-18T14:47:30.346Z",
              "_folder": "faee1f92-149b-4942-bf97-7570bf18ad50",
              "startedDateTime": "1970-01-01T00:00:00Z",
              "request": {
                "headersSize": -1,
                "bodySize": -1,
                "httpVersion": "",
                "cookies": [],
                "url": "www.google.com",
                "method": "GET",
                "headers": [],
                "queryString": [],
                "_authentication": {
                  "username": "",
                  "password": "",
                  "jwtToken": "",
                  "oauthAuthPosition": "",
                  "oauthAccessToken": ""
                },
                "_context": "default"
              },
              "response": {
                "status": 0,
                "statusText": "",
                "httpVersion": "",
                "cookies": [],
                "headers": [],
                "redirectURL": "",
                "headersSize": -1,
                "bodySize": -1,
                "content": {
                  "size": 0,
                  "mimeType": ""
                }
              },
              "cache": {},
              "timings": {
                "wait": -1,
                "send": -1,
                "receive": -1
              },
              "time": -1
            }
          ],
          "_contexts": [
            {
              "name": "default",
              "variables": []
            }
          ]
        }
      }`
      const bookmarkProvider = makeBookmarkProvider(mockStorageProvider)
      const response = bookmarkProvider.importObj(JSON.parse(sampleExport))
      expect(response.bookmarks.length).toBe(1)
      expect(response.contexts.length).toBe(1)
      expect(response.bookmarks[0].name).toBe('FOLDER')
      expect(response.bookmarks[0].bookmarks.length).toBe(2)
    })
  })

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