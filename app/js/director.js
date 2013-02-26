angular.module('director', [ 'scene', 'dream.scenes', 'dream.objects', 'dream.events', 'threeView', 'three.helpers', 'controls'])

    .factory('director.Director', ['$rootScope', function($rootScope) {
        var Director = function Director(view) {
            this.views = {};
            this.controls = {};
            this.gameEvents = [];
            this.clock = new THREE.Clock();
            this.addView(view);
            this.tick = angular.bind(this, this.tick);

            this.registerEvents();

            return this;
        };

        Director.prototype.getView = function getView(name) {
            return this.views[name];
        };

        Director.prototype.addView = function addView(view) {
            if (view) {
                this.views[view.name] = view;
                return true;
            }
            return false;
        };

        /**
         * Initialize and add controls for a view/camera so they may be swapped
         * at a later time (free-float versus gravity, for example).
         *
         * @param viewName
         * @param Controls
         * @returns {Object} initialized controls
         */
        Director.prototype.addControlsForView = function addControlsForView(viewName, Controls) {
            if (!this.views[viewName]) return false;
            var controls = new Controls(this.views[viewName].camera);
            this.controls[viewName] = controls;
            return controls;
        };

        // TODO: refactor to each individual scene for its own geometry.
        Director.prototype.addGameEvent = function addGameEvent(fn, timeout, isInterval) {
            this.gameEvents.push(fn);
        };

        Director.prototype.updateGameEvents = function updateGameEvents() {
            for (var event in this.gameEvents) {
                this.gameEvents[event].apply(this, arguments);
            }
        };

        Director.prototype.registerEvents = function registerEvents() {
            // listen for any render events to animate associated scene
            $rootScope.$on('render', this.tick);

            window.addEventListener('resize', this.onWindowResize, false);
        };

        Director.prototype.onWindowResize = function onWindowResize() {
            for (var view in this.views) {
                this.views[view].handleResize();
                if (this.controls[view] && this.controls[view].handleResize) {
                    this.controls[view].handleResize();
                }
            }
        };

        Director.prototype.tick = function tick(event, view) {
            var delta = this.clock.getDelta();

            // animate the view's associated scene and camera
            // TODO: refactor to track scenes, also
            if (this.views[view.name] && this.views[view.name].sceneCoordinator) {
                this.updateGameEvents(view.name);
                this.views[view.name].sceneCoordinator.animate(this.views[view.name].renderer, this.clock);
                if (this.controls[view.name]) this.controls[view.name].update(delta);
            }
        };

        // support for both vernaculars
        Director.prototype.update = Director.prototype.tick;

        // TODO: figure out purpose of this.  services are confusing me a bit here,
        // since we're not supposed to instantiate any state in the
        // controllers according to the docs (wtf?)
        // maybe use direct to set up scene changes or load geometry?
        Director.prototype.direct = function direct(scene, init) {
            return init.call(this, scene.threeScene);
        };

        return Director;
    }])

    .factory('director.DreamDirector', [
      '$rootScope',
      'director.Director',
      'dream.objects.makeDreamAtom',
      'three.helpers.makeRandomVector',
      function($rootScope, Director, makeDreamAtom, makeRandomVector) {
        function DreamDirector() {
            Director.call(this);
            return this;
        };

        DreamDirector.prototype = Object.create(Director.prototype);

        DreamDirector.prototype.malleable = {};

        // TODO: if ever do collision detection, change to bounding sphere
        DreamDirector.prototype.addCheckDreamProximity = function(dream) {
            this.addGameEvent(angular.bind(this, function(view) {
                view = this.views[view];
                // as close as 50 gl_units, enter the dream
                if (view.camera.position.distanceTo(dream.position) < 200) {
                    $rootScope.$broadcast('dreamProximity', dream);
                }
            }));
        };

        DreamDirector.prototype.makeDreamsFor = function(dreams, view) {
            var sceneCoordinator = view.sceneCoordinator;
            var coordClamp = {
                x: 5000,
                y: 3000,
                z: 5000
            };
            for (var i in dreams) {
                var dreamAtom = makeDreamAtom(0, 0, 0, sceneCoordinator.getScene(), view.camera);
                dreamAtom.position = makeRandomVector(coordClamp, view.camera.position);
                dreamAtom.meta.title = dreams[i];
                this.addCheckDreamProximity(dreamAtom);
                sceneCoordinator.add(dreamAtom);
            }
        };

        return DreamDirector;
    }])

    .directive('dreamContent', [ '$rootScope', function($rootScope) {
        return function(scope, element, attrs) {
            scope.$on('dreamProximity', function(event, dream) {
                if (!scope.content.show) {
                    scope.content.show = true;
                    scope.content.url = 'assets/dreams/' + dream.meta.title + '.html';
                    scope.content.title = dream.meta.title;
                    element.addClass('animate-slide');
                }
            });
        };
    }])

    /**
     * This is explicitly a service because it returns a single instance.
     * There can only be one director on set.
     */
    .factory('dreamDirector', [
      'director.Director',
      'director.DreamDirector',
      'threeView.ThreeView',
      'dream.scenes.Circle',
      'dream.events.makeRainBoxes',
      'controls.DragPan',
      'controls.FreeFloat',
      'effects.effects',
      '$timeout',
      function(Director, DreamDirector, ThreeView, Circle, makeRainBoxes, DragPan, FreeFloat, effects, $timeout) {
        var dreamDirector = new DreamDirector();

        var circleSC = new Circle();

        // register the initialized scene with a view port.
        var threeView = new ThreeView('main', circleSC);

        // register view port and initialize controls for it
        dreamDirector.addView(threeView);
        var mainCamera = threeView.camera;
        var controls = dreamDirector.addControlsForView('main', FreeFloat);

        controls.movementSpeed = 1000;
        controls.lookSpeed = 0.125;
        controls.lookVertical = true;
        controls.constrainVertical = true;
        controls.verticalMin = 1.1;
        controls.verticalMax = 2.2;

        var stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        stats.domElement.style.right = '0px';

        //threeView.domElement.append(stats.domElement);
        threeView.renderer.setClearColorHex(0x000000, 1.0);
        threeView.renderer.clear();

        circleSC.add(mainCamera);
        mainCamera.position.z = 300;
        dreamDirector.malleable.rainCubeSize = { x: 50, y: 50, z: 50 };

        // create boxes every .5 seconds within a zone of mainCamera.position
        var boxesPromise = makeRainBoxes(circleSC.getScene(), dreamDirector.malleable.rainCubeSize, mainCamera.position, 500);

        // TODO: find a better way to check the scene status
        // for whether we're animating or not, and store intervals
        // taking place.

        return dreamDirector;
    }])
;