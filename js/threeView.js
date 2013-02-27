'use strict';

var threeViewModule = angular.module('threeView', [ 'dat.GUI', 'voxel' ])

    .config(['$provide', function($provide) {
        var WIDTH = 800
          , HEIGHT = 800;

        $provide.value('WIDTH', WIDTH);
        $provide.value('HEIGHT', HEIGHT);
        $provide.value('VIEW_ANGLE', 45);
        $provide.value('ASPECT', WIDTH / HEIGHT);
        $provide.value('NEAR', 0.1);
        $provide.value('FAR', 20000);
    }])

    .factory('threeView.ThreeView', ['$injector', '$rootScope', function($injector, $rootScope) {
        var ThreeView = function(name, sceneCoordinator) {

            // threeViews have three basic components:
            // a WebGL renderer, cameras, and a scene
            this.createStats = true;
            this.renderCount = 0;
            this.renderer = new THREE.WebGLRenderer();
            // TODO: move a createCamera method to the director
            this.camera = new THREE.PerspectiveCamera(
                $injector.get('VIEW_ANGLE'),
                $injector.get('ASPECT'),
                $injector.get('NEAR'),
                $injector.get('FAR')
            );
            this.name = name;
            this.sceneCoordinator = sceneCoordinator;
            this.activeAnimationFrame = null;
            if (this.createStats) {
                this.stats = new Stats();
                this.stats.domElement.style.position = 'absolute';
                this.stats.domElement.style.bottom = '0px';
                this.stats.domElement.style.right = '0px';
            }

            // TODO: create wrapping 'canvas-frame' div for threeView.port
            this.domElement = this.renderer.domElement;

            this.renderer.setSize(
                $injector.get('WIDTH'),
                $injector.get('HEIGHT')
            );

            // bind render to ThreeView instance so
            // requestAnimationFrame calls of this.render
            // will have the proper context.
            this.render = angular.bind(this, this.render);

            return this;
        };

        ThreeView.prototype.render = function render() {
            // let angular know we're about to render a scene
            $rootScope.$emit('render', this);
            this.activeAnimationFrame = requestAnimationFrame(this.render);
            this.update();
            this.renderer.render(this.sceneCoordinator.getScene(), this.camera);
        };

        ThreeView.prototype.update = function update() {
            this.stats.update();
        };

        ThreeView.prototype.setSceneCoordinator = function setSceneCoordinator(sceneCoordinator) {
            this.sceneCoordinator = sceneCoordinator;
            // TODO: destroy scene?
        };

        ThreeView.prototype.handleResize = function handleResize() {
            var width = window.innerWidth - 140
              , height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            // TODO: find more clever way to change canvas size be dynamic (define size in a wrapping element?)
            this.renderer.setSize( window.innerWidth - 140, window.innerHeight );
        };

        ThreeView.prototype.destroy = function destroy(scope) {
            cancelAnimationFrame(this.activeAnimationFrame);
        };

        return ThreeView;
    }])

    .directive('threeViewPort', ['voxel.pointerLock', function(pointerLock) {
        return function(scope, element, attrs) {
            if (Detector && !Detector.webgl) {
                Detector.addGetWebGLMessage();
                return element.innerHTML = "";
            }

            scope.$on('$destroy', function() {
                scope.threeView.destroy();
                scope.threeView.stats.end();
            });
            scope.threeView.handleResize();
            element.append(scope.threeView.domElement);

            if (scope.threeView.stats) {
                element.append(scope.threeView.stats.domElement);
                scope.threeView.stats.begin();
            }

            pointerLock(scope.threeView.renderer.domElement);

            scope.threeView.render();
        };
    }])
;

