#!/bin/bash
yoda set "/mongo/123" '{"host":"123.123.133.125", "port":"123"}'
echo
yoda get "/mongo/123"
echo
yoda set "/mongo/123" '{"host":"123.123.133.127", "port":"123"}'
echo
yoda get "/mongo/123"
echo
yoda del "/mongo/123"