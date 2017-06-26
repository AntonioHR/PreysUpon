var ComparativeHistograms = function (leftSelector, rightSelector)
{

	this.leftSelector = leftSelector;
	this.rightSelector = rightSelector;

	this.colorGroups = ["Blue", "White", "Green", "Black", "Red", "Multicolored", "Colorless"]; 	
	this.keys = ["Predator", "BounceOff", "Trade", "Prey"];
	this.rarities = ["Common", "Uncommon", "Rare", "Mythic Rare", "Special"];

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
			color: "blue"
		},
		{
			type: "Direita",
			color: "green"
		}
	]	

	this.margin = {top: 20, right: 20, bottom: 30, left: 40};

	this.colorsRarity = d3.scaleOrdinal()
		.range(["#FFFFFF", "#7a7a7a", "#efc323", "#d33d02", "#6e04cc"])
    	.domain(this.rarities);

	this.tooltipDiv = d3.select("body").append("div").attr("class", "tooltip");
	this.tooltipDiv.append("ul");	

	this.leftSelector.on("change", this.onHistogramSelected.bind(this));
	this.rightSelector.on("change", this.onHistogramSelected.bind(this));
			   
};

ComparativeHistograms.prototype.init = function(histogram1, histogram2) 
{
	this.setHistograms(histogram1, histogram2);
	this.height = 250;
	var offsetHeight = 50;

	this.matrizSVG = d3.select(".three").select("#comparative-table").append("svg").attr("width", 300).attr("height", this.height);
	this.width = +this.matrizSVG.attr("width") - this.margin.left - this.margin.right;
	this.relativeHeight = +this.matrizSVG.attr("height") - this.margin.top - this.margin.bottom - offsetHeight;
	this.g = this.matrizSVG.append("g");

	this.startedHistogram = true;

	this.addSubtitle();
};

ComparativeHistograms.prototype.addSubtitle = function() 
{
	var subtitleParent = this.g.append("g").attr("id", "legend");

	subtitleParent.append("text")
		.attr("x", this.width / 2 - 50)
		.attr("y", this.height / 2 + 50)
		.attr("dy", "0.25em")
		.attr("font-weight", "bold")
		.text("Legenda");

    var subtitle = subtitleParent.append("g")
      	.attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
      	.selectAll("g")
      	.data(this.subtitlesJson)
      	.enter().append("g")
        .attr("transform", function(d, i){return translate(0, (i % 2)*20 + 200)});

	subtitle.append("rect")
		.attr("x", function(d, i){
			if(i < 2){
				return this.width / 2
			}else{
				return this.width - 19
			}			
		}.bind(this))
		.attr("width", 19)
		.attr("height", 19)
		.attr("fill", function(d){return d.color;});		

	subtitle.append("text")
		.attr("x", function(d, i){
			if(i < 2){
				return this.width / 2
			}else{
				return this.width - 19
			}			
		}.bind(this))
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.attr("font-weight", "bold")
		.text(function(d){return d.type;});
};

ComparativeHistograms.prototype.setHistograms = function (histogram1, histogram2)
{	
    this.histogramLeft = histogram1;
    this.histogramRight = histogram2;     
}

ComparativeHistograms.prototype.comparingHistograms = function() {

	if(this.histogramLeft == null || this.histogramRight == null) return;

	var numberColumns = this.histogramLeft.data.length;	
	var histogramsColors = [];
	for (var i = numberColumns - 1; i >= 0; i--) 
	{		

		var typeLeft = this.histogramLeft.data[i];
		var typeRight = this.histogramRight.data[i];

		var result = {
			color: this.histogramLeft.data[i].key,
			types: [
				{
					id: this.comparingValues(typeLeft.Predator, typeRight.Predator),
					color: this.histogramLeft.data[i].key
				},
				{
					id: this.comparingValues(typeLeft.BounceOff, typeRight.BounceOff),
					color: this.histogramLeft.data[i].key
				},
				{
					id: this.comparingValues(typeLeft.Trade, typeRight.Trade),
					color: this.histogramLeft.data[i].key
				},				
				{
					id: this.comparingValues(typeLeft.Prey, typeRight.Prey),
					color: this.histogramLeft.data[i].key
				}										
			]			
		}		

		histogramsColors.push(result);				
	}

	this.buildMatriz(histogramsColors)

};

ComparativeHistograms.prototype.buildMatriz = function(histogramsColors) 
{		
	var x = d3.scaleOrdinal(this.width)	
			.domain(this.colorGroups)
		    .range([65, 95, 125, 155, 185, 215, 245]);		  
		    
	var y = d3.scaleOrdinal(this.relativeHeight)
			.domain(this.keys)
		    .range([30, 60, 90, 120]);	

	this.scaleColor = d3.scaleOrdinal()
		.domain([-2, -1, this.histogramLeft.histogramIndex, this.histogramRight.histogramIndex])
		.range(["black", "gray", "blue", "green"]);   	


	for (var i = histogramsColors.length - 1; i >= 0; i--) {

		var columns = this.g.append("g").attr("class", "column")
			.selectAll(".column");		    

	    columns.data(histogramsColors[i].types)		  	
		  	.enter().append("rect")
		    .attr("class", "cell")
		    .attr("x", function(d) { return x(histogramsColors[i].color); })
		    .attr("y", function(d, i) { return y(this.keys[i]); }.bind(this))
		    .attr("width", 20)
		    .attr("height", 20)	    
		    .style("stroke-width", 1)
		    .style("fill", function(d) { return this.scaleColor(d.id); }.bind(this))
		    .on("mouseover", this.onMouseOver.bind(this))
        	.on("mouseout", this.onMouseOut.bind(this))
        	.exit();        			     
	}	

	var texts = this.g.append("g").attr("class", "texts");
	
	var yText = texts.append("g").attr("class", "textsY").selectAll(".textsY").data(this.keys)
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
};

