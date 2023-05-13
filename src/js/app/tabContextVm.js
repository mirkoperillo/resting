define([
    'knockout',
    'app/bookmarkSelectedVm' 
    ],function(ko, BookmarkSelectedVm) {

    return function TabContextVm(counter = 1) {
        const self = this
        this.name = ko.observable('TAB ' + counter)
        this.request = {}
        this.response = {}

        // bookmark stuff
        this.folderName = ko.observable()
        this.bookmarkSelected = new BookmarkSelectedVm()

        this.isActive = ko.observable(false)

        this.reset = () => {
        this.request = {};
        this.response = {};
        this.folderName('');
        this.bookmarkSelected.reset();
        }
    }
    })