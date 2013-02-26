angular.module('dream.events', [ 'three.helpers', 'physijs' ])

    .factory('dream.events.makeRainBoxes', [
      'three.helpers.makeRandomVector',
      'physijs.Physijs',
      '$timeout',
      function(makeRandomVector, Physijs, $timeout) {

          /**
           * Creates raining boxes at random points within a 3-dimensional zone.
           *
           * @param scene to add boxes to
           * @param position Vector3 for center of rainfall 'zone'
           * @param interval between creating a new box
           * @returns interval promise object to cancel the rainfall with.
           */
          function makeRainBoxes(scene, size, position, interval) {
              function rain() {
                  var MAX_LIFE_TIME = 15000;
                  var coordClamp = {
                      x: 2000,
                      y: 1000,
                      z: 2000
                  };

                  var box = new Physijs.BoxMesh(
                      new THREE.CubeGeometry( size.x, size.y, size.z ),
                      new THREE.MeshBasicMaterial({
                          color: 0xffffff,
                          transparent: true,
                          opacity: Math.random()
                      })
                  );

                  box.position = makeRandomVector(coordClamp, position);
                  /*// debug
                  console.log('box.position: ', box.position.x);
                  console.log('box.position: ', box.position.y);
                  console.log('box.position: ', box.position.z);
                  */
                  scene.add(box);

                  // wait MAX_LIFE_TIME before removing box from scene
                  $timeout(function() {
                      scene.remove(box);
                  }, MAX_LIFE_TIME);
              };

              return setInterval(rain, interval);
          };

          return makeRainBoxes;
    }])
;