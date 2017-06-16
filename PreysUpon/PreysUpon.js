var init = function () {
    setsFiltered = filterJustCreaturesFromAllSets(setsMTG);

    this.comparativeHistograms = new ComparativeHistograms();

    this.histogramsCollection = [];

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
            redraw();
    });

};

function updateSelectedSets()
{
    this.data = CardQuery(this.setSelector.getSelectedCards());
}
function updatePreyFilters()
{
    this.splitData = this.data.getColorPredationSplitTable(this.powerTough.getPower(), this.powerTough.getToughness());
}

function redraw()
{
	var histogramSVG = d3.select(".two").append("svg").attr("width", 450).attr("height", 450);	
    var histogramObject = new MakeHistogram(histogramSVG);
    histogramObject.update(this.splitData, this.histogramsCollection.length + 1);

    this.histogramsCollection.push(histogramObject);

    if(this.histogramsCollection.length == 2){
    	this.comparativeHistograms.setHistograms(this.histogramsCollection[0], this.histogramsCollection[1]);
    	this.comparativeHistograms.comparingHistograms();
    }
}

function OnSetsChange()
{    
    updateSelectedSets();
    updatePreyFilters();
    this.powerTough.update(this.data.cards);    
}
