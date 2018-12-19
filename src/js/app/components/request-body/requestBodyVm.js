 define(['knockout'],function(ko) {

 return function RequestBodyVm(params) {
    const self = this;

    const request = params.request;
    self.bodyType = request.bodyType;
    self.formDataParams = request.formDataParams;
    self.formEncodedParams = request.formEncodedParams;
    self.rawBody = request.rawBody;

    self.types = ko.observableArray(['form-data','x-www-form-urlencoded','raw'])

  }
});
