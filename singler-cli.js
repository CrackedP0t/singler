#!/usr/bin/env node

var singler = require("./src/singler.js");
var yargs = require("yargs");

var args = yargs
		.demand(1)
		.alias({
			"out-file": "o",
			"out-dir": "O",
			"base-dir": "d",
			"css-dir": "c",
			"js-dir": "j",
			"print": "p"
		})
		.boolean("print")
		.default({
			"out-file": false,
			"out-dir": "",
			"base-dir": "",
			"css-dir": "",
			"js-dir": ""
		})
		.argv;

var argNames = ["outFile", "outDir", "baseDir", "cssDir", "jsDir", "print"];

var options = {
	inFile: args._[0]
};
for (var i in argNames) {
	options[argNames[i]] = args[argNames[i]];
}

var singled = singler(options);


if ((!options.outFile && options.outDir === "") || options.print) {
	console.log(singled);
}
