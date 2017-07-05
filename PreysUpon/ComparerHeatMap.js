var a = 36;
var ComparerHeatMap = function (origin, svg, legend_svg)
{
	width = svg.attr("width");
	height = svg.attr("height");

	this.colorGroups = ["Blue", "White", "Green", "Black", "Red", "Multicolored", "Colorless"];
	this.predationKeys = [ "Prey", "BounceOff", "Trade", "Predator"];


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

	result.clear = function clear()
	{
		svg.selectAll("*").remove();
	}

	function buildMatrix(joinedQuery)
	{
		// console.log(joinedQuery[0]);
		// console.log(joinedQuery[1]);

		var x = d3.scaleOrdinal()
			.domain(this.colorGroups)
			.range([65, 95, 125, 155, 185, 215, 245]);
			
		var y = d3.scaleOrdinal()
				.domain(this.predationKeys)
				.range([30, 60, 90, 120]);

		var emptyColor = "black";
		var scaleColor = d3.scaleLinear()
			.domain([-10, 0, 10])
			.range(["#ea00ff", "gray", "#4287ff"]);

		for (var i = 0; i < this.predationKeys.length; i++) {
			var columns = svg.append("g").attr("class", "column")
				.attr("transform", translate(0, y(this.predationKeys[i])))
				.selectAll(".column");

			var predationQuery = joinedQuery[this.predationKeys[i]];

			columns.data(predationQuery)
				.enter().append("rect")
				.attr("class", "cell")
				.attr("x", function(d) { return x(d.color); })
				// .attr("y", y[this.predationKeys[i]])
				.attr("width", 20)
				.attr("height", 20)
				.style("stroke-width", 1)
				// .style("fill", function(d) { return this.scaleColor(d.id); }.bind(this))
				.style("fill", function(d) { 
					var val = 0;
					if(d.total != 0)
					{
						var val = 10 * d.diff/d.total;
					}
					return scaleColor(val);
					// return d.total == 0? emptyColor : scaleColor(d.diff/d.total); 
				})
				// .on("mouseover", this.onMouseOver.bind(this))
				// .on("mouseout", this.onMouseOut.bind(this))
				.exit();


		};

		var texts = svg.append("g").attr("class", "texts");
		
		var yText = texts.append("g").attr("class", "textsY").selectAll(".textsY").data(this.predationKeys)
			.enter().append("text")
			.attr("x", 0)
			.attr("y", function(d) { return y(d) + 15; })		
			.attr("font-weight", "bold")
			.attr("font-size", 12)
			.text(function(d){return d; });

		var xText = texts.append("g").attr("class", "textsX").selectAll(".textsX").data(this.colorGroups)
			.enter().append("text")
			.attr("x", function(d) { return x(d); })
			.attr("y", function(d, i) { return ( (i % 2 == 0)? 15 : (160) ) })
			.attr("font-size", 10)
			.text(function(d){return d; });
	}

	function joinQueries(queryA, queryB)
	{
		var result = {};

		for (var i = this.predationKeys.length - 1; i >= 0; i--) {
			result[this.predationKeys[i]] =
				joinQueryPredation(
					queryA[predationKeys[i]],
					queryB[predationKeys[i]]);
		}
		return result;
	}

	function joinQueryPredation(predA, predB)
	{
		var result = [];
		for (var i = this.colorGroups.length - 1; i >= 0; i--) {

			var color = this.colorGroups[i];
			var temp = {color:color};
			temp["A"] = predA[color];
			temp["B"] = predB[color];
			temp["diff"] = predA[color].cardCount - predB[color].cardCount;
			temp ["total"] = predA[color].cardCount + predB[color].cardCount;
			result.push(temp);
		}
		return result;
	}
	function translate(x, y)
	{
		return "translate("+x+","+y+")";
	}

	return result;
}