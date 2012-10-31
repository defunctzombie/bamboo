var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var http = require('http');

var Widget = require('../widgets').Widget;

// ui file name -> widget function
var uis = {};

/// load the given file
var fetch = function(path, cb) {

    // TODO(shtylman) I am sure there is some library doing this
    var xmlhttp = new XMLHttpRequest();

    // TODO(shtylman) handle error
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            return cb(null, xmlhttp.responseText);
        }
    }

    xmlhttp.open('GET', path, true);
    xmlhttp.send();
};

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

/// element or elements
function wrap_element(element, ui) {
    var uiloader = this;

    if (Array.isArray(element)) {

        // all of these will be run in order
        // to create the widget
        var funcs = [];

        element.forEach(function(element) {
            funcs.push(wrap_element.bind(uiloader)(element, ui));
        });

        return function(widget) {
            // apply all of the loaded elements onto the widget
            funcs.forEach(function(func) {
                func(widget);
            });

            return widget;
        };
    }

    switch (element.type) {
    case 'tag':
        return function(parent) {
            var maybe_class = element.attributes['data-widget'];
            var custom = uiloader.custom_widgets[maybe_class];
            if (maybe_class && !custom) {
                console.error('no custom class for: ' + class_name);
            }

            if (custom) {
                var widget = new custom(parent);
            }
            else {
                var widget = new Widget(parent, element.name);
            }

            // apply attributes
            var widget_id = element.attributes['id'];

            // widgetid provides access to widget
            if (widget_id) {
                ui[widget_id] = widget;
            }

            var attributes = element.attributes;
            Object.keys(attributes).forEach(function(name) {
                widget.attr(name, attributes[name]);
            });

            element.children = element.children || [];

            // this widget is now the parent
            wrap_element.bind(uiloader)(element.children, ui)(widget);
        };
        break;
    case 'text':
        return function(parent) {
            parent.text(element.data);
        };
        break;
    case 'comment':
        break;
    };

    return function(parent) {};
};

module.exports.ui = function(name) {
    var ui = uis[name];
    if (!ui) {
        throw new Error('no ui: ' + name);
    }

    return ui;
};

/// ui

var UiLoader = function(custom) {
    var self = this;
    self.custom_widgets = custom;
};

var dombie = require('dombie');

UiLoader.prototype.load = function(name, content, cb) {
    var self = this;

    // turn content into dom
    dombie(content, function(err, dom) {

        var setup = function(parent) {
            var ui = {};

            // all of these will be run in order
            // to create the widget
            var funcs = [];

            dom.forEach(function(element) {
                funcs.push(wrap_element.bind(self)(element, ui));
            });

            var widget = new Widget(parent);

            // apply all of the loaded elements onto the widget
            funcs.forEach(function(func) {
                func(widget);
            });

            ui._ui = widget;

            return ui;
        };

        cb(null, setup);
    });
};

