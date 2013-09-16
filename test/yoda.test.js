var Yoda = require('../src');
var Etcd = require('node-etcd');
var async = require('async');

describe('yoda', function(){

	beforeEach(function(done){

		var client = new Etcd();

		client.get('/my/location', function(error, list){
			if(error){
				done();
				return;
			}

			async.forEach(list || [], function(item, nextitem){
			
				client.del(item.key, nextitem);
			}, function(error){
			
				done();
			})
			
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

		location.on('add', function(route, data){
			hits.add++;
		})

		location.on('change', function(route, data){
			hits.change++;
		})

		location.on('remove', function(route, data){
			hits.remove++;
		})

		async.series([
			function(next){
				client.set("/my/location/a", "hello world", function(error, val){
					next();
				})

			},

			function(next){
				client.set("/my/location/b", "hello world", function(error, val){
					next();
				})
			},

			function(next){
				client.del("/my/location/a", function(error, val){
					next();
				})
			},

			function(next){
				client.set("/my/location/b", "hello world 2", function(error, val){
					next();
				})
			},

			function(next){
				client.set("/my/location/c", "hello world new", function(error, val){
					next();
				})
			},

			function(next){
				// this should not change anything
				client.set("/my/location/b", "hello world 2", function(error, val){
					next();
				})
			}
		], function(error){

			// give the above a chance to register with the event handlers
			setTimeout(function(){
				hits.add.should.equal(3);
				hits.change.should.equal(1);
				hits.remove.should.equal(1);
				done();
			}, 10)
			
		})

  })

	it('should handle the location path in adds', function(done) {

		this.timeout(5000);

		// connect to the etcd server
		var yoda1 = new Yoda();
		var location1 = yoda1.connect('/my/location');

		var yoda2 = new Yoda();
		var location2 = yoda2.connect('/my/location');

		location1.on('add', function(route, data){
			
			route.should.equal('/123');
			data.should.equal('456');

			done();
		})

		location2.add('/123', '456');


  })

})
