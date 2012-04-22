zygote
======

[Cellular-differentiation](http://en.wikipedia.org/wiki/Cellular_differentiation)
for worker drones in [seaport](https://github.com/substack/seaport) clusters.

[![build status](https://secure.travis-ci.org/substack/zygote.png)](http://travis-ci.org/substack/zygote)

example
=======

First start a seaport hub:

```
seaport 7000
```

Start several undifferentiated zygote worker drones on different machines:

```
zygote drone localhost:7000
```

Create a cluster plan:

``` json
{
    "web" : {
        "number" : 2,
        "command" : "node web.js"
    },
    "auth" : {
        "number" : 1,
        "command" : "node auth.js"
    },
    "encoder" : {
        "number" : 3,
        "command" : "node encoder.js"
    }
}
```

Push the cluster plan to all the zygote drones:

```
zygote --seaport=localhost:7000 push cluster.json
```

Now there are 2 web, 1 auth, and 3 encoder services running across all your
zygote drones!

Modify the cluster plan and run `zygote push` again to update what all the
zygote drones are running.

install
=======

With [npm](http://npmjs.org) do:

```
npm install zygote
```

license
=======

MIT
