import { APPS_EVENT, AppsCollection, Grid } from './model';
import { SETTINGS } from '../common/settings';
import Sortable from 'sortablejs';
import {
    AppElementBuilder,
    applyEventListeners
} from './ui';
const APPS_LIST_ELEMENT = document.querySelector('.apps-list');


const chromeManagement = chrome.management;

export default class AppsLauncher {

    constructor (appsService, settingsService) {
        this.appsService = appsService;
        this.settingsService = settingsService;

        this.apps = null;
        this.appsGrid = null;
        this.appElementsCache = {};
        this.settings = null;
        this.activeAppId = 0;

        this.appsListElement = APPS_LIST_ELEMENT;
    }

    initialize () {
        return Promise.all([ this.settingsService.get(), this.appsService.load() ])
        .then(([ settings, apps ]) => {
            this.settings = settings;

            applyStyleSettings(settings);

            this.apps = new AppsCollection(apps);
            this.appsGrid = new Grid(apps.length, settings[SETTINGS.AppsPerRow]);

            this.draw(apps);
            this.makeGridSortable();
            this.registerAppEventHandlers();
            this.initializeSearchBar();
            this.handleFocus();
        });
    }

    draw (apps) {
        this.appsListElement.innerHTML = '';

        // TODO cache elements
        apps.forEach(app => {
            if (app.id in this.appElementsCache) {
                this.appsListElement.appendChild(this.appElementsCache[app.id]);
                return;
            }

            let appsListItem = document.createElement('li');
            let appElement = AppElementBuilder.create(app).build();

            applyEventListeners(appElement, this);

            appsListItem.appendChild(appElement);
            this.appsListElement.appendChild(appsListItem);

            this.appElementsCache[app.id] = appsListItem;
        });
    }

    registerAppEventHandlers() {
        saveOrderOnAppsEvents(this.appsService, this.apps);
        updateGridSizeOnAppsEvents(this.appsGrid, this.apps);

        this.apps.on(APPS_EVENT.FILTERED, () => this.draw(this.apps.display()));
    }

    launch () {
        chromeManagement.launchApp(this.activeAppId);
        window.close();
    }

    uninstall () {
        chromeManagement.uninstall(this.activeAppId, { showConfirmDialog: true });
        window.close();
    }

    filter (term) {
        this.apps.filter(term);
    }

    updateActiveApp(appId) {
        this.activeAppId = appId;
        this.apps.getIndexById(appId);
    }

    makeGridSortable () {
        let currentElement;

        let onEnd = (evnt) => {
            if (!currentElement || evnt.oldIndex === evnt.newIndex) {
                return;
            }

            let appId = getAppIdFromAppListItem(currentElement);
            let app = this.apps.getById(appId);
            this.apps.reorder(app, evnt.newIndex);
            currentElement = null;
        };

        let onUpdate = (evnt) => {
            currentElement = evnt.item;
        };

        Sortable.create(this.appsListElement, {
            draggable: 'li',
            animation: 150,
            onEnd,
            onUpdate
        });
    }

    handleFocus() {
        let hasSearch = this.settings[SETTINGS.SearchBar];
        let selToFocus = hasSearch ?
            '.search_input' :
            '.apps-list .app:first-of-type';
        document.querySelector(selToFocus).focus();
    }

    initializeSearchBar() {
        if (!this.settings[SETTINGS.SearchBar]) {
            return;
        }

        let searchInput = document.querySelector('input.search_input');
        if (!searchInput) {
            return;
        }

        searchInput.addEventListener('keyup', e => {
            let term = searchInput.value;
            if (e.keyCode === 13 && term && this.apps.filtered.length) {
                this.updateActiveApp(this.apps.filtered[0].id);
                this.launch();
                return;
            }

            this.filter(term);
        });
    }
}

function getAppIdFromAppListItem (li) {
    return li.childNodes[0].dataset.appId;
}

function applyStyleSettings (settings) {
    let classes = [];

    if (settings[SETTINGS.ShowAppNames]) {
        classes.push('showAppNames');
    }

    if (settings[SETTINGS.SearchBar]) {
        classes.push('hasSearch');
    }

    window.document.documentElement.className += ' ' + classes.join(' ');

    let launcherWidth = settings[SETTINGS.LauncherWidth];
    document.documentElement.style.setProperty('--launcherWidth', `${launcherWidth}px`);

    let appsPerRow = settings[SETTINGS.AppsPerRow];
    document.documentElement.style.setProperty('--appsPerRow', appsPerRow);

    let appIconPadding = settings[SETTINGS.AppIconPadding];
    document.documentElement.style.setProperty('--appIconPadding', appIconPadding);
}

function saveOrderOnAppsEvents (appsService, apps) {
    let saveOrder = () => appsService.saveOrder(apps.collection);

    apps.on(APPS_EVENT.REORDERED, saveOrder);
    apps.on(APPS_EVENT.ADDED, saveOrder);
    apps.on(APPS_EVENT.REMOVED, saveOrder);
}

function updateGridSizeOnAppsEvents (grid, apps) {
    let updateGridSize = () => {
        let itemsCount = apps.display().length;
        grid.itemsCount = itemsCount;
    };

    apps.on(APPS_EVENT.ADDED, updateGridSize);
    apps.on(APPS_EVENT.REMOVED, updateGridSize);
    apps.on(APPS_EVENT.FILTERED, updateGridSize);
}
