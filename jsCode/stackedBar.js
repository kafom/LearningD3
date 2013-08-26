
var currentArray = [];
var rects = Object();
var barCol = Object();
var dataAge = [], dataYear = [];
//READ IN DATA
d3.csv("data/01020561_EDITr2.csv", function(error, data)
{
	cCauseScale.domain(data.map(function (c) { return c.cause;}));

	dataYear= d3.nest()
		.key(function(d) {return d.age;})
		.key(function(d) {return d.sex;})
		.key(function(d) {return d.unit;})
		.entries(data);

	dataAge = d3.nest()
		.key(function(d) {return d.year;})
		.key(function(d) {return d.sex;})
		.key(function(d) {return d.unit;})
		.entries(data);

	updateDataAge();
	initVisualize();

});

function updateDataYear()
{
	dataSubset = dataYear[currAge].values[currSex].values[currUnit].values;
	xScale.domain(dataSubset.map(function (d) { return d.year;}));

	var cur = d3.nest()
		.key(function(d) { return d.year;})
		.key(function(d) { return d.cause;})
		.entries(dataSubset);

	causeDummyScale.domain(dataSubset.map(function (c) { return c.cause;}));
	var causeNames = causeDummyScale.domain();

	xScale.domain().forEach(function (d,i)
	{
		currentArray[i] = { age: currAge, sex: currSex, unit: currUnit, value: d, values: new Array};
		var y0 = 0;
		causeNames.forEach(function (name,j)
		{
			currentArray[i].values[j] =
			{
				name:name,
				value: +cur[i].values[j].values[0].value,
				y0: y0,
				y1: y0+= +cur[i].values[j].values[0].value};
		});
		currentArray[i].total = currentArray[i].values[causeNames.length -1].y1;
	});

	//the Y domain
	//NEED TO ROUND THESE VALUES
	yScale.domain([0, d3.max(currentArray, function (d) { return d.total;})]);
	if(currUnit == PERCENT)
		yScale.domain([0,99.5]); //to make it level it should be 100 but :( )

}

function updateDataAge()
{
	dataSubset = dataAge[currYear].values[currSex].values[currUnit].values;
	xScale.domain(dataSubset.map(function (d) { return d.age;}));
	xScaleTransition.domain(xScale.domain());


	var cur = d3.nest()
		.key(function(d) { return d.age;})
		.key(function(d) { return d.cause;})
		.entries(dataSubset);

	causeDummyScale.domain(dataSubset.map(function (c) { return c.cause;}));
	var causeNames = causeDummyScale.domain();

	xScale.domain().forEach(function (d,i)
	{                         //need to fix this so year is 2000 and not 0, same with unit and sex
		currentArray[i] = { year: currYear, sex: currSex, unit: currUnit, value: d, values: new Array};
		var y0 = 0;
		causeNames.forEach(function (name,j)
		{
			currentArray[i].values[j] =
			{
				name:name,
				value: +cur[i].values[j].values[0].value,
				y0: y0,
				y1: y0+= +cur[i].values[j].values[0].value};
		});
		currentArray[i].total = currentArray[i].values[causeNames.length -1].y1;
	});

	//the Y domain
	//NEED TO ROUND THESE VALUES
	yScale.domain([0, d3.max(currentArray, function (d) { return d.total;})]);
	if(currUnit == PERCENT)
		yScale.domain([0,99.5]); //to make it level it should be 100 but :( )
}

