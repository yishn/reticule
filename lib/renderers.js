(function() {
var path, reticule, Renderer, ReticuleRenderer, TocRenderer;
extend = function(x, y) {
    var copy = function() {};
    copy.prototype = y.prototype;
    var c = new copy();
    c.constructor = x;
    x.prototype = c;
    x.prototype.__super__ = y.prototype;
    x.prototype.__super__.init = y.prototype.constructor;
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
/*@3:1*/
// -*-javascript-*-
path = require('path');
reticule = require('./index');
Renderer = require('marked').Renderer;
/*@8:1*/
ReticuleRenderer = (function() {
    var init;
    init = function(dirname, sectionpath) {
        var self;
        self = this;
        /*@10:9*/
        self.keywords = [];
        self.dirname = dirname;
        self.relative = path.relative(sectionpath, './');
        /*@14:9*/
        self.__super__.init.call(self);
    };
    extend(init, Renderer);
    init.prototype.blockquote = function(quote) {
        var self;
        self = this;
        /*@17:9*/
        return ('<article>\n' + quote) + '</article>\n';
    };
    init.prototype.code = function(code) {
        var self;
        self = this;
        /*@20:9*/
        return ('<p class="math">$$$' + self.escape(code)) + '$$$</p>\n';
    };
    init.prototype.codespan = function(code) {
        var self;
        self = this;
        /*@23:9*/
        return ('<span class="math">$' + code) + '$</span>';
    };
    init.prototype.link = function(href, title, text) {
        var self, out;
        self = this;
        /*@26:9*/
        out = '<a ';
        if (href[0] === '#') {
            var tag;
            tag = reticule.getTagById(self.dirname, href);
            /*@30:13*/
            href = path.join(self.relative, tag.path) + tag.id;
            out += ((('class="tag" data-path="' + tag.path) + tag.id) + '" ');
        };
        out += (('href="' + href) + '"');
        /*@34:9*/
        if (title) {
            out += (('title="' + title) + '"');
        };
        out += (('>' + text) + '</a>');
        /*@37:9*/
        return out;
    };
    init.prototype.del = function(text) {
        var self, k, tuple;
        self = this;
        /*@40:9*/
        k = text.indexOf('|');
        if (k < 0) {
            k = text.length;
        };
        /*@43:9*/
        tuple = [text.slice(0, (k - 1) + 1), text.slice(k + 1)];
        if (self.keywords.every(function(x) {
            return !equals(x, tuple);
        })) {
            /*@46:13*/
            self.keywords.push(tuple);
        };
        return '';
    };
    init.prototype.escape = function(html) {
        var self;
        self = this;
        /*@51:9*/
        return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };
    return init;
})();
TocRenderer = (function() {
    var init;
    /*@59:5*/
    init = function(dirname, currentpath) {
        var self;
        self = this;
        self.dirname = dirname;
        /*@61:9*/
        self.currentpath = currentpath;
        self.relative = path.relative(currentpath, './');
        self.__super__.init.call(self);
    };
    extend(init, Renderer);
    init.prototype.list = function(body) {
        var self;
        self = this;
        /*@67:9*/
        return ('<ol class="toc">\n' + body) + '</ol>\n';
    };
    init.prototype.link = function(href, title, text) {
        var self, out;
        self = this;
        /*@70:9*/
        out = ((('<a href="' + path.join(self.relative, href)) + '" data-path="') + href) + '"';
        if (href === self.currentpath) {
            out += ' class="current"';
        };
        /*@75:9*/
        if (title) {
            out += ((' title="' + title) + '"');
        };
        return ((out + '>') + text) + '</a>';
    };
    return init;
})();
/*@80:1*/
exports.ReticuleRenderer = ReticuleRenderer;
exports.TocRenderer = TocRenderer;
})();
