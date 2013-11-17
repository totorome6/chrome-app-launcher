var EXTENSION = 'extension';

var appsLauncher = angular.module('appsLauncher', ['ui.sortable']);

appsLauncher.config(function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
});

appsLauncher.controller("AppsController", function AppsController($scope) {

    $scope.apps = [];

    var getId = function(x) { return x.id; };
    
    var determineAppsList = function (apps, order) {
        if (!order || !order.length) {
            return _.sortBy(apps, function (x) {
                return x.name;
            });
        }

        var appIds = _.map(apps, getId);
        order = order.concat(_.difference(appIds, order));
        var result = new Array(order.length);
        for (var i = 0; i < order.length; i++) {
            var curAppIdx = appIds.indexOf(order[i]);
            if (curAppIdx == -1) {
                continue;
            }

            result[i] = apps[curAppIdx];
        }

        return result;
    };

    chrome.management.getAll(function (extensions) {
        var apps = _.filter(extensions, function (x) {
            return x.type != EXTENSION && x.enabled;
        });

        chrome.storage.sync.get('order', function (response) {
            var order = response.order;
            var orderedApps = determineAppsList(apps, order ? JSON.parse(response.order) : null);
            $scope.$apply(function () {
                $scope.apps = orderedApps;
            });
        });
    });

    $scope.launch = function (app) {
        chrome.management.launchApp(app.id);
    }

    $scope.getIconUrl = function (app) {
        var icons = app.icons;
        var maxIconIdx = 0;
        var maxSize = icons[0].size;
        for (var i = 1; i < icons.length; i++) {
            if (maxSize < icons[i].size) {
                maxIconIdx = i;
                maxSize = icons[i].size;
            }
        }

        return icons[maxIconIdx].url || "";
    };

    $scope.$watch('apps', function (o) {
        if (!$scope.apps || !$scope.apps.length){
            return;
        }
        
        var appsOrder = JSON.stringify(_.map($scope.apps, getId));
        chrome.storage.sync.set({ "order": appsOrder }, function () {});
    }, true);


});