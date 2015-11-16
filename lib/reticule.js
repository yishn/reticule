#!/usr/bin/env node
(function() {
var process, minimist, reticule, argv;
inOp = function(x, l) {
    var t = Object.prototype.toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return x in l;
    return l.indexOf(x) != -1;
}
/*@3:1*/
process = require('process');
minimist = require('minimist');
reticule = require('./index');
/*@7:1*/
argv = minimist(process.argv.slice(2));
if (inOp('id', argv._)) {
    console.log(reticule.getUnusedId('./'));
} else {
    /*@12:5*/
    reticule.buildReticule('./');
};
})();
