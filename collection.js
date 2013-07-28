var EventEmitter = require('events').EventEmitter;

var ajax = require('superagent');
var inherits = require('inherits');

var Collection = function(opt) {

    var Model = opt.model;

    var Const = function() {
        if (!(this instanceof Const)) {
            return new Const();
        }

        var self = this;
        self.url = opt.url;
        self._items = [];
    };

    inherits(Const, EventEmitter);

    Const.prototype.fetch = function(cb) {
        var self = this;

        ajax.get(self.url).end(function(res) {
            var list = res.body;
            self._items = [];
            list.forEach(function(friend) {
                var item = Model(friend);
                item.collection = self;

                self._items.push(item);
                self.emit('add', item);
            });

            cb(null, self._items);
        });
    };

    return Const;
};

module.exports = Collection;
