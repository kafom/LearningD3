/**
 * Created with JetBrains WebStorm.
 * User: OlaMudzengi
 * Date: 23/08/13
 * Time: 4:31 PM
 * To change this template use File | Settings | File Templates.
 */

function createLegend()
{
	var rectHeight = 10, rectWidth = 5;
	var legend = legendGroup.selectAll(".legend")
		.data(cCauseScale.domain().slice().reverse())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * rectHeight + ")"; })
		.on("click", function(d,i)
		{
			var labelName = "#causeLabel"+i;

			if(d3.select(labelName).attr("class")=="selected")
				d3.select(labelName).style('fill','white').attr('class', "");
			else
				d3.select(labelName).style('fill',cCauseScale).attr("class", "selected");
			selectCause(d);
		})
		.on("mouseover", function(d,i)
		{
			var labelName = "#causeLabel"+i;
			$(labelName).toggleClass("highlight");

			var barName = "#bar"+(50-i);
			var rects = d3.selectAll(barName);
			rects.attr("opacity", 1.0);
			console.log(rects);
		})
		.on("mouseout", function(d,i)
		{
			var labelName = "#causeLabel"+i;
			$(labelName).toggleClass("highlight");
			var barName = "#bar"+(50-i);
			var rects = d3.selectAll(barName);
			rects.attr("opacity", 0.7);
		});


	legend.append("rect")
		.attr("id", function(d,i){ return "causeLabel"+ i;})
		.attr("x", rectWidth/2)
		.attr("width", function(d){ return rectWidth+1+ 3.5*d.length;})
		.attr("height", rectHeight)
		.attr("rx", 3)
		.attr("ry", 3)
		.style("fill", "white");


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

}
