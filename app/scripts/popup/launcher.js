import { APPS_EVENT, AppsCollection, Grid } from './model';
import { SETTINGS } from '../common/settings';
import Sortable from 'sortablejs';
import {
  AppElementBuilder,
  applyEventListeners } from './ui';

const APPS_LIST_ELEMENT = document.querySelector('.apps-list');

const chromeManagement = chrome.management;

export default class AppsLauncher {

  constructor (appsService, settingsService) {
    this.appsService = appsService;
    this.settingsService = settingsService;

    this.apps = null;
    this.appsGrid = null;
    this.settings = null;
    this.activeAppId = 0;
  }

  initialize () {
    return Promise.all([ this.settingsService.get(), this.appsService.load() ])
    .then(([ settings, apps ]) => {
      this.settings = settings;

      applySettings(settings);

      this.apps = new AppsCollection(apps);
      this.appsGrid = new Grid(this.apps.length, settings[SETTINGS.AppsPerRow]);

      drawAppElements.call(this, APPS_LIST_ELEMENT, this.apps.list());
      saveOrderOnAppsEvents(this.appsService, this.apps);
      updateGridSizeOnAppsEvents(this.appsGrid, this.apps);

      document.querySelector('.apps-list .app:first-of-type').focus();
      makeGridSortable.call(this, APPS_LIST_ELEMENT);
    });
  }

  launch () {
    chromeManagement.launchApp(this.activeAppId);
    window.close();
  }

  uninstall() {
    chromeManagement.uninstall(this.activeAppId, { showConfirmDialog: true });
    window.close();
  }

  updateActiveApp(appId) {
    this.activeAppId = appId;
    this.apps.getIndexById(appId);
  }

}

function makeGridSortable (appsListElement) {
  let currentElement;

  Sortable.create(appsListElement, {
    draggable: 'li',
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
}

function getAppIdFromAppListItem (li) {
  return li.childNodes[0].dataset.appId;
}

function drawAppElements (launcherElement, apps) {
  apps.forEach(app => {
    let appsListItem = document.createElement('li');

    let appElement = AppElementBuilder.create(app).build();

    applyEventListeners(appElement, this);

    appsListItem.appendChild(appElement);
    launcherElement.appendChild(appsListItem);
  });
}

function applySettings (settings) {
    let classes = [];

    if (!settings[SETTINGS.ShowAppNames]) {
        classes.push('hideAppNames');
    }

    window.document.documentElement.className += ' ' + classes.join(' ');

    let launcherWidth = settings[SETTINGS.LauncherWidth];
    document.documentElement.style.setProperty('--launcherWidth', `${launcherWidth}px`);

    let appsPerRow = settings[SETTINGS.AppsPerRow];
    document.documentElement.style.setProperty('--appsPerRow', appsPerRow);

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
