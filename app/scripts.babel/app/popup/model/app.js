'use strict';

const APP_TYPE = {
    Chrome: 'chrome',
    Custom: 'custom'
};

export default class AppEntry {

    get id () {
        return this.info.id;
    }

    constructor (type, info) {
        this.type = type;
        this.info = info;
    }

}
