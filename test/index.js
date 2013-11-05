var assert = require('assert');

// these are the general bamboo settings
var bamboo = require('../');

var superagent = require('superagent');

var superagent_adapter = function(opts, cb) {

    var url = opts.url;
    var method = opts.method;
    var headers = opts.headers
    var query = opts.query;
    var body = opts.body;

    // METHOD determines the function
    // GET, PUT, POST, DELETE

    superagent.post(opts.url, function(err, res) {
        if (err) {
            return cb(err);
        }

        if (res.status !== 200) {
            var err = new Error();
            err.status = 200;
            return cb(err);
        }

        var result = {
            headers: res.headers,
            status: res.status,
            text: res.text,
            body: res.body
        };

        cb(null, result);
    });

    // makes a request using opts
    // the following settings are passing in opts
    //
    // opts.url
    // opts.headers
    // opts.query
    // opts.body
    // cb should be called with:
    // error, response
    // error should indicate any non-200 response and have a `.status` field set
    // response should be details about the response
    // response.headers
    // response.status
    // response.text // raw text response of body
    // response.body // parsed body
    // should not be parsed and passed as is
    //
    // should return a "request" handle which can be used to cancel an inflight response
    //
    //superagent.request();
    //
};

// set the ajax function to use for all requests
// you MUST set an ajax function to use, we do not assume one for you
bamboo.ajax = superagent_adapter;

// default ajax adapter if you don't care
// bamboo.ajax = require('bamboo/ajax');

// bamboo models and other features should be requested specifically
var Model = require('../model');

// placeholder for the Post model
var Post = undefined;

test('build a model', function() {
    Post = Model({
        title: String,
        author: String
    });

    //Post.url_root('/posts');
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

test('is_new() - after save', function(done) {

    // create a new post
    var post = Post();
    post.title = 'post title';
    post.author = 'post author';

    post.url_root('/posts');

    post.save(function(err) {
        assert.ifError(err);
        assert.ok(post.id);
        assert.equal(post.title, 'post title');
        assert.equal(post.author, 'post author');

        var existing = Post();

        existing.url_root('/posts');

        existing.fetch(post.id, function(err) {
            assert.ifError(err);
            assert.equal(existing.title, 'post title');
            assert.equal(existing.author, 'post author');
            done();
        });
    });
});
