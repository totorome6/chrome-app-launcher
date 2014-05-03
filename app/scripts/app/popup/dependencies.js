
angular.module('launcher.common', []);
angular.module('launcher.directives', []);
angular.module('launcher.services', []);

angular.module('launcher', [
    'launcher.services',
    'launcher.directives',
    'launcher.common'
]);
