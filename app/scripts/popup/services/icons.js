const SIZE = {
    LARGE: 64,
    SMALL: 48
};

let appIconCache = {};

export default class IconService {

    static getIconUrl (app, type) {
        type = type || 'large';

        let cacheKey = getCacheKey(app, type);

        if (appIconCache.hasOwnProperty(cacheKey)) {
            return appIconCache[cacheKey];
        }

        let icons = app.icons;
        sortBySize(icons);

        let size = getSizeByType(type);
        let result = findIcon(icons, size);
        appIconCache[cacheKey] = result;

        return result;
    }

}

function getSizeByType (type) {
    return SIZE[type.toUpperCase()];
}

function findIcon (icons, size) {
    let result = null;
    let icon;

    for (let i = 0; i < icons.length; i++) {
        icon = icons[i];

        if (icon.size === size) {
            return icon.url || '';
        }

        if (icon.size > size && (!result || icon.size < result.size)) {
            result = icon;
        }
    }

    return !result ? '' : result.url;
}

function getCacheKey(app, type) {
    return `${ app.id }_${ type }`;
}

function sortBySize(icons) {
    icons.sort(function (i1, i2) {
        return i1.size - i2.size;
    });
}
