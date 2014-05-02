var launcherServices = angular.module('launcher.services', []);

launcherServices
    .factory('appsService', ['$q',
        function ($q) {

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

            var loadApps = function () {
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
    .factory('iconsService', [

        function () {

            var sizes = {
              	large: 64,
                small: 48
            };
            
            var getIconUrl = function (app, type) {
                
                var type = type || 'large';
                
                var icons = app.icons;
                icons.sort(function (i1, i2) {
                   return i1.size - i2.size; 
                });
                
                var result = null;
                var size = sizes[type];
                
                for (var i = 0; i < icons.length; i++) {
                    var icon  = icons[i];
                    
                    if (icon.size == size) {
                        return icon.url || "";   
                    }
                    
                    if (icon.size > size && (!result || icon.size < result.size)) {
                      	result = icon;   
                    }
                }
                
                return !result ? "" : result.url;
            };

            return {
                getIconUrl: getIconUrl
            };
}])
    .factory('gridFactory', [
            function () {

                var Grid = function (itemsCount, gridWidth) {
                    var self = this;

                    self.itemsCount = itemsCount;
                    self.gridWidth = gridWidth;
                };
                
                Grid.prototype.rowsCount = function () {
                    return Math.ceil(this.itemsCount / this.gridWidth);
                };
                
                Grid.prototype.cellsCount = function () {
                  return this.rowsCount() * this.gridWidth;  
                };
                
                Grid.prototype.positionExists = function (position) {
                    return (position / this.gridWidth) < (this.itemsCount / this.gridWidth);
                };
                
                Grid.prototype.translatePosition = function (position, vector) {
                    var cellsCount = this.cellsCount();
                    return (cellsCount + position + vector) % cellsCount;
                };
                
                Grid.prototype.getListVector = function (move, gridWidth) {

                    if (move == 'left') {
                        return -1;
                    }

                    if (move == 'right') {
                        return 1;
                    }

                    if (move == 'up') {
                        return -gridWidth;
                    }
                    
                    if (move == 'down') {
                        return gridWidth;
                    }
                    
                    return 0;
                };
                
                Grid.prototype.moveOnGrid = function (position, move) {
                    var self = this;
                    var vector = self.getListVector(move, self.gridWidth);
                    var newPos = self.translatePosition(position, vector);
                    while (!self.positionExists(newPos)) {
                        vector = vector + self.getListVector(move, self.gridWidth);
                        newPos = self.translatePosition(position, vector);
                    }
                    
                    return newPos;
                };

                var buildGrid = function (itemsCount, gridWidth){
                 return new Grid(itemsCount, gridWidth);   
                };

                    return {
                        buildGrid: buildGrid
                    };
                }]);