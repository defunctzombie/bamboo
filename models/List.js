
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var List = function() {
};
inherits(List, EventEmitter);

List.prototype.add = function(obj) {
    var self = this;
    self.emit('added', obj);
};

List.prototype.remove = function(obj) {
    var self = this;
    self.emit('removed', obj);
};

module.exports = List;

