var datGui = angular.module('dat.GUI', [])
    .directive('datGuiView', ['DatGui', function(DatGui){
        return function(scope, element, attrs) {
            var gui = new DatGui(scope.gui.obj);
            scope.gui.addAll(gui);
            // allowing autoplace for now
            // element.append(gui.domElement);
        };
    }])

    .factory('DatGui', function() {
        var guis = {};

        var DatGui = function DatGui(obj) {
            var gui;
            obj = obj || {};
            if (!obj) {
                return new dat.GUI();
            }

            if (guis[obj]) {
                gui = guis[obj];
            } else {
                gui = new dat.GUI();
                guis[obj] = gui;
            }

            return gui;
        };

        // wrap dat.GUI with a simple factory for instance caching.
        // key is the object, whose data can be modified by dat.GUI.add(obj, ....)
        return DatGui;
    })
;