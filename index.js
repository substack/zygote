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
            var service = drone(ports, opts.plan);
            
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

function drone (ports, plan) {
    if (!plan) prevPlan = {};
    var procs = {};
    
    var service = function (remote, conn) {
        this.plan = function (workers, plan) {
            // todo: query zygote roles at the start and subscribe to update
            
            var work = Object.keys(plan).reduce(function (acc, name) {
                acc[name] = plan[name].number;
                return acc;
            }, {});
            
            var share = marx(workers, work)[id] || {};
            
            var names = Object.keys(prevPlan).concat(Object.keys(share));
            names.forEach(function (name) {
                var diff = (share[name] || 0) - (prevPlan[name] || 0);
                var cmd = plan[name].command;
                if (!Array.isArray(cmd)) cmd = cmd.split(' ');
                
                for (var i = diff; i < 0; i++) {
                    // cull excess services
                    procs[name]
                        .removeAllListeners('exit')
                        .on('exit', function () {
                            delete procs[name];
                        })
                    ;
                    procs[name].kill('SIGHUP');
                }
                
                function createProc (cmd) {
                    var ps = spawn(cmd[0], cmd.slice(1));
                    ps.stdout.pipe(process.stdout, { end : false });
                    ps.stderr.pipe(process.stderr, { end : false });
                    return ps;
                }
                
                for (var i = 0; i < diff; i++) {
                    // spawn extra services
                    procs[name] = createProc(cmd);
                    
                    procs[name].on('exit', function () {
                        setTimeout(function () {
                            procs[name] = createProc(cmd);
                        }, 1000);
                    });
                }
            });
            
            prevShare = share;
        };
    };
    
    var id = service.id = Math.random().toString(16).slice(2);
    return service;
}
