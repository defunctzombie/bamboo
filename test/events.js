// test changing properties

var assert = require('assert');

var Model = require('../model');

suite('events');

// placeholder for the Post model
var Post = Model({
    title: String,
    author: {
        name: String,
        email: String
    }
});

test('top level changes', function(done) {
    var post = Post();

    post.once('change title', function(val) {
        assert.equal(val, 'foobar');
        assert.equal(post.title, 'foobar');
        done();
    });

    post.title = 'foobar';
});

test('nested change', function(done) {
    var post = Post();

    // because author is a nested object
    // it will start out {}
    assert.ok(post.author);

    post.once('change author.name', function(val) {
        assert.equal(val, 'Edgar Poe');
        assert.equal(post.author.name, 'Edgar Poe');
        done();
    });

    post.author.name = 'Edgar Poe';
});

// we change the entire sub object
// then we expect to be able to change inner properties and events will fire
test('obj change then trigger', function(done) {
    var post = Post({
        author: {
            name: 'foobar'
        }
    });

    assert.ok(post.author);
    assert.equal(post.author.name, 'foobar');

    post.once('change author', function(val) {
        assert.equal(val.name, 'Poe');
        assert.equal(post.author.name, 'Poe');
        assert.equal(val.email, 'poe@example.com');
        assert.equal(post.author.email, 'poe@example.com');
    });

    post.author = {
        name: 'Poe',
        email: 'poe@example.com'
    };

    // now we should still be able to alter an internal property on author

    post.once('change author.email', function(val) {
        assert.equal(val, 'edgar@example.com');
        assert.equal(post.author.email, 'edgar@example.com');
        done();
    });

    // same as post.author.email
    post.author.email = 'edgar@example.com';
});
