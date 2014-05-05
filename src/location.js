var EventEmitter = require('events').EventEmitter
var flatten = require('etcd-flatten')
var util = require('util')

function Location(etcd){
	EventEmitter.call(this)
	this.etcd = etcd

	// our map of vlues so we know if to say added or removed
	this.values = {}
}

util.inherits(Location, EventEmitter)

module.exports = Location

Location.prototype.connect = function(path){
	this.path = path
	this.load_path(path)
	this.watch_path(path)
}

// this method is used to add data
Location.prototype.add = function(id, data, done){
	if(id.charAt(0)!='/'){
		id = '/' + id
	}
	this.etcd.set(this.path + id, data, done)
}

Location.prototype.process = function(packet){
	var action = (packet.action || '').toLowerCase()
	var key = packet.node.key
	var value = packet.node.value

	if(action==='delete'){
		// we are only removing if we already had it
		if(this.values[key]){
			delete(this.values[key])
			this.emit('remove', key.substr(this.path.length), value)
		}
	}
	else{
		// if we already have the value it is a change
		if(this.values[key]){
			// we only actually changed if the value is different
			if(this.values[key]!=value){
				this.emit('remove', key.substr(this.path.length), this.values[key])
				this.values[key] = value
				this.emit('add', key.substr(this.path.length), value)
				this.emit('change', key.substr(this.path.length), value)
			}
		}
		else{
			this.values[key] = value
			this.emit('add', key.substr(this.path.length), value)
		}
	}
}

Location.prototype.load_path = function(path){

	var self = this
	// load the initial items at that path
	this.etcd.get(path, {
		recursive:true
	}, function(error, result){
		if(error || !result){
			return
		}
		else{
			var leafs = flatten(result.node)
			Object.keys(leafs || {}).forEach(function(key){
				var path = key.substr(self.path.length)
				var value = leafs[key]
				self.emit('add', path, value)
			})
		}
	})
}

Location.prototype.watch_path = function(path){	
	
	var self = this

	// setup a watch on the path
	this.etcd.wait(path, {
		recursive:true
	}, function onResult(error, data, next){
		if(error){
			return next(onResult)
		}
		if(!data){
			return next(onResult)
		}
		self.process(data)
		return next(onResult)
	})	
}