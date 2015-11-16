#!/usr/bin/env node
(function() {
var app, process, minimist, reticule, argv;
inOp = function(x, l) {
    var t = Object.prototype.toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return x in l;
    return l.indexOf(x) != -1;
}
/*@3:1*/
app = require('../package.json');
process = require('process');
minimist = require('minimist');
/*@6:1*/
reticule = require('./index');
argv = minimist(process.argv.slice(2));
if (inOp('id', argv._)) {
    /*@11:5*/
    console.log(reticule.getUnusedId('./'));
} else if (inOp('version', argv._)) {
    console.log((app.productName + ' v') + app.version);
} else {
    /*@15:5*/
    reticule.buildReticule('./');
};
})();
