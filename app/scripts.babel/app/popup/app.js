(function (window) {

    let { SettingsService } = window.common;
    let { AppsService } = window.popup.service
    let { AppsLauncher } = window.popup;

    new AppsLauncher(new AppsService(), new SettingsService()).initialize();

})(window);
