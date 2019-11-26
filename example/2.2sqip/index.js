const sqip = require('sqip');
 
const result =  sqip({
    filename: './in.png',
    numberOfPrimitives: 10
});

console.log(result.final_svg);

