const lqip = require('lqip');

const file = './in.png';

//image
lqip.base64(file).then(res => {
    console.log(res); 
});

//color
lqip.palette(file).then(res => {
    console.log(res);
});
