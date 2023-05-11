define([
    'knockout', 
    ],function(ko) {

    return  function ContextVm(name = 'default',variables = []) {
        const self = this;
        this.name = ko.observable(name);
        this.variables = ko.observableArray(variables.map(v => new EntryItemVm(v.name, v.value, v.enabled)));
        this.isDefault = ko.computed(function() {
            return this.name() === 'default';
        }, this);
    }
    })