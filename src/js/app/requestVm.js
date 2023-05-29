define(['knockout'], function (ko) {
  return function RequestVm(request = {}) {
    const self = this
    this.method = ko.observable('')
    this.url = ko.observable('')
    this.headers = ko.observableArray()
    this.querystring = ko.observableArray()

    this.authenticationType = ko.observable()
    this.username = ko.observable()
    this.password = ko.observable()
    this.jwtToken = ko.observable()
    this.oauthAuthPosition = ko.observable()
    this.oauthAccessToken = ko.observable()

    this.bodyType = ko.observable()
    this.formDataParams = ko.observableArray()
    this.formEncodedParams = ko.observableArray()
    this.rawBody = ko.observable()

    this.context = ko.observable('default')
  }
})
