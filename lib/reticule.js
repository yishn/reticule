#!/usr/bin/env node
(function() {
var process, minimist, reticule, argv, dirname;
/*@3:1*/
process = require('process');
minimist = require('minimist');
reticule = require('./index');
/*@7:1*/
argv = minimist(process.argv.slice(2));
(function(r) {
 dirname = (function() {
  var r1;
  r1 = r[0];
  if (((typeof r1) === 'undefined') || (r1 == null)) {
   return './';
  };
  return r1;
 })();
 return r;
})(argv._);
/*@10:1*/
reticule.buildReticule(dirname);
})();
