var a = 36;
var ComparerHeatMap = function (origin, svg, legend_svg)
{
	width = svg.attr("width");
	height = svg.attr("height");

	this.colorGroups = ["Blue", "White", "Green", "Black", "Red", "Multicolored", "Colorless"];
	this.predationKeys = ["Predator", "BounceOff", "Trade", "Prey"];


	var result ={

	};

	init();

	function init()
	{
		// svg.append("rect")
		// 	.attr("width", width)
		// 	.attr("height", height)
		// 	.attr("color", "FF00FF");
		buildLegendData();
		buildLegend(legend_svg);
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
			.range(["#E03019", "gray", "#86CE17"]);

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

	function buildLegendData()
	{
		this.subtitlesJson = [
		{
			type: "Vazios",
			color: "black"
		},
		{
			type: "Empate",
			color: "gray"
		},
		{
			type: "Esquerda",
			color: "#922C42"
		},
		{
			type: "Direita",
			color: "#48266B"
		}
	]	
	}

	function buildLegend(legendParent)
	{
		legendParent.append("text")
			.attr("dy", "1em")
			.attr("font-weight", "bold")
			.text("Legenda");

		var subtitle = legendParent.append("g")
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("text-anchor", "end")
				.selectAll("g")
			.data(this.subtitlesJson)
				.enter().append("g")
			.attr("transform", function(d, i){return translate(0, (i % 2)*20 );});

		subtitle.append("rect")
			.attr("x", function(d, i){
				if(i < 2){
					return this.width / 2;
				}else{
					return this.width - 19;
				}
			}.bind(this))
			.attr("width", 19)
			.attr("height", 19)
			.attr("fill", function(d){return d.color;});

		subtitle.append("text")
			.attr("x", function(d, i){
				if(i < 2){
					return this.width / 2;
				}else{
					return this.width - 19;
				}
			}.bind(this))
			.attr("y", 9.5)
			.attr("dy", "0.32em")
			.attr("font-weight", "bold")
			.text(function(d){return d.type;});
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