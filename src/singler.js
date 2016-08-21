var minify = require('html-minifier').minify;
var fs = require("fs");

function singlify(file, outfile) {
	let opts = {
		collapseBooleanAttributes: true,
		collapseWhitespace: true,
		minifyCSS: true,
		minifyJS: true,
		removeAttributeQuotes: true,
		removeComments: true,
		removeEmptyAttributes: true,
		removeRedundantAttributes: true
	};

	let cssRX = /<link.+href=["']?([\w\.]+)["']?.*>/g;
	let jsRX = /<script src=["']([\w\.]+)["'].*>.*<\/script>/g;


	let outstring = fs.readFileSync(file, "utf8");
	outstring = outstring.replace(cssRX, function(match, file) {
		return "<style>" + fs.readFileSync(file, "utf8") + "</style>";
	});
	outstring = outstring.replace(jsRX, function(match, file) {
		return "<script>" + fs.readFileSync(file, "utf8") + "</script>";
	});
	outstring = minify(outstring, opts);

	if (outfile) {
		fs.writeFileSync(outfile, outstring, "utf8");
	}

	return outstring;
}

module.exports = singlify;
