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
			var barName = "#bar"+(50-i);
			var rects = d3.selectAll(barName);

			if(d3.select(labelName).attr("class")=="selected")
			{
				d3.select(labelName).style("stroke", "none").attr('class',"");
				rects.style("stroke", "none");
			}
			else
			{
				d3.select(labelName).style("stroke", "black").style("stroke-width",3).attr("class", "selected");
				rects.style("stroke", "black").style("stroke-width", 3);
			}

			selectCause(d);
		})
		.on("mouseover", function(d,i)
		{
			d3.select("#causeLabel"+i).style("fill", cCauseScale);
			var barName = "#bar"+(50-i);
			d3.selectAll(barName).attr("opacity",1.0);
		})
		.on("mouseout", function(d,i)
		{
			d3.select("#causeLabel"+i).style('fill','none');
			var barName = "#bar"+(50-i);
			d3.selectAll(barName).attr("opacity",0.7);
		});


	legend.append("rect")
		.attr("id", function(d,i){ return "causeLabel"+ i;})
		.attr("x", rectWidth/2)
		.attr("width", function(d){ return rectWidth+2+ 3.5*d.length;})
		.attr("height", rectHeight)
		.attr("rx", 3)
		.attr("ry", 3)
		.style("fill", "none");


	legend.append("rect")
		.attr("width", rectWidth)
		.attr("height", rectHeight)
		.style("fill", cCauseScale);

	legend.append("text")
		.attr("x", rectWidth+1)
		.attr("y", rectHeight/2)
		.attr("dy", ".35em")
		.style("text-anchor", "left")
		.text(function(d) { return d; });

}
