var physijs = angular.module('physijs', []);

physijs.config(function() {
    Physijs.scripts.worker = 'js/vendor/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';
});

physijs.factory('physijs.Physijs', function() {
    return Physijs;
});