require('babel-core/register');
require('css-modules-require-hook/preset');

var env = process.env.NODE_ENV || 'prod'

if(env === 'prod'){
	var app = require("./server.prod.js");
} else {
	var app = require("./server.dev.js");
}