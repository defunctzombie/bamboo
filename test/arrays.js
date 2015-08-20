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

test('fields should support simple arrays', function() {
    var Post = Model({
        title: String,
        tags: [String]
    });

    var post = Post();
    assert(post.tags instanceof Array);
});

test('fields should support constructor types', function() {
    // initializers should be converted after passed through consturctor
    var Post = Model({
        nums: [Number]
    });

    var post = Post({
        nums: ['1.2', '3.4']
    });

    assert.equal(post.nums.length, 2);
    assert(typeof post.nums[0] == 'number');
});

test('pushing values should trigger constructor', function() {
    var Post = Model({
        nums: [Number]
    });

    var post = Post();

    post.nums.push('3.4');
    post.nums.push(4.5);

    assert.equal(post.nums.length, 2);
    assert(typeof post.nums[0] == 'number');
    assert(typeof post.nums[1] == 'number');
});
