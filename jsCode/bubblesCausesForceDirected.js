/**
 * Created with JetBrains WebStorm.
 * User: oola
 * Date: 9/4/13
 * Time: 2:31 PM
 * To change this template use File | Settings | File Templates.
 */

var maxRadius = 80;
var nodeArray = []; //nodes
var dataset = [];
var yearList = [];
var layout_gravity = -0.01,
	damper = 0.1,
	force, circles,
	tooltip = CustomTooltip("gates_tooltip", 240);

var width= 900, height=900;
var colorAgeScale = d3.scale.category20();

var radiusScale;

var center = {x: width / 2, y: height / 2};

var year_centers = {
	0: {x: width / 3, y: height / 4},
	1: {x: width / 2, y: height / 4},
	2: {x: 2 * width / 3, y: height / 4},
	3: {x: width / 3, y: height / 2},
	4: {x: width / 2, y: height / 2},
	5: {x: 2 * width / 3, y: height / 2}
};



//CONSTANTS
var BOTH = 0, MALE = 1, FEMALE = 2;
var RANK = 0, NUMBER = 1, PERCENT = 2, MORTALITY = 3;
var AGE = 0, YEAR = 1;

//let it be an array of values
var currUnit = MORTALITY, currYear = 0, currSex =BOTH, currAge = 0, mainFilter = AGE;

var randomPosition = [];
for(var i =0; i <1000; i++)
{
	var obj =
	{
		x: Math.random() * 500,
		y: Math.random() * 699
	};
	randomPosition[i]=obj;
}

var svg = d3.select("#viz")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("class", "bubble");


function filterCauses(element, index, array)
{
	return element.unit == 'Mortality Rate' && element.sex == currSex && element.year == "2000";
}

d3.csv("data/01020561_EDITr2.csv", function(error, data)
{
	data.forEach(function(d)
	{
		d.year = +d.year;
		d.value = +d.value;
	});


	//you could use the key value but how does that work????

	//else
	var xScale = d3.scale.category10();
	xScale.domain(data.map(function(d){ return d.year;}));

	yearList = xScale.domain();


	dataset = d3.nest()
		.key(function(d) {return d.year;})
		.key(function(d) {return d.sex;})
		.key(function(d) {return d.unit;})
		.entries(data);


	refactorData();
	visualize();
	start();
	display_group_all();
	createYearMenu();
	createAgeMenu();
//	createLabels();

});

function refactorData()
{
	//var currentDataset = jQuery.extend(true, [], dataset.filter(filterCauses));
	var currentDataset = dataset[currYear].values[currSex].values[currUnit].values;

	colorAgeScale.domain(currentDataset.map(function(d){ return d.age;}));

	radiusScale = d3.scale.pow().exponent(0.5)//or change it to .scale.linear()
		.domain([0, d3.max(currentDataset, function (d) { return d.value;})])
		.range([2, maxRadius]);

	nodeArray.length = 0;  //this is because we call this function by when we filter the data

	currentDataset.forEach(function(d,i)
	{
		var node = {
			id: d.id,
			cause: d.cause,
			age: d.age,
			sex: d.sex,
			value: d.value,
			r: radiusScale(d.value),
			year: i % 6
		//	x: randomPosition[i].x,
		//	y: randomPosition[i].y  //what do these numbers do????
		};
		nodeArray.push(node);

	});

	nodeArray.sort(function(a,b) {return b.value - a.value;});   //descending order

	setXY();

}
function display_by_year() {
	force.gravity(layout_gravity)
		.charge(charge)
		.friction(0.9)
		.on("tick", function(e) {
			circles.each(move_towards_year(e.alpha))
				.attr("cx", function(d) {return d.x;})
				.attr("cy", function(d) {return d.y;});
		});
	force.start();
	display_years();
}

function display_years() {
	var years_x = {"2008": 160, "2009": width / 2, "2010": width - 160};
	var years_data = d3.keys(years_x);
	var years = svg.selectAll(".years")
		.data(years_data);

	years.enter().append("text")
		.attr("class", "years")
		.attr("x", function(d) { return years_x[d]; }  )
		.attr("y", 40)
		.attr("text-anchor", "middle")
		.text(function(d) { return d;});

}
function move_towards_year(alpha) {
	return function(d) {
		var target = year_centers[d.year];
		d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
		d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
	};
}

