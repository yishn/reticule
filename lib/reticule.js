#!/usr/bin/env node
(function() {
var app, process, minimist, reticule, argv, subcommand;
/*@3:1*/
app = require('../package.json');
process = require('process');
minimist = require('minimist');
/*@6:1*/
reticule = require('./index');
argv = minimist(process.argv.slice(2));
(function(r) {
    subcommand = r[0];
    return r;
})(argv._);
/*@11:1*/
if (subcommand === 'id') {
    console.log(reticule.getUnusedId('./'));
} else if (subcommand === 'version') {
    console.log((app.productName + ' v') + app.version);
} else if (subcommand == null) {
    var result;
    /*@16:5*/
    if ((result = reticule.buildReticule('./')) !== true) {
        console.log('There are duplicate ids: ' + result);
    };
};
})();
