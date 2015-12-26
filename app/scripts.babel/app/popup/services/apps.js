'use strict';

(function (window) {

    var EXTENSION = 'extension';
    var THEME = 'theme';

    const chromeManagement = chrome.management;
    const chromeLocalStorage = chrome.storage.local;

    const getId = x => x.id;

    class AppsService {

        saveAppsOrder (apps) {
            if (!apps || !apps.length) {
                return;
            }

            var appsOrder = JSON.stringify(apps.map(getId)));

            chrome.storage.local.set({
                order: appsOrder
            }, () => {});
        }

        loadApps () {
            return Promise.all([ getAppsOrder(), getApps() ])
            .then(([ orderResponse, apps ]) => {
                var order = orderResponse.order;
                var orderedApps = composeAppsList(apps, order ? JSON.parse(order) : null);
                return orderedApps;
            })
        };

    }

    function getApps() {
        return new Promise((resolve) => {
            chrome.management.getAll((extensions) => resolve(extensions));
        })
        .then((extensions) => {
            return extensions.filter(x => {
                return x.type != EXTENSION &&
                       x.type != THEME &&
                       x.enabled;
            });
        });
    }

    function composeAppsList (apps, order) {
        if (!order || !order.length) {
            return _.sortBy(apps, (x) => x.name);
        }

        var appIds = apps.map(getId);
        order = order.concat(_.difference(appIds, order));

        var result = new Array(order.length);
        for (var i = 0; i < order.length; i++) {
            var curAppIdx = appIds.indexOf(order[i]);
            if (curAppIdx == -1) {
                continue;
            }

            result[i] = apps[curAppIdx];
        }

        return _.compact(result);
    };

    var getAppsOrder = function () {
        return new Promise((resolve) => {
            chromeLocalStorage.get('order', (response) => resolve(response));
        });
    };

    window.popup.service.AppsService = AppsService;

})(window);
