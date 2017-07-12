var makeTooltip = function ()
{
	var  rarities = ["Common", "Uncommon", "Rare", "Mythic Rare"];

	var colorsRarity = d3.scaleOrdinal()
		.range(["#FFFFFF", "#7a7a7a", "#efc323", "#d33d02", "#6e04cc"])
		.domain(rarities);

	// var compare_colors = ["#ea00ff", "gray", "#4287ff"];
	var compare_colors = ["#4287ff", "gray", "#ea00ff"];

	function show(set)
	{		
		showData(set.cards);
		fadeIn(set.cards.length);
	}
	var tooltipDiv = d3.select("body").append("div")
		.attr("class", "tooltip");

	function showCompare(comparison)
	{	
		// var data = comparison.greater.getMinus(comparison.lesser).cards;
		// showData(data);
		var split_data =  [comparison.A.getMinus(comparison.B).cards,
							comparison.A.getIntersect(comparison.B).cards,
							comparison.B.getMinus(comparison.A).cards];
		showSplitData(split_data);
	}

	function showSplitData(split_data) {

		var lists = tooltipDiv.selectAll("ul").data(split_data);

		var newLists = lists.enter().append("ul");

		lists.exit().remove();

		lists = lists.merge(newLists);


		lists.each(function(d, i)
		{
			showData(d, function(){return compare_colors[i];}, d3.select(this));
		});

		var originalLength = 0;

		for (var i = 0; i < split_data.length; i++) 
		{
			originalLength += split_data[i].length;
		}

		fadeIn(originalLength);

	}

	function showData(data, color_function, list)
	{
		if(!list)
		{
			tooltipDiv.selectAll("ul").remove();
			list = tooltipDiv.append("ul");
		}

		data.sort(function(a, b)
		{
			var indexA = rarities.indexOf(a.rarity);
			var indexB = rarities.indexOf(b.rarity);
			return indexB - indexA;
		});

		var elements = list.selectAll("li")
			.data(data);

		elements.exit().remove();

		var newElements = elements.enter().append("li");

		elements.merge(newElements)
			.text(function(d){return d.cmc + "-" + d.name + "(" + d.power + "/" + d.toughness + ")";})
			.style("color", color_function? color_function : color_by_rarity);
	}

	var color_by_rarity = function(d){return colorsRarity(d.rarity);};

	function fadeIn(length)
	{
		tooltipDiv.transition()
			.duration(200)
			.style("opacity", 1)
			.style("left", (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY - 12.5 * length) + "px");
	}

	function hide() {
		tooltipDiv.transition()
			.duration(500)
			.style("opacity", 0);
	}

	return {
		show: show,
		showCompare: showCompare,
		hide: hide
	};
};