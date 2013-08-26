/**
 * Created with JetBrains WebStorm.
 * User: OlaMudzengi
 * Date: 23/08/13
 * Time: 4:31 PM
 * To change this template use File | Settings | File Templates.
 */

function createLegend()
{
	var rectHeight = 10, rectWidth = 80;
	var legend = legendGroup.selectAll(".legend")
		.data(cCauseScale.domain().slice().reverse())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * rectHeight + ")"; })
		.on("click", function(d){
			console.log(d);
});

	//the width should be the length of the text plus about 10
	legend.append("rect")
	//	.attr("width", rectWidth)
		.attr("width", function(d){ return 8+ 3.7*d.length;})
		.attr("height", rectHeight)
		.attr("rx", 3) //rounded corners
		.attr("ry", 3) //rounded corners
		//.style("box-shadow", )
		.style("border", "2px dotted #00f")
		.style("fill", cCauseScale);

	legend.append("text")
		.attr("x", 5)
		.attr("y", rectHeight/2)
		.attr("dy", ".35em")
		.style("text-anchor", "left")
		.text(function(d) { return d; });

}
