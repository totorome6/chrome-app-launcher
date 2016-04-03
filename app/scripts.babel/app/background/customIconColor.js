(function (window) {

    chrome.runtime.onInstalled.addListener(updateIcon);
    chrome.runtime.onStartup.addListener(updateIcon);
    chrome.runtime.onMessage.addListener(updateIcon);

    const SettingsService = window.common.SettingsService;
    let settings = new SettingsService();

    const ICON_SIZE = {
        LDPI: 19,
        HDPI: 38
    };

    const ICON_DATA_URL = {
        [ICON_SIZE.LDPI]: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQFFQ4J5XwTYQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABNSURBVDjL5VM5DgAgCGuJ/ya8vG7GyUTCgLETdIH0ADpCEsa+bzMzvFV+Z201KwVvr5HMuxkRi3f3R90s1awvWNVNSb90k6cI3PAAMAEmJC0Es5Rn2gAAAABJRU5ErkJggg==',
        [ICON_SIZE.HDPI]: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQFFRQFXOelkQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABcSURBVFjD7dcxCgAhDERRR7x3yMnH1kJLl8j+dBaRh4EMynarWL0VrbKwsR4kbedqW6cLbvUwSmC/hYkFCwwYsI9CPDO3PRFBiAMDRogDAwaMnzijBEaI82LvwSbnujBDv/FZhAAAAABJRU5ErkJggg=='
    };

    const DEFAULT_ICON_COLOR = '#000000';

    function updateIcon() {
        settings.get()
        .then(settings => {
            var color = settings.launcherIconColor || DEFAULT_ICON_COLOR;
            var iconsPromises = Object.keys(ICON_SIZE)
                .map(sizeKey => ICON_SIZE[sizeKey])
                .map(size => produceIcon(color,
                        ICON_DATA_URL[size],
                        size));

            return Promise.all(iconsPromises)
            .then(icons => icons
                .reduce((result, iconData) => {
                    result[iconData.width] = iconData;
                    return result;
                }, {}));
        })
        .then(setIcon)
        .catch(err => {
            console.error(err.stack);
        });
    }

    function setIcon (iconData) {
        return new Promise((resolve) => {
            chrome.browserAction.setIcon({ imageData: iconData }, () => {
                resolve();
            });
        });
    }

    function produceIcon(color, data, size) {
        return new Promise((resolve, reject) => {
            var canvas = document.createElement('canvas');
            canvas.setAttribute('width', size);
            canvas.setAttribute('height', size);

            var context = canvas.getContext('2d');

            var img = new Image();
            img.src = data;

            img.onload = function () {
                context.drawImage(img, 0, 0, size, size);
                var imageData = context.getImageData(0, 0, size, size);
                colorize(color, imageData);
                resolve(imageData);
            };
        });
    }

    function colorize(color, imageData) {
        var rgb = hexToRgb(color);
        var data = imageData.data;

        for (var i = 0; i < data.length; i = i + 4) {
            if (!isBlack(data.slice(i, i + 3))) {
                    continue;
                }

                data[i] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
    }

    return imageData;
  }

  function isBlack(rgb) {
      return rgb.every(x => x === 0);
  }

  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

})(window);
