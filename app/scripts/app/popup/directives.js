/*
 * AngularJS integration with the HTML5 Sortable jQuery Plugin
 * https://github.com/voidberg/html5sortable
 *
 * Copyright 2013, Alexandru Badiu <andu@ctrlz.ro>
 *
 * Thanks to the following contributors: samantp.
 *
 * Released under the MIT license.
 */
var launcherDirectives = angular.module('launcher.directives');

launcherDirectives.directive('htmlSortable', [
  '$timeout',
  function ($timeout) {
    return {
      require: '?ngModel',
      link: function (scope, element, attrs, ngModel) {
        var opts, model;

        opts = angular.extend({}, scope.$eval(attrs.htmlSortable));
        if (ngModel) {
          model = attrs.ngModel;
          ngModel.$render = function () {
            $timeout(function () {
              element.sortable('reload');
            }, 50);
          };

          scope.$watch(model, function () {
            $timeout(function () {
              element.sortable('reload');
            }, 50);
          }, true);
        }

        // Create sortable
        $(element).sortable(opts);
        if (model) {
          $(element).sortable().bind('sortupdate', function (e, data) {
            var $source = data.startparent.attr('ng-model');
            var $dest = data.endparent.attr('ng-model');

            var $start = data.oldindex;
            var $end = data.item.index();

            scope.$apply(function () {
              if ($source == $dest) {
                scope[model].splice($end, 0, scope[model].splice($start, 1)[0]);
              } else {
                var $item = scope[$source][$start];

                scope[$source].splice($start, 1);
                scope[$dest].splice($end, 0, $item);
              }
            });
          });
        }
      }
    };
  }
]);

launcherDirectives
.directive('focusMe', [ '$timeout', function ($timeout) {
  return {
    scope: {
      trigger: '@focusMe'
    },
    link: function (scope, element) {
      scope.$watch('trigger', function (value) {
        if (value === 'true') {
          $timeout(function () {
            element[0].focus();
          });
        }
      });
    }
  };
}])
.directive('rightClick', [
  '$parse',
  function ($parse) {
    return function (scope, element, attrs) {
      var fn = $parse(attrs.rightClick);
      element.bind('mousedown', function (event) {

        if (event.which != 3) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        scope.$apply(function () {
          fn(scope, {
            $event: event
          });
        });

        return false;

      })
      .bind('contextmenu', function (event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      });;
    };
  }]);
