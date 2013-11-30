// test extending a model

var assert = require('assert');
var after = require('after');

var Model = require('../model');

suite('Model#extend');

var Post = Model({
    title: String
}, { url_root: '/foobar' });

test('extending should work', function() {
    var SuperPost = Post.extend();
    SuperPost.url_root = '/foobaz';

    assert.equal(Post.url_root, '/foobar');
    assert.equal(SuperPost.url_root, '/foobaz');
});

test('extend with additional schema', function() {
    var SuperPost = Post.extend({
        summary: String
    });

    var post = SuperPost();

    post.once('change title', function(val) {
        assert.equal(val, 'foobar');
        assert.equal(post.title, 'foobar');
    });

    post.once('change summary', function(val) {
        assert.equal(val, 'foobaz');
        assert.equal(post.summary, 'foobaz');
    });

    post.title = 'foobar';
    post.summary = 'foobaz';
});

