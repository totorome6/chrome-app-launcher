(function (window) {
    'use strict';

    describe('AppsCollection', function () {

        var AppsCollection = window.popup.model.AppsCollection,
            apps;

        var APPS_LIST = [
            { id: 'a', name: 'a' },
            { id: 'b', name: 'b' },
            { id: 'c', name: 'c' },
            { id: 'd', name: 'd' }
        ];

        beforeEach(function () {
            apps = new AppsCollection(APPS_LIST);
        });

        describe('when reordering', function () {

            var reorderedApp;

            APPS_LIST.forEach(function (app, from) {

                APPS_LIST.forEach(function (targetApp, to) {

                    describe('an app on index ' + from + ' moved to ' + to, function () {
                        beforeEach(function () {
                            apps.reorder(app, to);
                        });

                        it('should be reordered properly', function () {
                            apps.collection.indexOf(app).should.equal(to);
                        });

                        it('should not change number of elements in the list', function () {
                            apps.length.should.equal(APPS_LIST.length);
                        });

                        it('should not change the apps in the list', function () {
                            apps.collection.every(function (app) {
                                return apps.collection.indexOf(app) !== -1;
                            });
                        });
                    });

                });

            });
        });

    });
})(window);
