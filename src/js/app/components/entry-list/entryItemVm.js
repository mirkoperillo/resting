define(['knockout'],function(ko) {

  return function EntryItemViewModel(name, value, enabled) {
    this.name = ko.observable(name);
    this.value = ko.observable(value);
    this.enabled = ko.observable(enabled);
  }

});
