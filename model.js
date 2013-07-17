var EventEmitter = require('events').EventEmitter;
var inherit = require('inherit');
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
                prop_val = ArrayModel(config[0], prop_val, self);
            }

            if (typeof config === 'object' && (config.type instanceof Array)) {
                prop_val = ArrayModel(config.type[0], prop_val, self);

                if (config.push) {
                    prop_val.on('push', config.push.bind(self));

                    // TODO ??
                    prop_val.on('remove', function() {
                        prop_val.off('push', config.push);
                    });
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

    //inherit(Construct, EventEmitter);
    Construct.prototype = new EventEmitter();

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
