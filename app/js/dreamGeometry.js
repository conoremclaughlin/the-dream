angular.module('dreamGeometry', [])

    .value('circle', function(scene) {
        var sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xCC0000
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
            new THREE.MeshBasicMaterial({ color: 0x888888 })
        );

        scene.add(box);

        return scene;
    });