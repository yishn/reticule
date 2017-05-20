(function() {
var path, reticule, Renderer, ReticuleRenderer, TocRenderer, LinearTocRenderer;
extend = function(x, y) {
    var copy = function() {};
    copy.prototype = y.prototype;
    var c = new copy();
    c.constructor = x;
    x.prototype = c;
    x.__super__ = y.prototype;
    x.__super__.init = y.prototype.constructor;
    return x;
}
equals = function(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a == b;
    var t = Object.prototype.toString.call(a);
    if (t !== Object.prototype.toString.call(b)) return false;
    var aa = t === "[object Array]";
    var ao = t === "[object Object]";
    if (aa) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++)
            if (!equals(a[i], b[i])) return false;
        return true;
    } else if (ao) {
        var kk = Object.keys(a);
        if (kk.length !== Object.keys(b).length) return false;
        for (var i = 0; i < kk.length; i++) {
            k = kk[i];
            if (!(k in b)) return false;
            if (!equals(a[k], b[k])) return false;
        }
        return true;
    }
    return false;
}
/*@1:1*/
path = require('path').posix;
reticule = require('./index');
Renderer = require('marked').Renderer;
/*@6:1*/
ReticuleRenderer = (function() {
    var init;
    init = function(dirname, sectionpath) {
        var self;
        self = this;
        /*@8:9*/
        self.keywords = [];
        self.dirname = dirname;
        self.relative = path.relative(sectionpath, './');
        /*@12:9*/
        ReticuleRenderer.__super__.init.call(self);
    };
    extend(init, Renderer);
    init.prototype.blockquote = function(quote) {
        var self;
        self = this;
        /*@15:9*/
        return ('<article>\n' + quote) + '</article>\n';
    };
    init.prototype.code = function(code) {
        var self;
        self = this;
        /*@18:9*/
        return ('<p class="math">$$$' + self.escape(code)) + '$$$</p>\n';
    };
    init.prototype.codespan = function(code) {
        var self;
        self = this;
        /*@21:9*/
        return ('<span class="math">$' + code) + '$</span>';
    };
    init.prototype.link = function(href, title, text) {
        var self, out;
        self = this;
        /*@24:9*/
        out = '<a ';
        if (href[0] === '#') {
            var tag;
            tag = reticule.getTagById(self.dirname, href);
            /*@28:13*/
            href = path.join(self.relative, tag.path) + tag.id;
            out += ((('class="tag" data-path="' + tag.path) + tag.id) + '" ');
            if (text === '~') {
                /*@32:17*/
                text = (tag.type + ' ') + tag.id.slice(1).replace(/-/g, '.');
            };
        };
        out += (('href="' + href) + '"');
        /*@35:9*/
        if (title) {
            out += (('title="' + title) + '"');
        };
        out += (('>' + text) + '</a>');
        /*@38:9*/
        return out;
    };
    init.prototype.del = function(text) {
        var self, k, tuple;
        self = this;
        /*@41:9*/
        k = text.indexOf('|');
        if (k < 0) {
            k = text.length;
        };
        /*@44:9*/
        tuple = [text.slice(0, (k - 1) + 1), text.slice(k + 1)];
        if (self.keywords.every(function(x) {
            return !equals(x, tuple);
        })) {
            /*@47:13*/
            self.keywords.push(tuple);
        };
        return '';
    };
    init.prototype.escape = function(html) {
        var self;
        self = this;
        /*@52:9*/
        return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };
    return init;
})();
TocRenderer = (function() {
    var init;
    /*@60:5*/
    init = function(dirname, currentpath) {
        var self;
        self = this;
        self.currentpath = currentpath;
        /*@62:9*/
        TocRenderer.__super__.init.call(self, dirname, currentpath);
    };
    extend(init, ReticuleRenderer);
    init.prototype.list = function(body) {
        var self;
        self = this;
        /*@65:9*/
        return ('<ol class="toc">\n' + body) + '</ol>\n';
    };
    init.prototype.link = function(href, title, text) {
        var self, out;
        self = this;
        /*@68:9*/
        out = ((('<a href="' + path.join(self.relative, href)) + '" data-path="') + href) + '"';
        if (href === self.currentpath) {
            out += ' class="current"';
        };
        /*@73:9*/
        if (title == null) {
            title = text;
        };
        out += ((' title="' + title) + '"');
        /*@77:9*/
        return ((out + '>') + text) + '</a>';
    };
    return init;
})();
LinearTocRenderer = (function() {
    var init;
    /*@80:5*/
    init = function() {
        var self;
        self = this;
        self.lineartoc = [];
    };
    extend(init, Renderer);
    init.prototype.link = function(href, title, text) {
        var self;
        self = this;
        /*@84:9*/
        self.lineartoc.push({
            title: text,
            path: href
        });
        return LinearTocRenderer.__super__.link.call(self, href, title, text);
    };
    return init;
})();
/*@87:1*/
exports.ReticuleRenderer = ReticuleRenderer;
exports.TocRenderer = TocRenderer;
exports.LinearTocRenderer = LinearTocRenderer;
})();
