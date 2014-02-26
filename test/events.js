// test changing properties

var assert = require('assert');
var after = require('after');

var Model = require('../model');

suite('events');

var Author = Model({
    name: String,
    email: String
});

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

// changing the primary should trigger event on primary
// and on subfield
// then you should still be able to change the subfield
// and trigger event only on subfield
test('nested change - primary', function(done) {
    var post = Post();

    // because author is a nested object
    // but will start out undefined
    assert.ok(post.author === undefined);

    done = after(2, done);

    post.once('change author', function(val) {
        assert.deepEqual(val, { name: undefined, email: undefined });
        assert.equal(post.author.name, undefined);
        done();
    });

    // need to set author to something first
    post.author = {};

    post.once('change author.name', function(val) {
        assert.equal(val, 'Edgar Poe');
        assert.equal(post.author.name, 'Edgar Poe');
        done();
    });

    // setting this will trigger above change
    post.author.name = 'Edgar Poe';
});

test('nested change - field of submodel', function(done) {
    var Post = Model({
        title: String,
        author: Author
    });
    var post = Post();

    // because author is a nested object
    // but will start out undefined
    assert.ok(post.author === undefined);

    done = after(6, done);

    post.once('change author', function(val) {
        assert.equal(post.author.name, undefined);
        assert.equal(post.author.email, undefined);
        done();
    });

    // need to set author to something first
    post.author = {};

    post.author.once('change name', function(val) {
        assert.equal(val, 'Edgar Poe');
        done();
    });

    post.author.once('change', function(prop, val) {
        assert.equal(prop, 'name');
        assert.equal(val, 'Edgar Poe');
        done();
    });

    post.on('change author.name', function(val) {
        assert.equal(val, 'Edgar Poe');
        assert.equal(post.author.name, 'Edgar Poe');
        done();
    });

    // setting this will trigger above change
    post.author.name = 'Edgar Poe';

    // test that changing stuff on original author model
    // will not cause events on post
    // if the post author has been changed
    var orig = post.author;
    post.author = {};
    assert.equal(post.author.name, undefined);
    post.author.name = 'Edgar Poe';

    // should still be event on original model
    // not not an event on the post anymore
    orig.once('change name', function(val) {
        assert.equal(val, 'Foobar');
        done();
    });
    orig.name = 'Foobar';
});

// changing entire subobject should trigger change in primary
// and subfield
test('nested change - field', function(done) {
    var post = Post();

    // because author is a nested object
    // but will start out undefined
    assert.ok(post.author === undefined);

    post.once('change author', function(val) {
        assert.equal(val.name, 'Edgar Poe');
        assert.equal(post.author.name, 'Edgar Poe');
        done();
    });

    // setting the author should trigger property change too
    post.author = {
        name: 'Edgar Poe'
    };
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

test('properly handle setting undefined', function() {
    var Post = Model({
        title: String,
        author: Author
    });
    var post = Post();

    // starts out undefined
    assert.equal(post.title, undefined);
    assert.equal(post.author, undefined);

    post.title = 'foobar';
    assert.equal(post.title, 'foobar');

    // becomes undefined
    post.title = undefined;
    assert.equal(post.title, undefined);

    // should not ignore booleans
    post.title = false;
    assert.equal(post.title, 'false');

    // same for nested field stuff
    post.author = {
        name: 'Tom'
    };
    assert.equal(post.author.name, 'Tom');
    assert.equal(post.author.email, undefined);
    post.author = null;
    assert.equal(post.author, null);
});
