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
	function getColorGroupSplit()
	{
	    var result =
	        {
	            Colorless: getAllColorless(),
	            Multicolored: getAllMulticolored()
	        };
	    for (var c in AllColors)
	    {
	        result[AllColors[c]] = getAllWithColorMono(AllColors[c]);
	    }
	    return result;
	}
	function getAllColorless() {
	    return CardQuery(Cards.filter(hasNoColors));
	}
	function getAllMulticolored() {
	    var filter = Cards.filter(function (card) {
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
	function getAllInEdition(editions)
	{
	    var filter = Cards.filter(function (card) {
	        return anyMatches(card.printings, editions);
	    });
	    return CardQuery(filter);
	}

	//When combat results in no deaths
	function getAllBounceOff(power, toughness) {
	    var filter =  Cards.filter(function (card) {
	        return card.power < toughness && card.toughness > power;
	    });
	    return CardQuery(filter);
	}

	//When combat results both dying
	function getAllTrades(power, toughness) {
	    var filter =  Cards.filter(function (card) {
	        return card.power >= toughness && card.toughness <= power;
	    });
	    return CardQuery(filter);
	}
	function getAllPrey(power, toughness)
	{
	    var filter = Cards.filter(function(card)
	    {
	        return card.power < toughness && card.toughness <= power;
	    });
	    return CardQuery(filter);
	}
	function getAllPredators(power, toughness) {
	    var filter = Cards.filter(function (card) {
	        return card.power >= toughness && card.toughness > power;
	    });
	    return CardQuery(filter);
	}
	return {
		cards: Cards,
		cardCount: size,
		getAllPredators: getAllPredators,
		getAllPrey: getAllPrey,
		getAllBounceOff: getAllBounceOff,
		getAllTrades: getAllTrades,
		getAllInEdition: getAllInEdition,
		getCardWithName: getCardWithName,
		getColorGroupSplit: getColorGroupSplit
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