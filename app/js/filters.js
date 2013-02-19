'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['totalDreams', function(totalDreams) {
    return function(text) {
      return String(text).replace(/\%totalDreams\%/mg, totalDreams);
    };
  }]);
