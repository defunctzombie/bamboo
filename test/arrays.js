// test array fields

var assert = require('assert');
var after = require('after');

var Model = require('../model');

suite('arrays');

// placeholder for the Post model
var Post = Model({
    title: String,
    comments: [{
        text: String,
        author: String
    }]
});

test('field should be an array', function() {
    var post = Post();

    assert(post.comments instanceof Array);
});

