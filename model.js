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
        self._url_root = '';

        if (initial) {
            self.id = initial.id;
        }

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
                    self._saved = false;

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

    Construct.prototype.url_root = function(val) {
        var self = this;

        if (val) {
            self._url_root = val;
            return self;
        }

        return self._url_root;
    };

    // return the current working url of the model
    // if the model is_new, then this is the 'url_root'
    // otherwise it is 'url_root/id'
    Construct.prototype.url = function() {
        var self = this;

        if (self.is_new()) {
            return self.url_root()
        }

        return self.url_root() + '/' + self.id;
    };

    Construct.prototype.save = function(cb) {
        var self = this;

        // TODO, not sure about this...
        if (self.parent) {
            return self.parent.save();
        }

        cb = cb || function() {};

        var ajax_opt = {
            url: self.url(),
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: self,
        };

        if (self.is_new()) {
            ajax_opt.method = 'POST'
        }

        ajax(ajax_opt, function(err, res) {
            if (err) {
                return cb(err);
            }

            var body = res.body;
            self.id = body.id;

            return cb(null);
        });
    };

    Construct.prototype.fetch = function(id, cb) {
        var self = this;

        var ajax_opt = {
            url: self.url() + '/' + id,
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
            url: self.url(),
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
