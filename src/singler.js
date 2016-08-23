var fs = require("fs");
var minify = require('html-minifier').minify;
var path = require("path");

function singler(opts) {
	var minifyOpts;

	if (opts.minifyConfigReplace) {
		minifyOpts = opts.minifyConfig;
	} else {
		minifyOpts = {
			collapseBooleanAttributes: true,
			collapseWhitespace: true,
			minifyCSS: true,
			minifyJS: true,
			removeAttributeQuotes: true,
			removeComments: true,
			removeEmptyAttributes: true,
			removeRedundantAttributes: true
		};

		for (var k in opts.minifyConfig) {
			minifyOpts[k] = opts.minifyConfig[k];
		}
	}

	if (!opts.skipRemove)
		var removeRX = /<!\-\- singler\-remove\-start:[^]+:singler\-remove\-end \-\->/g;
	if (!opts.skipAdd)
		var addRX = /<!\-\- singler\-add\-start:([^]+):singler\-add\-end \-\->/g;
	if (!opts.skipCSS)
		var cssRX = /<link.+href=["']?([\w.]+)["']?.*>/gi;
	if (!opts.skipJS)
		var jsRX = /<.*script.+src=["']?([\w.]+)["']?.*>.*<.*\/.*script.*>/gi;

	var outstring = fs.readFileSync(path.join(opts.baseDir, opts.htmlDir, opts.inFile), "utf8");
	if (!opts.skipRemove)
		outstring = outstring.replace(removeRX, "");
	if (!opts.skipAdd)
		outstring = outstring.replace(addRX, "$1");
	if (!opts.skipCSS)
		outstring = outstring.replace(cssRX, function(match, file) {
			return "<style>" + fs.readFileSync(path.join(opts.baseDir, opts.cssDir, file), "utf8") + "</style>";
		});
	if (!opts.skipJS)
		outstring = outstring.replace(jsRX, function(match, file) {
			return "<script>" + fs.readFileSync(path.join(opts.baseDir, opts.jsDir, file), "utf8") + "</script>";
		});
	if (!opts.skipMinify)
		outstring = minify(outstring, minifyOpts);

	if (opts.outFile || opts.outDir !== "") {
		if (!fs.existsSync(opts.outDir)){
			fs.mkdirSync(opts.outDir);
		}

		fs.writeFileSync(opts.outFile
						 ? path.join(opts.outDir, opts.outFile)
						 : path.join(opts.outDir, path.parse(opts.inFile).base)
						 , outstring
						 , "utf8");
	}

	return outstring;
}

module.exports = singler;
