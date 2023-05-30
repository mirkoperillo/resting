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

define(['knockout'], function (ko) {
  return function AuthenticationVm(params) {
    const request = params.request

    const Authentication = {
      types: ko.observableArray(['Basic', 'JWT', 'Oauth 2.0']),
      oauthAuthPositions: ko.observableArray(['Request URL', 'Request Header']),
      authenticationType: request.authenticationType,
      username: request.username,
      password: request.password,
      jwtToken: request.jwtToken,
      oauthAuthPosition: request.oauthAuthPosition,
      oauthAccessToken: request.oauthAccessToken,
    }

    return Authentication
  }
})
