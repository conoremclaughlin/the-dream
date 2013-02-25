'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('MyApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'dat.GUI', 'director', 'voxel']);

myApp.config(['$routeProvider', function($routeProvider) {
        console.log('configuring the main application.');
        $routeProvider.when('/dream', { templateUrl: 'partials/dream.html', controller: 'start' });
        $routeProvider.when('/pixelated', { templateUrl: 'partials/pixelated.html', controller: 'pixelated' });
        $routeProvider.when('/add', { templateUrl: 'partials/add.html', controller: 'add' });
        $routeProvider.otherwise({ redirectTo: '/dream' });
    }])
    .controller('start', ['$scope', 'dreamDirector', function($scope, dreamDirector) {

        $scope.threeView = dreamDirector.getView('main');
        $scope.gui = {
            obj: {},
            addAll: function(gui) {
                // TODO
            }
        };
    }])
    .controller('pixelated', ['$scope', 'voxel.game', function($scope, game) {
        // TODO: don't even need this v just a placeholder
        $scope.game = game;
    }])
    .controller('add', ['$scope', function($scope) {
        console.log('you should be able to post here.');
    }]);
;
