var CardQuery = (function(Cards)
{
	var AllColors = ["Blue", "White", "Green", "Black", "Red"];
	var AllColorIdentities = ["U", "W", "G", "B", "R"];
	var size = Cards.length;


	function onlyUniqueFilter(value, index, self) {
	    return self.indexOf(value) === index;
	}
	function anyMatches(array1, array2)
	{
	    for (var a in array1) {
	        if (array2.indexOf(array1[a]) != -1)
	            return true;
	    }
	    return false;
	}
	function hasNoColors(card)
	{
	    return card.colors === undefined;
	}



	function getCardWithName(name) {
	    var card = Cards.find(function (card) {
	        return card.name == name;
	    });
	    return card;
	}
	//Helper filter functions
	function GetColourGroupSplit(cards)
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
	function getAllColorless(creatures) {
	    return creatures.filter(hasNoColors);
	}
	function getAllMulticolored(creatures) {
	    var filter = creatures.filter(function (card) {
	        return !hasNoColors(card) && card.colors.length > 1;
	    });
	    return CardQuery(filter);
	}
	function getAllWithColorMono(color)
	{
	    var filter = Cards.filter(function (card) {
	        return !hasNoColors(card) && card.colors.length == 1 && card.colors.indexOf(color) != -1;
	    });
	    return CardQuery(filter);
	}
	function getAllNonPreyNonPredator(power, toughness) {
	    var filter =  Cards.filter(function (card) {
	        return card.power < toughness && card.toughness > power;
	    });
	    return filter;
	}
	function getAllInEdition(editions)
	{
	    var filter = Cards.filter(function (card) {
	        return anyMatches(card.printings, editions);
	    });
	    return CardQuery(filter);
	}

	function getAllPrey(power)
	{
	    var filter = Cards.filter(function(card)
	    {
	        return card.toughness <= power;
	    });
	    return CardQuery(filter);
	}
	function getAllPredators(toughness) {
	    var filter = Cards.filter(function (card) {
	        return card.power >= toughness;
	    });
	    return CardQuery(filter);
	}
	return {
		cards: Cards,
		size: size,
		getAllPredators: getAllPredators,
		getAllPrey: getAllPrey,
		getAllNonPreyNonPredator: getAllNonPreyNonPredator,
		getAllInEdition: getAllInEdition,
		getCardWithName: getCardWithName
	};
});


function ParseCreaturesFromAllCards(mtg) {
	var creatures = [];
    for (var key in mtg) {
        var card = mtg[key];
        if (!card.types) continue;

        if (card.types.indexOf("Creature") > -1) {
            creatures.push(card);
        }
    }
    return CardQuery(creatures);
}