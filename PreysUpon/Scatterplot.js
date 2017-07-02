function makeScatterplot(svg) {

	var margin = { top: 20, right: 20, bottom: 20, left: 20 },
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", translate(margin.left, margin.top)),
		rarities = ["Common", "Uncommon", "Rare", "Mythic Rare", "Special"];


	function translate (x,y) {
		return "translate("+x+","+y+")";
	}

	var update = function data(newData) {

		//setup x
		var xValue = function(d) { 
				if (isNaN(d.power)) {
					return 0;
				} else {
					return d.power;
				}
			},
			//xScale = d3.scaleLinear().range([0,width]),
			xScale = d3.scaleLinear().domain([d3.min(newData, xValue), d3.max(newData, xValue)]).range([0,width]),
			xMap = function (d) { return xScale(xValue(d)); },
			xAxis = d3.axisBottom(xScale);

		var yValue = function(d) { 
				if (isNaN(d.toughness)) {
					return 0;
				} else {
					return d.toughness;
				}
			},
			//yScale = d3.scaleLinear().range([0, height]),
			yScale = d3.scaleLinear().domain([d3.min(newData, yValue), d3.max(newData, yValue)]).range([height, 0]),
			yMap = function(d) { return yScale(yValue(d)); },
			yAxis = d3.axisLeft(yScale);

		var cValue = function(d) { return d.rarity; },
			colorsRarity = d3.scaleOrdinal()
				.range(["#GGGGGG", "#7a7a7a", "#efc323", "#d33d02", "#6e04cc"])
				.domain(rarities);

		var t = d3.transition()
			.duration(750);

		var max = d3.max(newData, xValue);
		console.log(max);
		xScale.domain([d3.min(newData, xValue)-1, max]);
		yScale.domain([d3.min(newData, yValue)-1, max]);

		d3.selectAll("#scatterplot_axesParent").remove();
		var scatterplot_axesParent = g.append("g").attr("id", "scatterplot_axesParent");
		 // x-axis
		 var xAxisGroup = scatterplot_axesParent.append("g")
		      .attr("class", "x axis")
		      .attr("transform", translate(0,height))
		      .call(xAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("x", width)
		      .attr("y", -6)
		      .style("text-anchor", "end")
		      .text("Dias");

			// y-axis
			var yAxisGroup = scatterplot_axesParent.append("g")
			      .attr("class", "y axis")
			      .call(yAxis)
			      .append("text")
			      .attr("class", "label")
			      .attr("transform", "rotate(-90)")
			      .attr("y", 6)
			      .attr("dy", ".71em")
			      .style("text-anchor", "end")
			      .text("Preço");

		// draw dots
		scatterplot_axesParent.selectAll(".dot").data(newData)
			.enter().append("circle")
		  	.attr("class", "dot")
		  	.attr("r", 4)
		  	.attr("cx", xMap)
		  	.attr("cy", yMap)
		  	.style("fill", function(d) { return colorsRarity(cValue(d));});
	}

	return {
		update:update
	};
}