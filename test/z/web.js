var http = require('http');
var seaport = require('seaport');
var ports = seaport.connect(process.argv[2]);

var server = http.createServer(function (req, res) {
    res.end('web beep boop');
});

ports.service('web', function (port, ready) {
    server.listen(port, ready);
});
