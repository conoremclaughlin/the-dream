angular.module('director', [ 'scene', 'dreamScenes', 'threeView', 'controls'])

    // TODO: necessary? coordinator service for cameras/views and scenes?
    .factory('director.Director', ['$rootScope', function($rootScope) {
        var Director = function Director(viewName, view) {
            this.views = {};
            this.controls = {};
            this.clock = new THREE.Clock();
            this.addView(viewName, view);
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
            // stats.update();
            // TODO: need multiple calls as execution time changes?
            var delta = this.clock.getDelta();

            // animate the view's associated scene and camera
            if (this.views[view.name] && this.views[view.name].sceneCoordinator) {
                this.views[view.name].sceneCoordinator.animate();
                if (this.controls[view.name]) this.controls[view.name].update(delta);
            }
        };

        // add support for both vernaculars
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

    .factory('director.DreamDirector', ['director.Director', function(Director) {
        var DreamDirector = function DreamDirector() {
            return this;
        };

        DreamDirector.prototype = Object.create(Director.prototype);

        return DreamDirector;
    }])

    /**
     * This is explicitly a service because it returns a single instance.
     * There can only be one director on set.
     */
    .factory('dreamDirector', [
      'director.Director',
      'director.DreamDirector',
      'threeView.ThreeView',
      'dreamScenes.Circle',
      'controls.DragPan',
      'controls.FreeFloat',
      'effects.effects',
      '$timeout',
      function(Director, DreamDirector, ThreeView, Circle, DragPan, FreeFloat, effects, $timeout) {
        var dreamDirector = new Director();

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
        //controls.lookSpeed = 100;

        // TODO: push starting positions into initialization
        // method for the scene.
        mainCamera.position.y = circleSC.getY( circleSC.worldHalfWidth, circleSC.worldHalfDepth ) * 100 + 100;

        // var stats = new Stats();
        // stats.domElement.style.position = 'absolute';
        // stats.domElement.style.top = '0px';

        // container.appendChild( stats.domElement );

        threeView.renderer.setClearColorHex(0x000000, 1.0);
        threeView.renderer.clear();

        effects.setScene( circleSC.getScene(), mainCamera );
        addDream();


        dreamDirector.addView('dream', threeView);

        // add camera to the scene
        circleSC.add(mainCamera);

        // lock it like it's hot
        // TODO: move to directive mayhaps?

        //mainCamera.position.z = 300;

        // TODO: find a place for stuff like this....
        // create boxes every 3 seconds
        var boxesPromise = setInterval(rainBoxes, 3000);
        var camera = mainCamera;
        var rainDistance = 1000;
        var rainHeight = 500;
        var maxLifeTime = 15;


        function addDream() {
            effects.addLensFlare( 0x33CDC7, 200, 0, 0 );
            effects.addLensFlare( 0xFFFFFF, 0, 0, 0) ;
        };

        // TODO: find a better way to check the scene status
        // for whether we're animating or not, and store intervals
        // taking place.
        function rainBoxes() {
            var box = new Physijs.BoxMesh(
                new THREE.CubeGeometry( 50, 50, 50 ),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: Math.random()
                })
            );

            box.position = new THREE.Vector3();
            box.position.x = Math.floor( (Math.random() * rainDistance) + camera.position.x);
            box.position.y = Math.floor( (Math.random() * rainHeight) + camera.position.y);
            box.position.z = Math.floor( (Math.random() * rainDistance) + camera.position.z);
            circleSC.add(box);

            // wait 15 seconds before making the box disappear
            $timeout(function() {
                circleSC.remove(box);
            }, 15000);
        };

        return dreamDirector;
    }])
;