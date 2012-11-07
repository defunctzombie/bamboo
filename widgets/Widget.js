var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var Widget = function(parent, element) {
    var self = this;

    element = element || document.createElement('div');
    var elem = self._elem = element;

    function bind_event(dom_name, emit_name) {
        elem[dom_name] = function(ev) {
            self.emit(emit_name, ev);
        };
    }

    bind_event('onclick', 'click');
    bind_event('onkeydown', 'keydown');
    bind_event('onkeyup', 'keyup');
    bind_event('onkeypress', 'keypress');
    bind_event('oncontextmenu', 'contextmenu');

    // TODO(shtylman) context menu stuff
    // need nice way of making context menus on elements
    //_elem.oncontextmenu = function(event) {
    //    return false;
    //};

    // forms
    elem.onsubmit = function(event) {
        // prevent regular submitting
        // we are in the new era!
        event.preventDefault();

        self.emit('submit', event);
    };

    if (!parent) {
        return;
    }

    // box the parent if it is not a widget
    if (!(parent instanceof Widget)) {
        parent.appendChild(elem);
        return;
    }

    if (!elem.parentNode) {
        parent.add_child(self);
    }
};
inherits(Widget, EventEmitter);

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

    self._elem.textContent = text;

    return self;
};

Widget.prototype.append_html = function(html) {
    var self = this;

    self._elem.insertAdjacentHTML('beforeend', html);

    return self;
};

Widget.prototype.remove = function() {
    var self = this;

    self._elem.remove();

    return self;
};

Widget.prototype.empty = function() {
    var self = this;

    var elem = self._elem;
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }

    return self;
};

Widget.prototype.show = function() {
    var self = this;

    // TODO(shtylman) previous display value
    self._elem.style.display = 'block';

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

