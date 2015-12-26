(function (window) {

    const ENTER = 13,
    DELETE = 46,
    GRID_MOVES = {
        38: 'up',
        40: 'down',
        37: 'left',
        39: 'right'
    };

    let eventListeners = {
        'keyup': [ updateFocusOnArrowKeys, launchActiveAppOnEnterKey, deleteActiveAppOnDeleteKey ],
        'mousedown': [ launchActiveAppOnClick, deleteActiveAppOnRightClick ],
        'contextmenu': [ cancelDefaultActionForContextMenu ],
        'mouseover': [ updateFocusOnMouseEnter ],
        'focus': [ changeActiveAppOnFocus ]
    };

    let boundEventListeners;

    window.popup.ui.applyEventListeners = function (appElement, launcher) {

        if (!boundEventListeners) {
            boundEventListeners = bindEventListeners(launcher);
        }

        for (let eventName in boundEventListeners) {
            boundEventListeners[eventName].forEach((listener) => {
                appElement.addEventListener(eventName, listener);
            });
        }
    }

    function bindEventListeners (launcher) {
        return Object.keys(eventListeners)
            .reduce((result, eventName) => {

                result[eventName] = eventListeners[eventName]
                    .map(listener => listener.bind(launcher));

                return result;
            },
            {});
    }

    function updateFocusOnMouseEnter (ev) {
        let appElement = ev.currentTarget;
        this.updateActiveApp(appElement.dataset.appId);
        appElement.focus();
    }

    function changeActiveAppOnFocus (ev) {
        this.updateActiveApp(ev.currentTarget.dataset.appId);
    }

    function deleteActiveAppOnRightClick (ev) {
        if (ev.which !== 3) {
            return;
        }

        ev.preventDefault();
        ev.stopPropagation();
        this.uninstall();
    }

    function cancelDefaultActionForContextMenu (ev) {
        ev.preventDefault();
        ev.stopPropagation();
    }

    function updateFocusOnArrowKeys (ev) {
        let key = ev.keyCode,
        el = ev.currentTarget;

        if (key >= 37 && key <= 40) {
            let appId = el.dataset.appId;
            var currentIndex = this.apps.getIndexById(appId);
            var targetIndex = this.appsGrid.moveOnGrid(currentIndex, GRID_MOVES[key]);
            window.document.querySelectorAll(`.apps-list .app`)[targetIndex].focus();
        }
    }

    function launchActiveAppOnEnterKey (ev) {
        if (ev.keyCode === ENTER) {
            this.launch();
        }
    }

    function deleteActiveAppOnDeleteKey (ev) {
        if (ev.keyCode === DELETE) {
            this.uninstall();
        }
    }

    function launchActiveAppOnClick (ev) {
        if (ev.which !== 1) {
            return;
        }

        ev.preventDefault();
        ev.stopPropagation();

        this.launch();
    }

})(window);
