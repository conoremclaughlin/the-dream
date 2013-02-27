/**
 * credits to Michael Chang and the Google Data Arts stars project for lensflare assets and
 * some of the code.
 *
 * @see http://www.html5rocks.com/en/tutorials/casestudies/100000stars/
 */
angular.module('effects', [])

    .factory('effects.effects', function() {
        var scene
          , camera;

        var effects = {};

        effects.setScene = function(s, c) {
            scene = s;
            camera = c;
        };

        effects.addLensFlare = function addLensFlare( rgb, position, overrideImage ) {
            var size = 700;
            var textureFlare0 = overrideImage || THREE.ImageUtils.loadTexture( "assets/lensflare/lensflare0.png" );
            var textureFlare1 = THREE.ImageUtils.loadTexture( "assets/lensflare/lensflare1.png" );
            var textureFlare2 = THREE.ImageUtils.loadTexture( "assets/lensflare/lensflare2.png" );
            //var textureFlare3 = THREE.ImageUtils.loadTexture( "assets/lensflare/lensflare3.png" );

            var light = new THREE.PointLight( rgb, 1.5, 4500 );
            light.position = position;

            var flareColor = new THREE.Color( rgb );
            var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0, THREE.AdditiveBlending, flareColor );

            // we're going to be using multiple sub-lens-flare artifacts, each with a different size
            lensFlare.add( textureFlare1, 4096, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

            // and run each through a function below
            lensFlare.customUpdateCallback = this.lensFlareUpdateCallback;

            lensFlare.position = light.position;
            lensFlare.size = size ? size : 16000;

            scene.add( light );
            scene.add( lensFlare );

            return lensFlare;
        };

        /**
         * this function will operate over each lensflare artifact, moving them around the screen
         */
        effects.lensFlareUpdateCallback = function lensFlareUpdateCallback( object ) {
            var f, fl = this.lensFlares.length;
            var flare;
            var vecX = -this.positionScreen.x * 2;
            var vecY = -this.positionScreen.y * 2;
            var size = object.size ? object.size : 16000;
            var scaleHorizon = 200;

            var camDistance = camera.position.length();

            for( f = 0; f < fl; f ++ ) {
                flare = this.lensFlares[ f ];

                flare.x = this.positionScreen.x + vecX * flare.distance;
                flare.y = this.positionScreen.y + vecY * flare.distance;

                // if scaleHorizon gl_units away, don't change the size of the flare
                //if (camDistance > scaleHorizon) {
                flare.scale = size / camDistance;
                /*} else {
                    // else closer, grow it proportionately
                    flare.scale = size * 10 * (scaleHorizon / camDistance);
                }*/

                flare.rotation = 0;
            }
        };

        return effects;
    })
;