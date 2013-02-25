angular.module('dreamScenes', [ 'scene', 'effects' ])

    .factory('dreamScenes.Circle', [ '$timeout', 'scene.SceneCoordinator', 'effects.effects', function($timeout, SceneCoordinator, effects) {
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

            //effects.addLensFlare( 0.995, 0.025, 0.99, 0, 900, -150 );

            scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );

            // sides
            var light = new THREE.Color( 0xffffff );
            var shadow = new THREE.Color( 0x505050 );

            var matrix = new THREE.Matrix4();
            /*
            var pxGeometry = new THREE.PlaneGeometry( 100, 100 );
            pxGeometry.faces[ 0 ].materialIndex = 1;
            pxGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
            pxGeometry.applyMatrix( matrix.makeRotationY( Math.PI / 2 ) );
            pxGeometry.applyMatrix( matrix.makeTranslation( 50, 0, 0 ) );

            var nxGeometry = new THREE.PlaneGeometry( 100, 100 );
            nxGeometry.faces[ 0 ].materialIndex = 1;
            nxGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
            nxGeometry.applyMatrix( matrix.makeRotationY( - Math.PI / 2 ) );
            nxGeometry.applyMatrix( matrix.makeTranslation( - 50, 0, 0 ) );

            var pyGeometry = new THREE.PlaneGeometry( 100, 100 );
            pyGeometry.faces[ 0 ].materialIndex = 0;
            pyGeometry.faces[ 0 ].vertexColors = [ light, light, light, light ];
            pyGeometry.applyMatrix( matrix.makeRotationX( - Math.PI / 2 ) );
            pyGeometry.applyMatrix( matrix.makeTranslation( 0, 50, 0 ) );

            var pzGeometry = new THREE.PlaneGeometry( 100, 100 );
            pzGeometry.faces[ 0 ].materialIndex = 1;
            pzGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
            pzGeometry.applyMatrix( matrix.makeTranslation( 0, 0, 50 ) );

            var nzGeometry = new THREE.PlaneGeometry( 100, 100 );
            nzGeometry.faces[ 0 ].materialIndex = 1;
            nzGeometry.faces[ 0 ].vertexColors = [ light, shadow, shadow, light ];
            nzGeometry.applyMatrix( matrix.makeRotationY( Math.PI ) );
            nzGeometry.applyMatrix( matrix.makeTranslation( 0, 0, -50 ) );

            //

            var geometry = new THREE.Geometry();
            var dummy = new THREE.Mesh();

            for ( var z = 0; z < worldDepth; z ++ ) {

                for ( var x = 0; x < worldWidth; x ++ ) {

                    var h = getY( x, z );

                    dummy.position.x = x * 100 - worldHalfWidth * 100;
                    dummy.position.y = h * 100;
                    dummy.position.z = z * 100 - worldHalfDepth * 100;

                    var px = getY( x + 1, z );
                    var nx = getY( x - 1, z );
                    var pz = getY( x, z + 1 );
                    var nz = getY( x, z - 1 );

                    var pxpz = getY( x + 1, z + 1 );
                    var nxpz = getY( x - 1, z + 1 );
                    var pxnz = getY( x + 1, z - 1 );
                    var nxnz = getY( x - 1, z - 1 );

                    dummy.geometry = pyGeometry;

                    var colors = dummy.geometry.faces[ 0 ].vertexColors;
                    colors[ 0 ] = nx > h || nz > h || nxnz > h ? shadow : light;
                    colors[ 1 ] = nx > h || pz > h || nxpz > h ? shadow : light;
                    colors[ 2 ] = px > h || pz > h || pxpz > h ? shadow : light;
                    colors[ 3 ] = px > h || nz > h || pxnz > h ? shadow : light;

                    THREE.GeometryUtils.merge( geometry, dummy );

                    if ( ( px != h && px != h + 1 ) || x == 0 ) {

                        dummy.geometry = pxGeometry;

                        var colors = dummy.geometry.faces[ 0 ].vertexColors;
                        colors[ 0 ] = pxpz > px && x > 0 ? shadow : light;
                        colors[ 3 ] = pxnz > px && x > 0 ? shadow : light;

                        THREE.GeometryUtils.merge( geometry, dummy );

                    }

                    if ( ( nx != h && nx != h + 1 ) || x == worldWidth - 1 ) {

                        dummy.geometry = nxGeometry;

                        var colors = dummy.geometry.faces[ 0 ].vertexColors;
                        colors[ 0 ] = nxnz > nx && x < worldWidth - 1 ? shadow : light;
                        colors[ 3 ] = nxpz > nx && x < worldWidth - 1 ? shadow : light;

                        THREE.GeometryUtils.merge( geometry, dummy );

                    }

                    if ( ( pz != h && pz != h + 1 ) || z == worldDepth - 1 ) {

                        dummy.geometry = pzGeometry;

                        var colors = dummy.geometry.faces[ 0 ].vertexColors;
                        colors[ 0 ] = nxpz > pz && z < worldDepth - 1 ? shadow : light;
                        colors[ 3 ] = pxpz > pz && z < worldDepth - 1 ? shadow : light;

                        THREE.GeometryUtils.merge( geometry, dummy );

                    }

                    if ( ( nz != h && nz != h + 1 ) || z == 0 ) {

                        dummy.geometry = nzGeometry;

                        var colors = dummy.geometry.faces[ 0 ].vertexColors;
                        colors[ 0 ] = pxnz > nz && z > 0 ? shadow : light;
                        colors[ 3 ] = nxnz > nz && z > 0 ? shadow : light;

                        THREE.GeometryUtils.merge( geometry, dummy );
                    }
                }
            }

            var textureGrass = THREE.ImageUtils.loadTexture( '../../node_modules/painterly-textures/textures/grass.png' );
            textureGrass.magFilter = THREE.NearestFilter;
            textureGrass.minFilter = THREE.LinearMipMapLinearFilter;

            var textureGrassDirt = THREE.ImageUtils.loadTexture( '../../node_modules/painterly-textures/textures/grass_dirt.png' );
            textureGrassDirt.magFilter = THREE.NearestFilter;
            textureGrassDirt.minFilter = THREE.LinearMipMapLinearFilter;

            var material1 = new THREE.MeshLambertMaterial( { map: textureGrass, ambient: 0xbbbbbb, vertexColors: THREE.VertexColors } );
            var material2 = new THREE.MeshLambertMaterial( { map: textureGrassDirt, ambient: 0xbbbbbb, vertexColors: THREE.VertexColors } );

            var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( [ material1, material2 ] ) );
            scene.add( mesh );
             */

            var ambientLight = new THREE.AmbientLight( 0xcccccc );
            scene.add( ambientLight );

            var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
            directionalLight.position.set( 1, 1, 0.5 ).normalize();
            scene.add( directionalLight );

            var sphereMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff
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
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );


            var boxTwo = new Physijs.BoxMesh(
                new THREE.CubeGeometry( 50, 50, 50 ),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );

            scene.add(box);
            scene.add(boxTwo);



            return scene;
        };



        return Circle;
    }])
;