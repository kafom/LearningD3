/**
 * Created with JetBrains WebStorm.
 * User: oola
 * Date: 9/4/13
 * Time: 12:35 PM
 * To change this template use File | Settings | File Templates.
 */

var colorAgeScale = d3.scale.category20();
var nodeArrayObject = {	children: new Array() };

d3.csv("data/01020561_EDITr2.csv", function(error, data)

{
	dataset = data.filter(filterCauses);
	refactorData();
	visualize();

});

function refactorData()
{
	dataset.forEach(function(d)
	{
		d.year = +d.year;
		d.value = +d.value;

	});

	colorAgeScale.domain(dataset.map(function(d){ return d.age;}));

	dataset.forEach(function(d)
	{
		var node = {
			className: d.cause,
			packageName: d.age,
			value: d.value

		};
		nodeArrayObject.children.push(node);

	});
}
function visualize()
 {

	 var dataNodes = bubble.nodes(nodeArrayObject).filter(function(d) { return !d.children; });

	 var node = svg.selectAll(".node")
		 	 .data(dataNodes)
			 .enter().append("g")
			 .attr("class", "node")
			 .attr("transform", function(d)
			 {
			 return "translate(" + d.x + "," + d.y + ")";
			 });

	 node.append("title")
	 .text(function(d) { return d.className + ": " + format(d.value); });

	 node.append("circle")
	 .attr("r", function(d) { return d.r; })
	 .style("fill", function(d) { return colorAgeScale(d.packageName); });

	 node.append("text")
	 .attr("dy", ".3em")
	 .style("text-anchor", "middle")
	 .text(function(d) { return d.className.substring(0, d.r / 3); });
 }

function filterCauses(element, index, array)
{
	return element.unit == 'Number' && element.sex == "Both" && element.year == "2000";
}


