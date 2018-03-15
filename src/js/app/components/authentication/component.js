define(['knockout'],function(ko) {

  return function AuthenticationViewModel(params) {
    const Authentication = {
      types: ko.observableArray(['Basic']),
      authenticationType: params.authenticationType,
      username: params.username,
      password: params.password,
    };

   

    return Authentication;
  }
});
