(function() {
var fs, path, url, diacritic, marked, milk, uglify, cssshrink, renderers, localization, ReticuleRenderer, TocRenderer, LinearTocRenderer, cache, readdirRecursive, fillTemplate, loadFile, r, r1;
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
/*@3:1*/
// -*-javascript-*-
fs = require('fs');
path = require('path').posix;
url = require('url');
/*@6:1*/
diacritic = require('diacritic');
marked = require('marked').setOptions({
    smartypants: true
});
/*@8:1*/
milk = require('milk-lang');
uglify = require('uglify-js');
cssshrink = require('cssshrink');
/*@11:1*/
renderers = require('./renderers');
localization = require('./localization');
ReticuleRenderer = renderers.ReticuleRenderer;
/*@15:1*/
TocRenderer = renderers.TocRenderer;
LinearTocRenderer = renderers.LinearTocRenderer;
cache = {};
/*@20:1*/
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
    /*@23:5*/
    l1 = enumerate(items);
    for (i1 = 0; i1 < l1.length; i1++) {
        item = l1[i1];
        if (!(fs.statSync(item).isDirectory())) continue;
        items = items.concat(readdirRecursive(item));
    };
    /*@26:5*/
    return items;
};
fillTemplate = function(template, context) {
    var escaperegex, i1, l1, v, k;
    /*@29:5*/
    escaperegex = function(x) {
        return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };
    l1 = context;
    for (i1 in l1) {
        v = l1[i1];
        k = parseInt(i1, 10);
        if (isNaN(k)) k = i1;
        /*@32:9*/
        template = template.replace(new RegExp(('{{' + escaperegex(k)) + '}}', 'g'), v);
    };
    return template;
};
/*@36:1*/
loadFile = compose(function(x1) {
    return (r1 = fs).readFileSync.call(r1, x1, 'utf8');
}, (r = path).join, null, r);
exports.getBookInfo = compose((r = JSON).parse, function(x1) {
    return loadFile.call(null, x1, 'book.json');
}, r, null);
/*@40:1*/
exports.getToc = function(x1) {
    return loadFile.call(null, x1, 'toc.md');
};
exports.getMacros = function(x1) {
    return loadFile.call(null, x1, 'macros.tex');
};
/*@44:1*/
exports.getLinearToc = function(toc) {
    var renderer;
    renderer = new LinearTocRenderer();
    marked(toc, {
        renderer: renderer
    });
    /*@47:5*/
    return renderer.lineartoc;
};
exports.renderToc = function(toc, dirname, currentpath) {
    return marked(toc, {
        renderer: new TocRenderer(dirname, currentpath)
    });
};
/*@52:1*/
exports.extractTags = function(filename, dirname) {
    if (!inOp(filename, cache)) {
        var tags;
        tags = [];
        /*@56:9*/
        try {
            var content, tagheaders, tagslength, i1, l1, l, i;
            content = loadFile(filename).replace(/\r\n/g, '\n').split('\n');
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
            /*@59:13*/
            tagslength = content.filter(tagheaders).length;
            if (tagslength === 0) {
                return [];
            };
            /*@62:13*/
            l1 = content;
            for (i1 in l1) {
                l = l1[i1];
                i = parseInt(i1, 10);
                if (isNaN(i)) i = i1;
                if (!(tagheaders(l))) continue;
                /*@62:51*/
                break;
            };
            while (tags.length < tagslength) {
                var start, step, j, tag;
                /*@65:17*/
                start = i + 1;
                step = 1;
                for (j = start; true; j += step) {
                    if (!((j === content.length) || tagheaders(content[j]))) continue;
                    break;
                };
                /*@67:17*/
                tag = exports.parseTag(content.slice(i, (j - 1) + 1));
                tag.path = path.join(path.relative(dirname, path.join(filename, '..')), './');
                tags.push(tag);
                /*@71:17*/
                i = j;
            };
        } catch(e) {};
        cache[filename] = tags;
    };
    /*@75:5*/
    return cache[filename];
};
exports.renderTags = function(tags, dirname) {
    var output, keywords, __, i1, l1, tag;
    /*@78:5*/
    output = '';
    keywords = {};
    __ = function(x1) {
        return (r = localization).get.call(r, dirname, x1);
    };
    /*@82:5*/
    l1 = enumerate(tags);
    for (i1 = 0; i1 < l1.length; i1++) {
        tag = l1[i1];
        var renderer, options, prefix, i2, l2, keyword, context;
        renderer = new ReticuleRenderer(dirname, tag.path);
        /*@84:9*/
        options = {
            renderer: renderer
        };
        prefix = ('<p><a class="label" href="' + tag.id) + '">';
        /*@87:9*/
        if (tag.type.trim() !== '') {
            prefix += (((tag.type + ' ') + tag.id.slice(1).replace(/-/g, '.')) + '.');
        } else {
            prefix += __('&para;');
        };
        /*@91:9*/
        prefix += '</a></p>\n';
        output += ((((('<article id="' + tag.id.slice(1)) + '">\n') + prefix) + marked(tag.assertion, options)) + '\n');
        if (tag.proof != null) {
            /*@98:13*/
            output += ((((((('<p><em class="label">' + __('Proof')) + '.') + '</em></p>\n<section class="proof">\n') + marked(tag.proof, options)) + '\n<p class="qed">') + __('$\\square$')) + '</p>\n</section>');
        };
        output += '</article>\n';
        l2 = enumerate(renderer.keywords);
        for (i2 = 0; i2 < l2.length; i2++) {
            (function(r) {
                keyword = r[0];
                context = r[1];
                return r;
            })(l2[i2]);
            var tuple;
            /*@109:13*/
            tuple = [tag.path, tag.id];
            if (context !== '') {
                tuple.push(context);
            };
            /*@112:13*/
            if (!inOp(keyword, keywords)) {
                keywords[keyword] = [tuple];
            } else {
                keywords[keyword].push(tuple);
            };
        };
    };
    /*@117:5*/
    return [output, keywords];
};
exports.parseTag = function(lines) {
    var separator, start, step, k, j, id, type, assertion, proof;
    /*@120:5*/
    separator = function(x) {
        return (x !== '') && x.split('').every(function(y) {
            return y === '-';
        });
    };
    /*@121:5*/
    start = 0;
    step = 1;
    for (k = start; true; k += step) {
        if (!((k === lines.length) || separator(lines[k]))) continue;
        break;
    };
    /*@123:5*/
    j = lines[0].indexOf(':');
    id = (j === (-1)) ? lines[0] : lines[0].substring(0, j);
    type = (j === (-1)) ? '' : lines[0].substring(j + 1);
    /*@126:5*/
    assertion = lines.slice(1, (k - 1) + 1).join('\n').trim();
    proof = ((k + 1) < lines.length) ? lines.slice(k + 1).join('\n').trim() : null;
    return {
        id: id,
        type: type,
        assertion: assertion,
        proof: proof
    };
};
/*@133:1*/
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
    /*@134:5*/
    output = '<ul id="nav" class="nav">';
    compare = function(p, q, f) {
        return (f(p) === f(q)) ? 0 : ((f(p) < f(q)) ? (-1) : 1);
    };
    /*@137:5*/
    map = function(x) {
        return diacritic.clean(x).toLowerCase().replace(/[^0-9a-zA-Z]/g, '');
    };
    getAlpha = function(x) {
        var a;
        return ((a = map(x)[0]) === parseInt(a, 10)) ? '#' : a;
    };
    /*@140:5*/
    keys = Object.keys(data);
    keys.sort(function(x1, x2) {
        return compare.call(null, x1, x2, map);
    });
    /*@143:5*/
    if (keys.length === 0) {
        return '';
    };

    // Create alphas
    alphas = [];
    /*@147:5*/
    l1 = enumerate(keys.map(getAlpha));
    for (i2 = 0; i2 < l1.length; i2++) {
        alpha = l1[i2];
        if (!(!inOp(alpha, alphas))) continue;
        alphas.push(alpha);
    };
    /*@150:5*/
    l1 = enumerate("#abcdefghijklmnopqrstuvwxyz");
    for (i2 = 0; i2 < l1.length; i2++) {
        alpha = l1[i2];
        var slug;
        slug = (alpha === '#') ? 'num' : alpha;
        /*@152:9*/
        if (inOp(alpha, alphas)) {
            output += (((('<li><a href="#' + slug) + '">') + alpha.toUpperCase()) + '</a></li> ');
        } else {
            output += (('<li><span>' + alpha.toUpperCase()) + '</span></li> ');
        };
    };
    /*@157:5*/
    output += '</ul>\n<article>\n';

    // Generate tables
    l1 = enumerate(alphas);
    for (i2 = 0; i2 < l1.length; i2++) {
        alpha = l1[i2];
        var slug, i3, l2, keyword;
        /*@161:9*/
        slug = (alpha === '#') ? 'num' : alpha;
        output += ((((('<h2 class="alpha" id="' + slug) + '"><a href="#nav">') + alpha) + '</a></h2>\n') + '<ul class="index">\n');
        l2 = enumerate(keys.filter(function(x) {
            return getAlpha(x) === alpha;
        }));
        for (i3 = 0; i3 < l2.length; i3++) {
            keyword = l2[i3];
            var i4, l3, p, id, context;
            /*@166:13*/
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
                /*@169:17*/
                output += (((((('<a href="' + path.join(relative, p)) + id) + '" data-path="') + p) + id) + '" class="tag index">');
                output += ((context.trim() !== '') ? context : id);
                output += '</a> ';
            };
            /*@174:13*/
            output += '</li>\n';
        };
        output += '</ul>\n';
    };
    /*@178:5*/
    return output + '</article>';
};
exports.renderLinearNav = function() {
    var __, prev, next, relative, showToc, output;
    (function(r) {
        __ = r[0];
        prev = r[1];
        next = r[2];
        relative = (function() {
            r1 = r[3];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return './';
            };
            return r1;
        })();
        showToc = (function() {
            r1 = r[4];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return true;
            };
            return r1;
        })();
        return r;
    })(arguments);
    /*@181:5*/
    output = '<p class="nav">\n';
    if (prev != null) {
        output += (((('<a href="' + path.join(relative, prev.path)) + '" class="prev">&laquo; ') + prev.title) + '</a>\n');
    };
    /*@186:5*/
    if (showToc) {
        output += (((('<a href="' + relative) + '" class="middle">') + __('Table of Contents')) + '</a>\n');
    };
    if (next != null) {
        /*@190:9*/
        output += (((('<a href="' + path.join(relative, next.path)) + '" class="next">') + next.title) + ' &raquo;</a>\n');
    };
    return output + '</p>';
};
/*@194:1*/
exports.getAllTags = function(dirname) {
    if (!inOp(dirname, cache)) {
        var files, tags, i1, l1, file;
        files = readdirRecursive(dirname).filter(function(x) {
            return path.basename(x) === 'tags.md';
        });
        /*@197:9*/
        tags = [];
        l1 = enumerate(files);
        for (i1 = 0; i1 < l1.length; i1++) {
            file = l1[i1];
            /*@200:13*/
            tags = tags.concat(exports.extractTags(file, dirname));
        };
        cache[dirname] = tags;
    };
    /*@204:5*/
    return cache[dirname];
};
exports.getTagById = function(dirname, id) {
    return exports.getAllTags(dirname).filter(function(tag) {
        return tag.id === id;
    })[0];
};
/*@209:1*/
exports.renderFooter = function() {
    var __, bookinfo, file, result;
    (function(r) {
        __ = r[0];
        bookinfo = r[1];
        file = (function() {
            r1 = r[2];
            if (((typeof r1) === 'undefined') || (r1 == null)) {
                return null;
            };
            return r1;
        })();
        return r;
    })(arguments);
    /*@210:5*/
    result = '';
    if (inOp('github', bookinfo)) {
        result += (((('<a href="' + bookinfo.github) + '">') + __('GitHub')) + '</a> ');
    };
    /*@215:5*/
    if (file != null) {
        var href;
        href = bookinfo.github;
        if (!inOp('tree/master', bookinfo.github)) {
            /*@218:13*/
            href = url.resolve(href, 'tree/master/');
        };
        href = url.resolve(href, file);
        result += (((('<a href="' + href) + '">') + __('Edit page')) + '</a> ');
    };
    /*@223:5*/
    return ((result + '<a href="https://github.com/yishn/reticule">') + __('Generated by reticule')) + '</a>';
};
exports.buildReticule = function(dirname) {
    var __, execPath, template, bookinfo, renderer, macros, toc, linear, alltags, items, keywords, i1, l1, item, nav, renderedtoc, y1, key;
    /*@226:5*/
    __ = function(x1) {
        return (r = localization).get.call(r, dirname, x1);
    };
    execPath = process.argv[1];
    /*@228:5*/
    if (process.platform === 'win32') {
        execPath = execPath.replace(/\\/g, '/');
    };
    template = loadFile(execPath, '../../view/index.html');
    /*@231:5*/
    bookinfo = exports.getBookInfo(dirname);
    renderer = new ReticuleRenderer(dirname, dirname);
    macros = '';
    /*@234:5*/
    try {
        macros = marked(exports.getMacros(dirname).split('\n').map(function(x) {
            return '    ' + x;
        }).join('\n'), {
            renderer: renderer
        });
    } catch(e) {};
    /*@236:5*/
    console.log('Generate table of contents...');
    toc = exports.getToc(dirname);
    linear = exports.getLinearToc(toc);
    /*@241:5*/
    alltags = exports.getAllTags(dirname);
    items = [];
    keywords = {};
    /*@245:5*/
    l1 = enumerate(alltags.map(function(tag) {
        return tag.path;
    }));
    for (i1 = 0; i1 < l1.length; i1++) {
        item = l1[i1];
        if (!(!inOp(item, items))) continue;
        var relative, i2, l2, i, k, nav, sectioninfo, tags, html, kw, value, keyword;
        /*@246:9*/
        items.push(item);
        console.log(('Processing ' + item) + '...');
        try {
            /*@249:14*/
            fs.statSync(path.join(dirname, item, 'tags.md'));
        } catch (e) {
            continue;
        };
        /*@253:9*/
        // Look for prev/next section
        relative = path.join(path.relative(path.join(dirname, item), dirname), './');
        l2 = linear;
        for (i2 in l2) {
            i = l2[i2];
            k = parseInt(i2, 10);
            if (isNaN(k)) k = i2;
            if (!(i.path === item)) continue;
            /*@255:47*/
            break;
        };
        nav = exports.renderLinearNav(__, (function() {
            r = linear[k - 1];
            if (((typeof r) === 'undefined') || (r == null)) {
                return {
                    title: __('Table of Contents'),
                    path: './'
                };
            };
            return r;
        })(), linear[k + 1], relative);
        /*@262:9*/
        // Load data
        sectioninfo = linear[k];
        tags = exports.extractTags(path.join(dirname, item, 'tags.md'), dirname);
        (function(r) {
            html = r[0];
            kw = r[1];
            return r;
        })(exports.renderTags(tags, dirname));
        /*@267:9*/
        // Handle index
        l2 = kw;
        for (i2 in l2) {
            value = l2[i2];
            keyword = parseInt(i2, 10);
            if (isNaN(keyword)) keyword = i2;
            /*@268:13*/
            if (!inOp(keyword, keywords)) {
                keywords[keyword] = value;
            } else {
                keywords[keyword] = keywords[keyword].concat(value);
            };
        };
        /*@274:9*/
        // Write data
        fs.writeFileSync(path.join(dirname, item, 'index.html'), fillTemplate(template, {
            lang: (function() {
                r = bookinfo.lang;
                if (((typeof r) === 'undefined') || (r == null)) {
                    return 'en';
                };
                return r;
            })(),
            title: bookinfo.title,
            section: sectioninfo.title,
            macros: macros,
            toc: exports.renderToc(toc, dirname, item),
            relative: relative,
            main: [('<h1>' + sectioninfo.title) + '</h1>', nav, html, nav].join('\n'),
            footer: exports.renderFooter(__, bookinfo, path.join(item, 'tags.md'))
        }));
    };
    /*@290:5*/
    console.log('Create front page...');
    nav = exports.renderLinearNav(__, null, linear[0], './', false);
    renderedtoc = exports.renderToc(toc, dirname, './');
    /*@295:5*/
    fs.writeFileSync(path.join(dirname, 'index.html'), fillTemplate(template, {
        lang: (function() {
            r = bookinfo.lang;
            if (((typeof r) === 'undefined') || (r == null)) {
                return 'en';
            };
            return r;
        })(),
        title: bookinfo.title,
        section: __('Table of Contents'),
        toc: renderedtoc,
        macros: macros,
        relative: './',
        main: [('<h1>' + bookinfo.title) + '</h1>', marked(bookinfo.author).replace('<p>', '<p class="meta">'), '<article>', ('<h2>' + __('Table of Contents')) + '</h2>', renderedtoc.replace(/<ol/g, '<ul').replace(/<\/ol>/g, '</ul>'), '</article>', nav].join('\n'),
        footer: exports.renderFooter(__, bookinfo, 'toc.md')
    }));
    /*@314:5*/
    console.log('Generate index...');
    nav = exports.renderLinearNav(__, linear[linear.length - 2], null, '../');
    try {
        /*@318:10*/
        fs.mkdirSync(path.join(dirname, 'index'));
    } catch(e) {};

    // Sort index
    l1 = keywords;
    for (i1 in l1) {
        y1 = l1[i1];
        key = parseInt(i1, 10);
        if (isNaN(key)) key = i1;
        /*@322:9*/
        keywords[key].sort(function() {
            var i, x, j, y;
            (function(r) {
                (function(r1) {
                    i = r1[1];
                    x = r1[2];
                    return r1;
                })(r[0]);
                (function(r1) {
                    j = r1[1];
                    y = r1[2];
                    return r1;
                })(r[1]);
                return r;
            })(arguments);
            /*@323:13*/
            (function(r) {
                x = r[0];
                y = r[1];
                return r;
            })([(((typeof x) === 'undefined') || (x == null)) ? i : x, (((typeof y) === 'undefined') || (y == null)) ? j : y].map(function(x) {
                return diacritic.clean(x).toLowerCase();
            }));
            /*@324:13*/
            return (x === y) ? 0 : ((x < y) ? (-1) : 1);
        });
    };
    (function(x1) {
        return (r = fs).writeFileSync.call(r, x1, JSON.stringify(keywords));
    })(path.join(dirname, 'index/keywords.json'));
    /*@329:5*/
    fs.writeFileSync(path.join(dirname, 'index/index.html'), fillTemplate(template, {
        lang: (function() {
            r = bookinfo.lang;
            if (((typeof r) === 'undefined') || (r == null)) {
                return 'en';
            };
            return r;
        })(),
        title: bookinfo.title,
        section: __('Index'),
        toc: exports.renderToc(toc, dirname, 'index/'),
        macros: macros,
        relative: '../',
        main: [('<h1>' + __('Index')) + '</h1>', exports.renderIndex(keywords, '../', dirname), nav].join('\n'),
        footer: exports.renderFooter(__, bookinfo)
    }));
    /*@344:5*/
    console.log('Copy resources...');
    (function(x1) {
        return (r = fs).writeFileSync.call(r, path.join(dirname, 'favicon.ico'), x1);
    })(fs.readFileSync(path.join(execPath, '../../view/favicon.ico')));
    /*@350:5*/
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
    })(loadFile(execPath, '../../view/reticule.css'))));
    /*@355:5*/
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
    })(milk.compile(loadFile(execPath, '../../view/reticule.milk')))));
    /*@361:5*/
    console.log('Done.');
};
exports.getUnusedId = function(dirname) {
    var alpha, alltags, innerTag, getTag, increment;
    /*@364:5*/
    alpha = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
    alltags = exports.getAllTags(dirname);
    innerTag = [0, 0, 0, 0];
    /*@368:5*/
    getTag = function(x) {
        return '#' + x.map(function(y) {
            return alpha[y];
        }).join('');
    };
    /*@369:5*/
    increment = function() {
        var first, last;
        (function(r) {
            (function(r1) {
                first = (0 >= (r1.length - 1)) ? [] : [].slice.call(r1, 0, -1);
                last = r1[r1.length - 1];
                return r1;
            })(r[0]);
            return r;
        })(arguments);
        /*@370:9*/
        if (first.length === 0) {
            return [last];
        } else if ((last + 1) === alpha.length) {
            return increment(first).concat(0);
        } else {
            /*@375:13*/
            return first.concat(last + 1);
        };
    };
    while (alltags.some(function() {
        var id;
        (function(r) {
            (function(r1) {
                id = r1.id;
                return r1;
            })(r[0]);
            return r;
        })(arguments);
        return id === getTag(innerTag);
    })) {
        /*@378:9*/
        innerTag = increment(innerTag);
    };
    return getTag(innerTag);
};
})();
