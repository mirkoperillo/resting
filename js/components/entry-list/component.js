define(['knockout'],function(ko) {

  return function EntryListViewModel(params) {
    const EntryList = {
      entryList: params.entryList,
      entryName: ko.observable(),
      entryValue: ko.observable(),
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

    return EntryList;
  }
});
