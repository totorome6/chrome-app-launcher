'use strict';

(function (window) {

    class EventEmitter {

        constructor () {
            this.listeners = {};
        }

        on (evntName, listener) {
            let eListeners = this.listeners[evntName];
            if (!eListeners) {
                this.listeners[evntName] = [];
            }

            this.listeners[evntName] = listener;
        }

        emit (evntName, ...args) {
            let eListeners = this.listeners[evntName];
            if (!eListeners) {
                return;
            }

            this.listeners.forEach(listener => listener.apply(this, args));
        }
    }

    window.common.EventEmitter = EventEmitter;

})(window);
