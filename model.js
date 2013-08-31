var Emitter = require('emitter');
var ajax = require('superagent');

var ArrayModel = require('./array_model');

var Model = function(opt) {
    var properties = Object.keys(opt);

    var Construct = function(initial) {
        if (!(this instanceof Construct)) {
            return new Construct(initial);
        }

        Emitter.call(this);

        var self = this;
        self.is_new = true;

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

            if (prop_val && config instanceof Function && !(prop_val instanceof config)) {
                prop_val = config(prop_val);
            }

            if (config.type === 'property') {
                Object.defineProperty(self, prop, {
                    enumerable: false,
                    get: config.get
                });

                function change_event() {
                    self.emit('change ' + prop);
                }

                config.depends.forEach(function(parent_prop) {
                    self.on('change ' + parent_prop, change_event);
                });
                return;
            }

            Object.defineProperty(self, prop, {
                enumerable: true,
                get: function() {
                    return prop_val;
                },
                set: function(val) {
                    var old = prop_val;
                    prop_val = val;
                    self.emit('change ' + prop, val, old);
                }
            });
        });
    };

    Emitter(Construct.prototype);

    Construct.prototype.toJSON = function() {
        var self = this;
        var obj = {};

        properties.forEach(function(prop) {
            if (!self[prop]) {
                return;
            }

            obj[prop] = self[prop];
        });

        return obj;
    };

    Construct.prototype.save = function(cb) {
        var self = this;
        if (self.parent) {
            return self.parent.save();
        }

        cb = cb || function() {};

        if (self.is_new) {
            return ajax.post(self.url).send(self).end(function(err, res) {
                if (err) {
                    return cb(err);
                }

                if (res.status !== 200) {
                    return cb(new Error(res.body.error || 'failed to save'));
                }

                self.is_new = false;
                // id of the model should be the response
                self.id = res.body.id;
                self.url += '/' + self.id;

                return cb(null);
            });
        }

        ajax.put(self.url).send(self).end(function(err, res) {
            return cb(err);
        });
    };

    Construct.prototype.fetch = function(cb) {
        var self = this;
        ajax.get(self.url).end(function(err, res) {
            if (err) {
                return cb(err);
            }

            if (res.status !== 200) {
                return cb(new Error('failed to fetch'));
            }

            var val = Construct(res.body);
            val.is_new = false;
            val.url = self.url;

            cb(null, val);
        });
    };

    Construct.prototype.remove = function(cb) {
        var self = this;
        // model was never saved to server
        if (self.is_new) {
            return;
        }

        ajax.del(self.url).end(function(err, res) {
            cb(null);
            self.emit('remove');
        });
    };

    return Construct;
};

module.exports = Model;
