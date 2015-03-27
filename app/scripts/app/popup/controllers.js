(function () {
'use strict'

var ENTER = 13;

var GRID_MOVES = {
  38: 'up',
  40: 'down',
  37: 'left',
  39: 'right'
};

var GRID_WIDTHS = {
  'large': 3,
  'small': 5
};

angular.module('launcher').controller('AppsController', ['$scope', '$q', 'appsService', 'iconsService', 'gridFactory', 'settingsService', AppsController]);

    function AppsController($scope, $q, appsService, iconsService, gridFactory, settingsService) {

      $scope.apps = [];
      $scope.focusedAppIndex = 0;
      $scope.grid = null;

      $scope.launch = launch;
      $scope.uninstall = uninstall;
      $scope.getIconUrl = getIconUrl;
      $scope.getBgImageStyle = getBgImageStyle;
      $scope.sortableOptions = sortableOptions;
      $scope.handleKeys = handleKeys;

      $scope.updateFocusedApp = updateFocusedApp;

      activate();

      function updateFocusedApp(index) {
        $scope.focusedAppIndex = index;
      }

      function handleKeys(e, appIndex, app) {
        var key = e.keyCode;

        if (key == 13) {
          $scope.launch(app);
        } else if (key == 46) { 
          $scope.uninstall(app);
        } else if (key >= 37 && key <= 40) {
          var index = $scope.grid.moveOnGrid(appIndex, GRID_MOVES[key]);
          $scope.updateFocusedApp(index);
        }
      }

      function getIconUrl(app) {
        return iconsService.getIconUrl(app, $scope.settings.iconSize);
      }
      
      function getBgImageStyle (app) {
        return {
          'background-image': 'url(' + getIconUrl(app) + ')'
        };
      }

      function sortableOptions() {
        return {
          items: 'li',
          placeholder: '<li><div class="app card" ><div class="icon"></div><div class="name"></div></div></li>'
        };
      }

      function launch(app) {
        chrome.management.launchApp(app.id);
        window.close();
      }
      
      function uninstall(app) {
        chrome.management.uninstall(app.id, { showConfirmDialog: true });
        window.close();
      }
      
      function reloadApps() {
        appsService.loadApps()
        .then(function (apps) {
            $scope.apps = apps;
        });
      }
      
      function postLoad() {
        chrome.management.onInstalled.addListener(reloadApps);
        chrome.management.onUninstalled.addListener(reloadApps);
        chrome.management.onEnabled.addListener(reloadApps);
        chrome.management.onDisabled.addListener(reloadApps);

        $scope.$watch('apps', function (o) {
          appsService.saveOrder($scope.apps);

          if (!$scope.grid){
            $scope.grid = gridFactory.buildGrid($scope.apps.length, GRID_WIDTHS[$scope.settings.iconSize]);   
          }

          if ($scope.grid.itemsCount != $scope.apps.length) {
            $scope.grid.itemsCount = $scope.apps.length;
          }
        }, true);  
      }

      function activate() {
        $q.all([ settingsService.get(), appsService.loadApps() ])
          .then(function (results) {

            var settings = results[0];
            var apps = results[1];

            $scope.settings = settings;
            $scope.apps = apps;

            postLoad();
          });
      };
    }

}());
