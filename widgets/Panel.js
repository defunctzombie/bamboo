var Widget = require('./Widget');
var inherits = require('inherits');

var Panel = function(parent) {
    Panel.super.call(this, parent, 'div');
};
Widget.extend(Panel);

Panel.extend = function(child) {
    inherits(child, Panel);
};

module.exports = Panel;

