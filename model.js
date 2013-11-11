var Emitter = require('emitter');

var config = require('./config');
var ArrayModel = require('./array_model');

var Model = function(opt) {
    var properties = Object.keys(opt);

    // ajax function for CRUD
    var ajax = config.ajax;

    var Construct = function(initial) {
        if (!(this instanceof Construct)) {
            return new Construct(initial);
        }

        Emitter.call(this);

        var self = this;

        // default state is saved
        self._saved = true;

        // basepath for the url
        self.url_root = Construct.url_root;

        if (initial) {
            self.id = initial.id;
        }

        // url property can be used to overrride the model's url
        var _url = undefined;
        Object.defineProperty(self, 'url', {
            get: function() {
                // if user explicitly set, return their value
                if (_url) {
                    return _url;
                }

                if (self.is_new()) {
                    return self.url_root;
                }

                return self.url_root + '/' + self.id;
            },
            set: function(val) {
                _url = val;
            }
        });

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

            // create an object wrapper, this lets us emit events
            // when internal properties are set
            function inner_obj(key_path, props, initial) {
                var properties = {};
                initial = initial || {};

                Object.keys(props).forEach(function(key) {
                    var path = key_path + '.' + key;
                    var value_holder = initial[key];

                    properties[key] = {
                        enumerable: true,
                        get: function() {
                            return value_holder;
                        },
                        set: function(val) {
                            var old = value_holder;
                            value_holder = val;
                            self.emit('change ' + path, val, old);
                        }
                    }
                });
                return Object.create(null, properties);
            }

            // user specified an inner object
            var keys = Object.keys(config);
            if (keys.length > 0) {

                prop_val = inner_obj(prop, config, prop_val);

                // if the nothing above captured and config is a regular object
                // see if it has keys
                Object.defineProperty(self, prop, {
                    enumerable: true,
                    get: function() {
                        return prop_val;
                    },
                    set: function(val) {
                        var old = prop_val;
                        prop_val = inner_obj(prop, config, val);
                        self._saved = false;
                        self.emit('change ' + prop, prop_val, old);
                    }
                });

                return;
            }

            // if the nothing above captured and config is a single valueish
            Object.defineProperty(self, prop, {
                enumerable: true,
                get: function() {
                    return prop_val;
                },
                set: function(val) {
                    var old = prop_val;
                    prop_val = val;
                    self._saved = false;
                    self.emit('change ' + prop, prop_val, old);
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

    // if the model has an ID property, then it is not considered new
    Construct.prototype.is_new = function() {
        var self = this;
        return !self.id;
    };

    // return true if the model state has been persistent to the server
    // false for 'is_new()' or if a property has changed since last sync
    Construct.prototype.is_saved = function() {
        var self = this;
        return !self.is_new() && self._saved;
    };

    Construct.prototype.save = function(cb) {
        var self = this;

        // TODO, not sure about this...
        if (self.parent) {
            return self.parent.save();
        }

        cb = cb || function() {};

        var ajax_opt = {
            url: self.url,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: self,
        };

        var is_new = self.is_new();
        ajax_opt.method = is_new ? 'POST' : 'PUT';

        ajax(ajax_opt, function(err, res) {
            if (err) {
                return cb(err);
            }

            // only expect id back if new
            // for updating existing we don't do this?
            if (is_new) {
                var body = res.body;
                self.id = body.id;
            }

            return cb(null);
        });
    };

    Construct.prototype.fetch = function(id, cb) {
        var self = this;

        var ajax_opt = {
            url: self.url_root + '/' + id,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        ajax(ajax_opt, function(err, res) {
            if (err) {
                return cb(err);
            }

            // set our properties
            var body = res.body;
            for (var key in body) {
                self[key] = body[key];
            }

            return cb(null);
        });
    };

    Construct.prototype.destroy = function(cb) {
        var self = this;
        // model was never saved to server
        if (self.is_new()) {
            return;
        }

        var ajax_opt = {
            url: self.url,
            method: 'DELETE'
        };

        ajax(ajax_opt, function(err) {
            if (err) {
                return cb(err);
            }

            self.emit('destroy');
            cb(null);
        });
    };

    return Construct;
};

module.exports = Model;
