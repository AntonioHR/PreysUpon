var init = function() {
	this.margin = {top: 25, right: 25, bottom: 25, left: 25};

	var width = 1024 - this.margin.left - this.margin.right;
	var height = 600 - this.margin.top - this.margin.bottom;

	this.svgContainer = d3.select("body").append("svg").attr("width", width).attr("height", height);

	//Definindo as escalas, baseando os domínios ao contradomínio (dimensão aceita do svg)
	/*this.scaleX = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
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
	
	this.groupPoints = this.svgContainer.append("g");	*/

	setGlobalVariables();
	getCreatureCards();

	this.histogramGroup = this.svgContainer.append("g");

	//Definir o checklist dos monstros
	definingSelect();
	
	buildingHistogram(500, height);	
		
};

function changeHistogram() {	
	var currentName = this.selectComponent.options[this.selectComponent.selectedIndex].text;

	//Pega o primeiro card da listagem com aquele nome
	this.selectedCard = this.cardsCreatures.find(function (d) { return d.name == currentName});

	console.log(this.selectedCard);	
	pupulateBars();
};

function definingSelect() {
	this.selectComponent = document.getElementById("select");

	//Pegando os nomes para ordenar
	var names = [];
	this.cardsCreatures.forEach(function(card) {
		names.push(card.name);
	});

	names.sort();
	var option = document.createElement("option");
	names.forEach(function (name) {
		option = document.createElement("option");
		option.text = name;	    
	    this.selectComponent.add(option);
	})
	
	this.selectComponent.selectedIndex = - 1;
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

	this.dataSize = this.cardsCreatures.length;

	this.allColors = ["Blue", "White", "Green", "Black", "Red"];
	this.allColorIdentity = ["U", "W", "G", "B", "R"];

	/*this.cardsCreatures.forEach(function(card){
		if(card.colorIdentity){
			card.colorIdentity.forEach(function(color) {
				if(this.allColorIdentity.indexOf(color) == -1) this.allColorIdentity.push(color);
			});	
		}	
		if(card.colors){
			card.colors.forEach(function(color) {
				if(this.allColors.indexOf(color) == -1) this.allColors.push(color);
			});	
		}			
	});	*/	
};

//Testar!!
function buildingHistogram(width, height) {

	this.histogramWidth = width;
	this.histogramHeight = height;
	this.histogramOffsetX = this.histogramWidth * 0.35;	

	this.scaleHistogramX = d3.scaleLinear()
		.domain([0, this.allColors.length])
        .range([this.margin.left +  this.margin.right / 2 + this.margin.right, this.histogramWidth +  this.margin.right / 2 - this.margin.right]);

    this.bins = d3.histogram()
    	.domain(this.scaleHistogramX.domain())    	    	
    	(this.allColors);

	this.scaleHistogramY = d3.scaleLinear().domain([0, this.dataSize/2]).range([this.histogramHeight - this.margin.top, this.margin.bottom]);	

	this.histogramGroup = this.svgContainer.append("g");
	//Criando o eixo-x
	this.histogramGroup.append("g")	    
	    .attr("transform", "translate("+ this.histogramOffsetX +"," + (this.histogramHeight - this.margin.bottom) + ")")
	    .call(d3.axisBottom(this.scaleHistogramX).tickPadding(20).ticks(4));

	//Criando o eixo-y
	this.histogramGroup.append("g")
	    .attr("transform", "translate(" + ( this.histogramOffsetX + this.margin.left + this.margin.right) + ",0)")
	    .call(d3.axisLeft(this.scaleHistogramY).tickPadding(10));		


	//pupulateBars();	
};

function pupulateBars() {
	this.histogramGroup.selectAll(".bar").remove();
	
	//Populando barras
	this.bar = this.histogramGroup.selectAll(".bar")
		.data(this.bins)
		.enter().append("g")
	    .attr("class", "bar");	    

	preyBars(false);

	predatorsBars(true);

	//Adicionando nome das cores
	this.bar.append("text")
	    .attr("dy", ".75em")
	    .attr("y", function (d, i) {
	    	return this.scaleHistogramY(-10) + 10;
	    }.bind(this))
	    .attr("x", function (d, i) {	    	
	    	return this.histogramOffsetX + this.scaleHistogramX(this.bins[i].x0) + (this.scaleHistogramX(this.bins[i].x1) - this.scaleHistogramX(this.bins[i].x0)) / 2;
	    }.bind(this))	    	
	    .attr("text-anchor", "middle")
	    .text(function(d, i) { 
	    	return this.allColors[i]; 
	    }.bind(this));
};

