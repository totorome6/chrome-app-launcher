'use strict';

(function (window) {
    window.kaka = 'kaka!';
    const EventEmitter = window.common.EventEmitter;

    const APPS_EVENT = {
        ADDED: 'add',
        REMOVED: 'removed',
        REORDERED: 'reordered'
    };

    class AppsCollection extends EventEmitter {

        constructor (appsList) {
            super();

            this.collection = appsList.slice();

            this.mapById = this.collection
                .reduce((result, app) => {
                    result[app.id] = app;
                    return result;
                },
                {});
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

        reorder (app, toIndex) {
            let arr = this.collection;
            let fromIndex = arr.indexOf(app);
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, app);

            //arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0]);

            console.log(app.name, `${fromIndex} -> ${toIndex}`);

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
