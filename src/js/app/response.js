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

define(function () {

  const statusMeaning = {
    200: {
      label: '200 OK',
      desc: 'The 200 (OK) status code indicates that the request has succeeded.<br/> The content sent in a 200 response depends on the request method.',
      link: 'https://www.rfc-editor.org/rfc/rfc9110#section-15.3.1'
    }
  }
  const makeResponse = ({
    content = {},
    headers = [],
    status,
    duration = 0,
    size = 0,
  }) => ({ content, headers, status, duration, size })

  const parseHeaders = (headers = '') =>
    headers
      .trim()
      .split('\n')
      .map((header) => header.split(/:(.*)/).map((h) => h.trim()))
      .map((headerFields) => ({
        name: headerFields[0],
        value: headerFields[1],
      }))

  return {
    makeResponse,
    parseHeaders,
    statusMeaning
  }
})
