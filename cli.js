var singler = require("./src/singler.js");

var args = process.argv.slice(2);

let singled = singler(args[0], args[1]);

if (!args[1]) {
	console.log(singled);
}
