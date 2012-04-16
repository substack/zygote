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
        "min" : 2,
    },
    "auth" : {
        "exactly" : 1
    },
    "encoder" : {
        "min" : 5,
        "max" : 8
    }
}
```

Push the cluster plan to all the zygote drones:

```
zygote push localhost:7000 cluster.json
```
