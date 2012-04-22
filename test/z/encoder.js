var http = require('http');
var seaport = require('seaport');
var ports = seaport.connect(process.argv[2]);

var server = http.createServer(function (req, res) {
    res.end('encoder beep boop');
});

ports.service('encoder', function (port, ready) {
    server.listen(port, ready);
});
