define(['knockout'],function(ko) {

  return function AuthenticationVm(params) {
    const request = params.request;

    const Authentication = {
      types: ko.observableArray(['Basic', 'JWT']),
      authenticationType: request.authenticationType,
      username: request.username,
      password: request.password,
      jwtToken: request.jwtToken,
    };

    return Authentication;
  }
});
