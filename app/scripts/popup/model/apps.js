import { EventEmitter } from 'events';

export const APPS_EVENT = {
    ADDED: 'add',
    REMOVED: 'removed',
    REORDERED: 'reordered'
};

export class AppsCollection extends EventEmitter {

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
        if (!isValidIndex(toIndex, this.collection.length)) {
            throw new Error(`Invalid app reorder toIndex: ${ toIndex }`);
        }

        let arr = this.collection;
        let fromIndex = arr.indexOf(app);
        if (fromIndex === toIndex) {
            return;
        }

        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, app);

        this.emit(APPS_EVENT.REORDERED, app, fromIndex, toIndex);
    }

    getByIndex(idx) {
        return this.collection[idx];
    }

    getIndexById (appId) {
        return this.collection
        .map(app => app.id)
        .indexOf(appId);
    }

    getById (appId) {
        return this.mapById[appId];
    }

    get length () {
        return this.collection.length;
    }

    list () {
        return this.collection.map(x => x);
    }


}

function isValidIndex(idx, collectionLength) {
    return idx !== void 0 &&
    idx !== null &&
    idx >= 0 &&
    idx < collectionLength;
}
