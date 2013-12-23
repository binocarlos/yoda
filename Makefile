check: test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		--timeout 300 \
		--require should \
		--growl \
		test/test.js

install:
	cp -f yoda /usr/local/bin/yoda

etcd:
	docker build -t yoda/etcd .
	docker run -d -p 4001:4001 -p 7001:7001 -name yoda-etcd1 -t yoda/etcd

.PHONY: test