// test loading and persistence methods

var assert = require('assert');

var ajax = require('../sync/ajax');
var Model = require('../model');

suite('ajax');

// placeholder for the Post model
var Post = undefined;

test('build a model', function() {
    Post = Model({
        title: String,
        author: String
    }, { sync: ajax });

    // set the urlroot defining the basepath
    Post.url_root = '/posts';
})

test('basic model', function() {
    var post = Post();
    assert.ok(post.hasOwnProperty('title'));
    assert.ok(post.hasOwnProperty('author'));
    assert.ok(! post.hasOwnProperty('does not exist'));

    assert.ok(post.is_new());
});

// is_saved() should be false for anything without an id
test('is_saved() - new model', function() {
    var post = Post();
    assert.ok(! post.is_saved());
});

// is_saved() should be true for anything with an id
// and no properties changed yet
test('is_saved() - loaded with id results in true', function() {
    var post = Post({
        id: '123456'
    });

    assert.ok(post.is_saved());
});

// should be false if any property has changed
test('is_saved() - change property results in false', function() {
    var post = Post({
        id: '123456'
    });

    // change a property will trigger need to save
    post.title = 'new title';

    assert.ok(! post.is_saved());
});

// test the is_new() function
// this should return true if the 'id' of the model is set
// will not be set for newly created models
test('is_new() - basic', function() {
    var post = Post();
    assert.ok(post.is_new());

    // simulated having a model from the server
    post.id = '123456';
    assert.ok(! post.is_new());
});

var created_id = undefined;
test('is_new() - after save', function(done) {
    // create a new post
    var post = Post();
    post.title = 'post title';
    post.author = 'post author';

    post.save(function(err) {
        assert.ifError(err);
        assert.ok(post.id);
        created_id = post.id;

        assert.equal(post.title, 'post title');
        assert.equal(post.author, 'post author');

        Post.get(post.id, function(err, existing) {
            assert.ifError(err);
            assert.equal(existing.id, post.id);
            assert.equal(existing.title, 'post title');
            assert.equal(existing.author, 'post author');
            done();
        });
    });
});

test('update existing and save', function(done) {
    Post.get(created_id, function(err, post) {
        assert.ifError(err);
        assert.equal(post.title, 'post title');
        assert.equal(post.author, 'post author');

        post.title = 'new title';
        post.save(function(err) {
            assert.ifError(err);
            done();
        });
    });
});

test('check update', function(done) {
    Post.get(created_id, function(err, post) {
        assert.ifError(err);
        assert.equal(post.title, 'new title');
        assert.equal(post.author, 'post author');
        done();
    });
});

test('update directly via id', function(done) {
    var post = Post();
    post.id = created_id;

    post.title = 'foobar';
    post.save(function(err) {
        assert.ifError(err);
        done();
    });
});

test('check update', function(done) {
    Post.get(created_id, function(err, post) {
        assert.ifError(err);
        assert.equal(post.title, 'foobar');
        assert.equal(post.author, 'post author');
        done();
    });
});

test('remove', function(done) {
    Post.get(created_id, function(err, post) {
        assert.ifError(err);
        assert.equal(post.title, 'foobar');
        assert.equal(post.author, 'post author');

        post.destroy(function(err) {
            assert.ifError(err);
            Post.get(created_id, function(err) {
                assert.equal(err.status, 404);
                done();
            });
        });
    });
});
