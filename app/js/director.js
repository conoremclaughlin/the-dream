angular.module('director', [ 'scene', 'dreamGeometry', 'threeView'])

    // TODO: necessary? coordinator service for cameras/views and scenes?
    .factory('Director', function() {
        var Director = function Director(viewName, view) {
            this.views = {};
            this.addView(viewName, view);
            return this;
        };

        Director.prototype.getView = function getView(name) {
            return this.views[name];
        };

        Director.prototype.addView = function addView(name, view) {
            if (name && view) {
                this.views[name] = view;
                return true;
            }
            return false;
        };

        // TODO: figure out purpose of this.  services are confusing me a bit here,
        // since we're not supposed to instantiate any state in the
        // controllers according to the docs (wtf?)
        // maybe use direct to set up scene changes or load geometry?
        Director.prototype.direct = function direct(scene, init) {
            return init.call(this, scene.threeScene);
        };

        return Director;
    })

    /**
     * This is explicitly a service because it returns a single instance.
     * There can only be one director on set.
     */
    .factory('dreamDirector', ['Director', 'SceneCoordinator', 'ThreeView', 'circle', function(Director, SceneCoordinator, ThreeView, circle) {
        // initialize a rendering view, a director, and a scene.
        var dreamDirector = new Director();
        var circleSC = new SceneCoordinator('circle', { physijs: true });
        var threeView = new ThreeView(circleSC);

        dreamDirector.addView('dream', threeView);

        // add a camera
        circleSC.add(threeView.camera);
        threeView.camera.position.z = 300;

        // initialize the geometry in the scene and register
        circleSC.changeScene(circle);

        return dreamDirector;
    }])
;