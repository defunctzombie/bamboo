var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var Widget = function(parent, tag_name) {
    var self = this;

    // if our widget wants to be something else, it should specify
    self.tag_name = tag_name || 'div';

    var _elem = self._elem = self.create_element();

    // TODO(shtylman) should have a top level parent widget
    // to do this
    if (!parent) {
        document.body.appendChild(_elem);
        return;
    }

    function bind_event(dom_name, emit_name) {
        _elem[dom_name] = function(ev) {
            self.emit(emit_name, ev);
        };
    }

    bind_event('onclick', 'click');
    bind_event('onkeydown', 'keydown');
    bind_event('onkeyup', 'keyup');
    bind_event('onkeypress', 'keypress');

    // TODO(shtylman) context menu stuff
    // need nice way of making context menus on elements
    //_elem.oncontextmenu = function(event) {
    //    return false;
    //};

    // forms
    _elem.onsubmit = function(event) {

        // we don't submit our forms
        event.preventDefault();

        self.emit('submit', event);
    };

    // we are now part of the parent in the dom
    parent.add_child(self);
};
inherits(Widget, EventEmitter);

Widget.prototype.create_element = function() {
    var self = this;

    return document.createElement(self.tag_name);
};

Widget.prototype.value = function(val) {
    var self = this;

    if (val !== undefined) {
        self._elem.value = val;
    }

    return self._elem.value;
};

Widget.prototype.attr = function(name, val) {
    var self = this;

    if (val === undefined) {
        return self._elem.getAttribute(name);
    }

    self._elem.setAttribute(name, val);

    return self;
};

Widget.prototype.text = function(text) {
    var self = this;

    self._elem.appendChild(document.createTextNode(text));

    return self;
};

Widget.prototype.show = function() {
    var self = this;

    // TODO(shtylman) previous display value
    self._elem.style.display = 'block';

    self.emit('show');

    return self;
};

Widget.prototype.add_class = function(name) {
    var self = this;

    var existing = self.attr('class');
    if (!existing) {
        return self.attr('class', name);
    }

    if (existing.indexOf(name) >= 0) {
        return;
    }

    self.attr('class', existing + ' ' + name);

    return self;
};

Widget.prototype.remove_class = function(name) {
    var self = this;

    var existing = self.attr('class');
    if (!existing) {
        return self;
    }

    self.attr('class', existing.replace(name, ''));

    return self;
};

Widget.prototype.style = function(name, value) {
    var self = this;

    //self.$_elem.css(css);
    return self;
};

Widget.prototype.hide = function(how) {
    var self = this;

    self._elem.style.display = 'none';
    return self;
};

Widget.prototype.add_child = function(child) {
    var self = this;

    self._elem.appendChild(child._elem);

    //insertBefore
    //replaceChild
    //removeChild

    return self;
};

/// class functions

Widget.extend = function(child) {
    inherits(child, Widget);
};

module.exports = Widget;

