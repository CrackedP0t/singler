#!/usr/bin/env node

var singler = require("./src/singler.js");
var yargs = require("yargs");

var args = yargs
		.demand(1)
		.alias({
			"out-file": "o",
			"out-dir": "O",
			"base-dir": "d",
			"html-dir": "h",
			"css-dir": "c",
			"js-dir": "j",
			"print": "p",
			"skip-remove": "R",
			"skip-add": "A",
			"skip-css": "C",
			"skip-js": "J",
			"skip-minify": "H",
			"minify-config": "m",
			"minify-config-replace": "M"
		})
		.implies("minify-config-replace", "minify-config")
		.boolean([
			"print",
			"skip-remove",
			"skip-add",
			"skip-css",
			"skip-js",
			"skip-minify",
			"minify-config-replace"
		])
		.default({
			"out-file": false,
			"out-dir": "",
			"base-dir": "",
			"html-dir": "",
			"css-dir": "",
			"js-dir": "",
			"minify-config": "{}"
		})
		.argv;

var argNames = ["outFile", "outDir", "baseDir", "htmlDir", "cssDir", "jsDir", "print", "skipRemove", "skipAdd", "skipCSS", "skipJS", "skipMinify", "minifyConfig", "minifyConfigReplace"];

var options = {
	inFile: args._[0]
};
for (var i in argNames) {
	options[argNames[i]] = args[argNames[i]];
}

if (options.minifyConfig !== "") {
	options.minifyConfig = JSON.parse(options.minifyConfig);
}

var singled = singler(options);


if ((!options.outFile && options.outDir === "") || options.print) {
	console.log(singled);
}
