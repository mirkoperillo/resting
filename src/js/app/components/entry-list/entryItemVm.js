define(['knockout'],function(ko) {

  return function EntryItemVm(name, value, enabled) {
    this.name = ko.observable(name);
    this.value = ko.observable(value);
    this.enabled = ko.observable(enabled);
  }

});
