var assert = require('assert');

var Model = require('../model');

suite('sync');

// placeholder for the Post model
var Post = Model({
    title: String
}, { url_root: '/posts' });

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