function setXY()
{
	nodeArray.forEach(function(d,i)
	{

		d.x = randomPosition[i].x;
		d.y = randomPosition[i].y;
	});
}
function visualize()
{
	circles = svg.selectAll("circle")
		.data(nodeArray, function(d) { return d.id});


		circles.enter().append("circle")
			.attr("r", 0)
			.attr("id", function(d){ return "circle"+d.id;})
			.attr("stroke", function(d) { return colorAgeScale(d.age); })
			.attr("stroke", function(d) {return d3.rgb(colorAgeScale(d.age)).darker();})
			.attr("fill", function(d) { return colorAgeScale(d.age); })
			.attr("stroke-width", 2)
			.on("mouseover", function(d, i) {show_details(d, i, this);})
			.on("mouseout", function(d, i) {hide_details(d, i, this);} );

	circles.transition().duration(1000).attr("r", function(d) { return d.r; });

}
function charge(d)
{
	return -Math.pow(d.r, 2.0) / 6;
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
		.charge(function(d) {return -Math.pow(d.r, 2.0) / 5;})// charge)   //the distance between us, prevents collision tne NEGAIVE IS IMPORTANT oooooooooo                  	//how nodes push away or attract one another
		.friction(0.9)  //velocity decay 0 = no movement 1= no friction
		.on("tick", function(e)
		{
			circles.each(move_towards_center(e.alpha)) //speed of the node starts fast ends slow
				.attr("cx", function(d){ return d.x;})
				.attr("cy", function(d){ return d.y;})
		});

	force.start();


}
function displayAgain()
{
	force.gravity(layout_gravity)//force that pushes toward the center, 0 = disables - pushes away
		.charge(function(d) {return -Math.pow(d.r, 2.0) / 5;})// charge)   //the distance between us, prevents collision tne NEGAIVE IS IMPORTANT oooooooooo                  	//how nodes push away or attract one another
		.friction(0.9)  //velocity decay 0 = no movement 1= no friction
		.on("tick", function(e)
		{
			circles.each(moveTowards(e.alpha)) //speed of the node starts fast ends slow
				.attr("cx", function(d){ return d.x;})
				.attr("cy", function(d){ return d.y;})
		});

	force.start();


}

function hideLabels()
{
	//$('.textLabel').attr("display", "none");
	$(".textLabel").hide();
	display_by_year();
}
function createLabels()
{
	display_group_all();
	var texts = svg.selectAll("text")
		.data(nodeArray.filter(function(d) { return d.r > 30; }))
		.enter().append("text").attr("dy", ".3em")
		.attr("class", "textLabel")
	/*	.attr("x", function(d){
			var curCircle = "#circle"+ d.id;
			return d3.select(curCircle).node().attributes.cx.value;
		})
		.attr("y", function(d){
			var curCircle = "#circle"+ d.id;
			return d3.select(curCircle).node().attributes.cy.value;
		})
		*/
		.attr("x", function(d){ return d.x;})
		.attr("y", function(d){ return d.y - 10;}) //because of vSeperation that pushes it one line down
		.style("text-anchor", "middle")
		.each(function (d)
		{                    //should be the same as the font size
			var vSeparation = 13;
			var lines = wordWrapText(d);
			for (var i = 0; i < lines.length; i++)
			{
				d3.select(this).append("tspan").attr("dy",vSeparation).attr("x", d.x).text(lines[i]);
			}
		});

	$(".textLabel").show();

//.text(function(d) { return formatLabelText(d);});
}
function wordWrapText(d)
{
	//return  ["Malignant", "80 - 85"];
	//3 lines the first is d.r - 2 and so is the last and the middle is d.r
	var cause = d.cause.substring(0, d.r/3);
	var age = formatAge(d.age);
	var lines = [];
	lines[0] = cause;
	lines[1] = age;
	return lines;

}
function formatLabelText(d)
{
	  var cause = d.cause.substring(0, d.r / 6);
	  var age = formatAge(d.age);
	return cause+":"+age;
}
function formatAge(age)
{
	age = age.replace(" to ", "-")

	if (age == "0-1 year")
		age = age.replace("year", "");
	else if (age == "90 years and over")
		age = ">90";
	else
		age = age.replace("years", "");

	return age;
}
function move_towards_center(alpha) {
	return function(d) {
		d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
		d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
	};
}

