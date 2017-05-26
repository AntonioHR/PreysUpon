var init = function () {
    margin = { top: 25, right: 25, bottom: 25, left: 25 };

    var width = 1024 - this.margin.left - this.margin.right;
    var height = 600 - this.margin.top - this.margin.bottom;

    svgContainer = d3.select("body").append("svg").attr("width", width).attr("height", height);

    setGlobalVariables();
    getCreatureCards();
    buildColorArrays();
    populateCreatureComboBox();


    histoWidth = 300;
    histoHeight = 200;

    parent = addPositionedContainer(svgContainer, 100, 100);

    histogramPosData = applyMargin(parent, margin, histoWidth, histoHeight);
    //buildIt(histogramPosData.g, histogramPosData.width, histogramPosData.height);

    this.mainHisto = buildHisto(parent, histoWidth, histoHeight, this.allColors, this.creatureCards.length);
    this.currentCreaturePool = filterByEdition(this.creatureCards, ["SOM"]);

    barWidth = getBarWidth(this.mainHisto);

    x = stackBar(this.mainHisto.origin, barWidth, 100, "red");
    stackBar(x.g, barWidth, 100, "green");
    this.mainHisto.parent.selectAll("text").text("Hey");
};

//Callbacks for the HTML page
function onSelectedCardChange() {
    var currentName = this.CreatureSelector.options[this.CreatureSelector.selectedIndex].text;

    //Pega o primeiro card da listagem com aquele nome
    this.selectedCard = this.creatureCards.find(function (d) { return d.name == currentName; });

    console.log(this.selectedCard);
    populateBars();
}

//Initialization Functions
function populateCreatureComboBox() {
    this.CreatureSelector = document.getElementById("select");

    //Pegando os nomes para ordenar
    var names = [];
    this.creatureCards.forEach(function (card) {
        names.push(card.name);
    });

    names.sort();
    var option = document.createElement("option");
    names.forEach(function (name) {
        option = document.createElement("option");
        option.text = name;
        this.CreatureSelector.add(option);
    });

    this.CreatureSelector.selectedIndex = -1;
}

function setGlobalVariables() {
    this.creatureCards = [];
}

function getCreatureCards() {
    for (var key in cardsMTG) {
        var card = cardsMTG[key];
        if (!card.types) continue;

        if (card.types.indexOf("Creature") > -1) {
            this.creatureCards.push(card);
        }
    }

    this.dataSize = this.creatureCards.length;
}

function buildColorArrays() {
    this.allColors = ["Blue", "White", "Green", "Black", "Red"];
    this.allColorIdentity = ["U", "W", "G", "B", "R"];
}



//Helper Functions for positioning Stuff
function addPositionedScaledContainer(parent, x, y, scaleX, scaleY) {
    result = parent.append("g");
    result.attr("transform", "translate(" + x + "," + y + ")");
    result = result.append("g");
    result.attr("transform", "scale(" + x + "," + y + ")");
    return result;
}
function addPositionedContainer(parent, x, y) {
    result = parent.append("g");
    result.attr("transform", "translate(" + x + "," + y + ")");
    return result;
}

function applyMargin(parent, margin, width, height) {
    child = addPositionedContainer(parent, margin.left, margin.top);
    childWidth = width - (margin.left + margin.right);
    childHeight = height - (margin.top + margin.bottom);

    result =
        {
            g: child,
            width: childWidth,
            height: childHeight
        };
    return result;
}
function margins(top, right, bottom, left)
{
    return { top: top, right: right, bottom: bottom, left: left };
}

