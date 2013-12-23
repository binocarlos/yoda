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
var EtcdX = require('etcdx');
var Location = require('./location');

// the endpoint of the etcd server
function Yoda(host, port){
	EventEmitter.call(this);

	host = host || process.env.YODA_HOST || '127.0.0.1';
	port = port || process.env.YODA_PORT || 4001;

	this.etcd = new EtcdX({
		host:host,
		port:port });
}

util.inherits(Yoda, EventEmitter);

module.exports = Yoda;

// watch the given path and emit events for initial load and addition - removal
// we return a location object the wrapps all that up
Yoda.prototype.connect = function(path){

	var location = new Location(this.etcd);

	location.connect(path);	

	return location;

}