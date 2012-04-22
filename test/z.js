var test = require('tap').test;
var spawn = require('child_process').spawn;
var seaport = require('seaport');
var zygote = require('../');

process.chdir(__dirname + '/z');

test('z', function (t) {
    t.plan(3 * 4);
    var ports = seaport.createServer();
    var port = Math.floor(Math.random() * 5e4 + 1e4);
    ports.listen(port);
    var addr = 'localhost:' + port;
    
    var drone0 = zygote(addr).drone();
    var drone1 = zygote(addr).drone();
    
    function sendPlan (plan, cb) {
        zygote(addr).push(plan);
        t.equal(ports.query('zygote').length, 2);
        
        setTimeout(function () {
            Object.keys(plan).forEach(function (name) {
                t.equal(ports.query(name).length, plan[name].number);
            });
            cb();
        }, 3000);
    }
    
    var plans = [
        {
            web : { number : 2, command : 'node web.js ' + addr },
            auth : { number : 1, command : 'node auth.js ' + addr },
            encoder : { number : 3, command : 'node encoder.js ' + addr },
        },
        {
            web : { number : 3, command : 'node web.js ' + addr },
            auth : { number : 4, command : 'node auth.js ' + addr },
            encoder : { number : 1, command : 'node encoder.js ' + addr },
        },
        {
            web : { number : 0, command : 'node web.js ' + addr },
            auth : { number : 1, command : 'node auth.js ' + addr },
            encoder : { number : 1, command : 'node encoder.js ' + addr },
        },
    ];
    
    (function next () {
        var plan = plans.shift();
        setTimeout(function () {
            sendPlan(plan, function () {
                if (plans.length) next()
            });
        }, 1000);
    })();
    
    t.on('end', function () {
        drone0.close();
        drone1.close();
        ports.close();
        setTimeout(function () {
            process.exit();
        }, 100);
    });
});
