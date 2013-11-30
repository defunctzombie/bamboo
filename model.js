var Emitter = require('emitter');
var xtend = require('xtend');

var ArrayModel = require('./array_model');

var Model = function(schema, opt) {
    opt = opt || {};
    schema = schema || {};

    var properties = Object.keys(schema);

    // sync function for CRUD
    var sync = opt.sync;

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
            var config = schema[prop];

            var prop_val = (initial) ? initial[prop] : undefined;

            if (config instanceof Array) {
                var item = config[0];

                // shit... so in this case, we don't need a submodel
                // the issue is we have created a Model for each item
                // but, our model does not get the proper url rool
                if (typeof item === 'object') {
                    prop_val = ArrayModel(Model(item, opt), prop_val, self);
                }
                else {
                    prop_val = ArrayModel(item, prop_val, self);
                }
            }

            var is_constructor = false;

            if (prop_val && config instanceof Function && !(prop_val instanceof config)) {
                is_constructor = true;
                prop_val = config(prop_val);
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

                var proto = null;
                return Object.create(proto, properties);
            }

            if (config instanceof Function) {
                // oh.. so the issue is that if property of a model is a model
                // then we need to pass the events along?
                //
                // the inside one is a model
                // but we need the event to be emitted on our property
                // fuck
                // we could connect to 'change' events on the model obj
                // this would have change, key, val, old
                // then we can concat the key and emit on ourselves too
                //
                // if we are function, getting needs to return constructed model
                //
                //console.log(config);
                //
                // see if it has keys
                Object.defineProperty(self, prop, {
                    enumerable: true,
                    get: function() {
                        return prop_val;
                    },
                    set: function(val) {
                        var old = prop_val;

                        // this handles the case of setting via same object
                        // we don't need to call constructor
                        if (val instanceof config) {
                            prop_val = val
                        }
                        else {
                            prop_val = config(val);
                        }

                        self._saved = false;
                        self.emit('change ' + prop, prop_val, old);
                    }
                });

                return;
            }

            // if config is a function
            // then assume constructor
            // we need to use that constructor...

            // user specified an inner object
            // but don't do this for arrays
            var keys = Object.keys(config);
            if ( !(config instanceof Array) && keys.length > 0) {
                // no value set by default
                if (prop_val) {
                    prop_val = inner_obj(prop, config, prop_val);
                }

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

        sync(ajax_opt, function(err, res) {
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

    Construct.prototype.fetch = function(cb) {
        var self = this;

        // nothing to fetch if we don't have an id
        if (!self.id) {
            return;
        }

        var ajax_opt = {
            url: self.url_root + '/' + self.id,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        sync(ajax_opt, function(err, res) {
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

        sync(ajax_opt, function(err) {
            if (err) {
                return cb(err);
            }

            self.emit('destroy');
            cb(null);
        });
    };

    /// Class functions

    // get a single Model instance by id
    Construct.get = function(id, cb) {
        var self = this;

        var ajax_opt = {
            url: self.url_root + '/' + id,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        sync(ajax_opt, function(err, res) {
            if (err) {
                return cb(err);
            }

            var body = res.body;
            return cb(null, Construct(body));
        });
    };

    // query for a list of Models
    // @param [Object] query optional query object
    Construct.find = function(query, cb) {
        var self = this;

        if (typeof query === 'function') {
            cb = query;
            query = {}
        }

        var ajax_opt = {
            url: self.url_root,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        sync(ajax_opt, function(err, res) {
            if (err) {
                return cb(err);
            }

            var body = res.body;
            return cb(null, body.map(Construct));
        });
    };

    // copy this model and optionally mixin some new shit
    Construct.extend = function(more_schema, more_opt) {
        more_schema = more_schema || {};
        more_opt = more_opt || {};
        return Model(xtend(schema, more_schema), xtend(opt, more_opt));
    };

    return Construct;
};

module.exports = Model;
