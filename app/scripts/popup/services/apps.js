const EXTENSION = 'extension';
const THEME = 'theme';

const chromeLocalStorage = chrome.storage.local;

const getId = x => x.id;

export default class AppsService {

    saveOrder (apps) {
        if (!apps || !apps.length) {
            return;
        }

        let appsOrder = JSON.stringify(apps.map(getId));

        chrome.storage.local.set({
            order: appsOrder
        }, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
        });
    }

    load () {
        return Promise.all([ getAppsOrder(), getApps() ])
        .then(([ orderResponse, apps ]) => {
            let order = orderResponse.order;
            let orderedApps = composeAppsList(apps, order ? JSON.parse(order) : null);
            return orderedApps;
        });
    }

}

function getApps() {
    return new Promise((resolve) => {
        chrome.management.getAll((extensions) => resolve(extensions));
    })
    .then((extensions) => {
        return extensions.filter(x => {
            return x.type !== EXTENSION &&
            x.type !== THEME &&
            x.enabled;
        });
    });
}

function composeAppsList (apps, order) {
    if (!order || !order.length) {
        apps = apps.slice();
        apps.sort(function (a, b) {
            let aname = a.name,
            bname = b.name;

            if (aname > bname) {
                return 1;
            } else if (aname === bname) {
                return 0;
            }

            return -1;
        });

        return apps;
    }

    let appIds = apps.map(getId);
    order = order.concat(difference(appIds, order));

    let result = new Array(order.length);
    for (let i = 0; i < order.length; i++) {
        let curAppIdx = appIds.indexOf(order[i]);
        if (curAppIdx === -1) {
            continue;
        }

        result[i] = apps[curAppIdx];
    }

    return result.filter(x => x);
}

function getAppsOrder () {
    return new Promise((resolve) => {
        chromeLocalStorage.get('order', (response) => resolve(response));
    });
}

function difference(arr1, arr2) {
    return arr1.filter(i => arr2.indexOf(i) === -1);
}
