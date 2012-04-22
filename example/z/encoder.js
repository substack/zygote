var http = require('http');
var seaport = require('seaport');
var config = require('figc')(__dirname + '/config.json');
var ports = seaport.connect(config.seaport);

var server = http.createServer(function (req, res) {
    res.end('encoder beep boop');
});

ports.service('encoder', function (port, ready) {
    server.listen(port, ready);
});
