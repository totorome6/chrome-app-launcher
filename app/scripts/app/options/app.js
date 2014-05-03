var app = angular.module('options', ['launcher.common']);

app.config(function ($compileProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
});

app.controller('OptionsController',
               [
                 '$scope', 
                 '$timeout', 
                 'settingsService',
                 function ($scope, $timeout, settingsService) {

                   settingsService.get().then(function(settings){
                     $scope.settings = settings;
                   });

                   $scope.save = function(){
                     settingsService
                     .set($scope.settings)
                     .then(function(){
                       $scope.saved = true;

                       $timeout(function() {
                         $scope.saved = false;
                       }, 1000);
                     });
                   };

                   $scope.saved = false;
                 }
               ]);
