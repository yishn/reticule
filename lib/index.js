(function() {
var fs, path, diacritic, marked, milk, uglify, cssshrink, cache, ReticuleRenderer, readdirRecursive, fillTemplate, r, r1;
sign = function(x) {
    return x == 0 ? 0 : (x > 0 ? 1 : -1);
}
enumerate = function(l) {
    var t = Object.prototype.toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return Object.keys(l);
    return l;
}
inOp = function(x, l) {
    var t = Object.prototype.toString.call(l);
    if (t !== "[object Array]" && t !== "[object String]")
        return x in l;
    return l.indexOf(x) != -1;
}
compose = function(x, y, c1, c2) {
    return function() {
        return x.call(c1, y.apply(c2, arguments));
    }
}
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
fs = require('fs');
path = require('path').posix;
diacritic = require('diacritic');
/*@6:1*/
marked = require('marked').setOptions({
    smartypants: true
});
milk = require('milk-lang');
/*@8:1*/
uglify = require('uglify-js');
cssshrink = require('cssshrink');
cache = {};
/*@13:1*/
ReticuleRenderer = (function() {
    var init;
    init = function(dirname, sectionpath) {
        var self;
        self = this;
        /*@15:9*/
        self.keywords = [];
        self.dirname = dirname;
        self.relative = path.join(path.relative(path.join(dirname, sectionpath), dirname), './');
        /*@18:9*/
        self.__super__.init.call(self);
    };
    extend(init, marked.Renderer);
    init.prototype.blockquote = function(quote) {
        var self;
        self = this;
        /*@21:9*/
        return ('<article>\n' + quote) + '</article>\n';
    };
    init.prototype.code = function(code) {
        var self;
        self = this;
        /*@24:9*/
        return ('<p class="math">$$$' + code) + '$$$</p>\n';
    };
    init.prototype.codespan = function(code) {
        var self;
        self = this;
        /*@27:9*/
        return ('<span class="math">$' + code) + '$</span>';
    };
    init.prototype.link = function(href, title, text) {
        var self, out;
        self = this;
        /*@30:9*/
        out = '<a ';
        if (href[0] === '#') {
            var tag;
            tag = exports.getTagById(self.dirname, href);
            /*@34:13*/
            href = path.join(self.relative, tag.path) + tag.id;
            out += ((('class="tag" data-path="' + tag.path) + tag.id) + '" ');
        };
        out += (('href="' + href) + '"');
        /*@38:9*/
        if (title) {
            out += (('title="' + title) + '"');
        };
        out += (('>' + text) + '</a>');
        /*@41:9*/
        return out;
    };
    init.prototype.del = function(text) {
        var self, k, tuple;
        self = this;
        /*@44:9*/
        k = text.indexOf('|');
        if (k < 0) {
            k = text.length;
        };
        /*@47:9*/
        tuple = [text.slice(0, (k - 1) + 1), text.slice(k + 1)];
        if (self.keywords.every(function(x) {
            return !equals(x, tuple);
        })) {
            /*@50:13*/
            self.keywords.push(tuple);
        };
        return '';
    };
    return init;
})();
/*@54:1*/
readdirRecursive = function(dirname) {
    var items, i1, l1, item;
    items = (function() {
        var r, i1, l1, item;
        r = [];
        l1 = enumerate(fs.readdirSync(dirname));
        for (i1 = 0; i1 < l1.length; i1++) {
            item = l1[i1];
            r.push(path.join(dirname, item));
        };
        return r;
    })();
    /*@57:5*/
    l1 = enumerate(items);
    for (i1 = 0; i1 < l1.length; i1++) {
        item = l1[i1];
        if (!(fs.statSync(item).isDirectory())) continue;
        items = items.concat(readdirRecursive(item));
    };
    /*@60:5*/
    return items;
};
fillTemplate = function(template, context) {
    var escaperegex, i1, l1, v, k;
    /*@63:5*/
    escaperegex = function(x) {
        return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };
    l1 = context;
    for (i1 in l1) {
        v = l1[i1];
        k = parseInt(i1, 10);
        if (isNaN(k)) k = i1;
        /*@66:9*/
        template = template.replace(new RegExp(('{{' + escaperegex(k)) + '}}', 'g'), v);
    };
    return template;
};
/*@70:1*/
exports.getBookInfo = compose((r = JSON).parse, compose(function(x1) {
    return (r1 = fs).readFileSync.call(r1, x1, 'utf8');
}, function(x1) {
    return (r1 = path).join.call(r1, x1, 'book.json');
}, null, null), r, null);
/*@72:1*/
exports.getLinearToc = function(toc) {
    var linear, i1, l1, item;
    linear = [];
    l1 = enumerate(toc);
    for (i1 = 0; i1 < l1.length; i1++) {
        item = l1[i1];
        /*@76:9*/
        if (inOp('toc', item)) {
            var sublinear;
            sublinear = exports.getLinearToc(item.toc);
            linear = linear.concat(sublinear);
        } else {
            /*@80:13*/
            linear.push(item);
        };
    };
    return linear;
};
/*@84:1*/
exports.renderToc = function() {
    var toc, relative, currentpath, output, i2, l1, item;
    (function(r) {
        toc = r[0];
        relative = (function() {
            r1 = r[1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return './';
            };
            return r1;
        })();
        currentpath = (function() {
            r1 = r[2];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1;
        })();
        return r;
    })(arguments);
    /*@85:5*/
    output = '<ol class="toc">\n';
    l1 = enumerate(toc);
    for (i2 = 0; i2 < l1.length; i2++) {
        item = l1[i2];
        var a, li;
        /*@88:9*/
        a = item.title;
        if (!inOp('toc', item)) {
            a = ((((('<a href="' + path.join(relative, item.path)) + '" data-path="') + item.path) + '">') + item.title) + '</a>';
        };
        /*@93:9*/
        li = '<li>' + a;
        if (currentpath === item.path) {
            li = '<li class="current">' + a;
        };
        /*@97:9*/
        if (inOp('toc', item)) {
            var subtoc;
            subtoc = exports.renderToc(item.toc, relative, currentpath);
            li += subtoc;
        };
        /*@101:9*/
        li += '</li>\n';
        output += li;
    };
    return output + '</ol>';
};
/*@106:1*/
exports.extractTags = function(filename, dirname) {
    if (!inOp(filename, cache)) {
        var tags;
        tags = [];
        /*@110:9*/
        try {
            var content, tagheaders, tagslength, i1, l1, l, i;
            content = fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n').split('\n');
            tagheaders = function() {
                var first;
                (function(r) {
                    (function(r1) {
                        first = r1[0];
                        return r1;
                    })(r[0]);
                    return r;
                })(arguments);
                return first === '#';
            };
            /*@113:13*/
            tagslength = content.filter(tagheaders).length;
            if (tagslength === 0) {
                return [];
            };
            /*@116:13*/
            l1 = content;
            for (i1 in l1) {
                l = l1[i1];
                i = parseInt(i1, 10);
                if (isNaN(i)) i = i1;
                if (!(tagheaders(l))) continue;
                /*@116:51*/
                break;
            };
            while (tags.length < tagslength) {
                var start, step, j, tag;
                /*@119:17*/
                start = i + 1;
                step = 1;
                for (j = start; true; j += step) {
                    if (!((j === content.length) || tagheaders(content[j]))) continue;
                    break;
                };
                /*@121:17*/
                tag = exports.parseTag(content.slice(i, (j - 1) + 1));
                tag.path = path.join(path.relative(dirname, path.join(filename, '..')), './');
                tags.push(tag);
                /*@125:17*/
                i = j;
            };
        } catch(e) {};
        cache[filename] = tags;
    };
    /*@129:5*/
    return cache[filename];
};
exports.renderTags = function(tags, dirname) {
    var output, keywords, i1, l1, tag;
    /*@132:5*/
    output = '';
    keywords = {};
    l1 = enumerate(tags);
    for (i1 = 0; i1 < l1.length; i1++) {
        tag = l1[i1];
        var renderer, options, prefix, i2, l2, keyword, context;
        /*@136:9*/
        renderer = new ReticuleRenderer(dirname, tag.path);
        options = {
            renderer: renderer
        };
        /*@139:9*/
        prefix = ('<p><a class="label" href="' + tag.id) + '">';
        if (tag.type.trim() !== '') {
            prefix += (((tag.type + ' ') + tag.id.slice(1).replace(/-/g, '.')) + '.');
        } else {
            /*@143:13*/
            prefix += '&para;';
        };
        prefix += '</a></p>\n';
        output += ((((('<article id="' + tag.id.slice(1)) + '">\n') + prefix) + marked(tag.assertion, options)) + '\n');
        /*@150:9*/
        if (tag.proof != null) {
            output += (('<p><em class="label">Proof.</em></p>\n<section class="proof">\n' + marked(tag.proof, options)) + '\n<p class="qed">$\\square$</p>\n</section>');
        };
        output += '</article>\n';
        /*@157:9*/
        l2 = enumerate(renderer.keywords);
        for (i2 = 0; i2 < l2.length; i2++) {
            (function(r) {
                keyword = r[0];
                context = r[1];
                return r;
            })(l2[i2]);
            var tuple;
            /*@158:13*/
            tuple = [tag.path, tag.id];
            if (context !== '') {
                tuple.push(context);
            };
            /*@161:13*/
            if (!inOp(keyword, keywords)) {
                keywords[keyword] = [tuple];
            } else {
                keywords[keyword].push(tuple);
            };
        };
    };
    /*@166:5*/
    return [output, keywords];
};
exports.parseTag = function(lines) {
    var separator, start, step, k, j, id, type, assertion, proof;
    /*@169:5*/
    separator = function(x) {
        return (x !== '') && x.split('').every(function(y) {
            return y === '-';
        });
    };
    /*@170:5*/
    start = 0;
    step = 1;
    for (k = start; true; k += step) {
        if (!((k === lines.length) || separator(lines[k]))) continue;
        break;
    };
    /*@172:5*/
    j = lines[0].indexOf(':');
    id = (j === (-1)) ? lines[0] : lines[0].substring(0, j);
    type = (j === (-1)) ? '' : lines[0].substring(j + 1);
    /*@175:5*/
    assertion = lines.slice(1, (k - 1) + 1).join('\n').trim();
    proof = ((k + 1) < lines.length) ? lines.slice(k + 1).join('\n').trim() : null;
    return {
        id: id,
        type: type,
        assertion: assertion,
        proof: proof
    };
};
/*@182:1*/
exports.renderIndex = function() {
    var data, relative, output, compare, map, getAlpha, keys, alphas, i2, l1, alpha;
    (function(r) {
        data = r[0];
        relative = (function() {
            r1 = r[1];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return './';
            };
            return r1;
        })();
        return r;
    })(arguments);
    /*@183:5*/
    output = '<ul class="nav" id="nav">';
    compare = function(p, q, f) {
        return (f(p) === f(q)) ? 0 : ((f(p) < f(q)) ? (-1) : 1);
    };
    /*@186:5*/
    map = function(x) {
        return diacritic.clean(x).toLowerCase().replace(/[^0-9a-zA-Z]/g, '');
    };
    getAlpha = function(x) {
        var a;
        return ((a = map(x)[0]) === parseInt(a, 10)) ? '#' : a;
    };
    /*@189:5*/
    keys = Object.keys(data);
    keys.sort(function(x1, x2) {
        return compare.call(null, x1, x2, map);
    });
    /*@192:5*/
    if (keys.length === 0) {
        return '<p>No index.</p>';
    };

    // Create alphas
    alphas = [];
    /*@197:5*/
    l1 = enumerate(keys.map(getAlpha));
    for (i2 = 0; i2 < l1.length; i2++) {
        alpha = l1[i2];
        if (!(!inOp(alpha, alphas))) continue;
        alphas.push(alpha);
    };
    /*@200:5*/
    l1 = enumerate("#abcdefghijklmnopqrstuvwxyz");
    for (i2 = 0; i2 < l1.length; i2++) {
        alpha = l1[i2];
        var slug;
        slug = (alpha === '#') ? 'num' : alpha;
        /*@202:9*/
        if (inOp(alpha, alphas)) {
            output += (((('<li><a href="#' + slug) + '">') + alpha.toUpperCase()) + '</a></li> ');
        } else {
            output += (('<li><span>' + alpha.toUpperCase()) + '</span></li> ');
        };
    };
    /*@207:5*/
    output += '</ul>\n<article>\n';

    // Generate tables
    l1 = enumerate(alphas);
    for (i2 = 0; i2 < l1.length; i2++) {
        alpha = l1[i2];
        var slug, i3, l2, keyword;
        /*@211:9*/
        slug = (alpha === '#') ? 'num' : alpha;
        output += ((((('<h2 class="alpha" id="' + slug) + '"><a href="#nav">') + alpha) + '</a></h2>\n') + '<ul class="index">\n');
        l2 = enumerate(keys.filter(function(x) {
            return getAlpha(x) === alpha;
        }));
        for (i3 = 0; i3 < l2.length; i3++) {
            keyword = l2[i3];
            var i4, l3, p, id, context;
            /*@216:13*/
            output += (('<li>' + keyword) + ' ');
            l3 = enumerate(data[keyword]);
            for (i4 = 0; i4 < l3.length; i4++) {
                (function(r) {
                    p = r[0];
                    id = r[1];
                    context = (function() {
                        r1 = r[2];
                        if (((typeof r1) === 'undefined') || (r1 == null)) {
                            return '';
                        };
                        return r1;
                    })();
                    return r;
                })(l3[i4]);
                /*@219:17*/
                output += (((((('<a href="' + path.join(relative, p)) + id) + '" data-path="') + p) + id) + '" class="tag index">');
                output += ((context.trim() !== '') ? context : id);
                output += '</a> ';
            };
            /*@224:13*/
            output += '</li>\n';
        };
        output += '</ul>\n';
    };
    /*@228:5*/
    return output + '</article>';
};
exports.renderLinearNav = function() {
    var prev, next, relative, output;
    (function(r) {
        prev = r[0];
        next = r[1];
        relative = (function() {
            r1 = r[2];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return './';
            };
            return r1;
        })();
        return r;
    })(arguments);
    /*@231:5*/
    output = '<p class="nav">\n';
    if (prev != null) {
        output += (((('<a href="' + path.join(relative, prev.path)) + '" class="prev">&laquo; ') + prev.title) + '</a>\n');
    };
    /*@235:5*/
    if (next != null) {
        output += (((('<a href="' + path.join(relative, next.path)) + '" class="next">') + next.title) + ' &raquo;</a>\n');
    };
    return output + '</p>';
};
/*@240:1*/
exports.getAllTags = function(dirname) {
    if (!inOp(dirname, cache)) {
        var files, tags, i1, l1, file;
        files = readdirRecursive(dirname).filter(function(x) {
            return path.basename(x) === 'tags.md';
        });
        /*@243:9*/
        tags = [];
        l1 = enumerate(files);
        for (i1 = 0; i1 < l1.length; i1++) {
            file = l1[i1];
            /*@246:13*/
            tags = tags.concat(exports.extractTags(file, dirname));
        };
        cache[dirname] = tags;
    };
    /*@250:5*/
    return cache[dirname];
};
exports.getTagById = function(dirname, id) {
    return exports.getAllTags(dirname).filter(function(tag) {
        return tag.id === id;
    })[0];
};
/*@255:1*/
exports.buildReticule = function(dirname) {
    var execPath, template, bookinfo, macros, toc, linear, alltags, items, keywords, i1, l1, item, nav;
    execPath = process.argv[1];
    if (process.platform === 'win32') {
        /*@257:37*/
        execPath = execPath.replace(/\\/g, '/');
    };
    template = fs.readFileSync(path.join(execPath, '../../view/index.html'), 'utf8');
    bookinfo = exports.getBookInfo(dirname);
    /*@261:5*/
    macros = (inOp('macros', bookinfo)) ? (('$' + bookinfo.macros.join('\n')) + '$') : '';
    console.log('Generate table of contents...');
    toc = (function() {
        var i1, l1, x1;
        r = [];
        l1 = enumerate(bookinfo.toc);
        for (i1 = 0; i1 < l1.length; i1++) {
            x1 = l1[i1];
            r.push(x1);
        };
        r.push({
            title: 'Index',
            path: 'index/'
        });
        return r;
    })();
    /*@266:5*/
    linear = exports.getLinearToc(toc);
    alltags = exports.getAllTags(dirname);
    items = [];
    /*@270:5*/
    keywords = {};
    l1 = enumerate(alltags.map(function(tag) {
        return tag.path;
    }));
    for (i1 = 0; i1 < l1.length; i1++) {
        item = l1[i1];
        if (!(!inOp(item, items))) continue;
        var relative, i2, l2, i, k, nav, sectioninfo, tags, html, kw, value, keyword;
        /*@273:9*/
        items.push(item);
        console.log(('Processing ' + item) + '...');
        try {
            /*@276:14*/
            fs.statSync(path.join(dirname, item, 'tags.md'));
        } catch (e) {
            continue;
        };
        /*@280:9*/
        // Look for prev/next section
        relative = path.join(path.relative(path.join(dirname, item), dirname), './');
        l2 = linear;
        for (i2 in l2) {
            i = l2[i2];
            k = parseInt(i2, 10);
            if (isNaN(k)) k = i2;
            if (!(i.path === item)) continue;
            /*@282:47*/
            break;
        };
        nav = exports.renderLinearNav((function() {
            r = linear[k - 1];
            if (((typeof r) === 'undefined') || (r == null)) {
                return {
                    title: 'Table of Contents',
                    path: './'
                };
            };
            return r;
        })(), linear[k + 1], relative);
        /*@289:9*/
        // Load data
        sectioninfo = linear[k];
        tags = exports.extractTags(path.join(dirname, item, 'tags.md'), dirname);
        (function(r) {
            html = r[0];
            kw = r[1];
            return r;
        })(exports.renderTags(tags, dirname));
        /*@294:9*/
        // Handle index
        l2 = kw;
        for (i2 in l2) {
            value = l2[i2];
            keyword = parseInt(i2, 10);
            if (isNaN(keyword)) keyword = i2;
            /*@295:13*/
            if (!inOp(keyword, keywords)) {
                keywords[keyword] = value;
            } else {
                keywords[keyword] = keywords[keyword].concat(value);
            };
        };
        /*@301:9*/
        // Write data
        fs.writeFileSync(path.join(dirname, item, 'index.html'), fillTemplate(template, {
            title: bookinfo.title,
            section: sectioninfo.title,
            macros: macros,
            toc: exports.renderToc(toc, relative, item),
            relative: relative,
            main: [('<h1>' + sectioninfo.title) + '</h1>', nav, html, nav].join('\n')
        }));
    };
    /*@315:5*/
    console.log('Create front page...');
    nav = exports.renderLinearNav(null, linear[0], './');
    fs.writeFileSync(path.join(dirname, 'index.html'), fillTemplate(template, {
        title: bookinfo.title,
        section: 'Table of Contents',
        toc: exports.renderToc(toc),
        macros: macros,
        relative: './',
        main: [('<h1>' + bookinfo.title) + '</h1>', marked(bookinfo.author).replace('<p>', '<p class="meta">'), '<article>', '<h2>Table of Contents</h2>', exports.renderToc(toc).replace(/<ol/g, '<ul').replace(/<\/ol>/g, '</ul>'), '</article>', nav].join('\n')
    }));
    /*@336:5*/
    console.log('Generate index...');
    nav = exports.renderLinearNav(linear[linear.length - 2], null, '../');
    try {
        /*@340:10*/
        fs.mkdirSync(path.join(dirname, 'index'));
    } catch(e) {};
    (function(x1) {
        return (r = fs).writeFileSync.call(r, x1, JSON.stringify(keywords));
    })(path.join(dirname, 'index/keywords.json'));
    /*@345:5*/
    fs.writeFileSync(path.join(dirname, 'index/index.html'), fillTemplate(template, {
        title: bookinfo.title,
        section: 'Index',
        toc: exports.renderToc(toc, '../', 'index/'),
        macros: macros,
        relative: '../',
        main: ['<h1>Index</h1>', exports.renderIndex(keywords, '../', dirname), nav].join('\n')
    }));
    /*@358:5*/
    console.log('Copy resources...');
    (function(x1) {
        return (r = fs).writeFileSync.call(r, path.join(dirname, 'favicon.ico'), x1);
    })(fs.readFileSync(path.join(execPath, '../../view/favicon.ico')));
    /*@364:5*/
    (function(x1) {
        return (r = fs).writeFileSync.call(r, path.join(dirname, 'reticule.css'), x1);
    })(cssshrink.shrink((function(x1) {
        return fillTemplate.call(null, x1, {
            accent: (function() {
                r = bookinfo.accent;
                if (((typeof r) === 'undefined') || (r == null)) {
                    return '#327CCB';
                };
                return r;
            })()
        });
    })((function(x1) {
        return (r = fs).readFileSync.call(r, x1, 'utf8');
    })(path.join(execPath, '../../view/reticule.css')))));
    /*@370:5*/
    (function(x1) {
        return (r = fs).writeFileSync.call(r, path.join(dirname, 'reticule.js'), x1);
    })((function() {
        var code;
        (function(r) {
            (function(r1) {
                code = r1.code;
                return r1;
            })(r[0]);
            return r;
        })(arguments);
        return code;
    })((function(x1) {
        return (r = uglify).minify.call(r, x1, {
            fromString: true
        });
    })(milk.compile((function(x1) {
        return (r = fs).readFileSync.call(r, x1, 'utf8');
    })(path.join(execPath, '../../view/reticule.milk'))))));
    /*@377:5*/
    console.log('Done.');
};
})();
