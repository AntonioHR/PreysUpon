var Heatmap = function (origin, svg, legend_svg)
{
	var width = svg.attr("width"),
		height = svg.attr("height");

	this.max_toughness = 7;
	this.max_power = 7;

	var result = {};

	var update = function(newData, click_callback)
	{
		//clear();
		var self = this;

		var processedData = processData(newData.cards);
		var data = processedData.matrix;
		var max_count = processedData.max_count;
		console.log(processedData);
		var x = [25, 55, 85, 115, 145, 175, 205];
		var y = [50, 80, 110, 140, 170, 200, 230];

		var emptyColor = "black";
		var scaleColor = d3.scaleLinear()
			.domain([0, max_count])
			.range(["#cfcfcf", "#ff0000"]);
		
		for (var i = 0; i < 7; i++) {

			let power = i;

			var columns = svg.append("g").attr("class", "column")
				.attr("transform", translate(0, y[i]))
				.selectAll(".column");

			var creaturesByPower = data[i];

			columns.data(creaturesByPower)
				.enter().append("rect")
				.attr("class", "cell")
				.attr("x", function(d, index) {return x[index]; })
				.attr("width", 20)
				.attr("height", 20)
				.attr("data-count", function(d){return d;})
				.attr("data-i", i)
				.attr("data-index", function(d, index) {return index;})
				.style("stroke-width", 1)
				.style("fill", function(d) { return scaleColor(d); })
				.style("cursor", "pointer")
				.on("click", function(d, index)
					{
						if(click_callback) { click_callback({
								power: power,
								toughness: index,
								count: d
							}); }
					});
		}

		var texts = svg.append("g").attr("class", "texts");

		var yText = texts.append("g").attr("class", "textsY").selectAll(".textsY").data([0,1,2,3,4,5,6])
			.enter().append("text")
			.attr("x", 0)
			.attr("y", function(d) { return y[d] + 15; })		
			.attr("font-weight", "bold")
			.attr("font-size", 12)
			.text(function(d){if (d == 6) return d+"+"; else return d; });

		texts.append("g").attr("class", "textsY").selectAll(".textsY").data(["power"])
			.enter().append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -90)
			.attr("y", 20)
			.attr("font-weight", "bold")
			.attr("font-size", 12)
			.text(function(d) {return d;});

		var xText = texts.append("g").attr("class", "textsX").selectAll(".textsX").data([0,1,2,3,4,5,6])
			.enter().append("text")
			.attr("x", function(d) { return x[d]; })
			.attr("y", function(d, i) { return 28; })
			.attr("font-weight", "bold")
			.attr("font-size", 12)
			.text(function(d){if (d == 6) return d+"+"; else return d; });

		texts.append("g").attr("class", "textsX").selectAll(".textsX").data(["toughness"])
			.enter().append("text")
			.attr("x", 25)
			.attr("y", 40)
			.attr("font-weight", "bold")
			.attr("font-size", 12)
			.text(function(d) {return d;});
	}

	function translate(x, y)
	{
		return "translate("+x+","+y+")";
	}

	var clear = function clear()
	{
		svg.selectAll("*").remove();
	}

	function processData(data)
	{
		var max_count = 0;
		var matrix = new Array (this.max_toughness);

		for (var i = 0; i < this.max_toughness; i++) {
			matrix[i] = new Array(this.max_power);

			for (var j = 0; j < this.max_power; j++) {
				matrix[i][j] = 0;
			}
		}

		for(var i = 0; i < data.length; i++) {
			var power = data[i].power;
			var toughness = data[i].toughness;

			if (isNaN(toughness)) toughness = 0;
			else if (toughness >= this.max_toughness) toughness = this.max_toughness-1;
			if (isNaN(power)) power = 0;
			else if (power >= this.max_power) power = this.max_power-1;

			matrix[toughness][power]++;

			if (matrix[toughness][power] > max_count) max_count = matrix[toughness][power];
		}

		return {
			matrix: matrix,
			max_count: max_count
		}
	}

	return {
		clear: clear,
		update: update
	}
}