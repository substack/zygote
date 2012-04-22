var http = require('http');
var seaport = require('seaport');
var ports = seaport.connect(process.argv[2]);

var server = http.createServer(function (req, res) {
    res.end('auth beep boop');
});

ports.service('auth', function (port, ready) {
    server.listen(port, ready);
});
