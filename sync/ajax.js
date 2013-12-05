var superagent = require('superagent');

module.exports = function superagent_adapter(opts, cb) {

    var url = opts.url;
    var method = opts.method;

    var query = opts.query;
    var body = opts.body;

    // METHOD determines the function
    // GET, PUT, POST, DELETE
    var req = superagent(method, url);

    req.set('Accept', 'application/json');

    if (query) {
        req.query(query);
    }

    // TODO patch?
    if (body && (method === 'POST' || method === 'PUT')) {
        req.set('Content-Type', 'application/json');
        req.send(body.toJSON());
    }

    req.end(function(err, res) {
        if (err) {
            return cb(err);
        }

        var body = res.body || null;

        if (res.status !== 200) {
            var err = new Error();
            err.status = res.status;
            err.message = (body ? body.message : '');
            return cb(err);
        }

        cb(null, body);
    });
};
