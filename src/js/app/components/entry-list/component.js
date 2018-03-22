define(['knockout'],function(ko) {

  return function EntryListViewModel(params) {
    const EntryList = {
      entryList: params.entryList,
      entryName: ko.observable(),
      entryValue: ko.observable(),
      focusToNameField: ko.observable(true),
    };

    const addOnEnter = (data, event) => {
      const enter = 13;
      if(event.keyCode === enter) {
        add();
        EntryList.focusToNameField(true);
      }
    };

    const checkValidEntry = (name, value) =>
      name.trim().length > 0 && value.trim().length > 0;

    const add = () => {
      if (!checkValidEntry(EntryList.entryName(), EntryList.entryValue())) return false;

      EntryList.entryList.push({ name: EntryList.entryName(), value: EntryList.entryValue() });
      EntryList.entryName('');
      EntryList.entryValue('');

      return true;
    };

    const remove = entry =>
      EntryList.entryList.remove(entry);

    EntryList.add = add;
    EntryList.remove = remove;
    EntryList.addOnEnter = addOnEnter;

    return EntryList;
  }
});