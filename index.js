var airport = require('airport');
var seaport = require('seaport');
var dnode = require('dnode');
var marx = require('marx');
var spawn = require('child_process').spawn;

module.exports = function (ports) {
    var isSeaport = ports && typeof ports === 'object'
        && ports.free && ports.assume && ports.allocate
    ;
    
    if (!isSeaport) ports = seaport.connect(ports);
    var air = airport(ports);
    
    return {
        drone : function (opts) {
            if (!opts) opts = {};
            var service = drone(ports);
            
            var meta = {
                id : service.id,
                capacity : opts.capacity || 100,
            };
            return air(service).listen('zygote', { meta : meta });
        },
        push : function (plan) {
            ports.query('zygote', function (ps) {
                var workers = ps.reduce(function (acc, p) {
                    acc[p.id] = p.capacity;
                    return acc;
                }, {});
                
                var workers = ps.reduce(function (acc, p) {
                    acc[p.id] = 10;
                    return acc;
                }, {});
                
                ps.forEach(function (p) {
                    dnode.connect(p, function (remote, conn) {
                        remote.plan(workers, plan);
                        conn.end();
                    });
                });
                
                ports.close();
            });
        },
    };
};

function drone (ports) {
    var procs = {};
    
    var service = function (remote, conn) {
        this.plan = function (workers, plan) {
            // todo: query zygote roles at the start and subscribe to update
            
            var work = Object.keys(plan).reduce(function (acc, name) {
                var n = plan[name].number;
                if (n) acc[name] = n;
                return acc;
            }, {});
            
            var share = marx(workers, work)[id] || {};
            
            var names = Object.keys(procs).concat(Object.keys(work));
            names.forEach(function (name) {
                if (!procs[name]) procs[name] = [];
                
                var diff = (share[name] || 0) - procs[name].length;
                var cmd = plan[name].command;
                
                if (!Array.isArray(cmd)) cmd = cmd.split(' ');
                
                for (var i = 0; i < -diff; i++) (function () {
                    // cull excess services
                    
                    var to = setTimeout(function () { ps.kill() }, 2000);
                    var ps = procs[name][procs[name].length - i - 1];
                    
                    ps
                        .removeAllListeners('exit')
                        .on('exit', function () {
                            clearTimeout(to);
                            var ix = procs[name].indexOf(this);
                            if (ix >= 0) procs[name].splice(ix, 1);
                        })
                    ;
                    ps.kill('SIGHUP');
                })(i);
                
                function createProc (cmd) {
                    var ps = spawn(cmd[0], cmd.slice(1));
                    ps.stdout.pipe(process.stdout, { end : false });
                    ps.stderr.pipe(process.stderr, { end : false });
                    return ps;
                }
                
                for (var i = 0; i < diff; i++) {
                    // spawn extra services
                    var ps = createProc(cmd);
                    procs[name].push(ps);
                    
                    ps.on('exit', function () {
                        var ps = this;
                        setTimeout(function () {
                            var ix = procs[name].indexOf(ps);
                            if (ix >= 0) procs[name][ix] = createProc(cmd);
                        }, 1000);
                    });
                }
            });
        };
    };
    
    var id = service.id = Math.random().toString(16).slice(2);
    return service;
}
