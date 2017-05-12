var init = function() {
	this.margin = {top: 25, right: 25, bottom: 25, left: 25};

	this.width = 1336 - this.margin.left - this.margin.right;
	this.height = 600 - this.margin.top - this.margin.bottom;

	extractData(trips);
	filterTrips(trips);

	this.svgContainer = d3.select("body").append("svg").attr("width", this.width).attr("height", this.height);

	this.histogramGroup = this.svgContainer.append("g");
	this.selectedIndexCarries = [0, 1, 2];

	buildingScatterplot(700, this.height);

	buildingHistogram(324, this.height);
};	

function buildingScatterplot(width, height) {
	//A segunda é um scatterplot que deve mostrar a diferença do numéro de dias entre a postagem 
	//do preço e o incício da viagem no eixo X (post e start) e o preço da passagem no eixo Y. O scatterplot deve conter eixos.
	this.scatterplotGroup = this.svgContainer.append("g");		    

	var minDelayDays = d3.min(trips, function(d){return d.delayDays;});		
	var maxDelayDays = d3.max(trips, function(d){return d.delayDays;});		

	var minPrice = d3.min(trips, function(d) { return d.price; });
	var maxPrice = d3.max(trips, function(d) { return d.price; });

	var colorDom = d3.map(trips, function (d) { return d.carrier }).keys();
	
	this.scaleScatterplotX = d3.scaleLinear().domain([minDelayDays, maxDelayDays]).range([ 3* this.margin.left, width - this.margin.right]);
	this.scaleScatterplotY = d3.scaleLinear().domain([minPrice, maxPrice]).range([height - this.margin.top, this.margin.bottom]);

	this.scaleColor = d3.scaleOrdinal().domain(colorDom).range(["red", "green", "blue"]);
	
	this.idleDelay = 350;

	this.brush = d3.brush()
		.extent([[2*this.margin.left, this.margin.bottom/2], [width - this.margin.right/2, height - this.margin.bottom/2]])
		.on("start", brushstart.bind(this))
		.on("brush", brushmove.bind(this));		

	//Criando o eixo-x
	this.scatterplotGroup.append("g")	    
	    .attr("transform", "translate(0," + (height - this.margin.bottom) + ")")
	    .call(d3.axisBottom(this.scaleScatterplotX));

	//Criando o eixo-y
	this.scatterplotGroup.append("g")
	    .attr("transform", "translate(" + 2*this.margin.left + ",0)")
	    .call(d3.axisLeft(this.scaleScatterplotY));


	this.rects = this.scatterplotGroup.selectAll("rect").data(trips).enter().append("rect");

	this.rects.attr("x", function (d) {
			return this.scaleScatterplotX(d.delayDays) - 2.5;
		}.bind(this))
        .attr("y", function (d) {
			return this.scaleScatterplotY(d.price) - 2.5;
		}.bind(this))
        .attr("width", 5)
        .attr("height", 5)
        .style("fill", function (d) { return this.scaleColor (d.carrier); }.bind(this));

    this.scatterplotGroup.append("g")
		.attr("class", "brush")
		.call(this.brush)

};

//remover todas as seleções
function brushstart() {
	var s = d3.event.selection;	
	if(s[0][0]== s[1][0] && s[1][1] == s[0][1] ){
		this.rects.style("fill", function (d) {
		 	d.selected = true;
			return this.scaleColor (d.carrier); 
		}.bind(this));
		this.selectedIndexCarries = [0, 1, 2];
		filterTrips(trips);
		buildingHistogram(324, this.height);
	}
		
}

//Selecionar todos os pontos
function brushmove() {
	var s = d3.event.selection;
	this.collectPoints = [];
	this.selectedIndexCarries = [0, 1, 2];

	if (s != null) {
		var sx = [s[0][0], s[1][0]].map(this.scaleScatterplotX.invert, this.scaleScatterplotX);
		var sy = [s[1][1], s[0][1]].map(this.scaleScatterplotY.invert, this.scaleScatterplotY);
		this.rects.style("fill", function (d) { 
			var conditionX = !(sx[0] <= d.delayDays && d.delayDays <= sx[1] );
			var conditionY = !(sy[0] <= d.price && d.price <= sy[1] );
			if(conditionX || conditionY){
				d.selected = false;
				return "gray"; 	
			}
			d.selected = true;
			this.collectPoints.push(d);
			return this.scaleColor (d.carrier); 
		}.bind(this));	

		filterTrips(this.collectPoints);
		buildingHistogram(324, this.height);
	}
}

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

function filterTrips(newTrips) {
	this.filteredTrips = newTrips;
}

function filterData(index) {
	var content = this.filteredTrips.filter(function (d) { return d.carrier == this.carriers[index]; }.bind(this));
	return content;	
}

function extractData(trips) {
	this.dataSize = trips.length;	

	var parseDate = d3.timeParse("%d/%m/%Y");

	trips.forEach(function(d) {
		d.delayDays = (parseDate(d.start) - parseDate(d.post)) / (24*60*60*1000);	
		d.selected = true;	
	});	
	
	this.carriers = d3.map(trips, function(d){return d.carrier;}).keys();
}
