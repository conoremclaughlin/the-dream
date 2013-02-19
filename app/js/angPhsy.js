var physijs = angular.module('Physijs', []);

physijs.factory('physijs', function() {
    Physijs.scripts.worker = 'lib/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    return Physijs;
});