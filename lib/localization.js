(function() {
var reticule;
/*@1:1*/
reticule = require('./index');
exports.get = function(dirname, string) {
    var bookinfo;
    bookinfo = reticule.getBookInfo(dirname);
    /*@5:5*/
    return (function() {
        var r;
        r = (function() {
            var r1;
            r1 = bookinfo.localization;
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1[string];
        })();
        if (((typeof r) === 'undefined') || (r == null)) {
            return string;
        };
        return r;
    })();
};
})();
