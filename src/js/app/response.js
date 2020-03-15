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
 
define(function(){
  
  const makeResponse = ({content = {}, headers = [],status,duration = 0, size = 0}) => ({content,headers,status,duration, size});
  
  const parseHeaders = (headers = '') =>
      headers.trim().split('\n')
        .map(header =>
          header.split(':')
            .map(h => h.trim()))
        .map(headerFields => ({ name: headerFields[0], value: headerFields[1] }));
  
  
  return {
    makeResponse,
    parseHeaders,
  }
})
