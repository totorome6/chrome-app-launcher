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

function AppsController($scope, $q, appsService, iconsService, gridFactory, settingsService) {

    $scope.apps = [];
    $scope.focusedAppIndex = 0;
    $scope.grid = null;

    var loadApps = function () {
        appsService.loadApps()
            .then(function (apps) {
                $scope.apps = apps;
                
            });
    };

    var initialize = function () {
        settingsService.get()
            .then(function (settings) {
                $scope.settings = settings;
            })
            .then(function () {
                loadApps();
            })
            .then(function(){
                chrome.management.onInstalled.addListener(loadApps);
                chrome.management.onUninstalled.addListener(loadApps);
                chrome.management.onEnabled.addListener(loadApps);
                chrome.management.onDisabled.addListener(loadApps);
            
                $scope.$watch('apps', function (o) {
                    appsService.saveOrder($scope.apps);
            
                    if (!$scope.grid){
                        $scope.grid = gridFactory.buildGrid($scope.apps.length, GRID_WIDTHS[$scope.settings.iconSize]);   
                    }
                    
                    if ($scope.grid.itemsCount != $scope.apps.length) {
                        $scope.grid.itemsCount = $scope.apps.length;
                    }
                }, true);  
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
        return {
            'background-image': 'url(' + $scope.getIconUrl(app) + ')'
        };
    };

    $scope.sortableOptions = function () {
        return {
            items: 'li',
            placeholder: '<li><div class="app card" ><div class="icon"></div><div class="name"></div></div></li>'
        };
    };

    $scope.handleKeys = function (e, appIndex, app) {
        var key = e.keyCode;
        if (key == 13) {
            $scope.launch(app);
        } else if (key >= 37 && key <= 40) {
            var index = $scope.grid.moveOnGrid(appIndex, GRID_MOVES[key]);
            $scope.updateFocusedApp(index);
        }
    };

    $scope.updateFocusedApp = function (index) {
        $scope.focusedAppIndex = index;
    };


    initialize();
}

AppsController.$inject = ['$scope', '$q', 'appsService', 'iconsService', 'gridFactory', 'settingsService'];