function moveTowards(alpha) {
	return function(d) {
		d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha*1.1;
		d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha*1.1;
	};
}

function show_details(data, i, element) {
	d3.select(element).attr("stroke", "black");
	var content = "<span class=\"name\">Cause:</span><span class=\"value\"> " + data.cause + "</span><br/>";
	content +="<span class=\"name\">Age Group:</span><span class=\"value\"> " + data.age + "</span><br/>";
	content +="<span class=\"name\">Number:</span><span class=\"value\">" + addCommas(data.value) + "</span><br/>";
	content +="<span class=\"name\">Sex:</span><span class=\"value\">" + addCommas(data.r) + "</span><br/>";
	content +="<span class=\"name\">ID:</span><span class=\"value\">" + addCommas(data.id) + "</span><br/>";

	tooltip.showTooltip(content, d3.event);
}

function hide_details(data, i, element) {
	d3.select(element).attr("stroke", function(d) { return d3.rgb(colorAgeScale(d.group)).darker();} );
	tooltip.hideTooltip();
}

$(document).ready(function()
{
	$( '#buttonsSex').change(function()
	{
		currSex = parseInt($('input:radio[name=sex]:checked').val());
		console.log("The currSex = "+ currSex);
		update();
	});

	$( '#buttonsUnit').change(function()
	{
		currUnit = parseInt($('input:radio[name=unit]:checked').val());
		console.log("The currUnit = "+ currUnit);
		update();
	});

	$( '#buttonXFilter').change(function()
	{
		mainFilter = parseInt($('input:radio[name=xFilter]:checked').val());
		console.log("The mainFilter = "+ mainFilter);
		update();
	});


	$('#menuYear').change(function()
	{
		currYear=  document.getElementById('menuYear').selectedIndex;
		console.log(currYear);
		update();
	});

	$('#menuAge').change(function()
	{
		currAge=  document.getElementById('menuAge').selectedIndex;
		console.log(currAge);
		update();
	})


});
function update()
{
//	console.log("The currSex = "+ currSex);
	refactorData();
	updateVis();

}

function updateVis()
{
	var y = 10;

	//SELECT ALL
	circles = svg.selectAll("circle")
		.data(nodeArray);

	var x = 10;
	//CREATE NEW ONES
	/*
	circles.enter().append("circle")
		.attr("r", function(d) { return d.r; })
		.attr("id", function(d){ return "circle"+d.id;})
		.attr("stroke", function(d) { return colorAgeScale(d.age); })
		.attr("stroke", function(d) {return d3.rgb(colorAgeScale(d.age)).darker();})
		.attr("fill", function(d) { return colorAgeScale(d.age); })
		.attr("stroke-width", 2)
		.on("mouseover", function(d, i) {show_details(d, i, this);})
		.on("mouseout", function(d, i) {hide_details(d, i, this);} );
     */

	//updatE THE OLD ONES
	circles.transition().duration(250).attr("r", function(d) { return d.r; });


	//DELETE THE ONES WE DON'T NEED
	circles.exit().remove();


	//display_group_all();
	displayAgain();


}
function createYearMenu()
{
	var newSelect=document.getElementById("menuYear");
	//change this to a forEach
	for(var i = 0; i < yearList.length; i++)
	{
		var opt = document.createElement("option");
		opt.value = yearList[i];
		opt.text = opt.value;
		//opt.innerText, label
		newSelect.appendChild(opt);
	}
}
function createAgeMenu()
{
	var newSelect=document.getElementById("menuAge");

	var ageList = colorAgeScale.domain();
	for(var i = 0; i < ageList.length; i++)
	{
		var opt = document.createElement("option");
		opt.value = formatAge(ageList[i]);
		opt.text = opt.value;
		newSelect.appendChild(opt);
	}
}



