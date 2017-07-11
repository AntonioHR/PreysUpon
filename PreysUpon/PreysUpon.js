var init = function () {
    setsFiltered = filterJustCreaturesFromAllSets(setsMTG);
    this.setSelector = mtgSetsSelector(
        d3.select("#selectSet"),
        d3.select("body").select("#sets-list"),
        setsFiltered,
        OnSetsChange);

    this.tooltip = makeTooltip();

    var mainHistoSVG = d3.select("#histogram_svg");
    var mainHistoOrigin = d3.select(mainHistoSVG.node().parentElement);
    this.mainHistogram = makeHisto(mainHistoOrigin, mainHistoSVG, tooltip.show, tooltip.hide, showCards);

    histos_origin = d3.select("#histograms-origin");
    histos_data = [];
    histo_selections = [];

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
    heatmap = createHeatmap();
};

function addHisto()
{
    console.log("clicked add");
    var result = createHistogramSlot(histos_origin);
    var histo_svg = result.svg;
    var histo_origin = d3.select(histo_svg.node().parentElement);


    var rarity_filter = this.mainHistogram.rarity_filter();
    // var predation_filter = this.mainHistogram.predation_filter();
    var predation_filter = null;

    var newHisto = makeHisto(histo_origin, histo_svg, tooltip.show, tooltip.hide, showCards, result.title, rarity_filter, predation_filter,
        function(){onHistoUpdate();});

    var new_histo_data = {histo: newHisto, lock: result.lock, well: result.well};
    histos_data.push(new_histo_data);

    result.button.on("click", function()
    {
        result.origin.remove();
        removeHisto(new_histo_data);
        console.log(histos_data);
    });

    result.lock
        // .on("mouseover", function()
        // {
        //     d3.select(this).classed("current_hovered_histo", true);
        // })
        // .on("mouseout", function()
        // {
        //     d3.select(this).classed("current_hovered_histo", false);
        // })
        .on("click", function()
        {
            toggleHisto(new_histo_data);
        });

    redraw(newHisto);

    if(histos_data.length <= 2)
    {
        toggleHisto(new_histo_data);
    }
}

function updateComparer(histo1, histo2)
{
    var q0 = histo1.histo.query();
    var q1 = histo2.histo.query();


    // var table0 = q0.data.getPredationColorSplit(q0.pow, q0.tough);
    // var table1 = q1.data.getPredationColorSplit(q1.pow, q1.tough);
    // var qs = [table0, table1];
    // comparer.updateQueries(qs);
    comparer.updateQueries([q0, q1]);
}

function removeHisto(histo_data)
{
    if(histo_selections.indexOf(histo_data) != -1)
    {
        toggleHisto(histo_data);
    }
    histos_data.splice(histos_data.indexOf(histo_data), 1);
}

function createComparer()
{

    // <div class="well" id="comparer_root">
    //     <svg id="comparer_svg" width="300" height="300"></svg>
    var heatmapParent = d3.select("#comparer_root");
    var svg = d3.select("#comparer_svg");
    var legend_svg = d3.select("#comparer_legend_svg");
    return ComparerHeatMap(heatmapParent, svg, legend_svg,
        function(comparison)
        {
            // console.log("Show Tooltip!");
            tooltip.showCompare(comparison);
        },
        function()
        {
            // console.log("Hide Tooltip!");
            tooltip.hide();
        }, showComparisonCards);
}

function createHeatmap ()
{
    var heatmapParent = d3.select("#heatmap_root");
    var svg = d3.select("#heatmap_svg");
    var legend_svg = d3.select("#heatmap_legend_svg");
    return Heatmap(heatmapParent, svg, legend_svg);
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
    var well_holder = origin.append("div").attr("class", "col-sm-6");

    var well = well_holder.append("div").attr("class", "well");

    var div = well.append("div").attr("class", "row");

    var button = div.append("button")
        .attr("class", "close glyphicon glyphicon-remove float-right");
    var button_lock = div.append("button")
        .attr("class", "btn glyphicon glyphicon-lock float-right");

    title = div.append("h5")
        .attr("class", "histo_title")
        .text("2/3");


    var svg = div.append("svg")
        .attr("class", "creature_histo")
        .attr("width", "250")
        .attr("height", "250");

    return {
        svg: svg,
        button: button,
        title: title,
        origin: well_holder,
        well: well,
        lock: button_lock
    };
}

function toggleHisto(histo_data)
{
    if(histo_selections.indexOf(histo_data) != -1)
    {
        deselectHisto(histo_data);
        histo_selections[0].well.classed("current_histo_a", true);
        histo_selections[0].well.classed("current_histo_b", false);
    } else {
        if(histo_selections.length == 2)
        {
            var second = histo_selections[1];
            deselectHisto(histo_selections[0]);

            second.well.classed("current_histo_a", true);
            second.well.classed("current_histo_b", false);
        }
        selectHisto(histo_data);
    }
    if(histo_selections.length == 2)
    {
        updateComparer(histo_selections[0], histo_selections[1]);
    } else {
        comparer.clear();
    }
}

function showCards(cardQuery)
{
    console.log(cardQuery.cards);
}

function showComparisonCards(cardComparison)
{
    console.log(cardComparison.A.cards);
    console.log(cardComparison.B.cards);
}

function onHistoUpdate()
{
    if(histo_selections.length == 2)
    {
        updateComparer(histo_selections[0], histo_selections[1]);
    }
}

function selectHisto(histo_data)
{
    histo_selections.push(histo_data);
    if(histo_selections.length == 1)
    {
        histo_data.well.classed("current_histo_a", true);
    } else {
        histo_data.well.classed("current_histo_b", true);
    }
}

function deselectHisto(histo_data)
{
    histo_selections.splice(histo_selections.indexOf(histo_data), 1);
    histo_data.well.classed("current_histo_a", false);
    histo_data.well.classed("current_histo_b", false);
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
    heatmap.update(this.data, function(d){
        d3.select("#power_field").property("value", d.power).on("change")();
        d3.select("#toughness_field").property("value", d.toughness).on("change")();
    });
}