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

define([
  'knockout',
  'component/entry-list/entryItemVm',
  'app/bacheca',
], function (ko, EntryItemVm, bacheca) {
  'use strict'
  return function EntryListVm(params) {
    const entryList = params.entryList
    const enableFileEntry =
      params.enableFileEntry !== undefined && params.enableFileEntry
    const entryName = ko.observable()
    const entryValue = ko.observable()
    const focusToNameField = ko.observable(true)
    const entryType = ko.observable('Text')
    const entryTypes = ko.observableArray(['Text', 'File'])
    let entryFile = null

    const onFileSelectedEvent = function (vm, evt) {
      entryFile = evt.target.files[0]
      const loadedFile = document.getElementById('file-name')
      loadedFile.innerHTML = entryFile.name
      loadedFile.style.display = 'inline'
      document.getElementById('file-remove-button').style.display = 'inline'
      document.getElementById('select-file-button').style.display = 'none'
      console.log(JSON.stringify(entryFile))
    }

    const isFileEntry = ko.computed(function () {
      return entryType() === 'File'
    }, this)

    const addOnEnter = (data, event) => {
      const enter = 13
      if (event.keyCode === enter) {
        add()
        focusToNameField(true)
      }
    }

    const checkValidEntry = (name, value) =>
      name.trim().length > 0 && value.trim().length > 0

    const add = () => {
      if (entryType() === 'Text' && !checkValidEntry(entryName(), entryValue()))
        return false
      if (
        entryType() === 'File' &&
        (entryName().trim().length == 0 || entryFile == null)
      )
        return false
      let item
      if (entryType() === 'Text') {
        item = new EntryItemVm(
          entryName(),
          entryValue(),
          true,
          null,
          enableFileEntry,
          entryType()
        )
      }
      if (entryType() === 'File') {
        item = new EntryItemVm(
          entryName(),
          entryValue(),
          true,
          entryFile,
          enableFileEntry,
          entryType()
        )
      }
      entryList.push(item)
      _cleanFields()
      return true
    }

    const remove = (entry) => entryList.remove(entry)

    const _cleanFields = () => {
      entryName('')
      entryValue('')
      entryType('Text')
      removeFile()
    }

    const removeFile = () => {
      if (document.getElementById('file-name')) {
        document.getElementById('file-name').innerHTML = ''
        document.getElementById('file-name').style.display = 'none'
        document.getElementById('file-remove-button').style.display = 'none'
        document.getElementById('select-file-button').style.display = 'inline'
        entryFile = null
      }
    }

    bacheca.subscribe('reset', _cleanFields)

    return {
      entryList,
      entryName,
      entryValue,
      enableFileEntry,
      focusToNameField,
      entryType,
      entryTypes,
      isFileEntry,

      add,
      remove,
      addOnEnter,
      removeFile,
      onFileSelectedEvent,
    }
  }
})
