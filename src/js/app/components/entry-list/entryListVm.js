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

define(['knockout', 'component/entry-list/entryItemVm','app/bacheca'],function(ko, EntryItemVm, bacheca) {

  return function EntryListVm(params) {

    const EntryList = {
      entryList: params.entryList,
      entryName: ko.observable(),
      entryValue: ko.observable(),
      focusToNameField: ko.observable(true),
    };

    const addOnEnter = (data, event) => {
      const enter = 13;
      if(event.keyCode === enter) {
        add();
        EntryList.focusToNameField(true);
      }
    };

    const checkValidEntry = (name, value) =>
      name.trim().length > 0 && value.trim().length > 0;

    const add = () => {
      if (!checkValidEntry(EntryList.entryName(), EntryList.entryValue())) return false;

      EntryList.entryList.push(new EntryItemVm(EntryList.entryName(), EntryList.entryValue(), true ));
      EntryList.entryName('');
      EntryList.entryValue('');

      return true;
    };

    const remove = entry =>
      EntryList.entryList.remove(entry);

    const _cleanFields = () => {
      EntryList.entryName('');
      EntryList.entryValue('');
    };
    
    bacheca.subscribe('reset', _cleanFields);
    
    EntryList.add = add;
    EntryList.remove = remove;
    EntryList.addOnEnter = addOnEnter;

    return EntryList;
  }
});

