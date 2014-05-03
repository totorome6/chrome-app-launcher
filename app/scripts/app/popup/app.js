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

angular.module('launcher')
.config([ '$compileProvider', function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
}]);
