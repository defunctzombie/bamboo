var assert = require('assert');

var Model = require('../model');

suite('sync');

// placeholder for the Post model
var Post = Model({
    title: String
}, { url_root: '/posts' });

test('should POST when creating', function(done) {
    function sync(opt, cb) {
        assert.equal(opt.method, 'POST');
        assert.equal(opt.url, '/posts');
        assert.equal(opt.query, undefined);
        cb(null, {
            id: '12345'
        });
    };

    var post = Post.extend({}, { sync: sync })();
    post.save(function(err) {
        assert.ifError(err);
        assert.equal(post.id, 12345);
        done();
    });
});

test('should capture returned arguments from POST', function(done) {
    function sync(opt, cb) {
        assert.equal(opt.method, 'POST');
        assert.equal(opt.url, '/posts');
        assert.equal(opt.query, undefined);
        cb(null, {
            id: '12345',
            title: 'hello world'
        });
    };

    var post = Post.extend({}, { sync: sync })();
    post.save(function(err) {
        assert.ifError(err);
        assert.equal(post.id, 12345);
        assert.equal(post.title, 'hello world');
        done();
    });
});

test('should update on fetch', function(done) {
    function sync(opt, cb) {
        assert.equal(opt.method, 'GET');
        assert.equal(opt.url, '/posts/12345');
        assert.equal(opt.query, undefined);
        cb(null, {
            title: 'hello world'
        });
    };

    var post = Post.extend({}, { sync: sync })();
    post.id = '12345';
    post.title = 'test';
    post.fetch(function(err) {
        assert.ifError(err);
        assert.equal(post.id, 12345);
        assert.equal(post.title, 'hello world');
        done();
    });
});

test('destroy', function(done) {
    function sync(opt, cb) {
        assert.equal(opt.method, 'DELETE');
        assert.equal(opt.url, '/posts/12345');
        assert.equal(opt.query, undefined);
        cb();
    };

    var post = Post.extend({}, { sync: sync })();
    post.id = '12345';
    post.destroy(done);
});

test('destroy with query arguments', function(done) {
    function sync(opt, cb) {
        assert.equal(opt.method, 'DELETE');
        assert.equal(opt.url, '/posts/12345');
        assert.deepEqual(opt.query, { q: true });
        cb();
    };

    var post = Post.extend({}, { sync: sync })();
    post.id = '12345';
    post.destroy({ q: true }, done);
})

test('should pass the response back for .find', function(done) {
    function sync(opt, cb) {
        assert.equal(opt.method, 'GET');
        assert.equal(opt.url, '/posts');

        var posts = [{
            id: '1',
            title: 'Hello World'
        }, {
            id: '2',
            title: 'Magic Beans'
        }];

        var res = {
            body: posts,
            headers: {
                foo: 'bar'
            }
        }

        cb(null, posts, res);
    };

    var NewPost = Post.extend({}, { sync: sync });
    NewPost.find(function(err, posts, res) {
        assert.ifError(err);
        assert.equal(posts.length, 2);
        done();
    });
});

test('should support loading to a simple array', function(done) {
    function sync(opt, cb) {
        assert.equal(opt.method, 'GET');
        assert.equal(opt.url, '/posts/12345');
        assert.equal(opt.query, undefined);
        cb(null, {
            id: '12345',
            title: 'hello world',
            tags: ['foo', 'bar']
        });
    };

    var Post = Model({
        title: String,
        tags: [String]
    }, { url_root: '/posts', sync: sync });

    Post.get('12345', function(err, post) {
        assert.ifError(err);
        assert.equal(post.id, 12345);
        assert.equal(post.title, 'hello world');
        assert(post.tags instanceof Array);
        assert.equal(post.tags.length, 2);
        assert.equal(post.tags[0], 'foo');
        assert.equal(post.tags[1], 'bar');
        done();
    });
});
