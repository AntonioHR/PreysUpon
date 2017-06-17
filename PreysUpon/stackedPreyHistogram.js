var MakeHistogram = function (svg)
{
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
		colorGroups = ["Blue", "White", "Green", "Black", "Red", "Multicolored", "Colorless"];

	this.width = +svg.attr("width") - margin.left - margin.right;
	this.height = +svg.attr("height") - margin.top - margin.bottom;
	this.g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	this.predationGroups = ["Prey", "Trade", "BounceOff", "Predator"];
	this.rarities = ["Common", "Uncommon", "Rare", "Mythic Rare", "Special"];

    this.x = d3.scaleBand()
    	.rangeRound([0, this.width])
    	.paddingInner(0.05)
    	.align(0.1)
    	.domain(colorGroups);
	this.y = d3.scaleLinear()
		.rangeRound([this.height, 0]);

	this.z = d3.scaleOrdinal()
		.range(["#42f47d", "#ddff47", "#d4ffaa", "#ff7723"])
    	.domain(this.predationGroups);

	this.colorsRarity = d3.scaleOrdinal()
		.range(["#FFFFFF", "#7a7a7a", "#efc323", "#d33d02", "#6e04cc"])
    	.domain(this.rarities);

	this.tooltipDiv = d3.select("body").append("div")
	    .attr("class", "tooltip");

	this.tooltipDiv.append("ul");	    
};

MakeHistogram.prototype.update = function (data, histogramIndex)
{
	this.data = data;
	this.histogramIndex = histogramIndex;

	var t = d3.transition().duration(750);

	this.y.domain([0, d3.max(data, function(d){return d.cardCount;})]).nice();
	var dataStacks = d3.stack().keys(this.predationGroups)
		.value(function(d, key){return d[key].cardCount;})(data);

	for(var i in dataStacks)
	{
		for(var j in dataStacks[i])
		{
			dataStacks[i][j].key = dataStacks[i].key;
		}
	}	

	var elements =  this.g.selectAll(".bar").data(dataStacks);
	elements.exit().remove();

	var newElements = elements.enter().append("g")
		.attr("class", "bar");
	elements = newElements.merge(elements)
      	.attr("fill", function(d){return this.z(d.key);}.bind(this))

  	var subElements = elements.selectAll("rect")
  		.data(function(d){return d;});
		subElements.exit().remove();

	var subNewElements = subElements.enter().append("rect")
		.attr("y", this.height)
		.attr("height", 0)
		.on("mouseover", this.onMouseOver.bind(this))
        .on("mouseout", this.onMouseOut.bind(this));

	subNewElements.merge(subElements)
		.attr("x", function(d){return this.x(d.data.key);}.bind(this))
		.attr("width", this.x.bandwidth())
		.transition(t)
		.attr("y", function(d){return this.y(d[1]);}.bind(this))
		.attr("height", function(d){return this.y(d[0]) - this.y(d[1]);}.bind(this));

	var axesParent = this.g.append("g").attr("id", "axesParent");
    axesParent.append("g")
      .attr("class", "axis")
      .attr("transform", translate(0, this.height))
      .call(d3.axisBottom(this.x))
      .attr("font-size", "8px");    

    axesParent.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(this.y).ticks(null, "s"))
     	.append("text")
        .attr("x", -10)
        .attr("y", this.y(this.y.ticks().pop()) - 10)
        .attr("dy", "0.32em")
        .attr("fill", "#000")        
        .attr("text-anchor", "start")
        .text("Card Count");

	var legendParent = this.g.append("g").attr("id", "axesParent");
    var legend = legendParent.append("g")
      	.attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
      	.selectAll("g")
      	.data(this.predationGroups)
      	.enter().append("g")
        .attr("transform", function(d, i){return translate(0, i*-20 + 50)});

	legend.append("rect")
		.attr("x", this.width - 19)
		.attr("width", 19)
		.attr("height", 19)
		.attr("fill", this.z);		

	legend.append("text")
		.attr("x", this.width - 24)
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.attr("font-weight", "bold")
		.text(function(d){return d;});

	var title = this.g.append("g");

	var power = d3.select("#powerfield").property("value");
    var toughness = d3.select("#toughnessfield").property("value");

	title.append("text")
		.attr("x", this.width * 0.225)
		.attr("y", -10)		
		.attr("font-weight", "bold")
		.attr("font-size", 12)
		.text(function(d){
				return "id: " + this.histogramIndex + " Power: " + power + " Toughness:  "+ toughness;
			}.bind(this));	
	
}

MakeHistogram.prototype.onMouseOver = function (d)
{
	this.tooltipDiv.transition()
        .duration(200)
        .style("opacity", 1)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");

    var data = d.data[d.key].cards;
    data.sort(function(a, b)
    {
    	var indexA = this.rarities.indexOf(a.rarity);
    	var indexB = this.rarities.indexOf(b.rarity);
    	return indexB - indexA;
    }.bind(this));
    var elements = this.tooltipDiv.select("ul").selectAll("li").data(data);

    elements.exit().remove();

    var newElements = elements.enter().append("li");

	elements.merge(newElements)
		.text(function(d){return d.cmc + "-" + d.name + "(" + d.power + "/" + d.toughness + ")";})
		.style("color", function(d){return this.colorsRarity(d.rarity);}.bind(this));
}

MakeHistogram.prototype.onMouseOut = function (d)
{
	this.tooltipDiv.transition().duration(500).style("opacity", 0);
}

function translate(newX, newY)
{
  return "translate("+newX+","+newY+")";
}