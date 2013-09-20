/**
 * Created with JetBrains WebStorm.
 * User: oola
 * Date: 9/13/13
 * Time: 2:20 PM
 * To change this template use File | Settings | File Templates.
 */

d3.csv("data/01020561_EDITr2.csv", function(error, data)
{
	//we need to find a way to map the data or create keys
	data.forEach(function(d)
	{
		d.value = +d.value;
		d.year = +d.year;
	})

	dataset = data;
	visualizeHeatMap();
	visualizeBar();

	$('#popBar').hide();  //so that it will be ondemand when we want it to show up.
})

function visualizeHeatMap()
{
	filteredDatasetHM = dataset.filter(filterBothSexes);
	yScale.domain(filteredDatasetHM.map(function(d){ return d.age;}));
	xScale.domain(filteredDatasetHM.map(function(d){ return d.cause;}));
	var xWidth = (yScale.rangeBand() * (xScale.domain().length+0)) + (space*Math.pow((xScale.domain().length+3),2));
	xScale.rangeRoundBands([0,xWidth],space);
	colorScale.domain([0, buckets - 1, d3.max(filteredDatasetHM, function (d) { return d.value; })])

	heatMap.selectAll("rect")
		.data(filteredDatasetHM)
		.enter()
		.append("rect")
		.attr("rx", 4)
		.attr("ry", 4)
		.attr("x", function(d)
		{
			return xScale(d.cause);
		})
		.attr("y", function(d)
		{
			return yScale(d.age);
		})
		.attr("width", xScale.rangeBand())
		.attr("height",yScale.rangeBand())
		.attr("fill", function (d)
		{
			return colorScale(d.value);
		})
		.on("mouseover", function ()
		{
			d3.select(this).attr("opacity", "0.7");
			var xPos = parseFloat(d3.select(this).attr("x"));
			var yPos = parseFloat(d3.select(this).attr("y")) ;

			var thisAge = d3.select(this).node().__data__.age;
			var thisValue = formatPopulationValue(d3.select(this).node().__data__.value);
			var thisCause =d3.select(this).node().__data__.cause;

			d3.select("#toolTip")
				.text(function(){ return thisCause;})

			d3.select("#toolTipRect")
				.attr("width", function() { return 3+ thisCause.length*4;})

			d3.selectAll(".toolTipGroup")
				.attr("transform", "translate(" + xPos + ", "+ (yPos-10) + ")")
				.style("display", "inline-block");
		})
		.on("mouseout", function ()
		{
			d3.select(this).attr("opacity", "1.0");
			d3.selectAll(".toolTipGroup").style("display", "none");
		})
		.on("click", function ()
		{
			var thisAge = d3.select(this).node().__data__.age;
			var thisPop = formatPopulationValue(d3.select(this).node().__data__.value);
			var thisYear =d3.select(this).node().__data__.year;

			selected.province = thisAge;
			selected.year = thisYear;

			currentCause = d3.select(this).node().__data__.cause;
			currentAge = d3.select(this).node().__data__.age;
			updateBar();

			var xPos = parseFloat(d3.select(this).attr("x"));
			var yPos = parseFloat(d3.select(this).attr("y"));

			d3.selectAll('#popBar')
				.style("position", "absolute")
				.style("left", function() { return xPos+"px";})
				.style("top", function() { return yPos+"px";});

			$('#popBar').fadeIn();
			//.style("display", "inline-block");

			//this does the same thing but with css.
			//$('#popBar').css({position: "absolute",left:xPos,top:yPos})
			//          .show();

		});

	createToolTip();
	createLabels();
	createLegend();
}
function createToolTip()
{
	var toolGroup = heatMap.append("g")
		.attr("class", "toolTipGroup")
		.style("position","absolute");

	toolGroup.append("rect")
		.attr("id", "toolTipRect")
		.attr("rx", 4)
		.attr("ry", 4)
		.attr("width", 150)
		.attr("height",10)
		.attr("fill", "grey");

	toolGroup.append("text")
		.attr("y", 8)
		.attr("id", "toolTip")
		.attr("fill", "black")
		.attr('width', 150)
		.attr('height', 100);

}
function updateHeatMap()
{
	filteredDatasetHM = dataset.filter(filterBothSexes);
	colorScale.domain([0, buckets - 1, d3.max(filteredDatasetHM, function (d) { return d.value; })])

	heatMap.selectAll("rect")
		.data(filteredDatasetHM)
		.transition()
		.delay(function (d,i) { return i*1.1;})
		.attr("fill", function (d)
		{
			return colorScale(d.value);
		});
}
function visualizeBar()
{
	filteredDatasetBAR = dataset.filter(filterCauseAndAgeGroup);

	xScaleBar.domain(filteredDatasetBAR.map(function (d) {return d.year;}));
	xScaleBarInner.domain(filteredDatasetBAR.map(function (d) {return d.sex;}))
		.rangeRoundBands([0, xScaleBar.rangeBand()], spaceBarInner);

	yScaleBar.domain(d3.extent(filteredDatasetBAR, function(d) {return d.value;}));
	colorScaleBar.domain(filteredDatasetBAR.map(function(d){ return d.sex;}));

	svgPop.on("click", function()
	{
		$('#popBar').fadeOut();
	});

	barChart.selectAll("rect")
		.data(filteredDatasetBAR)
		.enter()
		.append("rect")
		.attr("x", function(d)
		{
			return xScaleBar(d.year) + xScaleBarInner(d.sex);
		})
		.attr("y", function(d) { return heightBar - yScaleBar(d.value); })
		.attr("width", xScaleBarInner.rangeBand())
		.attr("height", function(d) { return yScaleBar(d.value); })
		.attr("fill", function (d)
		{
			return colorScaleBar(d.sex);
		})
		.on("mouseover", function ()
		{
			/*  d3.select(this).attr("opacity", "0.7");
			 var xPos = parseFloat(d3.select(this).attr("x")) - 20;
			 var yPos = parseFloat(d3.select(this).attr("y")) ;

			 var thisAge = d3.select(this).node().__data__.age;
			 var thisPop = formatPopulationValue(d3.select(this).node().__data__.value);
			 var thisCause =d3.select(this).node().__data__.cause;

			 svg.append("text")
			 .attr("transform", "translate(" + (width+ legendLeft) + ", "+ (height+20+legendTop) + ")")
			 .attr("id", "tooltip")
			 .attr("x", xPos)
			 .attr("y", yPos)
			 .attr("fill", "black")
			 .text(function(){ return thisAge + ":" + thisPop + "-"+ thisCause});*/
		})
		.on("mouseout", function ()
		{
			d3.select(this).attr("opacity", "1.0");
			// d3.select("#tooltip").remove();
		})
		.on("click", function ()
		{
			$("#popBar").fadeOut();
		});

	createLegendBar();
	createXAxisBar();
}
function updateBar()
{
	filteredDatasetBAR = dataset.filter(filterCauseAndAgeGroup);
	yScaleBar.domain(d3.extent(filteredDatasetBAR, function(d) {return d.value;}));

	//UPDATE BAR
	barChart.selectAll("rect")
		.data(filteredDatasetBAR)
		.attr("opacity", "1.0")
		.transition()
		.duration(1000)
		.attr("y", function(d) { return heightBar - yScaleBar(d.value); })
		.attr("height", function(d) { return yScaleBar(d.value); });
}
function createLabels()
{
	labelHM.append("g")
		.attr("transform", "translate(" +(legendLeft + 10) +"," + (legendTop+13) + ")")
		.selectAll(".ageLabel")
		.attr("class", "legend_age")
		.data(yScale.domain().slice().reverse())
		.enter().append("text")
		.text(function (d) { return formatAge(d); })
		.attr("x", 0)
		.attr("y", function (d) { return yScale(d); })
		.style("text-anchor", "end");

	labelHM.append("g")
		.attr("transform", "translate(" +(legendLeft+22) +"," + (legendTop -2) + ")")
		.selectAll(".causeLabel")
		.attr("class", "legend_cause")
		.data(xScale.domain().slice().reverse())
		.enter().append("text")
		.text(function (d) { return d.substr(0,3); })
		.attr("y", 0)
		.attr("x", function (d) { return xScale(d); })
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em");

}
function stripDate(date)
{
	return date.toString().substr(2,2);
}
function createXAxisBar()
{
	labelB.append("g")
		.attr("transform", "translate(" + (10) + ", "+ (5+heightBar) + ")")
		.selectAll(".yearLabelsBar")
		.attr("class", "labelBar")
		.data(xScaleBar.domain().slice())
		.enter().append("text")
		.text(function (d) { return stripDate(d); })
		.style("text-anchor", "end")
		.attr("y", 0)
		.attr("x", function (d) { return xScaleBar(d); });
}
function createLegendBar()
{
	var legendBar = legendB.selectAll(".legendBar")
		.data(colorScaleBar.domain().slice())
		.enter().append("g")
		.attr("class", "legendBar")
		.attr("transform", "translate(" +(widthBar -5 ) +" ,"+ (legendBarSpace)+")");
	var tokenSize = 5;

	legendBar.append("rect")
		.attr("x", tokenSize)
		.attr("y", function (d,i) { return (i) + tokenSize * (i+1);})
		.attr("width", tokenSize)
		.attr("height", tokenSize)
		.attr("fill", colorScaleBar);

	legendBar.append("text")
		.attr("x", tokenSize*2)
		.attr("y", function (d,i) { return tokenSize/2+ tokenSize * (i+1);})
		.attr("dy", ".35em")
		.style("text-anchor", "left")
		.text(function(d) { if(d == "Males") return 'M'; else return 'F'; });
}
function createLegend()
{
	console.log([0].concat(colorScale.quantiles()))

	var legend = legendHM.selectAll(".legend")
		.data([0].concat(colorScale.quantiles()))
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" +(2*legendLeft) +" ,"+ (legendBottom/2)+")")

	legend.append("rect")
		.attr("x", function (d, i) { return 1.5*xScale.rangeBand()*i; })
		.attr("y", height)
		.attr("width", xScale.rangeBand()*1.5)
		.attr("height", yScale.rangeBand()/2)
		.attr("fill", function (d) { return colorScale(d); });

	legend.append("text")
		.attr("class", "mono")
		.attr("x", function (d, i) { return (5+ (1.5*xScale.rangeBand()*i)); })
		.attr("y", height +legendBottom/2)
		.text(function(d) { return "≥ " + formatPopulationValue(d); });
}
function updateLegendHeatMap()
{
	legendHM.selectAll("text")
		.data([0].concat(colorScale.quantiles()))
		.text(function(d) { return "≥ " + formatPopulationValue(d); });

}
function formatPopulationValue(d){
	d = Math.round(d);
	var formatted = d3.format(".2s");
	if(d < 1000000)
		return d;
	else
	{
		return formatted(d);
	}}
function filterCauseAndAgeGroup(element, index, array)
{
	return element.sex != "Both" && element.unit == currentUnit && element.cause == currentCause  && element.age == currentAge;
}
function filterBothSexes(element, index, array)
{
	return element.sex == "Both" && element.unit == currentUnit && element.year == currentYear;
}

function setSexIndex(sex)
{
	if (sex == "Males")
		return 1;
	else if(sex == "Females")
		return 2;
	else
		return 0;
}
function setProvinceIndex(province)
{
	var listProvinceAbbr = ["AB","BC","MB","NB","NL","NT","NS","NU", "ON", "PE","QC","SK", "YK"];
	return listProvinceAbbr.indexOf(province);
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
function setYear(dropDown)
{
	var myIndex = dropDown.selectedIndex;
	currentYear = 2000 + myIndex;
	update();
}
function update()
{
	updateHeatMap();
	updateBar();
	updateLegendHeatMap();
}
function setUnitNum()
{
	currentUnit = "Number";
	update();
}
function setUnitRate()
{
	currentUnit = "Mortality Rate";
	update();
}
function setUnitPercent()
{
	currentUnit = "Percentage";
	update();
}