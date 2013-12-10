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

            var getIconUrl = function (app) {
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
    .factory('gridService', [
            function () {

                

                var AppGrid = function (itemsCount, gridWidth) {
                    var self = this;

                    self.itemsCount = itemsCount;
                    self.gridWidth = gridWidth;

                    self.completeRowsCount = function () {
                        return Math.floor(self.itemsCount / self.gridWidth);
                    };

                    self.rowsCount = function () {
                        return Math.ceil(self.itemsCount / self.gridWidth);
                    };

                    self.isInCompleteRow = function (position) {
                        var rowIdx = Math.ceil(position / self.gridWidth);
                        return rowIdx <= self.completeRowsCount();
                    };
                    
                    self.cellsCount = function () {
                      return self.rowsCount() * self.gridWidth;  
                    };

                    self.positionExists = function (position) {
                        return (position / self.gridWidth) < (self.itemsCount / self.gridWidth);
                    };
                    
                    self.translatePosition = function (position, vector) {
                        var cellsCount = self.cellsCount();
                        return (cellsCount + position + vector) % cellsCount;
                    };
                    
                    self.getListVector = function (move, gridWidth) {

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
                    };

                    self.moveOnGrid = function (position, move) {
                        var vector = self.getListVector(move, self.gridWidth);
                        var newPos = self.translatePosition(position, vector);
                        while (!self.positionExists(newPos)) {
                            vector = vector + self.getListVector(move, self.gridWidth);
                            newPos = self.translatePosition(position, vector);
                        }
                        
                        return newPos;
                    };
                };

                var calcPositionOnGrid = function (position, move, itemsCount, gridWidth) {
                    var grid = new AppGrid(itemsCount, gridWidth);
                    return grid.moveOnGrid(position, move);
                };

                    return {
                        calcPositionOnGrid: calcPositionOnGrid
                    };
                }]);