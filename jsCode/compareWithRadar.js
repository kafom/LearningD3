/**
 * Created with JetBrains WebStorm.
 * User: oola
 * Date: 8/16/13
 * Time: 1:23 PM
 * To change this template use File | Settings | File Templates.
 */

var dataset = [];
var toWorkWithDataset = [];
var currentDataset = [];
var currentListOfCauses = [];//["Accidents (unintentional injuries)","Malignant neoplasms","Cerebrovascular diseases","Other causes of death", "Diseases of heart","Alzheimer's disease"];
//CONSTANTS
var  provinceAbbrList = ["CA", "AB","BC","MB","NB","NL","NT","NS","NU", "ON", "PE","QC","SK", "YK"];
//another way to get this is to make it a domain of something and then extract all of them from it.
var province = ["Canada", "Alberta", "British Columbia", "Manitoba", "New Brunswick","Newfoundland and Labrador", "Northwest Territories", "Nova Scotia","Nunavut","Ontario", "Prince Edward Island","Quebec","Saskatchewan", "Yukon"];

var provinceList = provinceAbbrList;

var BOTH = 0, MALE = 1, FEMALE = 2;
var NUMBER = 1, PERCENT = 2, MORTALITY = 3, RANK = 0;	//TO DO MAKE THIS BASED ON THE FILE AND NOT HARD CODED CUZ THE FILE CHANGES.
var currYear =0;

var causeList = [];
var axes;
var first = true;
var yearList = [];
d3.csv("data/01020563_EDIT.csv", function(error, data)
{
	data.forEach(function(d)
	{
		d.year = +d.year;
		d.value = +d.value;
	});

	dataset = d3.nest()
		.key(function(d) { return d.unit;})
		.key(function(d) { return d.sex;})
		.entries(data);

	var causeDummyScale = d3.scale.ordinal()
		.domain(data.map(function (c) { return c.cause;}));
	causeList = causeDummyScale.domain();

	var yearDummyScale = d3.scale.ordinal().domain(data.map(function(d) { return d.year;}));

	yearList = yearDummyScale.domain();
	console.log(yearList);
	colorGeoScale.domain(data.map(function(d){ return d.geo;}));

	//this one line also needs to be a function of its own.
	toWorkWithDataset =  dataset[PERCENT].values[BOTH].values;


	//create a list of all the causes
	createCauseButtons();
	createGeoButtons();
});

function getCurrentDataset()
{
	//AT ANY POINT IN TIME THE USER SHOULD BE ABLE TO SELECT AND DESELECT SOMETHING. SO WE WILL HAVE TO COME BACK TO THIS POINT TIME AND TIME AGAIN
	// so hereit cannot be currentDataset.filter(filterCauses) because currentDataset isn't what we think it is.
	//var currentDataset = (toWorkWithDataset.filter(filterCauses)).slice(0);

	currentDataset = jQuery.extend(true, [], toWorkWithDataset.filter(filterCauses));

	currentDataset.forEach(function(d){
		d.cause = currentListOfCauses.indexOf(d.cause);
	});

	currentDataset = currentDataset.sort(compared);
	//SET THE SCALES DOMAIN

	angle.domain([0, d3.max(currentDataset, function(d) { return d.cause+1; })]);
	radius.domain([0, d3.max(currentDataset, function(d) { return d.value; })]);

	currentDataset = d3.nest()
		.key(function(d){ return d.year;}).sortKeys(d3.ascending)
		.key(function(d){ return d.geo;})
		.entries(currentDataset);

	console.log(currentDataset);

}
function formatGEO(currentGeo)
{
	switch(currentGeo){
		case province[0]:return provinceAbbrList[0]; break;
		case province[1]:return provinceAbbrList[1]; break;
		case province[2]:return provinceAbbrList[2]; break;
		case province[3]:return provinceAbbrList[3]; break;
		case province[4]:return provinceAbbrList[4]; break;
		case province[5]:return provinceAbbrList[5]; break;
		case province[6]:return provinceAbbrList[6]; break;
		case province[7]:return provinceAbbrList[7]; break;
		case province[8]:return provinceAbbrList[8]; break;
		case province[9]:return provinceAbbrList[9]; break;
		case province[10]:return provinceAbbrList[10]; break;
		case province[11]:return provinceAbbrList[11]; break;
		case province[12]:return provinceAbbrList[12]; break;
		case province[13]:return provinceAbbrList[13]; break;

	}

}
d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

