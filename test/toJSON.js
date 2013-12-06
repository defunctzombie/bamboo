var assert = require('assert');

var Model = require('../model');

suite('toJSON');

var Post = Model({
        title: String,
        nums: [Number],
        random: Boolean,
        comments: [{
            title: String
        }]
});

// test that false values are serialized as expected
test('simple', function() {
    var post = Post();
    post.title = 'foobar';
    post.nums.push(55);
    post.random = false;

    var exp = {
        title: "foobar",
        random: false,
        nums: [55],
        comments: []
    };

    assert.deepEqual(post.toJSON(), exp);
});

// test that false values are serialized as expected
test('array items', function() {
    var post = Post();
    post.title = 'foobar';
    post.random = false;

    post.comments.push({ title: 'foobar' });

    var exp = {
        title: "foobar",
        random: false,
        nums: [],
        comments: [{
            title: 'foobar'
        }]
    };

    assert.deepEqual(post.toJSON(), exp);

    post.comments[0].title = 'baz';
    exp.comments[0].title = 'baz';
    assert.deepEqual(post.toJSON(), exp);
});
