var dataset =[];	//global variable

d3.csv("data/grocery.csv", function(error, data)
{
	if (error)
	{
		console.log(error); //Log the error, so we can troubleshoot.
	} 
	else 
	{ //If no error, then the file loaded correctly. Yay!
		console.log(data); //Log the data, so we can verify it.
		dataset = data.map(function(d) 
		{
			return[ d["Item"], +parseFloat(d["Cost"]), +parseInt(d["Quantity"]) ];
		});

		console.log(dataset);
		generateVis();
	}
});
			
var generateVis = function()
{
	var colCost = 1;
	var colQuantity = 2;
	d3.select("body").selectAll("div")
		.data(dataset)
		.enter()
		.append("div")
		.attr("class", "bar")
		.style("height", function(d)
			{
				return d[colCost]*10  + "px";
			})
		.style("background-color", function(d)
			{
				if (d[colQuantity] < 30) 
					{ return "blue";}
				else 
					{return "yellow";}	
			});
};