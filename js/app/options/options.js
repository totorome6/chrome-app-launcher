var app = angular.module('options', []);

app.config(function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
});

app.controller("OptionsController", function($scope){
   
    
    
});