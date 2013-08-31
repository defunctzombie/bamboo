var Emitter = require('emitter');
var ajax = require('superagent');

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

    Emitter(Const.prototype);

    Const.prototype.fetch = function(cb) {
        var self = this;

        ajax.get(self.url).end(function(err, res) {
            if (err) {
                return cb(err);
            }

            if (res.status !== 200) {
                return cb(new Error('failed to fetch'));
            }

            var list = res.body;
            self._items = [];
            list.forEach(function(detail) {
                var item = Model(detail);
                item.collection = self;
                item.url = self.url + '/' + item.id;

                self._items.push(item);
                self.emit('add', item);
            });

            cb(null, self._items);
        });
    };

    return Const;
};

module.exports = Collection;
