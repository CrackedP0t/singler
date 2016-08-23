#!/bin/sh

./singler-cli.js -d test -c css -j js test.html -O test/out/ -p -m "{\"removeComments\": false}"
