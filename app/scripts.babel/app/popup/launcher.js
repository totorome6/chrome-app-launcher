(function (window, chrome) {

    const { $, document } = window,
    model = window.popup.model,
    { AppElementBuilder, applyEventListeners } = window.popup.ui,
    APPS_EVENT = model.APPS_EVENT,
    AppsCollection = model.AppsCollection,
    APPS_LIST_ELEMENT = document.querySelector('.apps-list'),
    Grid = model.Grid,
    APP_SEL = '.app';

    const GRID_WIDTHS = {
        LARGE: 3,
        SMALL: 5
    };

    const SORTABLE_OPTIONS = {
        items: 'li',
        placeholder: '<li><div class="app card" ><div class="icon"></div><div class="name"></div></div></li>'
    };

    let chromeManagement = chrome.management;

    class AppsLauncher {

        constructor (appsService, settingsService) {
            this.appsService = appsService;
            this.settingsService = settingsService;

            this.apps = null;
            this.appsGrid = null;
            this.settings = null;
            this.activeAppId = 0;
        }

        initialize () {
            Promise.all([ this.settingsService.get(), this.appsService.load() ])
            .then(([ settings, apps ]) => {
                this.settings = settings;

                setTheme(settings);

                this.apps = new AppsCollection(apps);

                let gridWidth = GRID_WIDTHS[(settings.iconSize || 'large').toUpperCase()];
                this.appsGrid = new Grid(this.apps.length, gridWidth);

                drawAppElements.call(this, APPS_LIST_ELEMENT, this.apps.list());
                saveOrderOnAppsEvents(this.appsService, this.apps);
                updateGridSizeOnAppsEvents(this.appsGrid, this.apps);

                document.querySelector('.apps-list .app:first-of-type').focus();
                makeGridSortable.call(this, APPS_LIST_ELEMENT);
            });
        };

        launch () {
            chromeManagement.launchApp(this.activeAppId);
        }

        uninstall() {
            chromeManagement.uninstall(this.activeAppId, { showConfirmDialog: true });
            window.close();
        }

        updateActiveApp(appId) {
            this.activeAppId = appId;
            let appIndex = this.apps.getIndexById(appId);
        }

    }

    function makeGridSortable (appsListElement) {
        let opts = {
            items: 'li',
            placeholder: '<li class="app-container"><div class="app card" ><div class="icon"></div><div class="name"></div></div></li>'
        };

        let currentElement;

        Sortable.create(appsListElement, {
            draggable: 'li.app-container',
            animation: 150,

            onEnd: (evnt) => {
                if (!currentElement || evnt.oldIndex === evnt.newIndex) {
                    return;
                }

             let appId = getAppIdFromAppListItem(currentElement);
             let app = this.apps.getById(appId);
             this.apps.reorder(app, evnt.newIndex);
             currentElement = null;
            },

            onUpdate: (evnt) => {
                currentElement = evnt.item;
            }

        });
        // $(appsListElement)
        // .sortable(opts)
        // .on('sortupdate', (e, data) => {
        //     if (data.oldindex === data.index) {
        //         return;
        //     }
        //
        //     let appId = getAppIdFromAppListItem(data.item[0]);
        //     let app = this.apps.getById(appId);
        //     this.apps.reorder(app, data.elementIndex);
        // });
    }

    function getAppIdFromAppListItem (li) {
        return li.childNodes[0].dataset.appId;
    }

    function drawAppElements (launcherElement, apps) {
        apps.forEach(app => {
            let appsListItem = document.createElement('li');
            appsListItem.className = 'app-container';

            let appElement = AppElementBuilder.create(app)
                .withIconSize(this.settings.iconSize)
                .build();

            applyEventListeners(appElement, this);

            appsListItem.appendChild(appElement);
            launcherElement.appendChild(appsListItem);
        });
    }

    function setTheme(settings) {
        window.document.documentElement.className += settings.iconSize;
    }

    function saveOrderOnAppsEvents (appsService, apps) {
        let saveOrder = () => appsService.saveOrder(apps.collection);

        apps.on(APPS_EVENT.REORDERED, saveOrder);
        apps.on(APPS_EVENT.ADDED, saveOrder);
        apps.on(APPS_EVENT.REMOVED, saveOrder);
    }

    function updateGridSizeOnAppsEvents (grid, apps) {
        let updateGridSize = () => {
            grid.itemsCount = apps.length;
        };

        apps.on(APPS_EVENT.ADDED, updateGridSize);
        apps.on(APPS_EVENT.REMOVED, updateGridSize);
    }

    window.popup.AppsLauncher = AppsLauncher;

}(window, chrome, document));
