const SETTINGS_KEY = 'settings';

export const SETTINGS = {
    ShowAppNames: 'showAppNames',
    LauncherIconColor: 'launcherIconColor',
    LauncherWidth: 'launcherWidth',
    AppsPerRow: 'appsPerRow',
    SearchBar: 'searchBar',
    Version: 'version',
    AppIconPadding: 'appIconPadding'
};

export const LEGACY_SETTINGS = {
    IconSize: 'iconSize'
};

const chromeStorage = chrome.storage.local;

const CURRENT_VERSION = require('../../manifest.json').version;

export const DEFAULTS = {
    [SETTINGS.ShowAppNames]: true,
    [SETTINGS.SearchBar]: true,
    [SETTINGS.LauncherIconColor]: '#000000',
    [SETTINGS.LauncherWidth]: 350,
    [SETTINGS.AppsPerRow]: 3,
    [SETTINGS.AppIconPadding]: 5,
    [SETTINGS.Version]: CURRENT_VERSION
};

export class SettingsService {

    get() {
        return new Promise((resolve) =>
                chromeStorage.get(SETTINGS_KEY,
                    response => resolve(response[SETTINGS_KEY])))
            .then(settings => settings || DEFAULTS)
            .then(settings => {
                for (let prop in DEFAULTS) {
                    if (typeof settings[prop] === 'undefined') {
                        settings[prop] = DEFAULTS[prop];
                    }
                }

                return settings;
            });
    }

    set(settings) {
        settings[SETTINGS.Version] = CURRENT_VERSION;
        let storageObject = {
            [SETTINGS_KEY]: settings
        };
        return new Promise((resolve) => chromeStorage.set(storageObject, () => resolve(true)));
    }
}
