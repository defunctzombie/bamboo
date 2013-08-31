var Emitter = require('emitter');

var ArrayModel = function(Type, init, parent) {
    if (!(this instanceof ArrayModel)) {
        return new ArrayModel(Type, init, parent);
    }

    var self = this;
    Array.call(this);

    self._Type = Type;

    if (init) {
        init.forEach(self.push.bind(self));
    }

    Object.defineProperty(self, '_parent', {
        get: function() {
            return parent;
        }
    })
};

ArrayModel.prototype = new Array();

Emitter(ArrayModel.prototype);

ArrayModel.prototype.toJSON = function() {
    return Array.prototype.slice.call(this);
};

ArrayModel.prototype.push = function(obj) {
    var self = this;

    var val = self._Type(obj);
    if (typeof val === 'object') {
        Object.defineProperty(val, 'parent', {
            get: function() {
                return self._parent;
            }
        });
    }

    Array.prototype.push.call(self, val);

    self.emit('add', val);
    return val;
};

module.exports = ArrayModel;
