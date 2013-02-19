'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('MyApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'dream', 'Physijs', 'dat.GUI']);

myApp.config(['$routeProvider', function($routeProvider) {
        console.log('configuring the main application.');
        $routeProvider.when('/dream', { templateUrl: 'partials/dream.html', controller: 'start' });
        $routeProvider.when('/add', { templateUrl: 'partials/add.html', controller: 'add' });
        $routeProvider.otherwise({ redirectTo: '/dream' });
    }])
    .controller('start', ['$scope', 'dreamView', function($scope, dreamView) {
        $scope.threeView = dreamView;
        $scope.gui = {
            obj: {},
            add: function(gui) {
                // TODO
            }
        };
    }])
    .controller('add', ['$scope', function($scope) {
        console.log('you should be able to post here.');
    }]);

var dream = angular.module('dream', []);

dream.config(['$provide', function($provide) {
    // TODO: read all dreams
    $provide.value('totalDreams', 3);
}]);

dream.directive('threeViewPort', ['dreamView', function(dreamView) {
    return function(scope, element, attrs) {
        scope.$on('$destroy', function() {
            scope.threeView.destroy();
        });
        element.append(scope.threeView.renderer.domElement);
        scope.threeView.render();
    };
}]);

dream.factory('dreamView', ['physijs', 'datGui', function(physijs, datGui) {
    // set the scene size
    var WIDTH = 800
      , HEIGHT = 800
      , VIEW_ANGLE = 45
      , ASPECT = WIDTH / HEIGHT
      , NEAR = 0.1
      , FAR = 10000;

    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    var scene = new physijs.Scene();
    var activeAnimationFrames = [];

    // add the camera to the scene
    scene.add(camera);

    // the camera starts at 0,0,0
    // so pull it back
    camera.position.z = 300;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    var sphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xCC0000
    });

    // set up the sphere vars
    var radius = 50
      , segments = 16
      , rings = 16;

    // create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, segments, rings),
        sphereMaterial
    );

    // add the sphere to the scene
    scene.add(sphere);

    // create a point light
    var pointLight = new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);

    // Box
    var box = new Physijs.BoxMesh(
        new THREE.CubeGeometry( 5, 5, 5 ),
        new THREE.MeshBasicMaterial({ color: 0x888888 })
    );
    scene.add( box );

    function animate() {
        scene.simulate();
    };

    // need to do a function declaration for render
    // otherwise you get into funky binding for this.
    function render() {
        activeAnimationFrames.push(requestAnimationFrame(render));
        animate();
        renderer.render(scene, camera);
    };

    return {
        renderer: renderer,
        scene: scene,
        camera: camera,
        activeAnimationFrames: activeAnimationFrames,
        render: render,
        destroy: function(scope) {
            this.activeAnimationFrames.forEach(function(frame) {
                cancelAnimationFrame(frame);
            });
        }
    };
}]);

dream.run(function() {
    console.log('running the dream!');
});
