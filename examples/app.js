var Yoda = require('../src');

// hostname + port of the etcd server
var yoda = new Yoda('127.0.0.1', 4001);

// location will emit events for anything below /mongo
var location = yoda.connect('/mongo');

// listen for servers arriving
location.on('add', function(route, data){

	console.log('added');
	console.log('server id: ' + route);
	console.log(data);

})

location.on('change', function(route, data){

	console.log('changed');
	console.log('server id: ' + route);
	console.log(data);

})

location.on('remove', function(route){

	console.log('removed');
	console.log('server id: ' + route);

})