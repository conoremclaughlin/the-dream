angular.module('dream.scenes', [ 'scene', 'effects' ])

    .factory('dream.scenes.Circle', [ '$timeout', 'scene.SceneCoordinator', 'effects.effects', function($timeout, SceneCoordinator, effects) {
        var Circle = function circle(scene) {
            SceneCoordinator.call(this, 'circle', {
                physijs: true,
                worldWidth: 200,
                worldDepth: 200
            }, angular.bind(this, this.bootstrap));
        };

        Circle.prototype = Object.create(SceneCoordinator.prototype);

        Circle.prototype.data = [];

        Circle.prototype.items = [];

        Circle.prototype.generateBoxes = function() {
            var box = new Physijs.BoxMesh(
                new THREE.CubeGeometry( 50, 50, 50 ),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            this.scene.add(box);


            var boxTwo = new Physijs.BoxMesh(
                    new THREE.CubeGeometry( 50, 50, 50 ),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
        };

        Circle.prototype.getY = function getY( x, z ) {
            return ( this.data[ x + z * this.worldWidth ] * 0.2 ) | 0;
        };

        Circle.prototype.loadTexture = function loadTexture( path, callback ) {
            var image = new Image();

            image.onload = function () { callback(); };
            image.src = path;

            return image;
        };

        Circle.prototype.generateHeight = function generateHeight( width, height ) {

            var data = [], perlin = new ImprovedNoise(),
            size = width * height, quality = 2, z = Math.random() * 100;

            for ( var j = 0; j < 4; j ++ ) {

                if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;

                for ( var i = 0; i < size; i ++ ) {

                    var x = i % width, y = ( i / width ) | 0;
                    data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;

                }

                quality *= 4

            }

            return data;

        };

        Circle.prototype.bootstrap = function bootstrap(scene) {
            this.data = this.generateHeight(this.worldWidth, this.worldDepth);

            var fogExp2 = true
              , worldWidth = this.worldWidth
              , worldDepth = this.worldDepth
              , worldHalfWidth = this.worldHalfWidth
              , worldHalfDepth = this.worldHalfDepth
              , getY = angular.bind(this, this.getY);

            scene.fog = new THREE.FogExp2( 0x000000, 0.00015 );

            // sides
            var light = new THREE.Color( 0xffffff );
            var shadow = new THREE.Color( 0x505050 );

            var matrix = new THREE.Matrix4();

            var ambientLight = new THREE.AmbientLight( 0xaaaaaa );
            scene.add( ambientLight );

            var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
            directionalLight.position.set( 1, 1, 0.5 ).normalize();
            // scene.add( directionalLight );

            // TODO: add ground geometry

            return scene;
        };



        return Circle;
    }])
;