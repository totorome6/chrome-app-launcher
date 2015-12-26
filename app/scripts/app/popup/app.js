"use strict";

(function (window) {
    var SettingsService = window.common.SettingsService;
    var AppsService = window.popup.service.AppsService;
    var AppsLauncher = window.popup.AppsLauncher;

    new AppsLauncher(new AppsService(), new SettingsService()).initialize();
})(window);
//# sourceMappingURL=app.js.map
