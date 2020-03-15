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
 
define(['localforage'],function(localforage){

    localforage.config({
      name: 'resting',
      storeName: 'bookmarks',
    });

    const _contextsStore = localforage.createInstance({
      name: 'resting',
      storeName: 'contexts',
    });

    const _settingsStore = localforage.createInstance({
      name: 'resting',
      storeName: 'configurations',
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

    const saveSettings = (conf) => {
      if(conf) {
        const keys = Object.keys(conf);
        keys.forEach(k => _settingsStore.setItem(k, conf[k]));
      }
      return { result: 'OK', message: ''};
    };

    const readSettings = (conf, callback) => {
       _settingsStore.getItem(conf, callback);
    }

    const generateId = () =>  {
      let dt = new Date().getTime();
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
      });
      return uuid;
    };

    return {
      save : save,
      deleteById : deleteById,
      iterate : iterate,
      saveContext,
      loadContexts,
      deleteContextById,
      saveSettings,
      readSettings,
      generateId,
    };
});