function getBarWidth(histo)
{
    return histo.scaleX(1);
}
function buildHisto(parent, width, height, horizontalOptions, verticalCount)
{

    parent.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill:rgb(0,0,255)");


    axisBarsOffset = 5;
    extraBarOffset = 5;

    //Calculate Space for X Axis
    tickPaddingX = 10;
    tickInnerSizeX = 4;
    textHeightX = 10;
    tickOuterSizeX = 0;
    totalOffsetXAxis = tickPaddingX + tickInnerSizeX + textHeightX + tickOuterSizeX;

    //Calculate Space for Y Axis
    tickPaddingY = 0;
    tickInnerSizeY = 4;
    textWidthY = 20;
    tickOuterSizeY = 0;
    totalOffsetYAxis = tickPaddingY + tickInnerSizeY + textWidthY + tickOuterSizeY;

    //Make the margin

    posDataAxis = applyMargin(parent, margins(extraBarOffset, extraBarOffset, totalOffsetXAxis, totalOffsetYAxis), width, height);


    posData = applyMargin(posDataAxis.g, margins(0, 0, axisBarsOffset, axisBarsOffset), posDataAxis.width, posDataAxis.height);

    histogramGroup = posData.g;
    axesParent = posDataAxis.g;

    axisWidth = posDataAxis.width;
    axisHeight = posDataAxis.height;

    histogramWidth = posData.width;
    histogramHeight = posData.height;

    scaleHistogramX = d3.scaleLinear()
		.domain([0, horizontalOptions.length])
        .range([0, histogramWidth]);

    bins = d3.histogram()
    	.domain(scaleHistogramX.domain())
    	(horizontalOptions);

    scaleHistogramY = d3.scaleLinear().domain([0, verticalCount/ 2]).range([histogramHeight, 0]);


    //Criando o eixo-x
    var origin = addPositionedContainer(axesParent, axisBarsOffset, axisHeight);
        origin.call(d3.axisBottom(scaleHistogramX).tickPadding(tickPaddingX).tickSizeInner(tickInnerSizeX).tickSizeOuter(tickOuterSizeX).ticks(4));

        origin = addPositionedContainer(origin, 1, - 0.3);

    //Criando o eixo-y
    addPositionedContainer(axesParent, 0, axisBarsOffset)
	    .call(d3.axisLeft(scaleHistogramY).tickPadding(tickPaddingX).tickSizeInner(tickInnerSizeX).tickSizeOuter(tickOuterSizeX))
        .selectAll("text").remove();

    result =
        {
            scaleX: scaleHistogramX,
            scaleY: scaleHistogramY,
            origin: origin,
            g: histogramGroup,
            parent: parent,
            bins:bins
        };

    return result;
}

function stackBar(parent, width, height, fill)
{
    g =  addPositionedContainer(parent, 0, -height);
    bar = g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", fill);
    return  {
        g: g,
        bar:bar
    };
}


//Helper filter functions
function SplitUpSelectionByColor(cards)
{
    result =
        {
            Colorless: filterColorless(cards),
            MultiColored: filterMultiColoredAll(cards)
        };
    for (var c in this.allColors)
    {
        result[allColors[c]] = filterColorMono(cards, this.allColors[c]);
    }
    return result;
}

function filterColorMono(creatures, color)
{
    return creatures.filter(function (card) {
        return !hasNoColors(card) && card.colors.length == 1 && card.colors.indexOf(color) != -1;
    });
}
function filterMultiColoredAll(creatures) {
    return creatures.filter(function (card) {
        return !hasNoColors(card) && card.colors.length > 1;
    });
}
function filterColorless(creatures) {
    return creatures.filter(hasNoColors);
}
function hasNoColors(card)
{
    return card.colors === undefined;
}

function filterPrey(creatures, power)
{
    return creatures.filter(function(card)
    {
        return card.toughness <= power;
    });
}
function filterPredators(creatures, toughness) {
    return creatures.filter(function (card) {
        return card.power >= toughness;
    });
}
function filterNoDeaths(creatures, power, toughness) {
    return creatures.filter(function (card) {
        return card.power < toughness && card.toughness > power;
    });
}

function getByName(creatures, name) {
    return creatures.find(function (card) {
        return card.name == name;
    });
}

function filterByEdition(creatures, editions)
{
    return creatures.filter(function (card) {
        return anyMatches(card.printings, editions);
    });
}

function anyMatches(array1, array2)
{
    for (var a in array1) {
        if (array2.indexOf(array1[a]) != -1)
            return true;
    }
    return false;
}

function onlyUniqueFilter(value, index, self) {
    return self.indexOf(value) === index;
}