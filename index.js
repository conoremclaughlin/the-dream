#!/usr/bin/env node

// could make this a shell script, but
// doing a quick build js hack cause i'm lazy.

var sys = require('sys')
  , exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout);
}

// lots of gobbly gook requiring browserify, so
// just going to assume you've installed it globally
exec("browserify ./app/js/voxel.build.wrapper.js -o ./app/js/voxel.built.wrapper.js", puts);

// must be last, launches standard web-server
require('./scripts/web-server.js');