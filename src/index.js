var EventEmitter = require('events').EventEmitter
var util = require('util')
var Etcdjs = require('etcdjs')
var Location = require('./location')

// the endpoint of the etcd server
function Yoda(host, port){
	EventEmitter.call(this)

	host = host || process.env.YODA_HOST || '127.0.0.1'
	port = port || process.env.YODA_PORT || 4001

	this.etcd = new Etcdjs([host + ':' + port])
}

util.inherits(Yoda, EventEmitter)

module.exports = Yoda

// watch the given path and emit events for initial load and addition - removal
// we return a location object the wrapps all that up
Yoda.prototype.connect = function(path){

	var location = new Location(this.etcd)

	location.connect(path)

	return location

}