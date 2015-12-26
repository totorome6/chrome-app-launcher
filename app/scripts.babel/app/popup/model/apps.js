'use strict';

(function (window) {

    const EventEmitter = window.common.EventEmitter;

    const APPS_EVENT = {
        ADDED: 'add',
        REMOVED: 'removed',
        REORDERED: 'reordered'
    };

    class AppsCollection extends EventEmitter {

        constructor (appsList) {
            super();
            
            this.collection = appsList;

            this.mapById = appsList.reduce((result, app) => {
                result[app.id] = app;
                return result;
            });
        }

        add (app) {
            this.collection.push(app);
            this.mapById[app.id] = app;
            this.emit(APPS_EVENT.ADDED, app);
        }

        remove (app) {
            let idx = this.collection.indexOf(app);
            this.collection.splice(idx, 1);
            delete this.mapById[app.id];
            this.emit(APPS_EVENT.REMOVED, app);
        }

        reorder (app, newIndex) {
            let idx = this.collection.indexOf(app);
            this.collection.splice(idx, 1);
            this.collection.splice(newIndex, 0, app);
            this.emit(APPS_EVENT.REORDERED);
        }

        getByIndex(idx) {
            return this.collection[idx];
        }

        getIndexById (appId) {
            return this.collection
                .map(app => app.id)
                .indexOf(appId);
        }

        get length () {
            return this.collection.length;
        }

        list () {
            return this.collection.map(x => x);
        }

    }

    window.popup.model.AppsCollection = AppsCollection;
    window.popup.model.APPS_EVENT = APPS_EVENT;

})(window);
