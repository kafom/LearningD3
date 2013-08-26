/**
 * Created with JetBrains WebStorm.
 * User: oola
 * Date: 8/14/13
 * Time: 5:26 PM
 * To change this template use File | Settings | File Templates.
 */
//Borders, margins and sizes
var margin = {top: 20, right: 20, bottom: 20, left: 20};
var widthProvinceSelect = 150;
var heightProvinceSelect = 250;
var heightButtons = 40;
var legendLeft = 50, legendBottom = 50, provinceSelectSpace = 40;
var w = 700, h = 400;
var width = 700 - (margin.right+ margin.left + widthProvinceSelect +legendLeft + provinceSelectSpace);
var height = 500 - (margin.top +margin.bottom +legendBottom+heightButtons);

var circleRadius = 0,circleRadiusSelected = 0;
var opacityGrade = 0.3;

//SCALES
var xScaleIndicator =d3.scale
	.ordinal()
	.rangeRoundBands([0,width]);
var yScalePercent = d3.scale
	.linear()
	.range([height,20]);   //we need to use the size of the yScale radius that is teh biggest circle
//var cScaleProvince = d3.scale.category20();

var cScaleProvince = d3.scale
	.ordinal()
	.range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#45293C", "#FFA09E", "#F2F21F"]);
//.range(colorbrewer.Paired[12]);
//     .range(colorbrewer.YlGnBu[buckets - 1]);

//GLOBAL VARIABLE FOR DATA
var dataset = [];
var currentSex = 0;

//AXES
var xAxisIndicator = d3.svg.axis()
	.scale(xScaleIndicator)
	.tickSize(0)
	.orient("bottom");

var yAxisPercent = d3.svg.axis()
	.scale(yScalePercent)
	.tickSize(0)
	.ticks(5)
	.tickFormat(d3.format(".2s"))
	.orient("left");


//SVG ELEMENT
var svg = d3.select("body")
	.append("svg")
	.attr("width", w)
	.attr("height", h)
	.attr("transform", "translate(0," +(heightButtons) +")");

var bubbles = svg.append("g")
	.attr("class", "bubbles");


var provinceSelect = svg.append("g")
	.attr("class", "provinceSelect")
	.attr("transform", "translate(" +(legendLeft+margin.left+width+ provinceSelectSpace) + ",0)");


//READ IN THE DATA
d3.csv("data/01050501_A_Indicator.csv", function (error,data)
{
	data.forEach(function(d)
	{
		d.percent = +d.percent;
	});

	//ANOTHER WAY TO MAP
	dataset = d3.nest()
		.key(function (d) { return d.sex;})
		.entries(data);

	console.log(dataset);

	//THE SCALES
	xScaleIndicator.domain(dataset[0].values.map(function(d) { return d.indicator;}));

	yScalePercent.domain([0,d3.max(dataset, function(d)
	{
		return d3.max(d.values, function(c)
		{
			return c.percent;
		});
	})
	]);

	cScaleProvince.domain(dataset[0].values.map(function(d) { return d.abbr;}));

	//set the radius of the circles based on rangeBand
	circleRadius = Math.round(xScaleIndicator.rangeBand() * 0.08);
	circleRadiusSelected = Math.round(circleRadius * 2);
	console.log(circleRadius + "and" + circleRadiusSelected);
	console.log(xScaleIndicator.domain());
	console.log(yScalePercent.domain());
	console.log(cScaleProvince.domain());

	visualizeLines();
	visualizeBubbles();
	visualizeProvinceSelect();
	vAxes();
});


function visualizeProvinceSelect()
{
	var widthBar = 40;
	var heightBar = 10;

	var legend = provinceSelect.selectAll("rect")
		.data(cScaleProvince.domain().slice()) //do u need to do .slice().reverse()
		.enter()
		.append("g")
		.attr("class", "provinceLegend")
		.attr("id", function (d) { return d;})
		.attr("transform", function(d, i) { return "translate(0," + (i+2) * (2*heightBar) + ")"; })
		.on("click", function (d)
		{

			var rectChild = d3.select(this).node().firstChild;
			var textChild = d3.select(this).node().lastChild;
			//for that province find all the circles and set them also to hidden class.
			//we have the province name.
			//1. find all the ones that match that id with selectAll
			if (rectChild.classList.length == 0)
			{
				rectChild.classList.add("selected");
				textChild.classList.add("selected");
				uBubbles = d3.selectAll("#"+d)
					.transition()
					.duration(1000)
					.attr("r", circleRadiusSelected)
					.attr("class", "selected")
					.attr("opacity", "1.0");
			}
			else
			{
				rectChild.classList.remove("selected");
				textChild.classList.remove("selected");
				uBubbles = d3.selectAll("#"+d)
					.transition()
					.duration(1000)
					.attr("r", circleRadius)
					.attr("class", "")
					.attr("opacity", opacityGrade);

			}
		});

	legend.append("rect")
		.attr("x", widthBar - 10)
		.attr("width", widthBar)
		.attr("height", heightBar)
		.attr("opacity", opacityGrade)
		.style("fill", function (d) { return cScaleProvince(d);});


	//need to set an attribute so that people know the name is as clickable as the other parts of it is
	legend.append("text")
		.attr("x", 0) //based on the 0 + 18 above
		.attr("y", heightBar/2) //i don't know what to do with this
		.attr("dy", ".35em")
		.attr("opacity", opacityGrade)
		.style("text-anchor", "left")
		.style("fill", function (d) { return cScaleProvince(d);})
		.text(function (d) { return d; });

}
function visualizeBubbles()
{

	var randomX = Math.round(xScaleIndicator.rangeBand() * .6);

	//create the g element for the circles then draw all the circles.
	bubbles.attr("transform", "translate(" +(legendLeft+margin.left + xScaleIndicator.rangeBand()/2) + ",0)")
		.selectAll("circle")
		.data(dataset[currentSex].values)
		.enter()
		.append("circle")
		.attr("r", circleRadius)
		.attr("cx", function (d) { return (randomX*Math.random() - randomX/2) + xScaleIndicator(d.indicator);})
		.attr("cy", function (d) { return yScalePercent(d.percent);})
		.attr("fill", function (d) { return cScaleProvince(d.abbr);})
		.attr("opacity", opacityGrade)     //the diff btw style and attri
		.attr("id", function (d) { return d.abbr;})
		.on("click", function (d)
		{
			var gProvinceSelect = d3.select("g#"+d.abbr);
			var rectChild = gProvinceSelect.node().firstChild;
			var textChild = gProvinceSelect.node().lastChild;

			if((this).classList.length == 0)
			{
				var uBubbles = d3.selectAll("#"+d.abbr)
					.transition()
					.duration(1000)
					.attr("r", circleRadiusSelected)
					.attr("class", "selected")
					.attr("opacity", "1.0");

				rectChild.classList.add("selected");
				textChild.classList.add("selected");
			}
			else
			{
				var uBubbles = d3.selectAll("#"+d.abbr)
					.transition()
					.duration(1000)
					.attr("r", circleRadius)
					.attr("class", "")
					.attr("opacity", opacityGrade);

				rectChild.classList.remove("selected");
				textChild.classList.remove("selected");
			}
		});
}