function visualize()
{
	svg.selectAll(".layer")
		.data(currentDataset[currYear].values)
		.enter().append("path")
		.attr("class", "layer")
		.attr("d", function(d) { return area(d.values); })
		.style("fill", function(d, i) { return colorGeoScale(d.key); })
		.attr("opacity", 0.3)
		.attr("id", function(d) {return "path"+formatGEO(d.key);})
		.on("click", function(){
			console.log('I have been clicked'+ d3.select(this).node().__data__.key);
		})
		.on("mouseover", function()
		{
			d3.select(this).attr("opacity", 0.70).attr("stroke", "black").attr("stroke-width", 5);
			var sel = d3.select(this);
			sel.moveToFront();
		})
		.on("mouseout", function(){
			d3.select(this).attr("opacity", 0.3).attr("stroke-width",1);
		})
		.on("dblclick", function(){
			console.log("I have been double clicked oooooooooooooooooooo");
			d3.select(this).attr("display", "none");
		});
	     createAxisRadar();
}
function createAxisRadar()
{
	axes = svg.selectAll(".axisRadar")
		.data(d3.range(angle.domain()[1]))
		.enter().append("g")
		.attr("class", "axisRadar")
		.attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
		.call(d3.svg.axis()
			.scale(radius.copy().range([-innerRadius, -outerRadius]))
			.orient("left"))
		.append("text")
		.attr("y", -innerRadius - (outerRadius))
		.attr("dy", ".71em")
		.attr("text-anchor", "middle")
		.text(function(d) { return formatCauseName(d); });
}

function updateViz()
{
	//first bind data
	var newRadar = svg.selectAll(".layer")
					  .data(currentDataset[currYear].values);
	//UPDATE AND REDRAW THE PATHS
	newRadar.transition().attr("d", function(d) { return area(d.values); })
		.style("fill", function(d, i) { return colorGeoScale(d.key); })
		.attr("opacity", 0.3);

	//DELETE THE OLD AXES
	$('.axisRadar').remove();
	//CREATE NEW AXIS
	createAxisRadar();
}

function filterCauses(element, index, array)
{
	//return element.sex != "Both" && element.unit == currentUnit && element.cause == currentCause  && element.age == currentAge;
	//return element.cause == currentListOfCauses;
	return (currentListOfCauses.indexOf(element.cause) !== -1);
}

function formatCauseName(currCause)
{
	return currentListOfCauses[currCause];
}

function compared(a,b)
{
	return a.cause - b.cause;
}

//do you need this or do you just need to turn off the guy for it
//does there need to be an array. I believe for the causes yes, but for this not really
$(document).ready(function()
{
	$('#geoSelectorPanel').click(function(event)
	{
		var target = event.target;
		var nameOfPro = (target.id).substr(3,target.id.length);
		var loc= provinceList.indexOf(nameOfPro);
		var locPath = "path"+nameOfPro;
		if(loc !== -1)
		{	//remove it
			provinceList.splice(loc,1);
			d3.select(document.getElementById(locPath)).attr("display", "none");
		}
		else
		{	//add it
			provinceList.push(nameOfPro);
			d3.select(document.getElementById(locPath)).attr("display", "inline");
		}

	});

	$('#causeSelectorPanel').click(function(event)
	{
		var target = event.target;
		var loc = currentListOfCauses.indexOf(target.value);
		if(loc !== -1)
		{
			currentListOfCauses.splice(loc,1);
		}
		else
		{
			if(currentListOfCauses.length < 10)
				currentListOfCauses.push(target.value);
			else
				console.log("IT IS TOO MANY VARIABLES DONT DO ANYTHING");
		}

		console.log(currentListOfCauses);
	});
	$('#btnGO').click(function(){

		getCurrentDataset();
		if(first)
		{
			visualize();
			first = false;
		}
		else
		{
			updateViz();
		}

	});
	$( "#yearSlider" ).slider(
		{
			range: false, /*we just one value not a range */
			from: 2000,
			to: 2009,
			min: 2000,
			round: 1,
			max: 2009, //this should take in values from the other place not here.
			step: 1,
			animate: "slow",
			format: { format: '##.0', locale: 'de' },
			dimension: '&nbsp;€',
			//slide,
			change: function(e,ui)
			{
				//this works now because we have sorted the dataset.
				currYear = $(this).slider("value") - 2000;
				console.log(currYear);
				updateViz();
			}
		});
});

function createGeoButtons()
{
	for(var i = 0; i < provinceAbbrList.length; i++)
	{
		var btn = document.createElement("input");
		btn.setAttribute("type", "button");
		btn.id = "btn"+provinceAbbrList[i];
		btn.value = province[i];       //this shouldn't be province it should read it in from the data.csv input file.
		document.getElementById('geoSelectorPanel').appendChild(btn);
	}
}
function createCauseButtons()
{
	for(var i = 0; i < causeList.length; i++)
	{
		var btn = document.createElement("input");
		btn.setAttribute("type", "button");
		btn.id = "btn"+causeList[i];
		btn.value = causeList[i];       //this shouldn't be province it should read it in from the data.csv input file.
		document.getElementById('causeSelectorPanel').appendChild(btn);
	}
}


