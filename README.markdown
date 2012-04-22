zygote
======

[Cellular-differentiation](http://en.wikipedia.org/wiki/Cellular_differentiation)
for worker drones in [seaport](https://github.com/substack/seaport) clusters.

example
=======

First start a seaport hub:

```
seaport 7000
```

Start an undifferentiated zygote worker drone:

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
