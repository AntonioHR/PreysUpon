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


	function getColorPredationSplit(pow, tough)
	{
		var result =
			{
				Colorless: getAllColorless().getPredationSplit(pow, tough),
				Multicolored: getAllMulticolored().getPredationSplit(pow, tough)
			};
		for (var c in AllColors)
		{
			result[AllColors[c]] = getAllWithColorMono(AllColors[c]).getPredationSplit(pow, tough);
		}
		return result;
	}

	function getPredationColorSplit(pow, tough)
	{
		var result = [];

		result["Prey"] = getAllPrey(pow, tough).getColorGroupSplit();
		result["BounceOff"] = getAllBounceOff(pow, tough).getColorGroupSplit();
		result["Trade"] = getAllTrades(pow, tough).getColorGroupSplit();
		result["Predator"] = getAllPredators(pow, tough).getColorGroupSplit();
		return result;
	}

	function getColorPredationSplitTable(pow, tough)
	{
		var result = [];

		var Colorless =  getAllColorless().getPredationSplit(pow, tough);
		Colorless.key  = "Colorless";
		result.push(Colorless);
		var Multicolored =  getAllMulticolored().getPredationSplit(pow, tough);
		Multicolored.key  = "Multicolored";
		result.push(Multicolored);

		for (var c in AllColors)
		{
			var thisColor = getAllWithColorMono(AllColors[c]).getPredationSplit(pow, tough);
			thisColor.key = AllColors[c];
			result.push(thisColor);
		}
		return result;
	}

	function getPredationColorSplitTable(pow, tough)
	{
		var result = [];

		var Prey =  getAllPrey(pow, tough).getColorGroupSplit();
		Prey.key  = "Prey";
		result.push(Prey);

		var BounceOff =  getAllBounceOff(pow, tough).getColorGroupSplit();
		BounceOff.key  = "BounceOff";
		result.push(BounceOff);

		var Trade =  getAllTrades(pow, tough).getColorGroupSplit();
		Trade.key  = "Trade";
		result.push(Trade);

		var Predator =  getAllPredators(pow, tough).getColorGroupSplit();
		Predator.key  = "Predator";
		result.push(Predator);
		return result;
	}

	function getPredationSplit(pow, tough)
	{
		var result =
			{
				Prey:getAllPrey(pow, tough),
				BounceOff:getAllBounceOff(pow, tough),
				Trade:getAllTrades(pow, tough),
				Predator:getAllPredators(pow, tough),
				cardCount:size
				// AllSets = function(){return [Prey, BounceOff, Trade, Predator]}
			};
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

	function getAllInRarities(rarities)
	{
		var filter = Cards.filter(function (card) {
			return rarities.includes(card.rarity);
		});
		return CardQuery(filter);
	}


	function getAllWithCostBetween(costRange)
	{
		var filter = Cards.filter(function (card) {
			return card.cmc >= costRange[0] && card.cmc <= costRange[1];
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
		getColorGroupSplit: getColorGroupSplit,
		getColorPredationSplit: getColorPredationSplit,
		getPredationColorSplit: getPredationColorSplit,
		getColorPredationSplitTable: getColorPredationSplitTable,
		getPredationColorSplitTable: getPredationColorSplitTable,
		getPredationSplit: getPredationSplit,
		getAllInRarities: getAllInRarities,
		getAllWithCostBetween: getAllWithCostBetween
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