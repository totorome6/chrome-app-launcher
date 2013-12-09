'use strict'

var ENTER = 13;

var GRID_MOVES = {
  38: 'up',
  40: 'down',
  37: 'left',
  39: 'right'
};

function AppsController($scope, appsService, iconsService, gridService, settingsService) {

    $scope.apps = [];

    var loadApps = function(){
        appsService.loadApps()
        .then(function(apps){
            $scope.apps = apps;  
        });
    };
    
    var loadSettings = function(){
      settingsService.get()
       .then(function(settings){
          $scope.settings = settings; 
       });
    };

    $scope.launch = function (app) {
        chrome.management.launchApp(app.id);
        window.close();
    }

    $scope.getIconUrl = function (app) {
        return iconsService.getIconUrl(app);
    };

    $scope.getBgImageStyle = function (app) {
        return { 'background-image': 'url(' + $scope.getIconUrl(app) + ')' };
    };

    $scope.sortableOptions = function () {
        return {
            items: 'li',
            placeholder: '<li><div class="app card" ><div class="icon"></div><div class="name"></div></div></li>'
        };
    };
    
    $scope.handleKeys = function(e, appIndex, app) {
        var key = e.keyCode;
        if (key == 13){
            $scope.launch(app);   
        }
        else if (key >= 37 && key <= 40){
            var listMove = gridService.translateGridMoveToListMove(5, GRID_MOVES[key]);
            console.log(e);
        }   
    };

    loadSettings();
    loadApps();

    chrome.management.onInstalled.addListener(loadApps);
    chrome.management.onUninstalled.addListener(loadApps);
    chrome.management.onEnabled.addListener(loadApps);
    chrome.management.onDisabled.addListener(loadApps);

    $scope.$watch('apps', function (o) {
        appsService.saveOrder($scope.apps);
    }, true);
}

AppsController.$inject = [ '$scope', 'appsService', 'iconsService', 'gridService', 'settingsService' ];