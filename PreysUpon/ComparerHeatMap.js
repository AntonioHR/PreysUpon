var a = 36;
var ComparerHeatMap = function (origin, svg, legend_svg, diff_hover_callback, diff_out_callback, spot_click_callback)
{
	width = svg.attr("width");
	height = svg.attr("height");

	this.colorGroups = ["Blue", "White", "Green", "Black", "Red", "Multicolored", "Colorless"];
	this.KillSurviveKeys = ["Kill", "Survive", "Not Kill", "Not Survive"];

	var result ={

	};

	init();

	function init()
	{
	}

	result.updateQueries = function udpateQueries(queries)
	{
		var joinedQuery = joinQueries(queries[0], queries[1]);
		console.log(joinedQuery);
		buildMatrix(joinedQuery);
	};

	function clear()
	{
		svg.selectAll("*").remove();
	}

	result.clear = clear;

	function buildMatrix(joinedQuery)
	{
		clear();

		var x = d3.scaleOrdinal()
			.domain(this.colorGroups)
			.range([65, 95, 125, 155, 185, 215, 245]);
		var y = d3.scaleOrdinal()
				.domain(this.KillSurviveKeys)
				.range([30, 60, 90, 120]);

		var emptyColor = "black";
		var scaleColor = d3.scaleLinear()
			.domain([-10, 0, 10])
			.range(["#ea00ff", "gray", "#4287ff"]);

		for (var i = 0; i < this.KillSurviveKeys.length; i++) {
			var columns = svg.append("g").attr("class", "column")
				.attr("transform", translate(0, y(this.KillSurviveKeys[i])))
				.selectAll(".column");

			var predationQuery = joinedQuery[this.KillSurviveKeys[i]];

			var cols = columns.data(predationQuery)
				.enter();
			var rects = cols.append("rect")
				.attr("class", "cell")
				.attr("x", function(d) { return x(d.color); })
				.attr("width", 20)
				.attr("height", 20)
				.style("stroke-width", 1)
				.style("fill", function(d) { 
					var val = 0;
					if(d.total != 0)
					{
						var val = d.diff;
					} else
					{
						return "Black";
					}
					return scaleColor(val);
				})
				.on("mouseover", function(d)
					{
						if(diff_hover_callback) diff_hover_callback(d);
					})
				.on("mouseout", function(d)
					{
						if(diff_out_callback) diff_out_callback(d);
					})
				.on("click", function(d)
					{
						if(spot_click_callback) spot_click_callback(d);
					});

				cols.append("text")
					.attr("x", function(d) { return x(d.color); })
					.attr("class", "heatmap_label")
					.attr("fill", "white")
					.attr("dy", "1em")
					.attr("text-anchor", "middle")
					.attr("dx", "0.7em")
					.text(function(d){return d.total;})
				.on("mouseover", function(d)
					{
						if(diff_hover_callback) diff_hover_callback(d);
					})
				.on("mouseout", function(d)
					{
						if(diff_out_callback) diff_out_callback(d);
					})
				.on("click", function(d)
					{
						if(spot_click_callback) spot_click_callback(d);
					});

		};

		var texts = svg.append("g").attr("class", "texts");

		var yText = texts.append("g").attr("class", "textsY").selectAll(".textsY").data(this.KillSurviveKeys)
			.enter().append("text")
			.attr("x", 0)
			.attr("y", function(d) { return y(d) + 15; })		
			.attr("font-weight", "bold")
			.attr("font-size", 12)
			.text(function(d){return d; });

		var xText = texts.append("g").attr("class", "textsX").selectAll(".textsX").data(this.colorGroups)
			.enter().append("text")
			.attr("x", function(d) { return x(d); })
			.attr("y", function(d, i) { return ( (i % 2 == 0)? 15 : (45 + y(this.KillSurviveKeys[this.KillSurviveKeys.length-1])) ) }.bind(this))
			.attr("font-size", 10)
			.text(function(d){return d; });
	}

	function joinQueries(queryA, queryB)
	{
		var aSplit = queryA.data.getKillSurviveColorSplit(queryA.pow, queryA.tough);
		var bSplit = queryB.data.getKillSurviveColorSplit(queryB.pow, queryB.tough);

		var result = {};

		for (var i = this.KillSurviveKeys.length - 1; i >= 0; i--) {
			result[this.KillSurviveKeys[i]] =
				joinQueryPredation(
					aSplit[KillSurviveKeys[i]],
					bSplit[KillSurviveKeys[i]]);
		}
		return result;
	}

	function joinQueryPredation(predA, predB)
	{
		var result = [];
		for (var i = this.colorGroups.length - 1; i >= 0; i--) {

			var color = this.colorGroups[i];
			var temp = {color:color};
			temp.A = predA[color];
			temp.B = predB[color];
			temp.diff = predA[color].cardCount - predB[color].cardCount;

			temp.greater = temp.diff > 0? temp.A : temp.B;
			temp.lesser = temp.diff <= 0? temp.A : temp.B;
			temp.total = temp.A.cardCount + temp.B.cardCount - temp.A.getIntersect(temp.B).cardCount;
			result.push(temp);
		}
		return result;
	}
	function translate(x, y)
	{
		return "translate("+x+","+y+")";
	}

	return result;
};