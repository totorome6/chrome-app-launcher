var EXTENSION = 'extension';
var THEME = 'theme';

var tryMigrateFromSyncToLocalStorage = function () {
    chrome.storage.sync.get('order', function (response) {
        if (!response || !response.order) {
            return;
        }

        chrome.storage.local.set({
            'order': response.order
        }, function () {});

        chrome.storage.sync.clear(function () {});
    });
};

tryMigrateFromSyncToLocalStorage();

var app = angular.module('appsLauncher', []);

app.config(function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
});

app.controller("AppsController", function AppsController($scope) {

    $scope.apps = [];

    var getId = function (x) {
        return x.id;
    };

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

        return _.filter(result, function (x) {
            return x;
        });
    };

    var loadApps = function () {
        chrome.management.getAll(function (extensions) {
            var apps = _.filter(extensions, function (x) {
                return x.type != EXTENSION && x.type != THEME && x.enabled;
            });

            chrome.storage.local.get('order', function (response) {
                var order = response.order;
                var orderedApps = determineAppsList(apps, order ? JSON.parse(response.order) : null);
                $scope.$apply(function () {
                    $scope.apps = orderedApps;
                });
            });

        });
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

    loadApps();

    chrome.management.onInstalled.addListener(loadApps);
    chrome.management.onUninstalled.addListener(loadApps);
    chrome.management.onEnabled.addListener(loadApps);
    chrome.management.onDisabled.addListener(loadApps);

    $scope.$watch('apps', function (o) {
        saveAppsOrder($scope.apps);
    }, true);
});

/*
 * AngularJS integration with the HTML5 Sortable jQuery Plugin
 * https://github.com/voidberg/html5sortable
 *
 * Copyright 2013, Alexandru Badiu <andu@ctrlz.ro>
 *
 * Thanks to the following contributors: samantp.
 *
 * Released under the MIT license.
 */
app.directive('htmlSortable', [
  '$timeout',
    function ($timeout) {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                var opts, model;

                opts = angular.extend({}, scope.$eval(attrs.htmlSortable));
                if (ngModel) {
                    model = attrs.ngModel;
                    ngModel.$render = function () {
                        $timeout(function () {
                            element.sortable('reload');
                        }, 50);
                    };

                    scope.$watch(model, function () {
                        $timeout(function () {
                            element.sortable('reload');
                        }, 50);
                    }, true);
                }

                // Create sortable
                $(element).sortable(opts);
                if (model) {
                    $(element).sortable().bind('sortupdate', function (e, data) {
                        var $source = data.startparent.attr('ng-model');
                        var $dest = data.endparent.attr('ng-model');

                        var $start = data.oldindex;
                        var $end = data.item.index();

                        scope.$apply(function () {
                            if ($source == $dest) {
                                scope[model].splice($end, 0, scope[model].splice($start, 1)[0]);
                            } else {
                                var $item = scope[$source][$start];

                                scope[$source].splice($start, 1);
                                scope[$dest].splice($end, 0, $item);
                            }
                        });
                    });
                }
            }
        };
  }
]);