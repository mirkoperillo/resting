define(['localforage'],function(localforage){

    localforage.config({
      name: 'resting',
      storeName: 'bookmarks',
    });

    const _contextsStore = localforage.createInstance({
      name: 'resting',
      storeName: 'contexts',
    });

    const deleteById = (id, callback) => {
      localforage.removeItem(id, callback);
    };

    const deleteContextById = (id, callback) => {
      _contextsStore.removeItem(id, callback);
    };

    const save = (bookmark) => {
      if(!bookmark.id) {
        return { result: 'KO', message: 'id must be set'};
      }
      localforage.setItem(bookmark.id, bookmark);
      return { result: 'OK', message: ''};
    };

    const iterate = (callback, callbackResult) => {
      if(!callbackResult) {
       localforage.iterate(function(value,key,iterationNumber) {
        callback(value);
       });
      } else {
        localforage.iterate(function(value,key,iterationNumber) {
          callback(value);
       }, callbackResult);
      };
    };

    const saveContext = (context) => {
      _contextsStore.setItem(context.name, context);
      return { result: 'OK', message: ''};
    };

    const loadContexts = (callback, callbackResult) => {
      _contextsStore.iterate(function(value,key,iterationNumber) {
        callback(value);
       }, callbackResult);
    };

    return {
      save : save,
      deleteById : deleteById,
      iterate : iterate,
      saveContext,
      loadContexts,
      deleteContextById,
    };
});
