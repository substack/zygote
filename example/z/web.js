var http = require('http');
var seaport = require('seaport');
var config = require('figc')(__dirname + '/config.json');
var ports = seaport.connect(config.seaport);

var server = http.createServer(function (req, res) {
    res.end('web beep boop');
});

ports.service('web', function (port, ready) {
    server.listen(port, ready);
});
