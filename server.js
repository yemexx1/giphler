var http = require('http');

var finalHandler = require('finalhandler');
var serveStatic = require('serve-static');
var serve = serveStatic("./");

var server = http.createServer(function (req, res) {
    var done = finalHandler(req, res);
    serve(req, res, done);
});


module.exports = {
    bootstrap: function (done) {
        done();
    },
    teardown: function (done) {
        server.close(done);
    }
};

if (!server.listening) {
    server.listen(3000, function () {
        console.log('Giphler running at http://localhost:3000')
    });
}
