function applyMargin(parent, margin, width, height) {
    var child = addPositionedContainer(parent, margin.left, margin.top);
    var childWidth = width - (margin.left + margin.right);
    var childHeight = height - (margin.top + margin.bottom);

    var result =
        {
            g: child,
            width: childWidth,
            height: childHeight
        };
    return result;
}

//Helper Functions for positioning Stuff
function addPositionedScaledContainer(parent, x, y, scaleX, scaleY) {
    result = parent.append("g");
    result.attr("transform", "translate(" + x + "," + y + ")");
    result = result.append("g");
    result.attr("transform", "scale(" + x + "," + y + ")");
    return result;
}


function addPositionedContainer(parent, x, y) {
    var result = parent.append("g");
    result.attr("transform", "translate(" + x + "," + y + ")");
    return result;
}


function margins(top, right, bottom, left)
{

    var result =  {
    	top: top,
    	right: right,
    	bottom: bottom,
    	left: left
    };
    result.apply = function(parent, width, height)
    	{
    		return applyMargin(parent, result, width, height);
    	};
    return result;
}



function stackBar(parent, width, height, fill)
{
    g =  addPositionedContainer(parent, 0, -height);
    bar = g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", fill);
    return  {
        g: g,
        bar:bar
    };
}

function Histo(parent) {
	var _outerMargin = margins(0, 0, 5, 5),
		_innerMargin = margins(5, 5, 25, 5),
		_width = 600,
		_height = 400,
		_xOptions = ["Blue", "White", "Green",
			"Black", "Red", "Multicolored", "Colorless"],
		_parent = parent;

	var result = {
		outerMargin: _outerMargin,
		innerMargin: _innerMargin
	};


	result.init = function render()
	{
		// _parent.append("rect")
  //       .attr("width", _width)
  //       .attr("height", _height)
  //       .attr("style", "fill:rgb(0,0,255)");

		var outerPosData = _outerMargin.apply(parent, _width, _height);
		var innerPosData = _innerMargin.apply(outerPosData.g,
			outerPosData.width , outerPosData.height);


	    var histogramGroup = outerPosData.g;
	    var axesParent = innerPosData.g;

	    var axisBarsOffset = _outerMargin.right;

	    var axisWidth = innerPosData.width;
	    var axisHeight = innerPosData.height;
	    var histogramWidth = outerPosData.width;
	    var histogramHeight = outerPosData.height;

	    updateScales(axisWidth , axisHeight);

	    var bins = d3.histogram()
	    	.domain(result.scaleX.domain())(_xOptions);

    	var origin = addPositionedContainer(axesParent, _innerMargin.left, axisHeight);
        origin.call(d3.axisBottom(result.scaleX)
        	// .tickPadding(tickPaddingX).tickSizeInner(tickInnerSizeX).tickSizeOuter(tickOuterSizeX)
        			);

        origin = addPositionedContainer(origin, 1, - 0.3);

        addPositionedContainer(axesParent, 0, 0)
	    .call(d3.axisLeft(result.scaleY)
	    	// .tickPadding(tickPaddingX).tickSizeInner(tickInnerSizeX).tickSizeOuter(tickOuterSizeX))
	    		)
        .selectAll("text").remove();

        result.origin = origin;
        result.g = histogramGroup;
        result.bins = bins;
        result.barWidth = result.scaleX(_xOptions[1]) - result.scaleX(_xOptions[0]);
        return result;
	};

	result.show = function show(cards, power, toughness)
	{
		var barsScale = d3.scaleLinear()
			.range(result.scaleY.range())
			.domain([cards.cardCount, 0]);
		var split = cards.getColorGroupSplit();
		var origin = result.origin;
		var barWidth = result.barWidth;

		result.origin.selectAll("rect").remove();
		for(var c in _xOptions)
		{
			var currentQuery = split[_xOptions[c]];
			var myOrigin = addPositionedContainer(origin, result.scaleX(_xOptions[c]), 0);
			//Prey
			var preyCountcount = currentQuery.getAllPrey(power, toughness).cardCount;
			var bar = stackBar(myOrigin, result.barWidth, barsScale(preyCountcount), "Green");

			//BounceOff
			var bounceOffCount = currentQuery.getAllBounceOff(power, toughness).cardCount;
			var bar = stackBar(bar.g, result.barWidth, barsScale(bounceOffCount), "Gray");

			//Trade

			var bounceOffCount = currentQuery.getAllTrades(power, toughness).cardCount;
			var bar = stackBar(bar.g, result.barWidth, barsScale(bounceOffCount), "Yellow");
			//Predators


			var predatorCount = currentQuery.getAllPredators(power, toughness).cardCount;
			var bar = stackBar(bar.g, result.barWidth, barsScale(predatorCount), "Red");


		}
	};

	function updateScales(width, height)
	{
		result.scaleX = d3.scaleBand()
			.domain(_xOptions)
			.range([0, width]);
		result.scaleY = d3.scaleLinear()
			.range([height, 0]);
		result.scaleColor = d3.scaleOrdinal(d3.schemeAccent);
	}


	///Getters/Setters
	result.outerMargin = function(value) {
		if(!arguments.length) return _outerMargin;
		_outerMargin = value;
		return result;
	};
	result.innerMargin = function(value) {
		if(!arguments.length) return _innerMargin;
		_innerMargin = value;
		return result;
	};

	return result;
}