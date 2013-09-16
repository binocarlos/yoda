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

	if(packet.action==='DELETE'){
		// we are only removing if we already had it
		if(this.values[packet.key]){
			delete(this.values[packet.key]);
			this.emit('remove', packet.key.substr(this.path.length), packet.value);
		}
	}
	else{
		// if we already have the value it is a change
		if(this.values[packet.key]){
			// we only actually changed if the value is different
			if(this.values[packet.key]!=packet.value){
				this.values[packet.key] = packet.value;
				this.emit('change', packet.key.substr(this.path.length), packet.value);
			}
		}
		else{
			this.values[packet.key] = packet.value;
			this.emit('add', packet.key.substr(this.path.length), packet.value);
		}
	}
}

Location.prototype.load_path = function(path){

	var self = this;
	// load the initial items at that path
	this.etcd.get(path, function(error, items){
		
		// this is most likely (there are no keys here)
		if(error){
			return;
		}
		(items || []).forEach(function(item){
			self.process(item);
		})
	})
}

Location.prototype.watch_path = function(path){	
	
	var self = this;

	// setup a watch on the path
	var watcher = this.etcd.watcher(path);

	watcher.on('change', function(packet){
		self.process(packet);
	})
	
}