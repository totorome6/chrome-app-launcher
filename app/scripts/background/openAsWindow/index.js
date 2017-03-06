import { SETTINGS } from '../../common/settings';

export default function initializeOpenAsWindow(settingsService) {
    chrome.commands.onCommand.addListener((command) => {
        if (command !== 'open-as-window') {
            return;
        }

        settingsService.get()
            .then(settings => {
                const opts = {
                    url: 'popup.html',
                    width: settings[SETTINGS.LauncherWidth],
                    type: 'popup'
                };

                return new Promise(resolve => chrome.windows.create(opts, resolve));
            });

    });
}
