#!/usr/bin/env node

var singler = require("./src/singler.js");
var getOpts = require("get-options");

let args = getOpts(process.argv, [
	"-o", "--out-file", "[output-file]",
	"-c", "--css-dir", "[directory]",
	"-j", "--js-dir", "[directory]"
]);

let options = args.options;
console.log(args);
let singled = singler({infile: args.argv[0]});

if (!args[1]) {
	console.log(singled);
}
