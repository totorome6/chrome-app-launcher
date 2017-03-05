
export default function initializeOpenAsWindow(settingsService) {
    chrome.commands.onCommand.addListener((command) => {
        if (command !== 'open-as-window') {
            return;
        }

        const opts = {
            url: 'popup.html',
            width: 400,
            height: 600,
            type: 'popup'
        };

        chrome.windows.create(opts);
    });
}