ComparativeHistograms.prototype.resetHistogram = function() 
{	
	this.histogramLeft = null;
	this.histogramRight = null;

	d3.select(".three").selectAll("svg").remove();
	this.startedHistogram = false;
};

ComparativeHistograms.prototype.onMouseOver = function(d, index) 
{
	this.tooltipDiv.transition()
        .duration(200)
        .style("opacity", 1)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    
    var colorIndex = this.colorGroups.indexOf(d.color);
	
    var leftResult = null;
    var rightResult = null;    

	for (var i = this.histogramLeft.data.length - 1; i >= 0; i--) 
	{
		var left = this.histogramLeft.data[i];
		if(d.color == left.key) leftResult = left;
		
		var right = this.histogramRight.data[i];
		if(d.color == right.key) rightResult = right;		
	}	
	
	var cards = [];

	var cardsLeft = leftResult[this.keys[index]].cards;	
	var cardsRight = rightResult[this.keys[index]].cards;

	cards.push.apply(cards, cardsLeft);
	cards.push.apply(cards, cardsRight);	

    cards.sort(function(a, b)
    {
    	var indexA = this.rarities.indexOf(a.rarity);
    	var indexB = this.rarities.indexOf(b.rarity);
    	return indexB - indexA;
    }.bind(this)); 

    cards = this.getUniqueCards(cards);

    var elements = this.tooltipDiv.select("ul").selectAll("li").data(cards);
    elements.exit().remove();

    var newElements = elements.enter().append("li");

	elements.merge(newElements)
		.text(function(d){return d.cmc + "-" + d.name + "(" + d.power + "/" + d.toughness + ")";})
		.style("color", function(d){return this.colorsRarity(d.rarity);}.bind(this));
};

ComparativeHistograms.prototype.getUniqueCards = function(cards)
{
	var uniqueCards = [];   
    var card = null;
    var uniqueCard = null; 

    for (var i = 0; i < cards.length; i++) 
    {    	

    	card = cards[i];
    	var contain = false;    	

    	for (var j = 0; j < uniqueCards.length && !contain; j++) 
    	{
    		uniqueCard = uniqueCards[j];
    		contain = ( (card.cmc + "-" + card.name + "(" + card.power + "/" + card.toughness + ")") == (uniqueCard.cmc + "-" + uniqueCard.name + "(" + uniqueCard.power + "/" + uniqueCard.toughness + ")") );    	
    	}    	

		if(!contain) 
    	{
    		uniqueCards.push(card);
    	}

    }  

    return uniqueCards;
};

ComparativeHistograms.prototype.onMouseOut = function(d) 
{
	this.tooltipDiv.transition().duration(500).style("opacity", 0);
};

ComparativeHistograms.prototype.comparingValues = function(typeLeft, typeRight) 
{
	var result = -1;	

	if(typeLeft.cardCount > typeRight.cardCount){
		result = this.histogramLeft.histogramIndex;		
	}else if(typeLeft.cardCount < typeRight.cardCount){
		result = this.histogramRight.histogramIndex;		
	}

	if(typeLeft.cardCount == 0 && typeRight.cardCount == 0) result = -2

	return result;	
};

ComparativeHistograms.prototype.setHistogramLeft = function (histogram)
{
    this.histogramLeft = histogram;    
}

ComparativeHistograms.prototype.setHistogramRight = function (histogram)
{
    this.histogramRight = histogram;    
}

ComparativeHistograms.prototype.returnHistograms = function() 
{
    return [this.histogramLeft, this.histogramRight];
}


ComparativeHistograms.prototype.updateSelectors = function(dataset) {
	this.currentDataset = dataset;

	this.leftSelector.selectAll("option").remove();
	this.rightSelector.selectAll("option").remove();

	var options = this.leftSelector.selectAll("option").data(this.currentDataset).enter()
        .append("option")
        .text(function(d){return d.name;});

    var options = this.rightSelector.selectAll("option").data(this.currentDataset).enter()
        .append("option")
        .text(function(d){return d.name;});

};

ComparativeHistograms.prototype.onHistogramSelected = function() 
{
	var leftIndex = this.leftSelector.node().selectedIndex;
	var rightIndex = this.rightSelector.node().selectedIndex; 	   	

	this.resetHistogram();

	this.init(this.currentDataset[leftIndex], this.currentDataset[rightIndex]);	

	this.comparingHistograms();
};