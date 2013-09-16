yoda
====

etcd client for monitoring changes to the force

## installation

You need to have an [etcd](https://github.com/coreos/etcd) server running in order for yoda to speak to the force.

If you have [docker](https://github.com/dotcloud/docker/) installed you can use the Dockerfile to run a etcd server.

### node.js

The node.js part is so you app can listen to changes in the network.

	$ npm install yoda --save

### bash

The bash part is so your orchestration script can write changes to the network.

	$ wget -qO- https://raw.github.com/binocarlos/yoda/master/bootstrap.sh | sudo bash

## usage

Yoda gives you 2 things:

 * a node.js event listener that tells reacts to network endpoints coming and going
 * a bash script that endpoints call to register and un-register

### node.js client

Somewhere on a small lonely planet - we have a tiny node script that want to humbly connect to some Mongo databases.

We know we have an etcd server running on 127.0.0.1:4001 and so we tell Yoda to connect to it to get updates about Mongos.


```js
var Yoda = require('yoda');

// hostname + port of the etcd server
var yoda = new Yoda('127.0.0.1', 4001);

// location will emit events for anything below /mongo
var location = yoda.connect('/mongo');

// listen for servers arriving
location.on('add', function(route, data){

	// route will be the id of the server
	console.log('server id: ' + route);

	// data is a string at this point - encode how you like!
	console.log(data);

	// we probably want to connect to the mongo server at this point
})

```

### bash client

Meanwhile - in amoungst the alliance fleet - we have a Mongo spawning bash script that knows the IP of the server it is running a Mongo database on.

```bash

# the IP address of the mongo server we are booting
MONGO_IP='192.168.1.120'

# first run a mongo container using docker
MONGO_CONTAINER=$(docker run -p 27017 -t quarry/mongo)

# now get the port it is listening
MONGO_PORT=$(docker port $MONGO_CONTAINER 27017)

# now lets tell yoda about the server
yoda add /mongo/$MONGO_CONTAINER $MONGO_IP:$MONGO_PORT
```


## running examples

There is an example setup so you can see the rough idea

In the first shell:

	$ node examples/app.js

And then in the second shell:

	$ ./examples/addserver.sh

You should see servers arriving in the first shell.

## licence

MIT