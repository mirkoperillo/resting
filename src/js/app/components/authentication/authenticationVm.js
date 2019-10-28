define(['knockout'],function(ko) {

  return function AuthenticationVm(params) {
    const request = params.request;

    const Authentication = {
      types: ko.observableArray(['Basic']),
      authenticationType: request.authenticationType,
      username: request.username,
      password: request.password,
    };

    return Authentication;
  }
});
