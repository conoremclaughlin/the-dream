angular.module('dream.objects', [ 'effects' ])

    .factory('dream.objects.makeStarsSky', function() {
        return THREE.ImageUtils.loadTexture( 'img/free-star-background-smallest.jpg', new THREE.UVMapping());
    })

    .factory('dream.objects.makeDreamAtom', [
      'effects.effects',
      'dream.objects.makeStarsSky',
      'three.helpers.makeRandomVector',
      function(effects, makeStarsSky, makeRandomVector) {
        var protonTexture = THREE.ImageUtils.loadTexture( 'img/free-star-background-smallest.jpg' );

        function makeDreamAtom(x, y, z, scene, camera) {
            var radius = 25
              , segments = 16
              , rings = 16
              , dreamAtom = new THREE.Object3D()
              , sphereOne
              , sphereTwo
              , rotationSeed = THREE.Math.random16();

            var rotationX = 0.06 * rotationSeed
              , rotationY = 0.05 * rotationSeed
              , rotationZ = 0.04 * rotationSeed
              , numFlares = 2
              , flares = []
              , axes = ['x', 'y', 'z']
              , axis = new THREE.Vector3( 0, 1, 0 )
              , angle = Math.PI / 50
              , matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);

            effects.setScene(dreamAtom, camera);

            // WARNING: uncomment following lines if you'd like reflective protons.
            // however, three.js is buggy with cubeCameras and lensFlares in the same scene.

            // var cubeCamera = new THREE.CubeCamera( 1, 1000, 256 );
            // cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
            // dreamAtom.add( cubeCamera );

            // generate flares with random colors and electron positions
            for (var i = 0; i < numFlares; i++) {
                var position = new THREE.Vector3();
                axes.forEach(function(axis) {
                    var distance = THREE.Math.clampBottom(Math.floor(200 * THREE.Math.random16()), 75, 200);
                    if (distance % 2) {
                        position[axis] -= distance;
                    } else {
                        position[axis] += distance;
                    }
                });

                flares.push(effects.addLensFlare( THREE.Math.randInt(0x101010, 0xFCFCFC), position));
            }
            // create an atom by pairing spheres 'radius' units
            // apart on each axis
            axes.forEach(function(axis) {
                sphereOne = new THREE.Mesh(
                    new THREE.SphereGeometry(radius, segments, rings),
                    new THREE.MeshBasicMaterial( { map: protonTexture } )
                );

                sphereTwo = new THREE.Mesh(
                    new THREE.SphereGeometry(radius, segments, rings),
                    new THREE.MeshBasicMaterial( { map: protonTexture } ) //new THREE.MeshBasicMaterial( { envMap: cubeCamera.renderTarget } )
                );

                sphereOne.position = new THREE.Vector3(x, y, z);
                sphereTwo.position = new THREE.Vector3(x, y, z);
                sphereOne.position[axis] += radius;
                sphereTwo.position[axis] -= radius;
                dreamAtom.add(sphereOne);
                dreamAtom.add(sphereTwo);
            });

            dreamAtom.update = function(renderer, scene, clock) {
                var time = clock.getElapsedTime();

                dreamAtom.rotation.x += rotationX;
                dreamAtom.rotation.y += rotationY;
                dreamAtom.rotation.z += rotationZ;

                flares.forEach(function(flare) {
                    flare.position.applyMatrix4(matrix);
                });

                sphereTwo.visible = false;
                // cubeCamera.updateCubeMap( renderer, scene );
                sphereTwo.visible = true; // *cough*
            };

            dreamAtom.meta = {};

            return dreamAtom;
          };

          return makeDreamAtom;
    }])
;