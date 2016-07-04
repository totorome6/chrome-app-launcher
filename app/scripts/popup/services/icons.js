let appIconCache = {};

export default class IconService {

    static getIconUrl (app) {
        let cacheKey = getCacheKey(app);

        if (appIconCache.hasOwnProperty(cacheKey)) {
            return appIconCache[cacheKey];
        }

        let icons = app.icons;

        let result = findIcon(icons);
        appIconCache[cacheKey] = result;

        return result;
    }
}

function findIcon (icons) {
    return icons.filter(x => x.size === Math.max(...icons.map(i => i.size)))
        .map(x => x.url);
}

function getCacheKey(app) {
    return app.id;
}
