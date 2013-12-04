'use strict'

function AppsController($scope, appsService, iconsService, settingsService) {

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

AppsController.$inject = [ '$scope', 'appsService', 'iconsService', 'settingsService' ];