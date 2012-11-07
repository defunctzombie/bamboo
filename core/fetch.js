
/// load the given path
module.exports = function fetch(path, cb) {

    // TODO(shtylman) I am sure there is some library doing this
    var xmlhttp = new XMLHttpRequest();

    // TODO(shtylman) handle error
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            return cb(null, xmlhttp.responseText);
        }
    }

    // TODO(shtylman) external urls?
    if (path.charAt(0) !== '/') {
        path = '/' + path;
    }

    xmlhttp.open('GET', path, true);
    xmlhttp.send();
};

