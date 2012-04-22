var zygote = require('../');
var fs = require('fs');

var argv = require('optimist')
    .demand('seaport')
    .argv
;

var cmd = argv._[0];
var z = zygote(argv.seaport);

if (cmd === 'drone') {
    z.drone(argv);
}
else if (cmd === 'push') {
    var planFile = argv._[1];
    var plan = JSON.parse(fs.readFileSync(planFile));
    z.push(plan);
}
