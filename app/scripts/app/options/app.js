'use strict';

(function () {

  angular.module('options', ['launcher.common']).config(['$compileProvider', configureImgSrcSanitizationWhitelist]).controller('OptionsController', ['$scope', '$timeout', 'settingsService', OptionsController]);

  function configureImgSrcSanitizationWhitelist($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
  }

  function OptionsController($scope, $timeout, settingsService) {

    settingsService.get().then(function (settings) {
      $scope.settings = settings;
    });

    $scope.save = function () {
      settingsService.set($scope.settings).then(function () {
        $scope.saved = true;

        $timeout(function () {
          $scope.saved = false;
        }, 1000);
      });
    };

    $scope.saved = false;
  }
})();
//# sourceMappingURL=app.js.map
