#!/bin/bash

set -e

# Concatenate the js & minify them
./node_modules/uglifyjs/bin/uglifyjs client/vendor/erizo.js client/conqueror-start.js -o static/conqueror.js
