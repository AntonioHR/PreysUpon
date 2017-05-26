var init = function () {
    margin = { top: 25, right: 25, bottom: 25, left: 25 };

    var width = 1024 - this.margin.left - this.margin.right;
    var height = 600 - this.margin.top - this.margin.bottom;

    svgContainer = d3.select("body").append("svg").attr("width", width).attr("height", height);

    this.creatureCards = ParseCreaturesFromAllCards(cardsMTG);
    buildColorArrays();


    histoWidth = 300;
    histoHeight = 200;

    parent = addPositionedContainer(svgContainer, 100, 100);
    histogramPosData = applyMargin(parent, margin, histoWidth, histoHeight);

    this.mainHisto = Histo(parent);
    mainHisto.init();

    // this.mainHisto = buildHisto(
    //     parent, histoWidth, histoHeight, this.allColors, this.creatureCards.length);

    this.currentCreaturePool = this.creatureCards.getAllInEdition(["SOM"]);

    this.CreatureSelector = populateCreatureComboBox(currentCreaturePool);

    powerfield = d3.select("#powerfield");
    toughnessfield = d3.select("#toughnessfield");
    powerfield.on("input", function()
        {
            powerfield.attr("value", this.value);
            updateBars();
        });
    toughnessfield.on("input", function()
        {
            toughnessfield.attr("value", this.value);
            updateBars();
        });




    // barWidth = getBarWidth(this.mainHisto);

    // x = stackBar(this.mainHisto.origin, barWidth, 100, "red");
    // stackBar(x.g, barWidth, 100, "green");
    // this.mainHisto.parent.selectAll("text").text("Hey");
};

function updateBars()
{
    mainHisto.show(this.currentCreaturePool, 
        powerfield.attr("value"), 
        toughnessfield.attr("value"));
}

//Callbacks for the HTML page
function onSelectedCardChange() {
    var currentName = this.CreatureSelector.options[this.CreatureSelector.selectedIndex].text;

    //Pega o primeiro card da listagem com aquele nome
    this.selectedCard = this.creatureCards.getCardWithName(currentName);
    this.powerfield.attr("value", selectedCard.power);
    this.powerfield.val = selectedCard.power;
    this.toughnessfield.attr("value", selectedCard.toughness);
    this.toughnessfield.val = selectedCard.toughness;

    console.log(this.selectedCard);

    updateBars();
    // mainHisto.show(currentCreaturePool, selectedCard.power, selectedCard.toughness);
    // populateBars();
}

//Initialization Functions
function populateCreatureComboBox(cardQuery) {
    creatureSelector = document.getElementById("select");

    //Pegando os nomes para ordenar
    var names = [];
    var creatureCards = cardQuery.cards;
    creatureCards.forEach(function (card) {
        names.push(card.name);
    });

    names.sort();
    var option = document.createElement("option");
    names.forEach(function (name) {
        option = document.createElement("option");
        option.text = name;
        creatureSelector.add(option);
    });

    creatureSelector.selectedIndex = -1;
    return creatureSelector;
}


function buildColorArrays() {
    this.allColors = ["Blue", "White", "Green", "Black", "Red"];
    this.allColorIdentity = ["U", "W", "G", "B", "R"];
}






