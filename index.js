var airport = require('airport');
var seaport = require('seaport');
var marx = require('marx');

module.exports = function (ports) {
    var isSeaport = ports && typeof ports === 'object'
        && ports.free && ports.assume && ports.allocate
    ;
    
    if (!isSeaport) ports = seaport(ports);
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
                
                ps.forEach(function (p) {
                    var c = dnode.connect(p, function (remote, conn) {
                        remote.plan(plan, ids);
                    });
                    c.on('error', function (err) {
                        console.error(err);
                    });
                });
            });
        },
    };
};

function drone (ports, plan) {
    if (!plan) plan = {};
    
    var service = function (remote, conn) {
        this.plan = function (p, workers) {
            // todo: query zygote roles at the start and subscribe to update
            plan = p;
            
            var work = marx(workers, plan)[id] || {};
            console.dir(work);
        };
    };
    
    var id = service.id = Math.random().toString(16).slice(2);
    return service;
}
