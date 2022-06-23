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
 
define(['knockout'],function(ko) {

  return function EntryItemVm(name, value, enabled, valueFile = null, enableFileEntry = false, entryType = 'Text') {
    const self = this
    self.name = ko.observable(name);
    self.value = ko.observable(value);
    self.valueFile = valueFile;
    self.enabled = ko.observable(enabled);
    self.enableFileEntry = ko.observable(enableFileEntry);
    self.entryType = ko.observable(entryType);
    self.isFileEntry = ko.computed(function () {
      return self.entryType() === 'File'
    }, this);

    self.entryTypes = ko.observableArray(['Text', 'File']);
  }

});
