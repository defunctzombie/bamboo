var superagent = require('superagent');

module.exports = function superagent_adapter(opts, cb) {

    var url = opts.url;
    var method = opts.method;
    var headers = {
        'Accept': 'application/json'
    };

    var query = opts.query;
    var body = opts.body;

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    // METHOD determines the function
    // GET, PUT, POST, DELETE
    var req = superagent(method, url);

    if (headers) {
        for (var key in headers) {
            req.set(key, headers[key]);
        }
    }

    if (query) {
        req.query(query);
    }

    // TODO patch?
    if (body && (/POST/i.test(method) || /PUT/i.test(method))) {
        req.send(body);
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
