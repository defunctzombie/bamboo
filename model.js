var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var ajax = require('superagent');

var ArrayModel = require('./array_model');

var Model = function(opt) {
    var properties = Object.keys(opt);

    var Construct = function(initial) {
        if (!(this instanceof Construct)) {
            return new Construct(initial);
        }

        var self = this;

        properties.forEach(function(prop) {
            var config = opt[prop];

            var prop_val = (initial) ? initial[prop] : undefined;

            if (config instanceof Array) {
                var item = config[0];

                if (typeof item === 'object') {
                    prop_val = ArrayModel(Model(item), prop_val, self);
                }
                else {
                    prop_val = ArrayModel(item, prop_val, self);
                }
            }

            Object.defineProperty(self, prop, {
                enumerable: true,
                get: function() {
                    return prop_val;
                },
                set: function(val) {
                    var old = prop_val;
                    prop_val = val;
                    self.emit('change:' + prop, val, old);
                }
            });
        });
    };

    inherits(Construct, EventEmitter);

    Construct.prototype.save = function() {
        var self = this;
        if (self.parent) {
            return self.parent.save();
        }

        ajax.put(self.url).send(self).end();
    };

    Construct.prototype.fetch = function(cb) {
        var self = this;
        ajax.get(self.url).end(function(res) {
            var val = Construct(res.body);
            cb(null, val);
        });
    };

    return Construct;
};

module.exports = Model;
