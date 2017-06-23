var init = function () {
    setsFiltered = filterJustCreaturesFromAllSets(setsMTG);

    this.comparativeHistograms = new ComparativeHistograms();

    this.histogramsCollection = [];
    this.histogramIndex = 0;

    this.setSelector = mtgSetsSelector(
        d3.select("#selectSet"),
        d3.select("body").select("ul"),
        setsFiltered,
        OnSetsChange);
   
    this.powerTough = powerToughnessSelector(
        d3.select("#selectCreature"),
        d3.select("#powerfield"),
        d3.select("#toughnessfield"),
        function()
        {
            updatePreyFilters();
            var newHisto = drawHistogram(this.splitData);
            this.histogramsCollection.push(newHisto);

            buildComparation();
    	}.bind(this));

};

function updateSelectedSets()
{
    this.data = CardQuery(this.setSelector.getSelectedCards());
};

function updatePreyFilters()
{
    this.splitData = this.data.getColorPredationSplitTable(this.powerTough.getPower(), this.powerTough.getToughness());
};

function drawHistogram(sliptedData)
{
	var histogramSVG = d3.select(".two").append("svg").attr("width", 400).attr("height", 400);	
    var histogramObject = new MakeHistogram(histogramSVG);    
    histogramObject.update(sliptedData, this.histogramIndex, redrawHistograms);

    this.histogramIndex++;

    return histogramObject;    
};

function redrawHistograms(removedIndex) 
{	
	this.comparativeHistograms.resetHistogram();

	this.histogramsCollection.splice(removedIndex, 1); 

	d3.select(".two").selectAll("svg").remove();

	var newHistogramList = [];
	this.histogramIndex = 0;

	for (var i = 0; i < this.histogramsCollection.length; i++) {
		var newHisto = drawHistogram(this.histogramsCollection[i].data, i);
		newHistogramList.push(newHisto)
	}

	this.histogramsCollection = newHistogramList; 
};


function buildComparation() {	
    if(this.histogramIndex >= 2){
    	if(this.comparativeHistograms.startedHistogram) return;    	
    	this.comparativeHistograms.init();
    	this.comparativeHistograms.setHistograms(this.histogramsCollection[0], this.histogramsCollection[1]);
    	this.comparativeHistograms.comparingHistograms();
    }else{
    	this.comparativeHistograms.resetHistogram();
    }
}

function OnSetsChange()
{    
    updateSelectedSets();
    updatePreyFilters();
    this.powerTough.update(this.data.cards);    
};
