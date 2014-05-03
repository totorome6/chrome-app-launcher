var common = angular.module('launcher.common');

common.service("settingsService", [ 
    '$q', 
    function ($q) {

        var SETTINGS_KEY = "settings";
        var chromeStorage = chrome.storage.local;

        var getDefaultSettings = function () {
            return {
                'iconSize': 'large',
                'searchBar': 'off',
            };
        };

        var getSettings = function () {
            var deferred = $q.defer();

            chromeStorage.get(SETTINGS_KEY, function (response) {
                deferred.resolve(response[SETTINGS_KEY] || getDefaultSettings());
            });

            return deferred.promise;
        };

        var setSettings = function (settings) {
            var deferred = $q.defer();
            var storageObject = {};
            storageObject[SETTINGS_KEY] = settings;
            chromeStorage.set(storageObject, function () {
                deferred.resolve(true);
            });

            return deferred.promise;
        }

        return {
            "get": getSettings,
            "set": setSettings
        };
}]);
