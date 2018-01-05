 define(['knockout'],function(ko) {
 
 return function RequestBodyViewModel(params) {
    const self = this;

    self.bodyType = params.bodyType;
    self.formDataParams = params.formDataParams;
    self.formEncodedParams = params.formEncodedParams;
    self.rawBody = params.rawBody;
  }
});
