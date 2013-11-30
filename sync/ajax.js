var superagent = require('superagent');

module.exports = function superagent_adapter(opts, cb) {

    var url = opts.url;
    var method = opts.method;
    var headers = opts.headers
    var query = opts.query;
    var body = opts.body;

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

        if (res.status !== 200) {
            var err = new Error();
            err.status = res.status;
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
