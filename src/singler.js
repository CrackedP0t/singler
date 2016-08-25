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

	function traverse(nIt, cb2, inRemoveBlock, toRemove=[]) {
		var node;
		node = nIt.nextNode();
		if (node) {
			var isComment = node.nodeType == 8;
			if (inRemoveBlock) {
				if (node.textContent.match(/:singler-remove-end/)) {
					inRemoveBlock = false;
				}
				toRemove.push(node);
				traverse(nIt, cb2, inRemoveBlock, toRemove);
			} else if (isComment && node.textContent.match(/singler-remove-start:/)) {
				inRemoveBlock = true;
				toRemove.push(node);
				traverse(nIt, cb2, inRemoveBlock, toRemove);
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
					traverse(nIt, cb2, inRemoveBlock, toRemove);
				});
			} else {
				traverse(nIt, cb2, inRemoveBlock, toRemove);
			}
		} else {
			for (let i in toRemove) {
				toRemove[i].parentElement.removeChild(toRemove[i]);
			}
			cb2();
		}
	}


	jsdom.env(path.join(opts.baseDir, opts.htmlDir, opts.inFile), function(err, window) {
		var nIt = window.document.createNodeIterator(window.document, window.NodeFilter.SHOW_ALL);
		traverse(nIt, function() {
			var html = jsdom.serializeDocument(window.document);
			html = minify(html, minifyOpts);
			cb1(html);
		});
	});
}

module.exports = singler;
