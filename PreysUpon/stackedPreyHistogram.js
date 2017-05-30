function makeHisto(svg){

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = +svg.attr("width") - margin.left - margin.right,
	    height = +svg.attr("height") - margin.top - margin.bottom,
	    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
	    colorGroups = ["Blue", "White", "Green",
			"Black", "Red", "Multicolored", "Colorless"],
		predationGroups = ["Prey", "BounceOff", "Trade", "Predator"];


    var x = d3.scaleBand()
    	.rangeRound([0, width])
    	.paddingInner(0.05)
    	.align(0.1)
    	.domain(colorGroups);
	var y = d3.scaleLinear()
		.rangeRound([height, 0]);

	var z = d3.scaleOrdinal()
		.range(["#42f47d", "#ddff47", "#d4ffaa", "#ff7723"])
    	.domain(predationGroups);

	// var x = d3.
	
	function translate(x, y)
	{
	  return "translate("+x+","+y+")";
	}
	var update = function data(data)
	{

		var t = d3.transition()
	      .duration(750);

		y.domain([0, d3.max(data, function(d){return d.cardCount;})]).nice();
		var dataStacks = d3.stack()
		.keys(predationGroups)
		.value(function(d, key)
			{
				return d[key].cardCount;
			})(data);


		d3.selectAll("#legendParent").remove();
		d3.selectAll("#axesParent").remove();

		var elements =  g.selectAll(".bar").data(dataStacks);
		elements.exit().remove();
		var newElements = elements.enter().append("g")
			.attr("class", "bar");
		elements = newElements.merge(elements)
	      	.attr("fill", function(d){return z(d.key);})


	  	var subElements = elements.selectAll("rect")
	  		.data(function(d){return d;});
			subElements.exit().remove();
		var subNewElements = subElements.enter().append("rect")
			.attr("y", height)
			.attr("height", 0);
		subNewElements.merge(subElements)
			.attr("x", function(d){return x(d.data.key);})
			.attr("width", x.bandwidth())
			.transition(t)
			.attr("y", function(d){return y(d[1]);})
			.attr("height", function(d){return y(d[0]) - y(d[1]);});

		var axesParent = g.append("g").attr("id", "axesParent");
	    axesParent.append("g")
	      .attr("class", "axis")
	      .attr("transform", translate(0, height))
	      .call(d3.axisBottom(x));
	    axesParent.append("g")
	        .attr("class", "axis")
	        .call(d3.axisLeft(y).ticks(null, "s"))
	      .append("text")
	        .attr("x", 2)
	        .attr("y", y(y.ticks().pop()) + 0.5)
	        .attr("dy", "0.32em")
	        .attr("fill", "#000")
	        .attr("font-weight", "bold")
	        .attr("text-anchor", "start")
	        .text("Card Count");

		var legendParent = g.append("g").attr("id", "axesParent");
	    var legend = legendParent.append("g")
	      	.attr("font-family", "sans-serif")
	        .attr("font-size", 10)
	        .attr("text-anchor", "end")
	      .selectAll("g")
	      .data(predationGroups)
	      .enter().append("g")
	        .attr("transform", function(d, i){return translate(0, i*20)});

	      legend.append("rect")
	        .attr("x", width - 19)
	        .attr("width", 19)
	        .attr("height", 19)
	        .attr("fill", z);

	      legend.append("text")
	        .attr("x", width - 24)
	        .attr("y", 9.5)
	        .attr("dy", "0.32em")
	        .text(function(d){return d;});
	};
	return {
		update:update
	};
}