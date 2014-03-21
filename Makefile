JSON_SH_URL ?= https://raw.github.com/dominictarr/JSON.sh/master/JSON.sh

check: test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		--timeout 300 \
		--require should \
		--growl \
		test/test.js

install: jsonsh
	cp -f yoda /usr/local/bin/yoda

jsonsh:
	wget -qO- ${JSON_SH_URL} > /usr/local/bin/jsonsh
	chmod a+x /usr/local/bin/jsonsh

etcd:
	docker run -d -p 4001:4001 -p 7001:7001 -name yoda-etcd1 -t coreos/etcd

.PHONY: test check install jsonsh etcd