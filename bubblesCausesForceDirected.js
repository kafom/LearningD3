/**
 * Created with JetBrains WebStorm.
 * User: oola
 * Date: 9/4/13
 * Time: 2:31 PM
 * To change this template use File | Settings | File Templates.
 */

var nodeArray = []; //nodes
var dataset = [];
var layout_gravity = -0.01,
	damper = 0.1,
	force, circles;
//	tooltip = CustomTooltip("gates_tooltip", 240),

var width= 940, height=500;
var colorAgeScale = d3.scale.category20();

var radiusScale;

var center = {x: width / 2, y: height / 2};


var svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("class", "bubble");


function filterCauses(element, index, array)
{
	return element.unit == 'Number' && element.sex == "Both" && element.year == "2000";
}

d3.csv("data/01020561_EDITr2.csv", function(error, data)
{
	dataset = data.filter(filterCauses);
	refactorData();
	visualize();
	start();
	display_group_all();

});

function refactorData()
{
	dataset.forEach(function(d)
	{
		d.year = +d.year;
		d.value = +d.value;

	});

	colorAgeScale.domain(dataset.map(function(d){ return d.age;}));

	radiusScale = d3.scale.pow().exponent(0.5)//or change it to .scale.linear()
		.domain([0, d3.max(dataset, function (d) { return d.value;})])
		.range([2, 85]);


	dataset.forEach(function(d)
	{
		var node = {
			id: d.id,
			cause: d.cause,
			age: d.age,
			value: d.value,
			r: radiusScale(d.value),
			x: Math.random() * 800,
			y: Math.random() * 500  //what do these numbers do????
		};
		nodeArray.push(node);

	});

	nodeArray.sort(function(a,b) {return b.value - a.value;});   //descending order

	console.log(nodeArray);

}
function visualize()
{
	circles = svg.selectAll("circle")
		.data(nodeArray, function(d) { return d.id});

		circles.enter().append("circle")
			.attr("r", 0)
			.attr("stroke", function(d) { return colorAgeScale(d.age); })
			.attr("stroke", function(d) {return d3.rgb(colorAgeScale(d.age)).darker();})
			.attr("fill", function(d) { return colorAgeScale(d.age); })
			.attr("stroke-width", 2);

	circles.transition().duration(1000).attr("r", function(d) { return d.r; });
}
function charge(d)
{
	return -Math.pow(d.r, 2.0) / 8;
}
function start()
{
	force = d3.layout.force()
		.nodes(nodeArray)
		.size([width, height]); //reducing these values doesn't change it either
}
function display_group_all()
{
	force.gravity(layout_gravity)//force that pushes toward the center, 0 = disables - pushes away
		.charge(function(d) {return -Math.pow(d.r, 2.0) / 7;})// charge)   //the distance between us, prevents collision tne NEGAIVE IS IMPORTANT oooooooooo                  	//how nodes push away or attract one another
		.friction(0.9)  //velocity decay 0 = no movement 1= no friction
		.on("tick", function(e)
		{
			circles.each(move_towards_center(e.alpha)) //speed of the node starts fast ends slow
				.attr("cx", function(d){ return d.x;})
				.attr("cy", function(d){ return d.y;})
		});

	force.start();
}

function move_towards_center(alpha) {
	return function(d) {
		d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
		d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
	};
}


