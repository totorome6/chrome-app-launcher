(function() {

  angular.module('launcher.common').service("settingsService", [ '$q', settingsService ]);

  function settingsService($q) {

    var SETTINGS_KEY = "settings";
    var chromeStorage = chrome.storage.local;

    return {
      "get": getSettings,
      "set": setSettings
    };

    function getSettings() {
      var deferred = $q.defer();

      chromeStorage.get(SETTINGS_KEY, function (response) {
        deferred.resolve(response[SETTINGS_KEY] || getDefaultSettings());
      });

      return deferred.promise;
    };

    function setSettings (settings) {
      var deferred = $q.defer();
      var storageObject = {};

      storageObject[SETTINGS_KEY] = settings;

      chromeStorage.set(storageObject, function () {
        deferred.resolve(true);
      });

      return deferred.promise;
    }

    function getDefaultSettings() {
      return {
        'iconSize': 'large',
        'searchBar': 'off',
      };
    };

  }
}());
