import { EventEmitter } from 'events';

export const APPS_EVENT = {
    ADDED: 'add',
    REMOVED: 'removed',
    REORDERED: 'reordered',
    FILTERED: 'filtered'
};

export class AppsCollection extends EventEmitter {

    constructor (appsList) {
        super();

        this.apps = appsList.slice();
        this.filtered = this.apps;

        this.mapById = this.apps.reduce((result, app) => {
            result[app.id] = app;
            return result;
        },
        {});
    }

    get collection () {
        return this.apps.slice();
    }

    display () {
        return this.filtered;
    }

    add (app) {
        this.apps.push(app);
        this.mapById[app.id] = app;
        this.emit(APPS_EVENT.ADDED, app);
    }

    remove (app) {
        let idx = this.apps.indexOf(app);
        this.apps.splice(idx, 1);
        delete this.mapById[app.id];
        this.emit(APPS_EVENT.REMOVED, app);
    }

    filter (term) {
        if (!term) {
            this.filtered = this.collection;
            this.filterTerm = null;
            this.emit(APPS_EVENT.FILTERED);
            return;
        }

        this.filterTerm = term = term.toUpperCase();

        let filtered = this.apps
            .filter(x => x.name.toUpperCase().indexOf(this.filterTerm) !== -1);

        let orderMap = filtered.map((x, i) => ({ index: i, value: x.name.toUpperCase() }));
        orderMap.sort((a, b) => {
            let aIdx = a.value.indexOf(term),
                bIdx = b.value.indexOf(term);

            if (aIdx === bIdx) {
                return a.value > b.value;
            }

            return aIdx > bIdx;
        });

        this.filtered = orderMap.map(el => filtered[el.index]);

        this.emit(APPS_EVENT.FILTERED);
    }

    reorder (app, toIndex) {
        if (this.filterTerm) {
            throw new Error('Cannot reorder filtered apps collection.');
        }

        if (!isValidIndex(toIndex, this.apps.length)) {
            throw new Error(`Invalid app reorder toIndex: ${ toIndex }`);
        }

        let arr = this.apps;
        let fromIndex = arr.indexOf(app);
        if (fromIndex === toIndex) {
            return;
        }

        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, app);

        this.emit(APPS_EVENT.REORDERED, app, fromIndex, toIndex);
    }

    getByIndex(idx) {
        return this.apps[idx];
    }

    getIndexById (appId) {
        return this.filtered.map(app => app.id).indexOf(appId);
    }

    getById (appId) {
        return this.mapById[appId];
    }

    get length () {
        return this.apps.length;
    }

}

function isValidIndex(idx, collectionLength) {
    return idx !== void 0 &&
    idx !== null &&
    idx >= 0 &&
    idx < collectionLength;
}
