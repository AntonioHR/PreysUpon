var init = function () {
    setsFiltered = filterJustCreaturesFromAllSets(setsMTG);
    this.setSelector = mtgSetsSelector(
        d3.select("#selectSet"),
        d3.select("body").select("#sets-list"),
        setsFiltered,
        OnSetsChange);

    var mainHistoSVG = d3.select("#histogram_svg");
    var mainHistoOrigin = d3.select(mainHistoSVG.node().parentElement);
    this.mainHistogram = makeHisto(mainHistoOrigin, mainHistoSVG);

    var histos_origin = d3.select("#histograms-origin");
    var histos = []


    this.powerTough = powerToughnessSelector(
        d3.select("#selectCreature"),
        d3.select("#power_field"),
        d3.select("#toughness_field"),
        function()
        {
            updatePredationFilter();
            redraw(mainHistogram);
        });
    this.powerToughBtn = d3.select("#button-creature-add");
        powerToughBtn.on("click", function()
        {
            console.log("clicked add");
            var histo_svg = createHistogramSlot(histos_origin);
            var histo_origin = d3.select(histo_svg.node().parentElement);
            var newHisto = makeHisto(histo_origin, histo_svg);
            histos.push(newHisto);
            redraw(newHisto);
        });
};

function createHistogramSlot(origin)
{
    // <div class="col-sm-6">
    //     <div class="well">
    //         <div class="row">
    //             <button class="close glyphicon glyphicon-remove float-right"></button>

    //             <svg id="histogram_svg" width="250" height="250"></svg>
    //         </div>
    //     </div>
    // </div>

    var div = origin
                .append("div").attr("class", "col-sm-6")
                    .append("div").attr("class", "well")
                        .append("div").attr("class", "row");

    div.append("button").attr("class", "close glyphicon glyphicon-remove float-right");


    return div.append("svg")
        .attr("class", "creature_histo")
        .attr("width", "250")
        .attr("height", "250");
}

function updateSelectedSets()
{
    this.data = CardQuery(this.setSelector.getSelectedCards());
}
function updatePredationFilter()
{
    this.predation_filter = [this.powerTough.getPower(), this.powerTough.getToughness()];
}

function redraw(histo)
{
    histo.data(this.data);
    histo.predation_filter(this.predation_filter);
    histo.render();
}

function OnSetsChange()
{
    updateSelectedSets();
    updatePredationFilter();
    this.powerTough.update(this.data.cards);
    redraw(mainHistogram);
}