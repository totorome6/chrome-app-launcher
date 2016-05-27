const SETTINGS_KEY = 'settings';
const chromeStorage = chrome.storage.local;

function getDefaultSettings() {
  return {
    iconSize: 'large',
    launcherIconColor: '#000000',
    searchBar: 'off'
  };
}

export class SettingsService {

  get () {
    return new Promise((resolve) => {
      chromeStorage.get(SETTINGS_KEY, function (response) {
        resolve(response[SETTINGS_KEY] || getDefaultSettings());
      });
    });
  }

  set (settings) {
    let storageObject = {};

    storageObject[SETTINGS_KEY] = settings;

    return new Promise((resolve) => {
      chromeStorage.set(storageObject, function () {
        resolve(true);
      });
  });
  }
}