function initVisualize()
{
	barCol = chart.selectAll(".barCol") //what does this do
		.data(currentArray)
		.enter()
		.append("g")
		.attr("class", "bars")
		.attr("transform", function(d) { return "translate(" + xScale(d.value) + ",0)"; });

	rects = barCol.selectAll("rect")
		.data(function(d) { return d.values;})
		.enter()
		.append("rect")
		.attr("class", "bars")
		.attr("y", function(d) { return yScale(d.y1);})
		.attr("height", function(d) { return yScale(d.y0) - yScale(d.y1);})
		.attr("width", xScale.rangeBand())
		.attr("fill", function(d) { return cCauseScale(d.name);})
		.on("mouseover", function (d)
		{
			d3.select(this).attr("opacity", "0.7");
			var xPos =  xScale(d3.select(this).node().parentNode.__data__.value);
			var yPos = parseFloat(d3.select(this).attr("y")) + 10 ;
			var thisCause = d.name;
			var thisValue = d.value;
			var thisHeight =  yScale(d.y0) - yScale(d.y1);

			svgBar.append("text")
				.attr("id", "tooltip")
				.attr("x", xPos ) //this is translated.
				.attr("y", yPos)
				.attr("font-family", "sans-serif")
				.attr("font-size", "8px")
				.attr("font-weight", "bold")
				.attr("fill", "black")
				.text(function(){ return thisCause + ":"+thisHeight+":"+ thisValue});
		})
		.on("mouseout", function ()
		{
			d3.select(this).attr("opacity", "1.0");
			d3.select("#tooltip").remove();
		})
		.on("click", function(d)
		{
			console.log(d.name)
			//so at this point show the visulaization and populate it with the appropriate data.
			//so you want to show the male and the female and then put it in a div,
		});
	createAxis();
}
function updateVisualize()
{
	barCol = chart.selectAll("g")
		.data(currentArray);

	barCol.enter()
		.append("g")
		.attr("class", "bars")
		.attr("transform", function(d) { return "translate(" + xScale(d.value) + ",0)"; });

	barCol.attr("transform", function(d) { return "translate(" + xScale(d.value) + ",0)"; });
	barCol.exit().remove();

	rects = barCol.selectAll("rect")
		.data(function(d) { return d.values;})

	//ADD NEW ELEMENT  //maybe it's color
	rects.enter()
		.append("rect")
		.attr("class", "bars")
		.attr("y", function(d) { return yScale(d.y1);})
		.attr("height", function(d) { return yScale(d.y0) - yScale(d.y1);})
		.attr("width", xScale.rangeBand())
		//    .attr("fill", function(d) { return cCauseScale(d.name);})
		.attr("fill", "white")  //so it isn't that greena t the beginning
		.on("mouseover", function (d)
		{
			d3.select(this).attr("opacity", "0.7");
			var xPos = xScale(d3.select(this).node().parentNode.__data__.age);
			var yPos = parseFloat(d3.select(this).attr("y")) + 10 ;

			var thisCause = d.name;
			var thisValue = d.value;
			var thisHeight =  yScale(d.y0) - yScale(d.y1);

			svgBar.append("text")
				.attr("id", "tooltip")
				.attr("x", xPos ) //this is translated.
				.attr("y", yPos)
				.attr("font-family", "sans-serif")
				.attr("font-size", "8px")
				.attr("font-weight", "bold")
				.attr("fill", "black")
				.text(function(){ return thisCause + ":"+thisHeight+":"+ thisValue});
		})
		.on("mouseout", function ()
		{
			d3.select(this).attr("opacity", "1.0");
			d3.select("#tooltip").remove();
		});

	//UPDATE ALL THE OTHERS
	rects.attr("fill", function(d) { return cCauseScale(d.name);})
		.transition()
		.delay(function(d)
		{
			return cCauseScale(d.name);
			return xScaleTransition(d3.select(this).node().parentNode.__data__.age);
		})
		.duration(1000)
		.attr("width", xScale.rangeBand())
		.attr("height", function(d) { return yScale(d.y0) - yScale(d.y1);})
		.attr("y", function(d) { return yScale(d.y1);});

	//DELETE THE ONES THAT WE DON'T NEED
	rects.exit().remove();

	updateAxis();
}
function createAxis()
{
	yAxisGroup.call(yAxis);

	xAxisGroup.call(xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.attr("transform", function(d) {return "rotate(-65)"});

	createLegend();
}
function updateAxis()
{
	yAxisGroup.transition().duration(1500).call(yAxis);
	xAxisGroup.transition().duration(1500).call(xAxis)
		.selectAll("text")
		.style("text-anchor", "end")
		//       .attr("dx", "-.8em")
		//     .attr("dy", ".15em")
		.attr("transform", function(d) {return "rotate(-65)"});
}
/*function createLegend()
{
	var rectHeight = 10, rectWidth = 10;
	var legend = legendGroup.selectAll(".legend")
		.data(cCauseScale.domain().slice().reverse())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * rectHeight + ")"; });

	legend.append("rect")
		.attr("width", rectWidth)
		.attr("height", rectHeight)
		.style("fill", cCauseScale);

	legend.append("text")
		.attr("x", rectWidth)
		.attr("y", rectHeight/2)
		.attr("dy", ".35em")
		.style("text-anchor", "left")
		.text(function(d) { return d; });

} */
function update()
{
	currentArray.length = 0;
	if (mainFilter == AGE)
	{
		$('select#menuYear').show();
		$('select#menuAge').hide();
		updateDataAge();
	}
	else if(mainFilter == YEAR)
	{
		$('select#menuAge').show();
		$('select#menuYear').hide();
		updateDataYear();
	}

	updateVisualize();
}
function setSexB()
{
	currSex = BOTH;
	update();
}
function setSexM()
{
	currSex = MALE;
	update();
}
function setSexF()
{
	currSex = FEMALE;
	update();
}
function setUnitNum()
{
	currUnit = NUMBER;
	update();
}
function setUnitRate()
{
	currUnit = MORTALITY;
	update();
}
function setUnitPercent()
{
	currUnit = PERCENT;
	update();
}
function setYear(dropDown)
{
	var myIndex = dropDown.selectedIndex;
	currYear = myIndex;
	update();
}
function setAge(dropDown)
{
	var myIndex = dropDown.selectedIndex;
	currAge = myIndex;
	update();
}
function setXFilterAge()
{
	mainFilter = AGE;
	update();
}
function setXFilterYear()
{
	mainFilter = YEAR;
	update();
}
