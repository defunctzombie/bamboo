var express = require('express');
var uuid = require('uuid');

function Collection() {
    var db = {};

    var Constr = function(obj) {
        if (! (this instanceof Constr)) {
            return new Constr(obj);
        }

        var self = this;
        for (var key in obj) {
            self[key] = obj[key];
        }
    }

    Constr.find_one = function(query, cb) {
        var self = this;
        var item = db[query.id];
        cb(null, item);
    };

    Constr.remove = function(query, cb) {
        var self = this;
        var item = db[query.id];
        if (!item) {
            return cb(null, 0);
        }
        db[query.id] = undefined;
        cb(null, 1);
    };

    Constr.prototype.save = function(cb) {
        var self = this;
        var id = self.id = self.id || uuid();
        db[id] = self;
        cb(null, self);
    }

    return Constr;
};

var Post = Collection();

var app = express();

app.use(function(req, res, next) {
    req.wrap = function(cb) {
        return function() {
            if (arguments[0]) {
                return next(arguments[0]);
            }

            var args = Array.prototype.slice.call(arguments, 1);
            cb.apply(this, args);
        };
    };
    next();
});

app.use(express.logger('dev'));
app.use(express.json());

// return list of posts
app.get('/posts', function(req, res, next) {
    res.send([]);
});

app.get('/posts/:id', function(req, res, next) {
    Post.find_one({id: req.param('id') }, req.wrap(function(post) {
        if (!post) {
            res.send(404);
        }

        res.json(post);
    }));
});

// update an existing post
app.put('/posts/:id', function(req, res) {
    Post.find_one({id: req.param('id') }, req.wrap(function(post) {
        var body = req.body;
        for (var key in body) {
            post[key] = body[key];
        }

        post.save(req.wrap(function() {
            res.send(200);
        }));
    }));
});

// remove a post
app.del('/posts/:id', function(req, res) {
    Post.remove({id: req.param('id')}, req.wrap(function(count) {
        if (count === 0) {
            return res.send(404);
        }
        res.send(200);
    }));
});

// add a new post
app.post('/posts', function (req, res) {
    var post = Post(req.body);
    post.save(req.wrap(function() {
        res.json(post);
    }));
});

// post comments

// get comments for post
app.get('/posts/:id/comments', function(req, res) {
});

// new comment
app.post('/posts/:id/comments', function(req, res) {
});

var server = app.listen(process.env.ZUUL_PORT);
