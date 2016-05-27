import { SettingsService } from '../../common/settings';
import { isBlack, hexToRgb } from './utils';

const ICON_SIZE = {
    LDPI: 19,
    HDPI: 38
};

/* eslint-disable max-len */
const ICON_DATA_URL = {
    [ICON_SIZE.LDPI]: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQFFQ4J5XwTYQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABNSURBVDjL5VM5DgAgCGuJ/ya8vG7GyUTCgLETdIH0ADpCEsa+bzMzvFV+Z201KwVvr5HMuxkRi3f3R90s1awvWNVNSb90k6cI3PAAMAEmJC0Es5Rn2gAAAABJRU5ErkJggg==',
    [ICON_SIZE.HDPI]: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQFFRQFXOelkQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABcSURBVFjD7dcxCgAhDERRR7x3yMnH1kJLl8j+dBaRh4EMynarWL0VrbKwsR4kbedqW6cLbvUwSmC/hYkFCwwYsI9CPDO3PRFBiAMDRogDAwaMnzijBEaI82LvwSbnujBDv/FZhAAAAABJRU5ErkJggg=='
};
/* eslint-enable max-len */

const DEFAULT_ICON_COLOR = '#000000';

const settingsService = new SettingsService();

function setIcon (iconData) {
    return new Promise((resolve) => {
        chrome.browserAction.setIcon({ imageData: iconData }, () => {
            resolve();
        });
    });
}

function colorizeImage(color, imageData) {
    let rgb = hexToRgb(color);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        if (!isBlack(data.slice(i, i + 3))) {
            continue;
        }

        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
    }

    return imageData;
}

function produceIcon(color, data, size) {
    return new Promise((resolve, reject) => {
        let canvas = window.document.createElement('canvas');
        canvas.setAttribute('width', size);
        canvas.setAttribute('height', size);

        let context = canvas.getContext('2d');

        let img = new Image();
        img.src = data;

        img.onload = function () {
            context.drawImage(img, 0, 0, size, size);
            let imageData = context.getImageData(0, 0, size, size);
            colorizeImage(color, imageData);
            resolve(imageData);
        };

        img.onerror = (err) => reject(err);
    });
}

function indexIconsByWidth(icons) {
    return icons.reduce((result, iconData) => {
        result[iconData.width] = iconData;
        return result;
    }, {});
}

function updateIcon() {
    settingsService.get()
    .then(settings => {
        let color = settings.launcherIconColor || DEFAULT_ICON_COLOR;
        let iconsPromises = Object.keys(ICON_SIZE)
        .map(sizeKey => ICON_SIZE[sizeKey])
        .map(size => produceIcon(color, ICON_DATA_URL[size], size));

        return Promise.all(iconsPromises);
    })
    .then(indexIconsByWidth)
    .then(setIcon)
    .catch(err => console.error(err));
}

export default function customizeIconColor() {
    chrome.runtime.onInstalled.addListener(updateIcon);
    chrome.runtime.onStartup.addListener(updateIcon);
    chrome.runtime.onMessage.addListener(updateIcon);
}
