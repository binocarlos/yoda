var Yoda = require('../src');
var Etcd = require('etcdx');
var async = require('async');
var should = require('should');

describe('yoda', function(){

	beforeEach(function(done){

		this.timeout(1000);

		var client = new Etcd();

		client.rmdir('/my/location', function(error){
			setTimeout(done, 100);
		})
		
	})


	it('should be an Event Emitter', function(done) {
		var yoda = new Yoda();

		yoda.on('levitate', done);
		yoda.emit('levitate');
	})

	it('should do a basic read and write', function(done) {

		this.timeout(5000);

		// connect to the etcd server
		var yoda = new Yoda();
		var location = yoda.connect('/my/location');
		var client = new Etcd();

		var hits = {
			add:0,
			change:0,
			remove:0
		};

		var values = {}

		location.on('add', function(route, data){
			hits.add++;
			values[route] = data;
			var match = route.match(/\/my\/location/);

			if(match){
				throw new Error('paths not removed');
			}
		})

		location.on('change', function(route, data){			
			hits.change++;
			values[route] = data;
		})

		location.on('remove', function(route, data){			
			hits.remove++;
			delete(values[route]);
		})

		async.series([

			function(next){
				setTimeout(next, 100);
			},
			
			function(next){
				client.set("/my/location/a", "hello world", function(error, val){
					setTimeout(next, 10);
				})

			},

			function(next){

				client.set("/my/location/b", "hello world", function(error, val){
					setTimeout(next, 10);
				})
			},

			function(next){
				client.del("/my/location/a", function(error, val){
					setTimeout(next, 10);
				})
			},

			function(next){
				client.set("/my/location/b", "hello world 2", function(error, val){
					setTimeout(next, 10);
				})
			},

			function(next){
				client.set("/my/location/c", "hello world new", function(error, val){
					setTimeout(next, 10);
				})
			},

			function(next){
				// this should not change anything
				client.set("/my/location/b", "hello world 2", function(error, val){
					setTimeout(next, 10);
				})
			}
		], function(error){

			// give the above a chance to register with the event handlers
			setTimeout(function(){

				should.not.exist(values["/a"]);
				values["/b"].should.equal('hello world 2');
				values["/c"].should.equal('hello world new');
				hits.add.should.equal(3);
				hits.change.should.equal(1);
				hits.remove.should.equal(1);
				done();
			}, 10)
			
		})

  })
	

	it('should load values initially', function(done) {

		this.timeout(5000);

		var client = new Etcd();

		
		async.series([

			function(next){
				setTimeout(next, 100);
			},
			
			function(next){
				client.set("/my/location/a", "hello world a", function(error, val){
					next();
				})

			},

			function(next){

				client.set("/my/location/b", "hello world b", function(error, val){
					next();
				})
			},

			function(next){
				client.set("/my/location/c/sub", "hello world c", function(error, val){
					next();
				})
			}
		], function(error){

			var yoda = new Yoda();
			var location = yoda.connect('/my/location');
			
			var values = {}

			location.on('add', function(route, data){
				values[route] = data;
			})

			setTimeout(function(){
				values["/a"].should.equal('hello world a');
				values["/b"].should.equal('hello world b');
				values["/c/sub"].should.equal('hello world c');
				done()
			}, 100)

		})

  })

})
