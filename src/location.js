/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

/*
  Module dependencies.
*/

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Location(etcd){
	EventEmitter.call(this);
	this.etcd = etcd;

	// our map of values so we know if to say added or removed
	this.values = {};
}

util.inherits(Location, EventEmitter);

module.exports = Location;

Location.prototype.connect = function(path){
	this.path = path;
	this.load_path(path);
	this.watch_path(path);
}

// this method is used to add data
Location.prototype.add = function(id, data, done){
	if(id.charAt(0)!='/'){
		id = '/' + id;
	}
	this.etcd.set(this.path + id, data, done || function(){

	});
}

Location.prototype.process = function(packet){
	var action = (packet.action || '').toLowerCase();
	var key = packet.node.key;
	var value = packet.node.value;

	if(action==='delete'){
		// we are only removing if we already had it
		if(this.values[key]){
			delete(this.values[key]);
			this.emit('remove', key.substr(this.path.length), value);
		}
	}
	else{
		// if we already have the value it is a change
		if(this.values[key]){
			// we only actually changed if the value is different
			if(this.values[key]!=value){
				this.emit('remove', key.substr(this.path.length), this.values[key]);
				this.values[key] = value;
				this.emit('add', key.substr(this.path.length), value);
				this.emit('change', key.substr(this.path.length), value);
			}
		}
		else{
			this.values[key] = value;
			this.emit('add', key.substr(this.path.length), value);
		}
	}
}

Location.prototype.recurse = function(node){
	if(node.dir){
		(node.nodes || []).forEach(this.recurse.bind(this));
	}
	else{

		this.values[node.key] = node.value;
		this.emit('add', node.key.substr(this.path.length), node.value);
	}
}

Location.prototype.load_path = function(path){

	var self = this;
	// load the initial items at that path
	this.etcd.ls(path, true, function(error, result){
		if(error){
			return;
		}

		if(!error){
			self.recurse(result.node);	
		}
	})
}

Location.prototype.watch_path = function(path){	
	
	var self = this;

	// setup a watch on the path
	this.etcd.watch(path, true, function(error, packet){

		if(!error){
			self.process(packet);
		}

		// control if we still keep watching
		return !error ? true : false;
	})	
}