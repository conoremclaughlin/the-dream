angular.module('director', [ 'scene', 'dream.scenes', 'dream.objects', 'dream.events', 'threeView', 'three.helpers', 'controls'])

    .factory('director.Director', ['$rootScope', function($rootScope) {
        var Director = function Director(view) {
            this.views = {};
            this.controls = {};
            this.gameEvents = [];
            this.gameEventsDeferred = [];
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

            // TODO: find a better way to check the scene status
            // for whether we're animating or not, and store intervals
            // taking place.

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

        /**
         * TODO: if ever do collision detection, change to bounding sphere
         * TODO: write clock class to defer event handling
         * for a certain period of time after firing
         */
        DreamDirector.prototype.addCheckDreamProximity = function(dream) {
            var clock = new THREE.Clock(false);
            this.addGameEvent(angular.bind(this, function(view) {
                view = this.views[view];

                // if the event has already been broadcast within the last second,
                // do nothing

                if (clock.running) {
                    if (clock.getElapsedTime() > 1) {
                        clock.stop();
                    } else {
                        return false;
                    }
                }

                // if within 200 gl_units, bring up the dream's data
                if (view.camera.position.distanceTo(dream.position) < 200) {
                    clock.start();
                    $rootScope.$broadcast('dreamProximity', dream);
                }
                return true;
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

        /**
         * Ghettofabulous custom setIntervals that should only be called while animating.
         * TODO: find better way to manage animation intervals other than
         * the slight equivalent of a spin-lock.
         *
         * @param fn
         * @param interval
         */
        DreamDirector.prototype.setInterval = function(fn, interval) {
            // THREE.Clock returns elapsed time in seconds, need to compensate
            var start = this.clock.getElapsedTime()
              , stop = 0
              , interval = interval / 1000;

            var event = angular.bind(this, function() {
                stop = this.clock.getElapsedTime();
                if ((stop - start) > interval) {
                    start = stop;
                    setTimeout(fn, 0); // add async call to JS event queue
                }
            });

            this.addGameEvent(event);
        };

        return DreamDirector;
    }])

    .directive('dreamContent', [ '$rootScope', '$http', function($rootScope, $http) {
        return function(scope, element, attrs) {
            scope.$on('dreamProximity', function(event, dream) {
                if (!scope.content.show) {
                    $http.get('assets/dreams/' + dream.meta.title + '.html')
                        .success(function(data, status, headers, config) {
                            scope.content.show = true;
                            scope.content.quote = data;
                            scope.content.title = dream.meta.title;
                            element.addClass('animate-slide');
                         })
                         .error(function(data, status, headers, config) {
                             console.error('failed to read the ' + dream.meta.title + ' dream.');
                         });
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
        var rain = makeRainBoxes(circleSC.getScene(), dreamDirector.malleable.rainCubeSize, mainCamera.position);
        dreamDirector.setInterval(rain, 500);

        return dreamDirector;
    }])
;