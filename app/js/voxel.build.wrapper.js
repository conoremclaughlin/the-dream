
angular.module('voxel', [])
    .factory('voxel.game', function() {
        var createGame = require('voxel-engine')
          , voxel = require('voxel')
          , toolbar = require('toolbar')
          , player = require('voxel-player')
          , createTerrain = require('voxel-perlin-terrain')
          , highlighter = require('voxel-highlight')
          , createTree = require('voxel-forest')
          , texturePath = require('painterly-textures')(__dirname)
          , blockSelector = toolbar({ el: '#tools' });

        // setup the game and add some trees
        var game = createGame({
            generateVoxelChunk: createTerrain({ scaleFactor: 10 }),
            chunkDistance: 2,
            materials: [
                'obsidian',
                ['grass', 'dirt', 'grass_dirt'],
                'brick',
                'grass',
                'plank'
            ],
            texturePath: texturePath,
            worldOrigin: [0, 0, 0],
            controls: { discreteFire: true }
        });

        // TODO: (conor) can I remove this? listed as needed for debugging...
        window.game = game; // for debugging

        for (var i = 0; i < 20; i++) {
            createTree(game, { bark: 5, leaves: 4 });
        }

        // create the player from a minecraft skin file and tell the
        // game to use it as the main player
        var createPlayer = player(game);
        var substack = createPlayer('../img/substack.png');
        substack.yaw.position.set(0, -1200, 0);
        substack.possess();

        // TODO: toggle between first and third person modes
        window.addEventListener('keydown', function (ev) {
            if (ev.keyCode === 'R'.charCodeAt(0)) substack.toggle();
        });

        // block interaction stuff
        var highlight = highlighter(game);
        var currentMaterial = 1;

        blockSelector.on('select', function(material) {
            material = +material; // cast to int
            if (material > -1) {
                currentMaterial = material;
            } else {
                currentMaterial = 1;
            }
        });

        // TODO: (conor) check what other events can be
        // used with game. Perhaps for animate?
        game.on('fire', function(target, state) {
            var vec = game.cameraVector();
            var pos = game.cameraPosition();
            var point = game.raycast(pos, vec, 100);
            if (!point) return ;
            var erase = !state.firealt && !state.alt;
            if (erase) {
                game.setBlock(point, 0);
            } else {
                game.createBlock(point.addSelf(vec.multiplyScalar(-game.cubeSize/2)), currentMaterial);
            }
        });

        return game;
    })

    .factory('voxel.pointerLock', function() {
        var pointerLock = require('voxel-engine/node_modules/interact/node_modules/pointer-lock');

        return pointerLock;
    })

    .directive('voxelGame', ['voxel.game', function(game) {
        return function(scope, element, attrs) {
            game.appendTo(element[0]);
            game.setupPointerLock(element[0]);
        };
    }])
;