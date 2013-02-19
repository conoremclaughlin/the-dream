var datGui = angular.module('dat.GUI', []);

datGui.directive('datGuiView', ['datGui', function(datGui){
    return function(scope, element, attrs) {
        console.log('hello, now attaching.');
        var gui = new datGui(scope.gui.obj);
        scope.gui.addAll(gui);
        // allowing autoplace for now
        // element.append(gui.domElement);
    };
}]);

datGui.factory('datGui', function() {
    console.log('getting datGui. This should be called only once for the injector.');
    var guis = {};

    // wrap dat.GUI with a simple factory for instance caching.
    // key is the object, whose data can be modified by dat.GUI.add(obj, ....)
    return function datGui(obj) {
        var gui;
        obj = obj || {};
        if (!obj) {
            return new dat.GUI();
        }

        if (guis[obj]) {
            console.log('caching: ', obj);
            gui = guis[obj];
        } else {
            console.log('creating new dat.GUI.');
            gui = new dat.GUI();
            guis[obj] = gui;
            console.log('dat: ', dat);
        }

        return gui;
    };
});