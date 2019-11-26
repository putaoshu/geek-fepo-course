// var pngquant = require('node-pngquant-native');
var pngquant = require('jdf-png-native');
var fs = require('fs');

fs.readFile('./in.png', function(err, buffer) {
    if (err) throw err;

	var resBuffer = pngquant.option({}).compress(buffer);
   
    fs.writeFile('./out.png', resBuffer, {
        flags: 'wb'
    }, function(err) {});
});