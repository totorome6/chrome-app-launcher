(function (window) {

    const document = window.document;
    const SettingsService = window.common.SettingsService;

    let service = new SettingsService();
    const ICON_SIZE_RADIO_SEL = 'input[name=iconSize]';
    const LAUNCHER_ICON_COLOR_SEL = 'input[name=launcherIconColor]';

    const DEFAULT_LAUNCHER_ICON_COLOR = '#000000';
    const DEFAULT_ICON_SIZE = 'large';

    let currentSettings;

    service.get()
    .then(settings => {

        currentSettings = settings;

        setIconSizeRadio(currentSettings);
        setLauncherIconColor(currentSettings);

        let saveOptsButton = document.querySelector('.save');
        saveOptsButton.addEventListener('click', () => {
            saveSettings()
            .catch(console.error);

            chrome.runtime.sendMessage({
                type: 'settingsChange',
                settings: currentSettings
            });
        });
    });

    function saveSettings() {
        let dirty = getDirtySettings();
        currentSettings = Object.assign(currentSettings, dirty);
        return service.set(currentSettings);
    }

    function setIconSizeRadio(settings) {
        let size = settings.iconSize || DEFAULT_ICON_SIZE;
        let radioSel = `${ ICON_SIZE_RADIO_SEL }[value=${ size }]`;
        let radio = document.querySelector(radioSel);
        radio.checked = true;
    }

    function setLauncherIconColor(settings) {
        let color = settings.launcherIconColor || DEFAULT_LAUNCHER_ICON_COLOR;
        document.querySelector(LAUNCHER_ICON_COLOR_SEL).value = color;
    }

    function getDirtySettings() {
        let settings = {};
        settings.iconSize = document.querySelector(`${ ICON_SIZE_RADIO_SEL }:checked`).value;
        settings.launcherIconColor = document.querySelector(LAUNCHER_ICON_COLOR_SEL).value;
        return settings;
    }

}(window));
