define(['knockout'], function (ko) {
  // FIXME: why not use directly BookmarkVm ?
  return function BookmarkSelectedVm(bookmark = {}) {
    const self = this
    this.id = ko.observable('')
    this.name = ko.observable('')
    this.folder = ko.observable('')

    this.toModel = () => {
      return { id: this.id(), name: this.name(), folder: this.folder() }
    }

    this.reset = () => {
      this.id('')
      this.name('')
      this.folder('')
    }
  }
})
