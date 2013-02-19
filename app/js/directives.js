'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('totalDreams', ['totalDreams', function(totalDreams) {
    return function(scope, element, attrs) {
      element.text(totalDreams);
    };
  }]);
