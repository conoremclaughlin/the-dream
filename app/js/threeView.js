'use strict';

var threeViewModule = angular.module('threeView', [ 'dat.GUI' ])

    .config(['$provide', function($provide) {
        var WIDTH = 800
          , HEIGHT = 800;
        console.log('$provide: ', $provide);
        $provide.value('WIDTH', WIDTH);
        $provide.value('HEIGHT', HEIGHT);
        $provide.value('VIEW_ANGLE', 45);
        $provide.value('ASPECT', WIDTH / HEIGHT);
        $provide.value('NEAR', 0.1);
        $provide.value('FAR', 10000);
    }])

    .factory('ThreeView', ['$injector', function($injector) {
        var ThreeView = function(sceneCoordinator) {

            // threeViews have three basic components:
            // a WebGL renderer, cameras, and a scene
            this.renderCount = 0;
            this.renderer = new THREE.WebGLRenderer();
            this.camera = new THREE.PerspectiveCamera(
                $injector.get('VIEW_ANGLE'),
                $injector.get('ASPECT'),
                $injector.get('NEAR'),
                $injector.get('FAR')
            );
            this.sceneCoordinator = sceneCoordinator;
            this.activeAnimationFrames = [];

            this.renderer.setSize(
                $injector.get('WIDTH'),
                $injector.get('HEIGHT')
            );

            // bind render to ThreeView instance so
            // requestAnimationFrame calls of this.render
            // will have the proper context.
            this.render = angular.bind(this, this.render);
            console.log('bound this.render');

            return this;
        };

        ThreeView.prototype.render = function render() {
            // need to do a function declaration for render
            // otherwise you get into funky binding for this.
            this.activeAnimationFrames.push(requestAnimationFrame(this.render));
            this.sceneCoordinator.animate();
            this.renderer.render(this.sceneCoordinator.getScene(), this.camera);
        };

        ThreeView.prototype.setSceneCoordinator = function setSceneCoordinator(sceneCoordinator) {
            this.sceneCoordinator = sceneCoordinator;
            // TODO: destroy scene?
        };

        ThreeView.prototype.destroy = function destroy(scope) {
            this.activeAnimationFrames.forEach(function(frame) {
                cancelAnimationFrame(frame);
            });
        };

        return ThreeView;
    }])

    .directive('threeViewPort', function() {
        return function(scope, element, attrs) {
            scope.$on('$destroy', function() {
                scope.threeView.destroy();
            });
            element.append(scope.threeView.renderer.domElement);
            scope.threeView.render();
        };
    })
;

