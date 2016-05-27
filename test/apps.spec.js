import { AppsCollection } from '../app/scripts/popup/model';
import chai from 'chai';

chai.should();

describe('AppsCollection', function () {

    let apps;

    const APPS_LIST = [
        { id: 'a', name: 'a' },
        { id: 'b', name: 'b' },
        { id: 'c', name: 'c' },
        { id: 'd', name: 'd' }
    ];

    beforeEach(function () {
        apps = new AppsCollection(APPS_LIST);
    });

    describe('when reordering', function () {

        APPS_LIST.forEach(function (app, from) {

            APPS_LIST.forEach((targetApp, to) => {

                describe('an app on index ' + from + ' moved to ' + to, () => {
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
                        apps.collection.every(function (item) {
                            return apps.collection.indexOf(item) !== -1;
                        });
                    });
                });

            });

        });
    });

});
