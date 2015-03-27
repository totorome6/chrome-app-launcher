(function(){
  angular.module('launcher')
  .config([ '$compileProvider', configureImgSrcSanitizationWhitelist]);

  function configureImgSrcSanitizationWhitelist($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
  }
}());
