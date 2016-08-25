import {
        SettingsService,
        DEFAULTS as DEFAULT_SETTINGS,
        SETTINGS } from './common/settings';

const LAUNCHER_WIDTH_RANGE_SEL = `input[name=${ SETTINGS.LauncherWidth }]`;
const APPS_PER_ROW_RANGE_SEL = `input[name=${ SETTINGS.AppsPerRow }]`;
const SHOW_APP_NAMES_CHBOX_SEL = `input[name=${ SETTINGS.ShowAppNames }]`;
const SEARCH_BAR_CHBOX_SEL = `input[name=${ SETTINGS.SearchBar }]`;
const LAUNCHER_ICON_COLOR_SEL = `input[name=${ SETTINGS.LauncherIconColor }]`;
const APP_ICON_PADDING_SEL = `input[name=${ SETTINGS.AppIconPadding }]`;

const document = window.document;
const service = new SettingsService();

let currentSettings;

service.get()
.then(settings => {

    currentSettings = settings;

    setupOptionsUI(settings);

    let saveOptsButton = document.querySelector('.save');
    saveOptsButton.addEventListener('click', () => {
        saveSettings()
        .catch(console.error)
        .then(() => {
            chrome.runtime.sendMessage({
                type: 'settingsChange',
                settings: currentSettings
            });
        });
    });

    Array.from(document.querySelectorAll('input[type=range]'))
    .forEach(rangeInput => {
        let output = document.querySelector(`output[name=${rangeInput.name}Output]`);
        if (!output) {
            return;
        }

        let updateOutputVal = () => {
            output.value = rangeInput.value;
        };

        rangeInput.addEventListener('input', updateOutputVal);
        updateOutputVal();
    });
});

function saveSettings() {
    let dirty = getDirtySettings();
    currentSettings = Object.assign(currentSettings, dirty);
    return service.set(currentSettings);
}

function setupOptionsUI (settings) {
    setLauncherWidth(settings);
    setAppsPerRow(settings);
    setLauncherIconColor(settings);
    setShowAppNamesChbox(settings);
    setSearchBarChbox(settings);
    setAppIconPadding(settings);
}

function getSettingValue (settings, key) {
    let setting = settings[key];
    if (typeof setting === 'undefined' ||
        setting === null) {
        return DEFAULT_SETTINGS[key];
    }

    return setting;
}

function setShowAppNamesChbox (settings) {
    let chbox = document.querySelector(SHOW_APP_NAMES_CHBOX_SEL);
    chbox.checked = getSettingValue(settings, SETTINGS.ShowAppNames);
}

function setSearchBarChbox (settings) {
    let chbox = document.querySelector(SEARCH_BAR_CHBOX_SEL);
    chbox.checked = getSettingValue(settings, SETTINGS.SearchBar);
}

function setAppsPerRow (settings) {
    document.querySelector(APPS_PER_ROW_RANGE_SEL).value =
        getSettingValue(settings, SETTINGS.AppsPerRow);
}

function setLauncherWidth (settings) {
    document.querySelector(LAUNCHER_WIDTH_RANGE_SEL).value =
        getSettingValue(settings, SETTINGS.LauncherWidth);
}

function setLauncherIconColor(settings) {
    let color = getSettingValue(settings, SETTINGS.LauncherIconColor);
    document.querySelector(LAUNCHER_ICON_COLOR_SEL).value = color;
}

function setAppIconPadding(settings) {
    document.querySelector(APP_ICON_PADDING_SEL).value =
        getSettingValue(settings, SETTINGS.AppIconPadding);
}

function getDirtySettings() {
    let settings = {};
    settings[SETTINGS.ShowAppNames] =
        document.querySelector(SHOW_APP_NAMES_CHBOX_SEL).checked;
    settings[SETTINGS.SearchBar] =
        document.querySelector(SEARCH_BAR_CHBOX_SEL).checked;
    settings[SETTINGS.LauncherIconColor] =
        document.querySelector(LAUNCHER_ICON_COLOR_SEL).value;
    settings[SETTINGS.LauncherWidth] =
        parseInt(document.querySelector(LAUNCHER_WIDTH_RANGE_SEL).value);
    settings[SETTINGS.AppsPerRow] =
        parseInt(document.querySelector(APPS_PER_ROW_RANGE_SEL).value);
    settings[SETTINGS.AppIconPadding] =
        parseInt(document.querySelector(APP_ICON_PADDING_SEL).value);
    return settings;
}
