'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('MyApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'dat.GUI', 'director', 'voxel']);

myApp.config(['$routeProvider', function($routeProvider) {
        console.log('configuring the dream.');
        $routeProvider.when('/dream', { templateUrl: 'partials/dream.html', controller: 'start' });
        $routeProvider.when('/pixelated', { templateUrl: 'partials/pixelated.html', controller: 'pixelated' });
        $routeProvider.when('/add', { templateUrl: 'partials/add.html', controller: 'add' });
        $routeProvider.otherwise({ redirectTo: '/dream' });
    }])

    .controller('start', ['$scope', '$http', 'dreamDirector', function($scope, $http, dreamDirector) {
        $scope.threeView = dreamDirector.getView('main');
        $scope.content = {
            show: false,
            quote: '',
            title: ''
        };
        $scope.gui = {
            obj: {},
            addAll: function(gui) {
                var fol;
                // TODO: allow user to modify settings like rain rate, gravity, etc.
                for (var group in dreamDirector.malleable) {
                    fol = gui.addFolder(group);
                    fol.add(dreamDirector.malleable[group], 'x');
                    fol.add(dreamDirector.malleable[group], 'y');
                    fol.add(dreamDirector.malleable[group], 'z');
                }

                // open last folder created (most bottom in controls)
                fol.open()
            }
        };
        $http.get('assets/dreams/names.json')
            .success(function(data, status, headers, config) {
                $scope.dreamTitles = angular.fromJson(data);
                dreamDirector.makeDreamsFor($scope.dreamTitles, $scope.threeView);
            })
            .error(function(data, status, headers, config) {
                console.error('there are no dreams. this is what happens when you believe dreams can come true.');
            });
    }])

    .controller('pixelated', ['$scope', 'voxel.game', function($scope, game) {
        $scope.game = game;
    }])

    .controller('add', ['$scope', function($scope) {
        // pretend there's a backend to post to here.
    }])
;
