var express = require('express');

var app = express();

app.use(express.logger('dev'));

// return list of posts
app.get('/posts', function(req, res) {
    res.send([]);
});

app.get('/posts/:id', function(req, res) {
    res.json({
        id: '12345',
        title: 'cat'
    });
});

// update an existing post
app.put('/posts/:id', function(req, res) {
});

// remove a post
app.del('/posts/:id', function(req, res) {
});

// add a new post
app.post('/posts', function (req, res) {
    // TODO generate id and return info about post
    res.json({
        id: '12345'
    });
});

// post comments

// get comments for post
app.get('/posts/:id/comments', function(req, res) {
});

// new comment
app.post('/posts/:id/comments', function(req, res) {
});

var server = app.listen(process.env.ZUUL_PORT);
