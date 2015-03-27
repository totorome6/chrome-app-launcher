(function(){

  angular.module('launcher.directives')
  .directive('htmlSortable', ['$timeout', htmlSortable])
  .directive('focusMe', [ '$timeout', focusMe ])
  .directive('rightClick', ['$parse', rightClick]);

  function htmlSortable($timeout) {
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

  function focusMe($timeout) {
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
  }

  function rightClick($parse) {
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
  }
}());
