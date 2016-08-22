var minify = require('html-minifier').minify;
var fs = require("fs");
var path = require("path");

function singler(opts) {
	var minifyOpts = {
		collapseBooleanAttributes: true,
		collapseWhitespace: true,
		minifyCSS: true,
		minifyJS: true,
		removeAttributeQuotes: true,
		removeComments: true,
		removeEmptyAttributes: true,
		removeRedundantAttributes: true
	};

	if (!opts.skipRemove)
		var removeRX = /<!\-\- singler\-remove\-start \-\->[\s\S]+<!\-\- singler\-remove\-end \-\->/gi;
	var cssRX = /<link.+href=["']?([\w\.]+)["']?.*>/gi;
	var jsRX = /<.*script.+src=["']?([\w\.]+)["']?.*>.*<.*\/.*script.*>/gi;

	var outstring = fs.readFileSync(path.join(opts.baseDir, opts.inFile), "utf8");
	if (!opts.skipRemove)
		outstring = outstring.replace(removeRX, "");
	outstring = outstring.replace(cssRX, function(match, file) {
		return "<style>" + fs.readFileSync(path.join(opts.baseDir, opts.cssDir, file), "utf8") + "</style>";
	});
	outstring = outstring.replace(jsRX, function(match, file) {
		return "<script>" + fs.readFileSync(path.join(opts.baseDir, opts.jsDir, file), "utf8") + "</script>";
	});
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
