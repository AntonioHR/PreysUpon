var ComparativeHistograms = function (){};

ComparativeHistograms.prototype.setHistograms = function (histogram1, histogram2)
{	
    this.histogramLeft = histogram1;
    this.histogramRight = histogram2;      
}

ComparativeHistograms.prototype.comparingHistograms = function() {
	var numberColumns = this.histogramLeft.data.length;	
	
	for (var i = numberColumns - 1; i >= 0; i--) 
	{		

		var typeLeft = this.histogramLeft.data[i];
		var typeRight = this.histogramRight.data[i];

		var results = {
			key: this.histogramLeft.data[i].key,
			bounceOff: this.comparingValues(typeLeft.BounceOff, typeRight.BounceOff),
			predator: this.comparingValues(typeLeft.Predator, typeRight.Predator),
			prey: this.comparingValues(typeLeft.Prey, typeRight.Prey),
			trade: this.comparingValues(typeLeft.Trade, typeRight.Trade)
		}

		console.log(results);	
			
	}

};

ComparativeHistograms.prototype.comparingValues = function(typeLeft, typeRight) 
{
	var result = -1;	

	if(typeLeft.cardCount > typeRight.cardCount){
		result = this.histogramLeft.histogramIndex;		
	}else if(typeLeft.cardCount < typeRight.cardCount){
		result = this.histogramRight.histogramIndex;		
	}

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
