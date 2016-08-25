var util = require("util");

var fs = require("fs");
var minify = require('html-minifier').minify;
var path = require("path");
var jsdom = require("jsdom");

function singler(opts, cb1) {
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

	function traverse(document, nIt, cb2, inRemoveBlock, toRemove) {
		toRemove = toRemove || [];
		var node;
		node = nIt.nextNode();
		if (node) {
			var isComment = node.nodeType == 8;
			if (inRemoveBlock) {
				if (node.textContent.match(/:singler-remove-end/)) {
					inRemoveBlock = false;
				}
				toRemove.push(node);
				traverse(document, nIt, cb2, inRemoveBlock, toRemove);
			} else if (isComment && node.textContent.match(/singler-remove-start:/)) {
				inRemoveBlock = true;
				toRemove.push(node);
				traverse(document, nIt, cb2, inRemoveBlock, toRemove);
			} else if (isComment && node.textContent.match(/singler-add-start:/)) {
				var addString = node.textContent;
				addString = addString.replace(/singler-add-start:/, "");
				addString = addString.replace(/:singler-add-end/, "");

				var addElement = jsdom.env(addString, function(err, window) {
					var headNodes = window.document.getElementsByTagName("head")[0].childNodes;
					for (var i in headNodes) {
						node.parentElement.insertBefore(headNodes[i], node);
					}
					toRemove.push(node);
					traverse(document, nIt, cb2, inRemoveBlock, toRemove);
				});
			} else if (node.tagName
					   && node.tagName.toLowerCase() == "link"
					   && node.rel == "stylesheet") {
				var filePath = path.join(opts.baseDir, opts.cssDir, path.parse(node.href).base);
				fs.readFile(filePath, "utf8", function(err, data) {
					var style = document.createElement("style");
					style.textContent = data;
					node.parentElement.replaceChild(style, node);

					traverse(document, nIt, cb2, inRemoveBlock, toRemove);
				});
			} else if (node.tagName
					   && node.tagName.toLowerCase() == "script"
					   && node.src) {
				var filePath = path.join(opts.baseDir, opts.jsDir, path.parse(node.src).base);
				fs.readFile(filePath, "utf8", function(err, data) {
					node.removeAttribute("src");
					node.textContent = data;

					traverse(document, nIt, cb2, inRemoveBlock, toRemove);
				});
			} else {
				traverse(document, nIt, cb2, inRemoveBlock, toRemove);
			}
		} else {
			for (var i in toRemove) {
				toRemove[i].parentElement.removeChild(toRemove[i]);
			}
			cb2();
		}
	}

	var inFilePath = path.join(opts.baseDir, opts.htmlDir, opts.inFile);

	if (opts.verbose)
		console.log("Singling %s", inFilePath);

	jsdom.env(inFilePath, function(err1, window) {
		var nIt = window.document.createNodeIterator(window.document, window.NodeFilter.SHOW_ALL);
		traverse(window.document, nIt, function() {
			var html = jsdom.serializeDocument(window.document);
			html = minify(html, minifyOpts);
			if (opts.outFile || opts.outDir !== "") {
				var outFilePath = path.join(opts.outDir, opts.outFile
										 || path.parse(opts.inFile).base);
				if (opts.verbose)
					console.log("Writing to %s", outFilePath);

				fs.mkdir(path.parse(outFilePath).dir, function(err2) {
					fs.writeFile(outFilePath, html, function(err3) {
						cb1(html);
					});
				});
			}
		});
	});
}

module.exports = singler;
