angular.module('scene', [ 'physijs' ])

    .factory('SceneCoordinator', ['Physijs', function(Physijs) {
        var scenes = {};

        // name of the scene. Pixar uses scene_number:shot_number,
        // for example
        var SceneCoordinator = function(name, options, bootstrap) {
            if (arguments.length <= 0) return false;
            bootstrap = arguments[arguments.length - 1];
            options = (typeof options === 'object') ? options : {};
            if (scenes[name]) return scenes[name];

            this.scene = options.physijs
                                ? new Physijs.Scene()
                                : new THREE.Scene();

            scenes[name] = this.scene;

            if (bootstrap && typeof bootstrap === 'function') {
                this.changeScene(bootstrapGeometry);
            }

            return this;
        };

        SceneCoordinator.prototype.add = function add(obj) {
            this.scene.add(obj);
        };

        SceneCoordinator.prototype.animate = function animate() {
            if (this.scene.simulate) this.scene.simulate();
        };

        SceneCoordinator.prototype.getScene = function get() {
            return this.scene;
        };

        SceneCoordinator.prototype.changeScene = function changeScene() {
            var args = Array.prototype.slice.call(arguments);
            var func = args.shift();
            // add the scene object to the beginning of the arguments
            args.unshift(this.getScene());
            return func.apply(null, args);
        };

        return SceneCoordinator;
    }])
;