var tryMigrateFromSyncToLocalStorage = function () {
    chrome.storage.sync.get('order', function (response) {
        if (!response || !response.order) {
            return;
        }

        chrome.storage.local.set({
            'order': response.order
        }, function () {});

        chrome.storage.sync.clear(function () {});
    });
};

tryMigrateFromSyncToLocalStorage();

var app = angular.module('launcher', [
    'launcher.services',
    'launcher.directives'
]);

app.config(function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
});