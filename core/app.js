var EventEmitter = require('events').EventEmitter;

var inherits = require('inherits');
var dombie = require('dombie');

var render = require('./render');
var fetch = require('./fetch');
var Widget = require('../widgets').Widget;

// ui file name -> widget function
var uis = {};

// load resources
module.exports.init = function(opt) {
    self.ui_files = opt.ui;
    self.widgets = opt.widgets;

    var widgets = opt.widgets || {};
    var files = opt.ui || {};
    var count = 0;

    var emitter = new EventEmitter();

    var uiloader = new UiLoader(widgets);

    (function next(err) {
        if (err) {
            return emitter.emit('error', err);
        }

        if (count >= files.length) {
            return emitter.emit('init');
        }

        var file = files[count++];
        fetch(file + '.html', function(err, content) {
            if (err) {
                return next(err);
            }

            uiloader.load(file, content, function(err, setup) {
                if (err) {
                    return self.emit('error', err);
                }

                uis[file] = setup;
                next();
            });
        });
    })();

    return emitter;
};

module.exports.ui = function(name) {
    var ui = uis[name];
    if (!ui) {
        throw new Error('no ui: ' + name);
    }

    return function(parent) {
        if (parent instanceof Widget) {
            return ui(parent._elem);
        }

        return ui(parent);
    };
};

/// ui

var UiLoader = function(custom) {
    var self = this;
    self.custom_widgets = custom;
};

// return a function which can be called with a parent node
// to create the dom
function gen(parent, dom, custom_widgets, ui) {
    // document body is the parent if no parent specified
    parent = parent || document.body;

    var handler = function(parent, element, node) {

        var maybe_class = element.attributes['data-widget'];
        var custom = custom_widgets[maybe_class];
        if (maybe_class && !custom) {
            console.error('no custom class for: ' + maybe_class);
        }

        var Class = custom || Widget;
        var widget = new Class(parent, node);

        // apply attributes
        var widget_id = element.attributes['id'];

        // widgetid provides access to widget
        if (widget_id) {
            ui[widget_id] = widget;
        }

        return node;
    };

    dom.forEach(function(element) {
        // ui will contain .elements: [], .ids: {}
        render(element, parent, handler);
    });

    return ui;
};

UiLoader.prototype.load = function(name, content, cb) {
    var self = this;
    var custom_widgets = self.custom_widgets;

    // turn content into dom
    dombie(content, function(err, dom) {
        if (err) {
            return cb(err);
        }

        // embedded ui elements are found within <script type="x-bamboo">
        // and the name="" property will be the name
        var embedded_ui = {};

        var setup = function(parent) {
            var ui = {
                ui: embedded_ui
            };

            return gen(parent, dom, custom_widgets, ui);
        };

        // look for script tags in top level elements
        var count = 0;
        (function next() {
            if (count >= dom.length) {
                return cb(null, setup);
            }

            var element = dom[count++];
            if (element.name === 'script' &&
                element.attributes['type'] === 'x-bamboo') {

                return dombie(element.data, function(err, dom) {
                    embedded_ui[element.attributes['name']] = function(parent) {
                        var ui = {};

                        var elem = parent;
                        if (parent instanceof Widget) {
                            elem = parent._elem;
                        }

                        return gen(elem, dom, custom_widgets, ui);
                    };

                    next();
                });
            }

            next();
        })();
    });
};

