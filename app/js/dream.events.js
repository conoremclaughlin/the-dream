angular.module('dream.events', [ 'three.helpers', 'physijs' ])

    .factory('dream.events.makeRainBoxes', [
      'three.helpers.makeRandomVector',
      'physijs.Physijs',
      '$timeout',
      function(makeRandomVector, Physijs, $timeout) {

          /**
           * Creates raining boxes at random points within a 3-dimensional zone.
           *
           * @param {Object} scene to add to
           * @param {Object} size of the boxes to create
           * @param {Vector3} position for center of rainfall 'zone'
           *
           * @returns {Function} meant to be used in an interval.
           */
          function makeRainBoxes(scene, size, position) {
              function rain() {
                  var MAX_LIFE_TIME = 15000
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
                  scene.add(box);

                  // wait MAX_LIFE_TIME before removing box from scene
                  $timeout(function() {
                      scene.remove(box);
                  }, MAX_LIFE_TIME);
              };

              // TODO: find a wrapper for director for these.
              return rain;
          };

          return makeRainBoxes;
    }])
;