(function (window) {

    const SETTINGS_KEY = "settings";
    const chromeStorage = chrome.storage.local;

    class SettingsService {

        get () {
            return new Promise((resolve) => {
                chromeStorage.get(SETTINGS_KEY, function (response) {
                    resolve(response[SETTINGS_KEY] || getDefaultSettings());
                });
            });
        };

        set (settings) {
            var storageObject = {};

            storageObject[SETTINGS_KEY] = settings;

            return new Promise((resolve) => {
                chromeStorage.set(storageObject, function () {
                    resolve(true);
                });

            })
        }
    }

    function getDefaultSettings() {
        return {
            'iconSize': 'large',
            'searchBar': 'off',
        };
    };

    window.common.SettingsService = SettingsService;

}(window));
