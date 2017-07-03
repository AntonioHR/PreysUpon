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

    histos_origin = d3.select("#histograms-origin");
    histos = [];


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
           addHisto();
        });

    comparer = createComparer();
};

function addHisto()
{
     console.log("clicked add");
    var result = createHistogramSlot(histos_origin);
    var histo_svg = result.svg;
    var histo_origin = d3.select(histo_svg.node().parentElement);
    var newHisto = makeHisto(histo_origin, histo_svg);
    histos.push(newHisto);

    result.button.on("click", function()
    {
        result.well.remove();
        removeHisto(newHisto);
        console.log(histos);
    });
    redraw(newHisto);

    if(histos.length == 2)
    {
        var q0 = histos[0].query();
        var q1 = histos[1].query();


        var table0 = q0.data.getPredationColorSplit(q0.pow, q0.tough);
        var table1 = q1.data.getPredationColorSplit(q1.pow, q1.tough);
        var qs = [table0, table1];
        comparer.updateQueries(qs);
    }
}

function removeHisto(histo)
{
    histos.splice(histos.indexOf(histo), 1);
}

function createComparer()
{

    // <div class="well" id="comparer_root">
    //     <svg id="comparer_svg" width="300" height="300"></svg>
    var heatmapParent = d3.select("#comparer_root");
    var svg = d3.select("#comparer_svg");
    var legend_svg = d3.select("#comparer_legend_svg");
    return ComparerHeatMap(heatmapParent, svg, legend_svg);
}

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
    var well = origin.append("div").attr("class", "col-sm-6");
    var div = well
                .append("div").attr("class", "well")
                    .append("div").attr("class", "row");


    var button = div.append("button")
        .attr("class", "close glyphicon glyphicon-remove float-right")

    var svg = div.append("svg")
        .attr("class", "creature_histo")
        .attr("width", "250")
        .attr("height", "250");

    return {
        svg: svg,
        button: button,
        well: well
    };
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