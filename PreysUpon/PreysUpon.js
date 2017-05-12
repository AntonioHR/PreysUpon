var init = function() {
	var margin = {top: 25, right: 25, bottom: 25, left: 25};

	var width = 800 - margin.left - margin.right;
	var height = 600 - margin.top - margin.bottom;

	this.svgContainer = d3.select("body").append("svg").attr("width", width).attr("height", height);

	//Definindo as escalas, baseando os domínios ao contradomínio (dimensão aceita do svg)
	this.scaleX = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
	this.scaleY = d3.scaleLinear().domain([0, 100]).range([height -  margin.top, margin.bottom]);
	this.scaleR = d3.scaleLinear().domain([0, 100]).range([5, 25]);
	this.scaleColor = d3.scaleLinear().domain([0, 100]).range([0.0, 1.0]);	

	this.svgGroup = this.svgContainer.append("g")

	//Criando o eixo-x
	this.svgGroup.append("g")	    
	    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
	    .call(d3.axisBottom(this.scaleX));

	//Criando o eixo-y
	this.svgGroup.append("g")
	    .attr("transform", "translate(" + margin.left + ",0)")
	    .call(d3.axisLeft(this.scaleY));
	
	this.groupPoints = this.svgContainer.append("g");	

	setGlobalVariables();

	getCreatureCards();

	//Definir o checklist dos monstros
		
};

function setGlobalVariables() {
	this.cardsCreatures = [];
}

function getCreatureCards() {
	for (key in cardsMTG) {
		var card = cardsMTG[key];
		if(!card.types) continue;
		
		if(card["types"].indexOf("Creature") > -1){
			this.cardsCreatures.push(card);	
		}	
	}

	/*this.cardsCreatures.forEach(function(card){
		console.log(card);
	});*/
};

//Testar!!
function buildingHistogram(width, height ) {
	this.histogramGroup.selectAll(".bar").remove();

	var offsetX = 5/2 * width;

	this.scaleHistogramX = d3.scaleLinear()
		.domain([0, this.carriers.length])
        .range([this.margin.left +  this.margin.right / 2 + this.margin.right, width +  this.margin.right / 2 - this.margin.right]);

    this.bins = d3.histogram()
    	.domain(this.scaleHistogramX.domain())    	    	
    	(this.carriers);

	this.scaleHistogramY = d3.scaleLinear().domain([0, this.dataSize]).range([height - this.margin.top, this.margin.bottom]);	

	this.histogramGroup = this.svgContainer.append("g");
	//Criando o eixo-x
	this.histogramGroup.append("g")	    
	    .attr("transform", "translate("+ offsetX +"," + (height - this.margin.bottom) + ")")
	    .call(d3.axisBottom(this.scaleHistogramX).tickPadding(20).ticks(3));

	//Criando o eixo-y
	this.histogramGroup.append("g")
	    .attr("transform", "translate(" + ( offsetX + this.margin.left + this.margin.right) + ",0)")
	    .call(d3.axisLeft(this.scaleHistogramY).tickPadding(10));		

	this.bar = this.histogramGroup.selectAll(".bar")
		.data(this.bins)
		.enter().append("g")
	    .attr("class", "bar");	    

	this.bar.append("rect")
	    .attr("x", function (d) {
	    	return offsetX + this.scaleHistogramX(d.x0);
	    }.bind(this))
	    .attr("y", function (d,i) {	    	
			return this.scaleHistogramY(filterData(i).length);
	    }.bind(this))
	    .attr("width", this.scaleHistogramX(this.bins[0].x1) - this.scaleHistogramX(this.bins[0].x0) - 1)
	    .attr("height", function(d, i) {     			    	
		    return Math.floor(height - this.margin.top - this.scaleHistogramY(filterData(i).length)); 
	    }.bind(this))
	    .on("click", function(d, i) {	    	
	    	
	    	var remove = false;
	    	if(d3.select(this).style("fill") == "rgb(0, 0, 0)"){	    		
	    		d3.select(this).style("fill", "steelblue");
	    	}else{
	    		remove = true;				    		
	    		d3.select(this).style("fill", "black");	    		
	    	}
	    		    	
	    	updatePlotColor(i, remove);
	    	d3.event.stopPropagation();
		})
		.style("fill", "steelblue");		

	this.bar.append("text")
	    .attr("dy", ".75em")
	    .attr("y", function (d, i) {
	    	return this.scaleHistogramY(filterData(i).length) - 20;
	    }.bind(this))
	    .attr("x", function (d, i) {	    	
	    	return offsetX + this.scaleHistogramX(this.bins[i].x0) + (this.scaleHistogramX(this.bins[i].x1) - this.scaleHistogramX(this.bins[i].x0)) / 2;
	    }.bind(this))	    	
	    .attr("text-anchor", "middle")
	    .text(function(d, i) { 
	    	return filterData(i).length.toString(); 
	    }.bind(this));
};

function updatePlotColor(i, removePlot) {
	var index = this.selectedIndexCarries.indexOf(i);
	if(removePlot){
		if(index > -1) this.selectedIndexCarries.splice(index, 1);
	}else{
		if(index == -1) this.selectedIndexCarries.push(i);
	}	

	var selectedCarries = [];
	this.selectedIndexCarries.forEach(function (id) {
		selectedCarries.push(this.carriers[id])
	}.bind(this))		

	this.rects.style("fill", function (d) { 
		if(selectedCarries.indexOf(d.carrier) > -1){
			if(!d.selected) return "gray";
			return this.scaleColor (d.carrier);
		}else if(!d.selected) return "gray";
		return "black";					
	}.bind(this));	
}

function filterData(index) {
	var content = this.filteredTrips.filter(function (d) { return d.carrier == this.carriers[index]; }.bind(this));
	return content;	
}