var launcherServices = angular.module('launcher.services', []);

launcherServices
.factory('appsService', [ '$q', function($q) {
    
    var EXTENSION = 'extension';
    var THEME = 'theme';
    
    var getId = function (x) {
        return x.id;
    };
    
    var saveAppsOrder = function (apps) {
        if (!apps || !apps.length) {
            return;
        }

        var appsOrder = JSON.stringify(_.map(apps, getId));
        chrome.storage.local.set({
            "order": appsOrder
        }, function () {});
    };
    
    var composeAppsList = function (apps, order) {
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

        return _.filter(result, function (x) {
            return x;
        });
    };
    
    var loadApps = function(){
        var deferred = $q.defer();
        
        chrome.management.getAll(function (extensions) {
            var apps = _.filter(extensions, function (x) {
                return x.type != EXTENSION && x.type != THEME && x.enabled;
            });

            chrome.storage.local.get('order', function (response) {
                var order = response.order;
                var orderedApps = composeAppsList(apps, order ? JSON.parse(response.order) : null);
                deferred.resolve(orderedApps);
            });

        });
        
        return deferred.promise;
    };
    
    return {
      saveOrder: saveAppsOrder,
      loadApps: loadApps
    };
    
}])
.factory('iconsService', [ function() { 
    
    var getIconUrl = function(app){
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
    
    return {
     getIconUrl: getIconUrl
    };
}])
.factory('gridService', [ function(){
    
    var translateGridMoveToListMove = function(gridWidth, move){

        if (move == 'left'){
            return -1;
        }
        else if (move == 'right'){
            return 1;
        }
        else if (move == 'up'){
            return gridWidth;
        }
        else if (move == 'down'){
            return -gridWidth;   
        }
        
        return 0;
    };
    
    return {
      translateGridMoveToListMove: translateGridMoveToListMove   
    };
}]);