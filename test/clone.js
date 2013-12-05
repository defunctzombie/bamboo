// test cloning ... baaaaa

var assert = require('assert');
var after = require('after');

var Model = require('../model');

suite('Model#clone');

var Post = Model({
    title: String
}, { url_root: '/foobar' });

Post.prototype.foo = function() {};
Post.bar = function() {};

test('clone should work', function() {
    var post = Post();
    post.title = 'foo';
    assert.equal(post.title, 'foo');

    var dolly = post.clone();
    assert.equal(dolly.title, post.title);

    // change original, no effect on clone
    post.title = 'bar';
    assert.equal(dolly.title, 'foo');

    // change clone no effect on original
    dolly.title = 'baz';
    assert.equal(dolly.title, 'baz');
    assert.equal(post.title, 'bar');

    dolly.url_root = '/cat';
    assert.equal(post.url_root, '/foobar');
    assert.equal(dolly.url_root, '/cat');
});

// changing clone should not trigger event on original
test('isolated clone events', function(done) {
    var post = Post();
    var dolly = post.clone();

    post.once('change title', function() {
        asert(false);
    });

    dolly.once('change title', function(val) {
        assert.equal(val, 'bar');
        done();
    });

    dolly.title = 'bar';
});

