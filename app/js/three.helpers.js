angular.module('three.helpers', [])

    .factory('three.helpers.makeRandomVector', function() {
        return function(clampVector, centerVector) {
            var position = new THREE.Vector3();

            ['x', 'y', 'z'].forEach(function(coord) {
                if (THREE.Math.random16() > 0.5) {
                    position[coord] = Math.floor( centerVector[coord] + (THREE.Math.random16() * clampVector[coord]));
                } else {
                   position[coord] = Math.floor( centerVector[coord] - (THREE.Math.random16() * clampVector[coord]));
                }
            });

            return position;
        };
    })
;