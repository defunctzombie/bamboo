var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var ArrayModel = function(Type, init, parent) {
    if (!(this instanceof ArrayModel)) {
        return new ArrayModel(Type, init, parent);
    }

    var self = this;
    EventEmitter.call(this);

    self._Type = Type;
    self._parent = parent;

    if (init) {
        init.forEach(self.push.bind(self));
    }
};

ArrayModel.prototype = new Array();

ArrayModel.prototype.push = function(obj) {
    var self = this;

    var val = self._Type(obj);
    val.parent = function() {
        return self._parent;
    };

    var ret = Array.prototype.push.call(this, val);
    self.emit('push', val);
    return ret;
};

ArrayModel.prototype.emit = EventEmitter.prototype.emit;
ArrayModel.prototype.on = EventEmitter.prototype.on;

module.exports = ArrayModel;
