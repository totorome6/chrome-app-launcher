'use strict';

(function (window) {

    class EventEmitter {

        constructor () {
            this.listeners = {};
        }

        on (evntName, listener) {
            let eListeners = this.listeners[evntName];
            if (!eListeners) {
                eListeners = this.listeners[evntName] = [];
            }

            eListeners.push(listener);
        }

        emit (evntName, ...args) {
            let eListeners = this.listeners[evntName];
            if (!eListeners) {
                return;
            }

            eListeners
                .forEach(listener => listener.apply(this, args));
        }
    }

    window.common.EventEmitter = EventEmitter;

})(window);
