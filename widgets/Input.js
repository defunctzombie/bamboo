var Widget = require('./Widget');
var inherits = require('inherits');

var Input = function(parent) {
    Input.super.call(this, parent, 'input');
};
Widget.extend(Input);

Input.extend = function(child) {
    inherits(child, Input);
};

module.exports = Input;

