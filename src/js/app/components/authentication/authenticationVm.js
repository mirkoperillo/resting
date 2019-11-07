define(['knockout'],function(ko) {

  return function AuthenticationVm(params) {
    const request = params.request;

    const Authentication = {
      types: ko.observableArray(['Basic', 'JWT', 'Oauth 2.0']),
      oauthAuthPositions: ko.observableArray(['Request URL', 'Request Header']),
      authenticationType: request.authenticationType,
      username: request.username,
      password: request.password,
      jwtToken: request.jwtToken,
      oauthAuthPosition: request.oauthAuthPosition,
      oauthAccessToken: request.oauthAccessToken,
    };

    return Authentication;
  }
});