function preyBars(isPredator) {
	this.bar.append("rect")
	    .attr("x", function (d) {
	    	return this.histogramOffsetX + this.scaleHistogramX(d.x0);
	    }.bind(this))
	    .attr("y", function (d,i) {	    	    	
			return this.scaleHistogramY(filterCardPreyPredator(i, false).length);
	    }.bind(this))
	    .attr("width", this.scaleHistogramX(this.bins[0].x1) - this.scaleHistogramX(this.bins[0].x0) - 1)
	    .attr("height", function(d, i) {     			    	
		    return Math.floor(this.histogramHeight - this.margin.top - this.scaleHistogramY(filterCardPreyPredator(i, false).length)); 
	    }.bind(this))
	    .on("click", function(d, i) {	    	
	    	console.log("preyBars Click");
		})
		.on("mouseover", function(d, i) {	    	
	    	console.log("preyBars Hover");
		})
		.style("fill", "red");		

	//Adicionando número de cartas
	this.bar.append("text")
	    .attr("dy", ".75em")
	    .attr("y", function (d, i) {
	    	return this.scaleHistogramY(filterCardPreyPredator(i, false).length) + 10;
	    }.bind(this))
	    .attr("x", function (d, i) {	    	
	    	return this.histogramOffsetX + this.scaleHistogramX(this.bins[i].x0) + (this.scaleHistogramX(this.bins[i].x1) - this.scaleHistogramX(this.bins[i].x0)) / 2;
	    }.bind(this))	    	
	    .attr("text-anchor", "middle")
	    .text(function(d, i) { 
	    	return filterCardPreyPredator(i, false).length.toString(); 
	    }.bind(this));
};

function predatorsBars(isPredator) {
	this.bar.append("rect")
	    .attr("x", function (d) {
	    	return this.histogramOffsetX + this.scaleHistogramX(d.x0);
	    }.bind(this))
	    .attr("y", function (d,i) {	    	    	
			return this.scaleHistogramY(filterCardPreyPredator(i, true).length + filterCardPreyPredator(i, false).length);
	    }.bind(this))
	    .attr("width", this.scaleHistogramX(this.bins[0].x1) - this.scaleHistogramX(this.bins[0].x0) - 1)
	    .attr("height", function(d, i) {     			    	
		    return Math.floor(this.histogramHeight - this.margin.top - this.scaleHistogramY(filterCardPreyPredator(i, true).length)); 
	    }.bind(this))
	    .on("click", function(d, i) {	    	
	    	console.log("predatorsBars Click");
		})
		.on("mouseover", function(d, i) {	    	
	    	console.log("predatorsBars Hover");
		})
		.style("fill", "green");		

	//Adicionando número de cartas
	this.bar.append("text")
	    .attr("dy", ".75em")
	    .attr("y", function (d, i) {
	    	return this.scaleHistogramY(filterCardPreyPredator(i, true).length + filterCardPreyPredator(i, false).length) - 40;
	    }.bind(this))
	    .attr("x", function (d, i) {	    	
	    	return this.histogramOffsetX + this.scaleHistogramX(this.bins[i].x0) + (this.scaleHistogramX(this.bins[i].x1) - this.scaleHistogramX(this.bins[i].x0)) / 2;
	    }.bind(this))	    	
	    .attr("text-anchor", "middle")
	    .text(function(d, i) { 
	    	return filterCardPreyPredator(i, true).length.toString(); 
	    }.bind(this));
};

function filterCardPreyPredator(index, isPredator) {
	var content = this.cardsCreatures.filter(function (d) { 
		var sameColor = false;
		if(d.colorIdentity){
			sameColor = d.colorIdentity.indexOf(this.allColorIdentity[index]) > -1;	
		}else if(d.colors){
			sameColor = d.colors.indexOf(this.allColors[index]) > -1;
		}	

		if(isPredator){
			return sameColor && d.toughness <= this.selectedCard.power;
		}else{
			return sameColor && d.power >= this.selectedCard.toughness;
		}

	}.bind(this));	
	return content;	
};

function filterData(index) {
	var content = this.cardsCreatures.filter(function (d) { 

		if(d.colorIdentity){
			return d.colorIdentity.indexOf(this.allColorIdentity[index]) > -1;	
		}else if(d.colors){
			return d.colors.indexOf(this.allColors[index]) > -1;
		}		 

	}.bind(this));	
	return content;	
}