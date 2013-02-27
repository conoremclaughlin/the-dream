angular.module('scene', [ 'physijs' ])

    .factory('scene.SceneCoordinator', ['physijs.Physijs', function(Physijs) {
        var scenes = {};

        /**
         * SceneCoordinator is a wrapper for THREE.scene to track
         * state.
         *
         * @param {String} name of the scene. Pixar uses scene_number:shot_number
         * @param {Object} options for the scene
         * @param {Function} bootstrap the scene
         * @returns this
         */
        var SceneCoordinator = function(name, options, bootstrap) {
            if (arguments.length <= 0) return false;
            if (scenes[name]) return scenes[name];

            // TODO: just copy the options properties to this
            this.worldWidth = options.worldWidth;
            this.worldDepth = options.worldDepth;
            this.worldHalfWidth = this.worldWidth ? this.worldWidth / 2 : null;
            this.worldHalfDepth = this.worldDepth ? this.worldDepth / 2 : null;

            console.log('this: ', this.worldWidth);

            bootstrap = arguments[arguments.length - 1];
            options = typeof options === 'object' ? options : {};
            this.animates = [];
            this.scene = options.physijs ? new Physijs.Scene() : new THREE.Scene();
            if (bootstrap && typeof bootstrap === 'function') {
                this.changeScene(bootstrap);
            }

            scenes[name] = this;
            return this;
        };

        SceneCoordinator.prototype.add = function add(obj) {
            var animate = obj.animate || obj.update || obj.tick;
            if (animate) this.animates.push(animate);
            this.scene.add(obj);
        };

        SceneCoordinator.prototype.remove = function remove(obj) {
            this.scene.remove(obj);
        };

        // TODO: switch to event emitter, but whether to use angular or node.js...
        // hmmm....
        SceneCoordinator.prototype.addAnimate = function addAnimation(animateFn) {
            this.animates.push(animateFn);
        };

        SceneCoordinator.prototype.animate = function animate(renderer, clock) {
            var scene = this.getScene();
            if (scene.simulate) scene.simulate();
            this.animates.forEach(function(animateFn) {
                // TODO: need to use .call for context?
                animateFn(renderer, scene, clock);
            });
        };

        SceneCoordinator.prototype.getScene = function get() {
            return this.scene;
        };

        SceneCoordinator.prototype.changeScene = function changeScene() {
            // TODO: initialize new scene?
            var args = Array.prototype.slice.call(arguments);
            var func = args.shift();
            // add the scene object to the beginning of the arguments
            args.unshift(this.getScene());
            return func.apply(null, args);
        };

        return SceneCoordinator;
    }])
;