function updateBubbles()
{
	var randomX = Math.round(xScaleIndicator.rangeBand() * .6);

	//BIND THE DATA FIRST
	uBubbles = bubbles.selectAll("circle")
		.data(dataset[currentSex].values);

	//add new elements if need be
	uBubbles.enter()
		.append("circle")
		.attr("r", circleRadius)
		.attr("cx", function (d) { return (randomX*Math.random() - randomX/2) + xScaleIndicator(d.indicator);})
		.attr("cy", height/2)  //   we will come back to these lines later cy and opacity
		.attr("opacity", opacityGrade)
		.attr("fill", function (d) { return cScaleProvince(d.abbr);})
		.on("click", function (d)
		{
			var gProvinceSelect = d3.select("g#"+d.abbr);
			var rectChild = gProvinceSelect.node().firstChild;
			var textChild = gProvinceSelect.node().lastChild;

			if((this).classList.length == 0)
			{
				var uBubbles = d3.selectAll("#"+d.abbr)
					.transition()
					.duration(1000)
					.attr("r", circleRadiusSelected)
					.attr("class", "selected")
					.attr("opacity", "1.0");

				rectChild.classList.add("selected");
				textChild.classList.add("selected");
			}
			else
			{
				var uBubbles = d3.selectAll("#"+d.abbr)
					.transition()
					.duration(1000)
					.attr("r", circleRadius)
					.attr("class", "")
					.attr("opacity", opacityGrade);

				rectChild.classList.remove("selected");
				textChild.classList.remove("selected");
			}
		});

	//now update all the elements
	uBubbles.transition()
		.duration(1000)
		.delay(100)  //we don't need this at all.
		.attr("cy", function (d) { return yScalePercent(d.percent);});


	//EXIT THE ONES THAT DON'T MATCH
	uBubbles.exit()
		.transition()
		.duration(500)
		.attr("opacity", opacityGrade)
		.remove();
}

function visualizeLines()
{
	var lines = svg.append("g")
		.attr("class", "indicatorLines")
		.attr("transform", "translate(" +(legendLeft+margin.left) + ",0)");

	lines.selectAll("line")
		.data(xScaleIndicator.domain())
		.enter()
		.append("line")
		.attr("x1", function (d)
		{return xScaleIndicator(d);})
		.attr("x2", function (d)
		{return xScaleIndicator(d);})
		.attr("y1", 0)
		.attr("y2", height);
	//.attr("stroke", "blue");

	var xValue = xScaleIndicator.rangeBand();
	var y = xScaleIndicator.domain().length;
	var x = xScaleIndicator.domain()[y-1];
	var z = xScaleIndicator(x) + xValue;
	//console.log(x)

	//add one more line on the right
	lines.append("line")
		.attr("x1", z)
		.attr("x2", z)
		.attr("y1", 0)
		.attr("y2", height)
		.attr("stroke", "blue");

}
function vAxes()
{
	var axes = svg.append("g")
		.attr("transform", "translate(" +(legendLeft+margin.left-5) + ",0)");
	axes.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxisIndicator);

	axes.append("g")
		.attr("class", "y axis")
		.call(yAxisPercent)
		.append("text")
		//.attr("transform", "rotate(-90)")
		.attr("x", -1)
		//.attr("y", -9)    //because we have rotated it the y is actually now the x
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("(%)");
}
function setSexB()
{
	currentSex = 0;
	updateBubbles();
}
function setSexM()
{
	currentSex = 1;
	updateBubbles();
}
function setSexF()
{
	currentSex = 2;
	updateBubbles();
}