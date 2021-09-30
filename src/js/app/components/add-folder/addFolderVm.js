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
 
define(['Vue', 'app/bacheca', 'component/folder-dialog'],function(Vue, bacheca) {

  return function AddFolderVm(params) {
    const folderDialog = () => {
      bacheca.publish('showFolderDialog')
    };

    const vueApp = new Vue({
      el: "#v-folder",
      created() {
        bacheca.subscribe('showFolderDialog', () => this.showFolderDialog = true)
      },
      data() {
        return {
          showFolderDialog: false
        }
      }
    })
    return {
      folderDialog,
    };
  }
});
