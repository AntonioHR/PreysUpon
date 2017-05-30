var init = function () {
    setsFiltered = filterJustCreaturesFromAllSets(setsMTG);
    this.setSelector = mtgSetsSelector(
        d3.select("#selectSet"),
        d3.select("body").select("ul"),
        setsFiltered,
        OnSetsChange);

    var histogramsvg = d3.select("#histogram_svg");
    var width = histogramsvg.attr("width");
    var height = histogramsvg.attr("height");
    this.histogram = makeHisto(histogramsvg);

    this.powerTough = powerToughnessSelector(
        d3.select("#selectCreature"),
        d3.select("#powerfield"),
        d3.select("#toughnessfield"),
        function()
        {
            updatePreyFilters();
            redraw();
        });

    // this.creatureCards = ParseCreaturesFromAllCards(cardsMTG);
    // setupPowToughFields();
};

function updateSelectedSets()
{
    this.data = CardQuery(this.setSelector.getSelectedCards());
}
function updatePreyFilters()
{
    this.splitData = this.data.getColorPredationSplitTable(
            this.powerTough.getPower()
            , this.powerTough.getToughness());
}

function redraw()
{
    histogram.update(this.splitData);
}

function OnSetsChange()
{
    // populateCreatureComboBox(CardQuery(this.setSelector.getSelectedCards()));
    updateSelectedSets();
    updatePreyFilters();
    this.powerTough.update(this.data.cards);
    redraw();
}




// //Callbacks for the HTML page
// function onSelectedCardChange() {
//     var currentName = this.CreatureSelector.options[this.CreatureSelector.selectedIndex].text;

//     //Pega o primeiro card da listagem com aquele nome
//     selectedCard = this.creatureCards.getCardWithName(currentName);
//     this.powerfield.attr("value", selectedCard.power);
//     this.powerfield.val = selectedCard.power;
//     this.toughnessfield.attr("value", selectedCard.toughness);
//     this.toughnessfield.val = selectedCard.toughness;
// }

// //Initialization Functions
// function populateCreatureComboBox(cardQuery) {
//     creatureSelector = document.getElementById("select");

//     //Pegando os nomes para ordenar
//     var names = [];
//     var creatureCards = cardQuery.cards;
//     creatureCards.forEach(function (card) {
//         names.push(card.name);
//     });

//     names.sort();
//     var option = document.createElement("option");
//     names.forEach(function (name) {
//         option = document.createElement("option");
//         option.text = name;
//         creatureSelector.add(option);
//     });

//     creatureSelector.selectedIndex = -1;
//     return creatureSelector;
// }


// function setupPowToughFields()
// {
//     this.powerfield = d3.select("#powerfield");
//     this.toughnessfield = d3.select("#toughnessfield");
//     this.powerfield.on("input", function()
//         {
//             powerfield.attr("value", this.value);
//             updateBars();
//         });
//     this.toughnessfield.on("input", function()
//         {
//             toughnessfield.attr("value", this.value);
//             updateBars();
//         });
// }