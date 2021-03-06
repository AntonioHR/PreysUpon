var check = checkBoxFilter;

function makeHisto(parent, svg, mouse_over_function, mouse_out_function, area_click_function, title){
	if(!svg)
	{
		svg = parent.append("svg")
			.attr("width", 400)
			.attr("height", 400);
	}
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
		colorGroups = ["Blue", "White", "Green",
			"Black", "Red", "Multicolored", "Colorless"],
		predationGroups = ["Prey", "Trade", "BounceOff", "Predator"],
		rarities = ["Common", "Uncommon", "Rare", "Mythic Rare"],
		base_count = 10;

	//Filters
	var _predation_filter =  [-99, -99];

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

	var colorsRarity = d3.scaleOrdinal()
		.range(["#FFFFFF", "#7a7a7a", "#efc323", "#d33d02", "#6e04cc"])
		.domain(rarities);



	var tooltipDiv = d3.select("body").append("div")
		.attr("class", "tooltip");

	tooltipDiv.append("ul");


	

	function translate(x, y)
	{
		return "translate("+x+","+y+")";
	}

	var data = function(value)
	{
		if(!value)
			return _full_data.slice();
		else
		{
			_full_data = value;
		}
		return this;
	};

	var predation_filter = function(value)
	{
		if(!value)
		{
			return _predation_filter.slice();
		} else
		{
			_predation_filter = value;
		}
		return this;
	};
	

	var currentQuery = function()
	{
		var filtered_data = _full_data;

		// filtered_data = filtered_data.getAllInRarities(_rarity_filter);
		// filtered_data = filtered_data.getAllWithCostBetween(_cost_filter);

		return {
			data:filtered_data,
			pow:_predation_filter[0],
			tough:_predation_filter[1]
		};
	};

	var render = function ()
	{

		var filtered_data = _full_data;

		// filtered_data = filtered_data.getAllInRarities(_rarity_filter);
		// filtered_data = filtered_data.getAllWithCostBetween(_cost_filter);

		var formatted_data = filtered_data.getColorPredationSplitTable(_predation_filter[0], _predation_filter[1]);

		var t = d3.transition()
			.duration(750);

		var maxCardCount = d3.max(formatted_data, function(d){return d.cardCount;}) + 3;
		var yMax = (maxCardCount > base_count)? maxCardCount:base_count;
		y.domain([0, yMax]).nice();
		var dataStacks = d3.stack()
		.keys(predationGroups)
		.value(function(d, key)
			{
				return d[key].cardCount;
			})(formatted_data);

		for(var i in dataStacks)
		{
			for(var j in dataStacks[i])
			{
				dataStacks[i][j].key = dataStacks[i].key;
			}
		}

		parent.selectAll(".legendParent").remove();
		parent.selectAll(".axesParent").remove();

		if(title)
		{
			title.text("Power: " + _predation_filter[0] + " Toughness: " + _predation_filter[1]);
		}

		var elements =  g.selectAll(".bar").data(dataStacks);
		elements.exit().remove();
		var newElements = elements.enter().append("g")
			.attr("class", "bar");
		elements = newElements.merge(elements)
			.attr("fill", function(d){return z(d.key);});


		var subElements = elements.selectAll("rect")
			.data(function(d)
				{
					return d;
				});
			subElements.exit().remove();
		var subNewElements = subElements.enter().append("rect")
			.attr("y", height)
			.attr("height", 0)
			.on("mouseover", function(d){mouse_over_function(d.data[d.key]);})
			.on("mouseout", function(d){mouse_out_function(d.data[d.key]);})
			.on("click", function(d) { area_click_function(d.data[d.key]); } );

		subNewElements.merge(subElements)
			.attr("x", function(d){return x(d.data.key);})
			.attr("width", x.bandwidth())
			.transition(t)
			.attr("y", function(d){return y(d[1]);})
			.attr("height", function(d){return y(d[0]) - y(d[1]);});

		var axesParent = g.append("g").attr("class", "axesParent");
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

		var legendParent = g.append("g").attr("class", "legendParent");
		var legend = legendParent.append("g")
				.attr("font-family", "sans-serif")
				.attr("font-size", 10)
				.attr("text-anchor", "end")
			.selectAll("g")
			.data(predationGroups)
			.enter().append("g")
				.attr("transform", function(d, i){return translate(0, i*20);});

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
		render:render,
		predation_filter: predation_filter,
		data: data,
		// rarity_filter: rarity_filter,
		parent: parent,
		query: currentQuery
	};
}