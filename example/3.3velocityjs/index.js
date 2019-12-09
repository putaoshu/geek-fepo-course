var Velocity = require('velocityjs');

var VelocityRender = Velocity.render(
	'<h2>This is $name !~ </h2>'+
	'#foreach( $product in $allProducts )'+
    	'<li>$velocityCount $product.title $product.content</li>'+
	'#end', 
	
	{
	    "name": "h2", 
	    "allProducts": [
	        {
	            "title": "title1", 
	            "content": "content1"
	        }, 
	        {
	            "title": "title2", 
	            "content": "content2"
	        }
	    ]
	}
)

console.log(VelocityRender);